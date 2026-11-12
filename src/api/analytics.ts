import { apiClient, apiWithFallback, simulateDelay } from "./client";
import { API_CONFIG } from "@/config/api.config";
import type {
  AnalyticsOverview,
  ActivityDataPoint,
  AIPrediction,
  SubjectMastery,
} from "@/types/analytics";
import {
  MOCK_ANALYTICS_OVERVIEW,
  MOCK_ACTIVITY_DATA,
  MOCK_PREDICTION,
  MOCK_SUBJECT_MASTERY,
} from "@/mock/analytics.mock";

export const analyticsApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(API_CONFIG.endpoints.analytics.overview);
        return {
          ...MOCK_ANALYTICS_OVERVIEW,
          learningTimeHours: res.data.total_study_hours || MOCK_ANALYTICS_OVERVIEW.learningTimeHours,
          averageAccuracy: res.data.average_quiz_score ? Math.round(res.data.average_quiz_score) : MOCK_ANALYTICS_OVERVIEW.averageAccuracy,
          lessonsCompleted: res.data.quizzes_taken || MOCK_ANALYTICS_OVERVIEW.lessonsCompleted,
          currentStreakDays: res.data.streak_days || MOCK_ANALYTICS_OVERVIEW.currentStreakDays,
        };
      },
      async () => simulateDelay(MOCK_ANALYTICS_OVERVIEW)
    );
  },

  getActivityData: async (): Promise<ActivityDataPoint[]> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(API_CONFIG.endpoints.analytics.activity);
        return res.data.daily_breakdown || MOCK_ACTIVITY_DATA;
      },
      async () => simulateDelay(MOCK_ACTIVITY_DATA)
    );
  },

  getPrediction: async (): Promise<AIPrediction> => {
    return simulateDelay(MOCK_PREDICTION);
  },

  getSubjectMastery: async (): Promise<SubjectMastery[]> => {
    return simulateDelay(MOCK_SUBJECT_MASTERY);
  },
};
