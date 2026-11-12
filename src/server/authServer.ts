/**
 * LearnGraph — Production Authentication Server Module
 *
 * Implements full backend authentication protocol:
 * - PBKDF2-SHA512 password hashing with cryptographically secure random salt
 * - HMAC-SHA256 JWT access (15 min) and refresh tokens (7 days)
 * - Secure email verification tokens (24h) and password reset tokens (15 min)
 * - Persistent JSON-backed storage at backend/data/auth_db.json
 * - Account lockout protection (5 failed attempts -> 30 min lock)
 * - Active session tracking, revoke session, and logout all devices
 * - Both camelCase and snake_case user representations for 100% frontend compatibility
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { emailService } from "./emailService.ts";
import seedAuthDatabase from "../../backend/data/auth_db.json";

// ─────────────────────────────────────────────────────────────────────────────
// Configuration & Types
// ─────────────────────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || "learngraph_prod_jwt_super_secret_key_2026_sec#981";
const DB_FILE = process.env.VERCEL
  ? "/tmp/learngraph_auth_db.json"
  : path.resolve(process.cwd(), "backend", "data", "auth_db.json");

export interface StoredUser {
  id: string;
  email: string;
  full_name: string;
  username: string;
  password_hash: string;
  salt: string;
  role: "student" | "teacher" | "admin";
  is_active: boolean;
  is_verified: boolean;
  education_level: string;
  target_exam: string;
  learning_goals: string[];
  avatar_url: string;
  failed_login_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface StoredSession {
  id: string;
  user_id: string;
  device_name: string;
  device_type: "desktop" | "mobile" | "tablet";
  ip_address: string;
  location: string;
  is_current: boolean;
  created_at: string;
  last_active: string;
}

export interface StoredRefreshToken {
  token: string;
  user_id: string;
  expires_at: string;
  revoked: boolean;
}

export interface StoredVerificationToken {
  token?: string; // backwards compatibility
  hashed_token: string;
  email: string;
  user_id: string;
  expires_at: string;
  created_at: string;
  used: boolean;
}

export interface StoredPasswordResetToken {
  token?: string; // backwards compatibility
  hashed_token: string;
  email: string;
  user_id: string;
  expires_at: string;
  created_at: string;
  used: boolean;
}

export interface StoredLoginHistory {
  id: string;
  user_id: string | null;
  email: string;
  ip_address: string;
  timestamp: string;
  success: boolean;
  reason: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  sessions: StoredSession[];
  refresh_tokens: StoredRefreshToken[];
  email_verification_tokens: StoredVerificationToken[];
  password_reset_tokens: StoredPasswordResetToken[];
  login_history: StoredLoginHistory[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Database Persistence Layer
// ─────────────────────────────────────────────────────────────────────────────

function ensureDbDirectory(): void {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadDatabase(): DatabaseSchema {
  ensureDbDirectory();
  if (!fs.existsSync(DB_FILE)) {
    const seed: DatabaseSchema =
      seedAuthDatabase && Array.isArray((seedAuthDatabase as any).users)
        ? JSON.parse(JSON.stringify(seedAuthDatabase))
        : {
            users: [],
            sessions: [],
            refresh_tokens: [],
            email_verification_tokens: [],
            password_reset_tokens: [],
            login_history: [],
          };
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), "utf-8");
    } catch {
      // In read-only or serverless environments, continue in-memory if file write fails
    }
    return seed;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("[LearnGraph Auth] Failed to read database, falling back to seed", e);
    return seedAuthDatabase && Array.isArray((seedAuthDatabase as any).users)
      ? JSON.parse(JSON.stringify(seedAuthDatabase))
      : {
          users: [],
          sessions: [],
          refresh_tokens: [],
          email_verification_tokens: [],
          password_reset_tokens: [],
          login_history: [],
        };
  }
}

function saveDatabase(db: DatabaseSchema): void {
  ensureDbDirectory();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

// ─────────────────────────────────────────────────────────────────────────────
// Cryptography Utilities
// ─────────────────────────────────────────────────────────────────────────────

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

export function createJWT(
  payload: Record<string, unknown>,
  expiresInSeconds: number
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(signatureInput)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${signatureInput}.${signature}`;
}

export function verifyJWT(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Malformed JWT" };
    }
    const [headerB64, payloadB64, signatureB64] = parts;
    const signatureInput = `${headerB64}.${payloadB64}`;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(signatureInput)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (
      Buffer.byteLength(signatureB64) !== Buffer.byteLength(expectedSignature) ||
      !crypto.timingSafeEqual(Buffer.from(signatureB64), Buffer.from(expectedSignature))
    ) {
      return { valid: false, error: "Invalid signature" };
    }

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: "Token expired" };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Format User Response (Compatible with both Frontend and Backend expectations)
// ─────────────────────────────────────────────────────────────────────────────

export function formatUserResponse(user: StoredUser) {
  return {
    id: user.id,
    name: user.full_name,
    full_name: user.full_name,
    username: user.username,
    email: user.email,
    role: user.role,
    emailVerified: user.is_verified,
    email_verified: user.is_verified,
    is_verified: user.is_verified,
    is_active: user.is_active,
    level: 1,
    avatar: user.avatar_url || "",
    avatar_url: user.avatar_url || "",
    initials: user.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    educationLevel: user.education_level,
    education_level: user.education_level,
    targetExam: user.target_exam,
    target_exam: user.target_exam,
    learningInterests: user.learning_goals || [],
    createdAt: user.created_at,
    created_at: user.created_at,
    preferences: {
      theme: "system",
      preferredLanguage: "English",
      preferredExplanationStyle: "Intuitive & Analogies",
      dailyStudyGoalMinutes: 60,
      emailNotifications: true,
      examReminders: true,
      aiTutorTone: "Friendly",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  });
  res.end(body);
}

function parseJsonBody(req: IncomingMessage): Promise<any> {
  // If Vercel or an upstream framework already parsed the body
  if ((req as any).body) {
    const b = (req as any).body;
    if (typeof b === "string") {
      try {
        return Promise.resolve(JSON.parse(b));
      } catch {
        return Promise.resolve({});
      }
    }
    return Promise.resolve(b);
  }

  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      // Safeguard against huge payloads
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error("Invalid JSON in request body"));
      }
    });
    req.on("error", reject);
  });
}

function getBearerToken(req: IncomingMessage): string | null {
  const auth = req.headers["authorization"];
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Route Dispatcher
// ─────────────────────────────────────────────────────────────────────────────

function getRequestBaseUrl(req: IncomingMessage): string {
  const host = req.headers.host || "localhost:5173";
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protoHeader = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
  const isEncrypted = Boolean((req.socket as { encrypted?: boolean } | undefined)?.encrypted);
  const protocol = protoHeader ? protoHeader.split(",")[0].trim() : isEncrypted ? "https" : "http";
  return `${protocol}://${host}`;
}

export async function handleAuthApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const url = req.url || "/";
  const parsedUrl = new URL(url, "http://localhost");
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    });
    res.end();
    return true;
  }

  // Health check
  if (pathname === "/api/v1/health" || pathname === "/health") {
    sendJson(res, 200, {
      status: "healthy",
      app: "LearnGraph",
      version: "2.0.0",
      environment: "development",
    });
    return true;
  }

  // We handle /api/v1/auth/*, /api/auth/*, /v1/auth/*, /auth/*, and /api/v1/users/me
  const isAuthRoute =
    pathname.startsWith("/api/v1/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/v1/auth") ||
    pathname.startsWith("/auth/") ||
    pathname === "/auth" ||
    pathname === "/api/v1/users/me" ||
    pathname === "/api/users/me" ||
    pathname === "/users/me";

  if (!isAuthRoute) {
    return false;
  }

  // Normalize sub-path: e.g. /api/v1/auth/register -> /register
  let subpath = pathname;
  if (subpath.startsWith("/api/v1/auth")) {
    subpath = subpath.slice("/api/v1/auth".length);
  } else if (subpath.startsWith("/api/auth")) {
    subpath = subpath.slice("/api/auth".length);
  } else if (subpath.startsWith("/v1/auth")) {
    subpath = subpath.slice("/v1/auth".length);
  } else if (subpath.startsWith("/auth")) {
    subpath = subpath.slice("/auth".length);
  }

  const db = loadDatabase();
  const method = req.method?.toUpperCase();
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "127.0.0.1";

  try {
    // ── 1. POST /register ───────────────────────────────────────────────────
    if (method === "POST" && subpath === "/register") {
      const body = await parseJsonBody(req);
      const email = (body.email || "").trim().toLowerCase();
      const password = body.password || "";
      const fullName = (body.full_name || body.name || "").trim();
      const role = body.role || "student";
      const educationLevel = body.educationLevel || body.education_level || "Class 12";
      const targetExam = body.targetExam || body.target_exam || "None";

      // Validations
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        sendJson(res, 422, { detail: "Please provide a valid email address." });
        return true;
      }
      if (!password || password.length < 8) {
        sendJson(res, 422, { detail: "Password must be at least 8 characters long." });
        return true;
      }
      if (!fullName) {
        sendJson(res, 422, { detail: "Full name is required." });
        return true;
      }

      // Check duplicate email
      const existingUser = db.users.find((u) => u.email === email);
      if (existingUser) {
        sendJson(res, 409, { detail: `User with email '${email}' already exists.` });
        return true;
      }

      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);
      const userId = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      const newUser: StoredUser = {
        id: userId,
        email,
        full_name: fullName,
        username: email.split("@")[0] + "_" + Math.floor(Math.random() * 1000),
        password_hash: passwordHash,
        salt,
        role: ["student", "teacher", "admin"].includes(role) ? role : "student",
        is_active: true,
        is_verified: false, // Must be verified via email link!
        education_level: educationLevel,
        target_exam: targetExam,
        learning_goals: [],
        avatar_url: "",
        failed_login_attempts: 0,
        locked_until: null,
        created_at: nowIso,
        updated_at: nowIso,
        last_login_at: null,
      };

      db.users.push(newUser);

      // Generate verification token (valid for 24 hours) - store ONLY hashed token!
      const rawVerificationToken = generateSecureToken();
      const hashedVerificationToken = hashToken(rawVerificationToken);
      const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

      // Invalidate any older tokens for this email
      for (const t of db.email_verification_tokens) {
        if (t.email === email) {
          t.used = true;
        }
      }

      db.email_verification_tokens.push({
        hashed_token: hashedVerificationToken,
        email,
        user_id: userId,
        expires_at: expiresAt,
        created_at: nowIso,
        used: false,
      });

      // Dispatch real verification email with raw token
      const baseUrl = getRequestBaseUrl(req);

      const emailResult = await emailService.sendVerificationEmail(
        email,
        fullName,
        rawVerificationToken,
        baseUrl
      );

      if (!emailResult.success) {
        // In local development without configured email credentials, auto-activate so developer is not blocked
        if (emailResult.error?.includes("No email provider credentials configured")) {
          newUser.is_verified = true;
          saveDatabase(db);
          sendJson(res, 201, {
            message: "Registration successful. You can now sign in.",
            user_id: userId,
            email: email,
          });
          return true;
        }

        console.error(
          `[LearnGraph Auth] ❌ Verification email dispatch failed to ${email}:`,
          emailResult.error
        );
        sendJson(res, 500, {
          detail: "We couldn't send the verification email. Please try again later.",
          code: "EMAIL_DELIVERY_FAILED",
        });
        return true;
      }

      saveDatabase(db);

      sendJson(res, 201, {
        message: "Registration successful. Please check your email to verify your account.",
        user_id: userId,
        email: email,
      });
      return true;
    }

    // ── 2. POST /verify-email ────────────────────────────────────────────────
    if (method === "POST" && subpath === "/verify-email") {
      const body = await parseJsonBody(req);
      const token = (body.token || body.tokenOrCode || "").trim();

      if (!token) {
        sendJson(res, 400, { detail: "Verification token is required." });
        return true;
      }

      const tokenHash = hashToken(token);
      const tokenRecord = db.email_verification_tokens.find(
        (t) => (t.hashed_token === tokenHash || t.token === token) && !t.used
      );

      if (!tokenRecord) {
        sendJson(res, 400, {
          detail: "Invalid or expired email verification link. Please request a new one.",
        });
        return true;
      }

      if (new Date(tokenRecord.expires_at) < new Date()) {
        sendJson(res, 400, {
          detail: "This verification link has expired. Please request a new one.",
        });
        return true;
      }

      const user = db.users.find((u) => u.email === tokenRecord.email);
      if (!user) {
        sendJson(res, 404, { detail: "User not found." });
        return true;
      }

      // Mark user and token as verified
      user.is_verified = true;
      user.updated_at = new Date().toISOString();
      tokenRecord.used = true;

      // Invalidate all tokens for this user
      db.email_verification_tokens = db.email_verification_tokens.filter(
        (t) => t.email !== user.email
      );

      // Create session
      const sessionId = crypto.randomUUID();
      const nowIso = new Date().toISOString();
      db.sessions.push({
        id: sessionId,
        user_id: user.id,
        device_name: "Web Browser (Verified)",
        device_type: "desktop",
        ip_address: clientIp,
        location: "Local",
        is_current: true,
        created_at: nowIso,
        last_active: nowIso,
      });

      // Generate JWT Access (15m) and Refresh Tokens (7d)
      const accessToken = createJWT(
        { sub: user.id, email: user.email, role: user.role, type: "access" },
        15 * 60
      );
      const refreshToken = generateSecureToken();
      db.refresh_tokens.push({
        token: refreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
        revoked: false,
      });

      saveDatabase(db);

      console.log(`[LearnGraph Auth] ✅ User ${user.email} email successfully verified!`);

      sendJson(res, 200, {
        message: "Email address successfully verified.",
        user: formatUserResponse(user),
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "bearer",
        expires_in: 900,
      });
      return true;
    }

    // ── 3. POST /resend-verification ─────────────────────────────────────────
    if (method === "POST" && subpath === "/resend-verification") {
      const body = await parseJsonBody(req);
      const email = (body.email || "").trim().toLowerCase();

      if (!email) {
        sendJson(res, 400, { detail: "Email address is required." });
        return true;
      }

      const user = db.users.find((u) => u.email === email);
      if (!user) {
        sendJson(res, 200, {
          message: "If an account with that email exists, verification instructions have been sent.",
        });
        return true;
      }

      if (user.is_verified) {
        sendJson(res, 200, {
          message: "Your email is already verified. You can sign in.",
        });
        return true;
      }

      const now = Date.now();
      const recentToken = db.email_verification_tokens.find((t) => {
        if (t.email !== email || !t.created_at) return false;
        return now - new Date(t.created_at).getTime() < 60000;
      });

      if (recentToken) {
        const remainingSec = Math.ceil(
          (60000 - (now - new Date(recentToken.created_at).getTime())) / 1000
        );
        sendJson(res, 429, {
          detail: `Please wait ${remainingSec} seconds before requesting another verification email.`,
          code: "RATE_LIMITED",
        });
        return true;
      }

      // Invalidate old tokens
      for (const t of db.email_verification_tokens) {
        if (t.email === email) {
          t.used = true;
        }
      }

      // Generate new token & store ONLY hashed token
      const rawVerificationToken = generateSecureToken();
      const hashedVerificationToken = hashToken(rawVerificationToken);
      const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      const nowIso = new Date().toISOString();

      db.email_verification_tokens.push({
        hashed_token: hashedVerificationToken,
        email,
        user_id: user.id,
        expires_at: expiresAt,
        created_at: nowIso,
        used: false,
      });

      // Dispatch real verification email
      const baseUrl = getRequestBaseUrl(req);

      const emailResult = await emailService.sendVerificationEmail(
        email,
        user.full_name,
        rawVerificationToken,
        baseUrl
      );

      if (!emailResult.success) {
        // In local development without configured email credentials, auto-activate so developer is not blocked
        if (emailResult.error?.includes("No email provider credentials configured")) {
          user.is_verified = true;
          saveDatabase(db);
          sendJson(res, 200, {
            message: "Account verified successfully. You can now sign in.",
          });
          return true;
        }

        console.error(
          `[LearnGraph Auth] ❌ Resend verification email failed to ${email}:`,
          emailResult.error
        );
        sendJson(res, 500, {
          detail: "We couldn't send the verification email. Please try again later.",
          code: "EMAIL_DELIVERY_FAILED",
        });
        return true;
      }

      saveDatabase(db);

      sendJson(res, 200, {
        message: "Verification email sent successfully. Please check your inbox.",
      });
      return true;
    }

    // ── 4. POST /login ───────────────────────────────────────────────────────
    if (method === "POST" && subpath === "/login") {
      const body = await parseJsonBody(req);
      const email = (body.email || "").trim().toLowerCase();
      const password = body.password || "";

      if (!email || !password) {
        sendJson(res, 400, { detail: "Email and password are required." });
        return true;
      }

      const user = db.users.find((u) => u.email === email);

      if (!user) {
        db.login_history.push({
          id: crypto.randomUUID(),
          user_id: null,
          email,
          ip_address: clientIp,
          timestamp: new Date().toISOString(),
          success: false,
          reason: "User not found",
        });
        saveDatabase(db);
        sendJson(res, 401, { detail: "Invalid email or password." });
        return true;
      }

      // Check account lockout
      if (user.locked_until) {
        const lockExpiry = new Date(user.locked_until);
        if (lockExpiry > new Date()) {
          const remainingMin = Math.ceil((lockExpiry.getTime() - Date.now()) / 60000);
          sendJson(res, 423, {
            detail: `Your account is temporarily locked due to repeated failed login attempts. Please try again after ${remainingMin} minutes or reset your password.`,
            code: "ACCOUNT_LOCKED",
          });
          return true;
        } else {
          // Lockout expired, reset attempts
          user.locked_until = null;
          user.failed_login_attempts = 0;
        }
      }

      // Verify password
      const computedHash = hashPassword(password, user.salt);
      if (computedHash !== user.password_hash) {
        user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
        if (user.failed_login_attempts >= 5) {
          user.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min lock
        }
        db.login_history.push({
          id: crypto.randomUUID(),
          user_id: user.id,
          email,
          ip_address: clientIp,
          timestamp: new Date().toISOString(),
          success: false,
          reason: "Incorrect password",
        });
        saveDatabase(db);

        if (user.failed_login_attempts >= 5) {
          sendJson(res, 423, {
            detail: "Your account is temporarily locked due to too many failed login attempts. Please try again after 30 minutes or reset your password.",
            code: "ACCOUNT_LOCKED",
          });
          return true;
        }

        sendJson(res, 401, {
          detail: "Invalid email or password.",
          remaining_attempts: Math.max(0, 5 - user.failed_login_attempts),
        });
        return true;
      }

      // Check email verification status
      if (!user.is_verified) {
        db.login_history.push({
          id: crypto.randomUUID(),
          user_id: user.id,
          email,
          ip_address: clientIp,
          timestamp: new Date().toISOString(),
          success: false,
          reason: "Email unverified",
        });
        saveDatabase(db);

        sendJson(res, 403, {
          detail: "Please verify your email before signing in.",
          code: "EMAIL_NOT_VERIFIED",
          email: user.email,
        });
        return true;
      }

      // Successful login -> reset failed attempts and update last_login
      user.failed_login_attempts = 0;
      user.locked_until = null;
      user.last_login_at = new Date().toISOString();

      // Create session
      const sessionId = crypto.randomUUID();
      const nowIso = new Date().toISOString();
      db.sessions.push({
        id: sessionId,
        user_id: user.id,
        device_name: "Web Browser (Active)",
        device_type: "desktop",
        ip_address: clientIp,
        location: "Local",
        is_current: true,
        created_at: nowIso,
        last_active: nowIso,
      });

      // Generate JWT Access (15m) and Refresh Tokens (7d)
      const accessToken = createJWT(
        { sub: user.id, email: user.email, role: user.role, type: "access" },
        15 * 60
      );
      const refreshToken = generateSecureToken();
      db.refresh_tokens.push({
        token: refreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
        revoked: false,
      });

      db.login_history.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        email,
        ip_address: clientIp,
        timestamp: nowIso,
        success: true,
        reason: "Successful login",
      });

      saveDatabase(db);

      sendJson(res, 200, {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "bearer",
        expires_in: 900,
        user: formatUserResponse(user),
      });
      return true;
    }

    // ── 5. POST /refresh ─────────────────────────────────────────────────────
    if (method === "POST" && subpath === "/refresh") {
      const body = await parseJsonBody(req);
      const refreshToken = body.refresh_token;

      if (!refreshToken) {
        sendJson(res, 400, { detail: "Refresh token is required." });
        return true;
      }

      const tokenRecord = db.refresh_tokens.find(
        (t) => t.token === refreshToken && !t.revoked
      );

      if (!tokenRecord || new Date(tokenRecord.expires_at) < new Date()) {
        sendJson(res, 401, { detail: "Refresh token is invalid or expired." });
        return true;
      }

      const user = db.users.find((u) => u.id === tokenRecord.user_id);
      if (!user || !user.is_active) {
        sendJson(res, 401, { detail: "User inactive or not found." });
        return true;
      }

      const newAccessToken = createJWT(
        { sub: user.id, email: user.email, role: user.role, type: "access" },
        15 * 60
      );

      sendJson(res, 200, {
        access_token: newAccessToken,
        refresh_token: refreshToken,
        token_type: "bearer",
        expires_in: 900,
        user: formatUserResponse(user),
      });
      return true;
    }

    // ── 6. GET & PUT /me and /users/me ────────────────────────────────────────
    if (
      (subpath === "/me" || pathname === "/api/v1/users/me" || pathname === "/users/me")
    ) {
      const token = getBearerToken(req);
      if (!token) {
        sendJson(res, 401, { detail: "Authentication required." });
        return true;
      }

      const verified = verifyJWT(token);
      if (!verified.valid || !verified.payload?.sub) {
        sendJson(res, 401, { detail: "Invalid or expired token." });
        return true;
      }

      const user = db.users.find((u) => u.id === verified.payload.sub);
      if (!user) {
        sendJson(res, 404, { detail: "User not found." });
        return true;
      }

      if (method === "GET") {
        sendJson(res, 200, formatUserResponse(user));
        return true;
      }

      if (method === "PUT") {
        const body = await parseJsonBody(req);
        if (body.full_name || body.name) {
          user.full_name = (body.full_name || body.name).trim();
        }
        if (body.educationLevel || body.education_level) {
          user.education_level = body.educationLevel || body.education_level;
        }
        if (body.targetExam || body.target_exam) {
          user.target_exam = body.targetExam || body.target_exam;
        }
        if (body.avatar || body.avatar_url) {
          user.avatar_url = body.avatar || body.avatar_url;
        }
        user.updated_at = new Date().toISOString();
        saveDatabase(db);

        sendJson(res, 200, formatUserResponse(user));
        return true;
      }
    }

    // ── 7. POST /forgot-password ─────────────────────────────────────────────
    if (method === "POST" && subpath === "/forgot-password") {
      const body = await parseJsonBody(req);
      const email = (body.email || "").trim().toLowerCase();

      const user = db.users.find((u) => u.email === email);
      if (user) {
        // Invalidate prior reset tokens
        for (const t of db.password_reset_tokens) {
          if (t.email === email) {
            t.used = true;
          }
        }

        const rawResetToken = generateSecureToken();
        const hashedResetToken = hashToken(rawResetToken);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min expiry
        const nowIso = new Date().toISOString();

        db.password_reset_tokens.push({
          hashed_token: hashedResetToken,
          email,
          user_id: user.id,
          expires_at: expiresAt,
          created_at: nowIso,
          used: false,
        });

        const baseUrl = getRequestBaseUrl(req);

        // Dispatch real password reset email
        await emailService.sendPasswordResetEmail(email, rawResetToken, baseUrl);
        saveDatabase(db);
      }

      sendJson(res, 200, {
        message: "If an account with that email exists, password reset instructions have been sent.",
      });
      return true;
    }

    // ── 8. POST /reset-password ──────────────────────────────────────────────
    if (method === "POST" && subpath === "/reset-password") {
      const body = await parseJsonBody(req);
      const token = (body.token || body.tokenOrCode || "").trim();
      const newPassword = body.new_password || body.newPassword;

      if (!token || !newPassword) {
        sendJson(res, 400, { detail: "Token and new password are required." });
        return true;
      }

      if (newPassword.length < 8) {
        sendJson(res, 422, { detail: "Password must be at least 8 characters long." });
        return true;
      }

      const tokenHash = hashToken(token);
      const tokenRecord = db.password_reset_tokens.find(
        (t) => (t.hashed_token === tokenHash || t.token === token) && !t.used
      );

      if (!tokenRecord || new Date(tokenRecord.expires_at) < new Date()) {
        sendJson(res, 400, {
          detail: "Password reset link is invalid or has expired (links expire after 15 minutes).",
        });
        return true;
      }

      const user = db.users.find((u) => u.email === tokenRecord.email);
      if (!user) {
        sendJson(res, 404, { detail: "User not found." });
        return true;
      }

      // Hash and update password
      user.salt = generateSalt();
      user.password_hash = hashPassword(newPassword, user.salt);
      user.failed_login_attempts = 0;
      user.locked_until = null;
      user.updated_at = new Date().toISOString();
      tokenRecord.used = true;

      // Invalidate existing sessions and refresh tokens for security
      db.sessions = db.sessions.filter((s) => s.user_id !== user.id);
      db.refresh_tokens = db.refresh_tokens.map((t) =>
        t.user_id === user.id ? { ...t, revoked: true } : t
      );

      saveDatabase(db);

      console.log(`[LearnGraph Auth] 🔑 Password reset successfully for ${user.email}`);

      sendJson(res, 200, {
        message: "Password has been reset successfully. You can now log in.",
      });
      return true;
    }

    // ── 9. POST /logout ──────────────────────────────────────────────────────
    if (method === "POST" && subpath === "/logout") {
      const token = getBearerToken(req);
      if (token) {
        const verified = verifyJWT(token);
        if (verified.valid && verified.payload?.sub) {
          const userId = verified.payload.sub;
          // Revoke active sessions for current IP
          db.sessions = db.sessions.filter(
            (s) => !(s.user_id === userId && s.ip_address === clientIp)
          );
        }
      }
      saveDatabase(db);
      sendJson(res, 200, { message: "Logged out successfully." });
      return true;
    }

    // ── 10. POST /logout-all ──────────────────────────────────────────────────
    if (method === "POST" && subpath === "/logout-all") {
      const token = getBearerToken(req);
      if (token) {
        const verified = verifyJWT(token);
        if (verified.valid && verified.payload?.sub) {
          const userId = verified.payload.sub;
          db.sessions = db.sessions.filter((s) => s.user_id !== userId);
          db.refresh_tokens = db.refresh_tokens.map((t) =>
            t.user_id === userId ? { ...t, revoked: true } : t
          );
        }
      }
      saveDatabase(db);
      sendJson(res, 200, { message: "Logged out from all devices successfully." });
      return true;
    }

    // ── 11. GET /sessions ────────────────────────────────────────────────────
    if (method === "GET" && subpath === "/sessions") {
      const token = getBearerToken(req);
      if (!token) {
        sendJson(res, 401, { detail: "Authentication required." });
        return true;
      }
      const verified = verifyJWT(token);
      if (!verified.valid || !verified.payload?.sub) {
        sendJson(res, 401, { detail: "Invalid token." });
        return true;
      }

      const userSessions = db.sessions.filter((s) => s.user_id === verified.payload.sub);
      sendJson(
        res,
        200,
        userSessions.map((s) => ({
          id: s.id,
          userId: s.user_id,
          deviceName: s.device_name,
          deviceType: s.device_type,
          ipAddress: s.ip_address,
          location: s.location,
          lastActive: "Just now",
          isCurrent: s.ip_address === clientIp,
          createdAt: s.created_at,
        }))
      );
      return true;
    }

    // ── 12. DELETE /sessions/:id ─────────────────────────────────────────────
    if (method === "DELETE" && subpath.startsWith("/sessions/")) {
      const sessionId = subpath.slice("/sessions/".length);
      db.sessions = db.sessions.filter((s) => s.id !== sessionId);
      saveDatabase(db);
      sendJson(res, 200, { message: "Session revoked successfully." });
      return true;
    }

    // Not handled by auth endpoints
    return false;
  } catch (err: any) {
    console.error("[LearnGraph Auth] Server error:", err);
    sendJson(res, 500, { detail: "Internal authentication server error: " + err.message });
    return true;
  }
}
