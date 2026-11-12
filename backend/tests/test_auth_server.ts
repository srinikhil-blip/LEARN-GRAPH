/**
 * LearnGraph — Direct In-Process Authentication System Verification Suite
 * Tests all endpoints and logic with zero socket overhead.
 */

import { Readable, Writable } from "node:stream";
import { handleAuthApiRequest, hashToken } from "../../src/server/authServer.ts";
import { emailService } from "../../src/server/emailService.ts";
import type { IncomingMessage, ServerResponse } from "node:http";

function createMockReqRes(
  method: string,
  url: string,
  body?: any,
  headers: Record<string, string> = {}
): { req: IncomingMessage; res: ServerResponse; getResult: () => Promise<{ status: number; headers: any; data: any }> } {
  const reqStream = new Readable({
    read() {
      if (body) {
        this.push(JSON.stringify(body));
      }
      this.push(null);
    },
  }) as any;

  reqStream.method = method;
  reqStream.url = url;
  reqStream.headers = {
    host: "localhost:5173",
    "content-type": "application/json",
    ...headers,
  };

  let statusCode = 200;
  let responseHeaders: Record<string, string> = {};
  const chunks: Buffer[] = [];

  const resStream = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      callback();
    },
  }) as any;

  resStream.writeHead = function (code: number, headers?: any) {
    statusCode = code;
    if (headers) responseHeaders = headers;
    return this;
  };

  resStream.setHeader = function (name: string, value: string) {
    responseHeaders[name.toLowerCase()] = value;
    return this;
  };

  const getResult = (): Promise<{ status: number; headers: any; data: any }> => {
    return new Promise((resolve) => {
      resStream.on("finish", () => {
        const bodyStr = Buffer.concat(chunks).toString("utf-8");
        let parsed: any = null;
        try {
          parsed = bodyStr ? JSON.parse(bodyStr) : null;
        } catch {
          parsed = bodyStr;
        }
        resolve({ status: statusCode, headers: responseHeaders, data: parsed });
      });
    });
  };

  return { req: reqStream, res: resStream, getResult };
}

async function dispatch(
  method: string,
  url: string,
  body?: any,
  headers: Record<string, string> = {}
) {
  const { req, res, getResult } = createMockReqRes(method, url, body, headers);
  const handled = await handleAuthApiRequest(req, res);
  if (!handled) {
    res.writeHead(404);
    res.end();
  }
  return await getResult();
}

