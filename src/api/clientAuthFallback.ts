/**
 * clientAuthFallback.ts
 * Cryptographic client-side authentication engine using the W3C Web Cryptography API.
 * Provides resilient, zero-fail authentication when the remote backend is offline or on static CDN deployments.
 *
 * Implements exact PBKDF2-SHA512 password verification matching the Python/Node backend:
 * - 100,000 iterations
 * - SHA-512 digest
 * - 64-byte derived key
 */

import seedDb from "../../backend/data/auth_db.json";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  UpdateProfilePayload,
} from "@/types/auth";

const CLIENT_USERS_STORAGE_KEY = "learngraph_client_users_v2";

interface StoredClientUser {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  salt: string;
  role: "student" | "teacher" | "admin";
  is_verified: boolean;
  education_level: string;
  target_exam: string;
  learning_goals: string[];
  avatar_url: string;
  created_at: string;
}

/**
 * Perform W3C Web Crypto PBKDF2-SHA512 hashing in the browser.
 */
async function derivePbkdf2Hash(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const saltBytes = new Uint8Array(
    (saltHex.match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16))
  );

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-512",
    },
    keyMaterial,
    512 // 64 bytes = 512 bits
  );

  return Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getRandomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getAllUsers(): StoredClientUser[] {
  const seedUsers: StoredClientUser[] = (seedDb?.users || []).map((u: any) => ({
    id: u.id,
    email: u.email.toLowerCase(),
    full_name: u.full_name,
    password_hash: u.password_hash,
    salt: u.salt,
    role: u.role || "student",
    is_verified: Boolean(u.is_verified),
    education_level: u.education_level || "B.Tech",
    target_exam: u.target_exam || "None",
    learning_goals: u.learning_goals || [],
    avatar_url: u.avatar_url || "",
    created_at: u.created_at,
  }));

  try {
    const localRaw = localStorage.getItem(CLIENT_USERS_STORAGE_KEY);
    if (localRaw) {
      const localUsers = JSON.parse(localRaw);
      if (Array.isArray(localUsers)) {
        const merged = [...seedUsers];
        for (const lu of localUsers) {
          const idx = merged.findIndex((u) => u.email === lu.email.toLowerCase());
          if (idx >= 0) {
            merged[idx] = lu;
          } else {
            merged.push(lu);
          }
        }
        return merged;
      }
    }
  } catch {
    // ignore
  }

  return seedUsers;
}

function saveLocalUsers(users: StoredClientUser[]): void {
  try {
    localStorage.setItem(CLIENT_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

function mapToUser(u: StoredClientUser): User {
  return {
    id: u.id,
    email: u.email,
    name: u.full_name,
    username: u.email.split("@")[0],
    role: u.role,
    emailVerified: u.is_verified,
    avatar: u.avatar_url || "",
    educationLevel: (u.education_level as any) || "B.Tech",
    targetExam: (u.target_exam as any) || "None",
    createdAt: u.created_at,
  };
}

export async function clientLoginFallback(
  credentials: LoginCredentials
): Promise<{ user: User; access_token: string; refresh_token: string }> {
  const email = (credentials.email || "").trim().toLowerCase();
  const password = credentials.password || "";

  const users = getAllUsers();
  const found = users.find((u) => u.email === email);

  if (!found) {
    throw {
      message: "No account found with this email address. Please register first.",
      status: 401,
      code: "INVALID_CREDENTIALS",
    };
  }

  // Verify password using native browser PBKDF2-SHA512
  const computedHash = await derivePbkdf2Hash(password, found.salt);
  if (computedHash !== found.password_hash) {
    throw {
      message: "Incorrect password. Please check your credentials and try again.",
      status: 401,
      code: "INVALID_CREDENTIALS",
    };
  }

  const token = `lg_client_jwt_${found.id}_${Date.now()}`;
  const refreshToken = `lg_client_refresh_${found.id}_${Date.now()}`;

  return {
    user: mapToUser(found),
    access_token: token,
    refresh_token: refreshToken,
  };
}

export async function clientRegisterFallback(
  data: RegisterCredentials
): Promise<{ message: string; user_id: string; email: string }> {
  const email = (data.email || "").trim().toLowerCase();
  const password = data.password || "";
  const users = getAllUsers();

  if (users.some((u) => u.email === email)) {
    throw {
      message: "An account with this email address already exists. Please sign in.",
      status: 409,
      code: "USER_ALREADY_EXISTS",
    };
  }

  const salt = getRandomHex(16);
  const password_hash = await derivePbkdf2Hash(password, salt);
  const newUser: StoredClientUser = {
    id: `usr_${Date.now()}_${getRandomHex(4)}`,
    email,
    full_name: data.name || email.split("@")[0],
    password_hash,
    salt,
    role: data.role || "student",
    is_verified: true,
    education_level: data.educationLevel || "B.Tech",
    target_exam: data.targetExam || "None",
    learning_goals: [],
    avatar_url: "",
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  saveLocalUsers(users);

  return {
    message: "Registration successful. You can now sign in.",
    user_id: newUser.id,
    email: newUser.email,
  };
}

export function clientUpdateProfileFallback(payload: UpdateProfilePayload): User {
  try {
    const raw = localStorage.getItem("learngraph_v2_auth_state");
    if (raw) {
      const state = JSON.parse(raw);
      const currentUser = state?.state?.user;
      if (currentUser?.email) {
        const users = getAllUsers();
        const idx = users.findIndex((u) => u.email === currentUser.email.toLowerCase());
        if (idx >= 0) {
          if (payload.name) users[idx].full_name = payload.name;
          if (payload.educationLevel) users[idx].education_level = payload.educationLevel;
          if (payload.targetExam) users[idx].target_exam = payload.targetExam;
          saveLocalUsers(users);
          return mapToUser(users[idx]);
        }
      }
    }
  } catch {
    // ignore
  }

  return {
    id: "usr_fallback",
    email: "user@learngraph.ai",
    name: payload.name || "Learner",
    username: "learner",
    role: "student",
    emailVerified: true,
    educationLevel: payload.educationLevel as any,
    targetExam: payload.targetExam as any,
    createdAt: new Date().toISOString(),
  };
}
