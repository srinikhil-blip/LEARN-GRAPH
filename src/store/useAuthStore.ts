import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types/auth";

/**
 * Checks if a JWT token is expired.
 * Returns true if expired or if token cannot be parsed.
 */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false; // No expiry claim — treat as valid
    return Date.now() / 1000 > payload.exp;
  } catch {
    return true;
  }
}

interface AuthStoreState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  emailPendingVerification: string | null;
  role: UserRole;
  login: (user: User, token: string, refreshToken?: string) => void;
  setToken: (token: string) => void;
  setPendingVerificationEmail: (email: string | null) => void;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  setRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      // Clean initial state — no pre-logged-in user
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      emailPendingVerification: null,
      role: "student",

      login: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: user.emailVerified === true,
          emailPendingVerification: user.emailVerified ? null : user.email,
          role: user.role,
        }),

      setToken: (token) => set({ token }),

      setPendingVerificationEmail: (email) =>
        set({ emailPendingVerification: email }),

      logout: async () => {
        // Attempt to call backend logout; ignore errors (token may be expired)
        try {
          const { apiClient } = await import("@/api/client");
          await apiClient.post("/auth/logout");
        } catch {
          // Silently ignore — we still clear local state
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          emailPendingVerification: null,
          role: "student",
        });
      },

      logoutAll: async () => {
        try {
          const { apiClient } = await import("@/api/client");
          await apiClient.post("/auth/logout-all");
        } catch {
          // Silently ignore
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          emailPendingVerification: null,
          role: "student",
        });
      },

      updateUser: (updated) => {
        const curr = get().user;
        if (curr) {
          set({ user: { ...curr, ...updated } });
        }
      },

      setRole: (role) => set({ role }),
    }),
    {
      name: "learngraph_v2_auth_state",
      onRehydrateStorage: () => (state) => {
        // On hydration: if token exists but is expired, clear auth state
        if (state?.token && isTokenExpired(state.token)) {
          state.user = null;
          state.token = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          state.emailPendingVerification = null;
          state.role = "student";
        }
      },
    }
  )
);