async function runTestSuite() {
  console.log("🚀 Starting In-Process LearnGraph Auth Verification...\n");

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "Password123!";
  let capturedToken = "";

  // Configure test email delivery provider
  (emailService as any).sendEmail = async (opts: any) => {
    const match = opts.html.match(/token=([a-f0-9]+)/);
    if (match) capturedToken = match[1];
    return { success: true, messageId: `msg_${Date.now()}`, provider: "resend" };
  };

  // 1. Health check
  console.log("Test 1: Health check GET /api/v1/health");
  const health = await dispatch("GET", "/api/v1/health");
  if (health.status !== 200 || health.data.status !== "healthy") {
    throw new Error(`Health check failed: ${JSON.stringify(health)}`);
  }
  console.log("  ✅ Health check returned status: healthy\n");

  // 2. Register
  console.log(`Test 2: Register User (${testEmail})`);
  const regRes = await dispatch("POST", "/api/v1/auth/register", {
    name: "Srinivas Rao",
    email: testEmail,
    password: testPassword,
    role: "student",
    educationLevel: "B.Tech",
    targetExam: "GATE CS/AI",
  });
  if (regRes.status !== 201) {
    throw new Error(`Registration failed: ${JSON.stringify(regRes)}`);
  }
  const token = capturedToken;
  console.log("  ✅ User successfully registered (HTTP 201)");
  console.log(`  🔑 Verification email received with token: ${token.slice(0, 16)}...\n`);

  // 3. Unverified Login
  console.log("Test 3: Attempt Login Before Verification");
  const unverifiedLogin = await dispatch("POST", "/api/v1/auth/login", {
    email: testEmail,
    password: testPassword,
  });
  if (unverifiedLogin.status !== 403 || unverifiedLogin.data?.code !== "EMAIL_NOT_VERIFIED") {
    throw new Error(`Unverified login should fail with 403, got: ${JSON.stringify(unverifiedLogin)}`);
  }
  console.log("  ✅ Correctly blocked unverified login with 403 EMAIL_NOT_VERIFIED\n");

  // 4. Verify Email
  console.log("Test 4: Verify Email With Token");
  const verifyRes = await dispatch("POST", "/api/v1/auth/verify-email", {
    token,
  });
  if (verifyRes.status !== 200 || !verifyRes.data?.access_token || !verifyRes.data?.user?.emailVerified) {
    throw new Error(`Email verification failed: ${JSON.stringify(verifyRes)}`);
  }
  console.log("  ✅ Email verified successfully! User emailVerified=true\n");

  // 5. Login
  console.log("Test 5: Login With Verified Credentials");
  const loginRes = await dispatch("POST", "/api/v1/auth/login", {
    email: testEmail,
    password: testPassword,
  });
  if (loginRes.status !== 200 || !loginRes.data?.access_token) {
    throw new Error(`Login failed: ${JSON.stringify(loginRes)}`);
  }
  const accessToken = loginRes.data.access_token;
  const refreshToken = loginRes.data.refresh_token;
  console.log("  ✅ Login successful! JWT Access & Refresh Tokens issued.\n");

  // 6. Current User
  console.log("Test 6: Get Current User (GET /api/v1/auth/me)");
  const meRes = await dispatch("GET", "/api/v1/auth/me", undefined, {
    authorization: `Bearer ${accessToken}`,
  });
  if (meRes.status !== 200 || meRes.data?.email !== testEmail) {
    throw new Error(`GET /me failed: ${JSON.stringify(meRes)}`);
  }
  console.log(`  ✅ Profile retrieved: ${meRes.data.name} (${meRes.data.email})\n`);

  // 7. Update Profile
  console.log("Test 7: Update Profile (PUT /api/v1/auth/me)");
  const updateRes = await dispatch("PUT", "/api/v1/auth/me", {
    name: "Srinivas Rao (Updated)",
    targetExam: "FAANG Placement",
  }, {
    authorization: `Bearer ${accessToken}`,
  });
  if (updateRes.status !== 200 || updateRes.data?.name !== "Srinivas Rao (Updated)") {
    throw new Error(`PUT /me failed: ${JSON.stringify(updateRes)}`);
  }
  console.log(`  ✅ Profile updated to: ${updateRes.data.name}\n`);

  // 8. Refresh Token
  console.log("Test 8: Refresh Access Token");
  const refreshRes = await dispatch("POST", "/api/v1/auth/refresh", {
    refresh_token: refreshToken,
  });
  if (refreshRes.status !== 200 || !refreshRes.data?.access_token) {
    throw new Error(`Token refresh failed: ${JSON.stringify(refreshRes)}`);
  }
  console.log("  ✅ Access token successfully refreshed!\n");

  // 9. Active Sessions
  console.log("Test 9: Get Active Sessions");
  const sessionsRes = await dispatch("GET", "/api/v1/auth/sessions", undefined, {
    authorization: `Bearer ${accessToken}`,
  });
  if (sessionsRes.status !== 200 || !Array.isArray(sessionsRes.data) || sessionsRes.data.length === 0) {
    throw new Error(`Get sessions failed: ${JSON.stringify(sessionsRes)}`);
  }
  console.log(`  ✅ Active sessions: ${sessionsRes.data.length} found.\n`);

  // 10. Account Lockout Protection (5 failed attempts)
  console.log("Test 10: Account Lockout after Repeated Failed Attempts");
  for (let i = 1; i <= 5; i++) {
    const failRes = await dispatch("POST", "/api/v1/auth/login", {
      email: testEmail,
      password: "WrongPassword999!",
    });
    if (i < 5) {
      if (failRes.status !== 401) {
        throw new Error(`Attempt ${i} should return 401, got ${failRes.status}`);
      }
    } else {
      if (failRes.status !== 423) {
        throw new Error(`5th attempt should lock account with 423, got ${failRes.status}`);
      }
      console.log("  ✅ Account successfully locked out (HTTP 423 Locked) after 5 failed attempts!\n");
    }
  }

  // 11. Logout
  console.log("Test 11: Logout");
  const logoutRes = await dispatch("POST", "/api/v1/auth/logout", undefined, {
    authorization: `Bearer ${accessToken}`,
  });
  if (logoutRes.status !== 200) {
    throw new Error(`Logout failed: ${JSON.stringify(logoutRes)}`);
  }
  console.log("  ✅ Logout successful (HTTP 200)!\n");

  console.log("🎉 ALL LEARNGRAPH AUTHENTICATION INVARIANTS PASSED 100%!");
}

runTestSuite().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
