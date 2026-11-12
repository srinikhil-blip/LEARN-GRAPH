import { apiClient, apiWithFallback, simulateDelay } from "./client";
import { API_CONFIG } from "@/config/api.config";
import type {
  RecommendationItem,
  LearningPath,
  CompactRecommendation,
} from "@/types/recommendation";
import {
  MOCK_RECOMMENDATIONS,
  MOCK_LEARNING_PATH,
  MOCK_COMPACT_RECS,
} from "@/mock/recommendations.mock";

export const recommendationApi = {
  getRecommendations: async (): Promise<RecommendationItem[]> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(API_CONFIG.endpoints.recommendations.list);
        if (Array.isArray(res.data) && res.data.length > 0) {
          return res.data.map((r: any, idx: number) => ({
            id: `rec-live-${idx}`,
            title: r.title,
            text: r.description,
            type: "PRACTICE" as const,
            tone: "indigo" as const,
            matchedReason: r.reason,
          }));
        }
        return MOCK_RECOMMENDATIONS;
      },
      async () => simulateDelay(MOCK_RECOMMENDATIONS)
    );
  },

  getLearningPath: async (): Promise<LearningPath> => {
    return simulateDelay(MOCK_LEARNING_PATH);
  },

  getCompactRecommendations: async (): Promise<CompactRecommendation[]> => {
    return simulateDelay(MOCK_COMPACT_RECS);
  },
};
