/**
 * LearnGraph — API Client
 * Production axios instance with:
 * - JWT Bearer token attachment
 * - Silent 401 → access-token refresh → retry
 * - Logout on refresh failure
 *
 * NOTE: apiWithFallback and simulateDelay are kept ONLY for non-auth APIs
 * (courses, analytics, graph) that have local mock data as a UI convenience.
 * Auth APIs use direct calls only — no fallback, no mock.
 */

import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_CONFIG } from "@/config/api.config";

/* ─────────────────────────────────────────────────────────────────────────────
   Core axios instance
───────────────────────────────────────────────────────────────────────────── */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ─────────────────────────────────────────────────────────────────────────────
   Request Interceptor — attach access token
───────────────────────────────────────────────────────────────────────────── */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Dynamically read from Zustand store (avoids circular import issues)
    try {
      const raw = localStorage.getItem("learngraph_v2_auth_state");
      if (raw) {
        const state = JSON.parse(raw);
        const token = state?.state?.token;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // ignore parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─────────────────────────────────────────────────────────────────────────────
   Response Interceptor — 401 → silent refresh → retry
───────────────────────────────────────────────────────────────────────────── */
interface QueueItem {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // On 401, attempt token refresh (unless this IS the refresh call)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh" &&
      originalRequest.url !== "/auth/login"
    ) {
      if (isRefreshing) {
        // Queue while refresh is in progress
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const raw = localStorage.getItem("learngraph_v2_auth_state");
        const refreshToken = raw
          ? JSON.parse(raw)?.state?.refreshToken
          : null;

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const { data } = await axios.post(
          `${API_CONFIG.baseURL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newToken: string = data.access_token;

        // Update Zustand persist store with new token
        const storeRaw = localStorage.getItem("learngraph_v2_auth_state");
        if (storeRaw) {
          const store = JSON.parse(storeRaw);
          store.state.token = newToken;
          localStorage.setItem("learngraph_v2_auth_state", JSON.stringify(store));
        }

        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear auth state and redirect to login
        localStorage.removeItem("learngraph_v2_auth_state");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error shape
    let message =
      error.response?.data?.detail ||
      error.response?.data?.message;

    if (!message) {
      if (!error.response) {
        if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
          message = "Request timed out. Please check your connection and try again.";
        } else {
          message = "Unable to connect to the server. Please check your network connection and try again.";
        }
      } else {
        message = error.message || "An unexpected error occurred. Please try again.";
      }
    }

    const customError = {
      message,
      status: error.response?.status || (error.code === "ECONNABORTED" ? 408 : 503),
      code: error.response?.data?.code || (error.code === "ECONNABORTED" ? "TIMEOUT" : "NETWORK_ERROR"),
      data: error.response?.data,
      isNetworkError: !error.response,
    };
    return Promise.reject(customError);
  }
);

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers (retained for non-auth mock data, e.g. courses/analytics/graph)
───────────────────────────────────────────────────────────────────────────── */

/** Simulate network latency — used ONLY for non-auth mock data */
export async function simulateDelay<T>(data: T, delayMs = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs));
}

/**
 * Resilient API execution for non-auth endpoints:
 * Tries real backend; on network error falls back to mock data.
 * Auth endpoints must NOT use this — they call apiClient directly.
 */
export async function apiWithFallback<T>(
  apiCall: () => Promise<T>,
  mockFallback: () => Promise<T>
): Promise<T> {
  if (API_CONFIG.useMock) {
    return mockFallback();
  }
  try {
    return await apiCall();
  } catch (err: any) {
    if (err.isNetworkError || err.status === 503) {
      console.warn("[LearnGraph] Backend offline — using local data.", err.message);
      return mockFallback();
    }
    throw err;
  }
}
