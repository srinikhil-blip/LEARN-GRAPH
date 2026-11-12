/**
 * LearnGraph — API Configuration
 * Configures base URL, timeout, and endpoints connecting the React frontend
 * to the FastAPI + PostgreSQL + Neo4j backend at http://localhost:8000/api/v1
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  timeout: 10000,
  // When true or when live backend is offline, gracefully falls back to mock data
  useMock: false,
  endpoints: {
    auth: {
      login: "/auth/login",
      register: "/auth/register",
      me: "/auth/me",
      otp: "/auth/verify-otp",
      forgot: "/auth/forgot-password",
      refresh: "/auth/refresh",
    },
    student: {
      profile: "/students/profile",
      progress: "/students/progress",
      dashboard: "/students/dashboard",
      studyPlan: "/students/study-plan",
    },
    courses: {
      list: "/courses",
      details: (id: string) => `/courses/${id}`,
      enroll: (id: string) => `/courses/${id}/enroll`,
    },
    graph: {
      data: "/knowledge-graph/student",
      analytics: "/knowledge-graph/analytics",
      concept: (id: string) => `/knowledge-graph/concepts/${id}`,
      search: "/knowledge-graph/search",
    },
    tutor: {
      chat: "/chat/sessions",
      history: "/chat/sessions",
      upload: "/uploads",
    },
    quiz: {
      get: "/quiz",
      generate: "/quiz/generate",
      submit: "/quiz/submit",
      results: "/quiz/history",
    },
    analytics: {
      overview: "/analytics/weekly",
      activity: "/analytics/weekly",
      prediction: "/analytics/weekly",
      heatmap: "/analytics/weekly",
    },
    recommendations: {
      list: "/recommendations",
      path: "/recommendations",
    },
    teacher: {
      stats: "/teachers/dashboard",
      students: "/teachers/dashboard",
      report: "/teachers/dashboard",
    },
    admin: {
      kpis: "/admin/kpis",
      health: "/health",
      users: "/admin/users",
      modelConfig: "/admin/model-config",
    },
    notifications: {
      list: "/notifications",
      unreadCount: "/notifications/unread-count",
      markRead: (id: string) => `/notifications/${id}/read`,
      markAllRead: "/notifications/read-all",
    },
  },
} as const;
