/**
 * LearnGraph — Auth API
 * Production-only implementation. NO mock fallbacks. NO demo data.
 * All requests go to the FastAPI backend at http://localhost:8000/api/v1
 *
 * If the backend is offline, the user sees a proper error — not fake data.
 */

import { apiClient } from "./client";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  VerifyEmailPayload,
  ResendVerificationPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  UpdateProfilePayload,
  UserSession,
} from "@/types/auth";

export const authApi = {
  /**
   * Login — email + password.
   * Backend validates: email exists, password correct, email verified.
   * Returns access_token (15min), refresh_token (7d/30d), and user object.
   */
  login: async (
    credentials: LoginCredentials
  ): Promise<{ user: User; access_token: string; refresh_token: string }> => {
    const res = await apiClient.post("/auth/login", credentials);
    return res.data;
  },

  /**
   * Register new account.
   * Backend creates user (email_verified=false), sends verification email.
   * Returns: { message, user_id, email, verification_token }
   */
  register: async (
    data: RegisterCredentials
  ): Promise<{ message: string; user_id: string; email: string; verification_token?: string }> => {
    const res = await apiClient.post("/auth/register", {
      ...data,
      full_name: data.name,
    });
    return res.data;
  },

  /**
   * Verify email using token from the verification link.
   * Backend marks email_verified=true, issues access + refresh tokens.
   */
  verifyEmail: async (
    payload: VerifyEmailPayload
  ): Promise<{ user: User; access_token: string; refresh_token: string }> => {
    const res = await apiClient.post("/auth/verify-email", {
      token: payload.tokenOrCode,
    });
    return res.data;
  },

  /**
   * Resend verification email.
   */
  resendVerification: async (
    payload: ResendVerificationPayload
  ): Promise<{ message: string }> => {
    const res = await apiClient.post("/auth/resend-verification", payload);
    return res.data;
  },

  /**
   * Request password reset link (sent via email).
   * Always returns success message to prevent email enumeration.
   */
  forgotPassword: async (
    payload: ForgotPasswordPayload
  ): Promise<{ message: string }> => {
    const res = await apiClient.post("/auth/forgot-password", payload);
    return res.data;
  },

  /**
   * Reset password using token from the reset email link.
   * Token expires in 15 minutes.
   */
  resetPassword: async (
    payload: ResetPasswordPayload
  ): Promise<{ message: string }> => {
    const res = await apiClient.post("/auth/reset-password", {
      token: payload.tokenOrCode,
      new_password: payload.newPassword,
    });
    return res.data;
  },

  /**
   * Change password for authenticated user.
   */
  changePassword: async (
    payload: ChangePasswordPayload
  ): Promise<{ message: string }> => {
    const res = await apiClient.post("/auth/change-password", payload);
    return res.data;
  },

  /**
   * Logout current device — revokes current refresh token and session.
   * Access token is blacklisted in Redis until expiry.
   */
  logout: async (refreshToken?: string | null): Promise<void> => {
    await apiClient.post("/auth/logout", {
      refresh_token: refreshToken ?? undefined,
    });
  },

  /**
   * Logout all devices — revokes all sessions and refresh tokens.
   */
  logoutAll: async (): Promise<void> => {
    await apiClient.post("/auth/logout-all");
  },

  /**
   * Get current authenticated user profile.
   */
  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },

  /**
   * Update user profile details.
   */
  updateProfile: async (
    payload: UpdateProfilePayload
  ): Promise<User> => {
    const res = await apiClient.put("/auth/me", payload);
    return res.data;
  },

  /**
   * Get all active sessions (devices) for the current user.
   */
  getSessions: async (): Promise<UserSession[]> => {
    const res = await apiClient.get("/auth/sessions");
    return res.data;
  },

  /**
   * Revoke a specific session (remote logout of a device).
   */
  revokeSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/auth/sessions/${sessionId}`);
  },

  /**
   * Refresh access token using stored refresh token.
   * Called automatically by the axios interceptor in client.ts.
   */
  refreshAccessToken: async (
    refreshToken: string
  ): Promise<{ access_token: string }> => {
    const res = await apiClient.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return res.data;
  },
};
