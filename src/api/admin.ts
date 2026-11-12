import { apiClient, apiWithFallback, simulateDelay } from "./client";
import { API_CONFIG } from "@/config/api.config";
import type {
  AdminKPI,
  SystemHealthService,
  UserGrowthCategory,
  AIModelConfiguration,
} from "@/types/admin";
import {
  MOCK_ADMIN_KPIS,
  MOCK_SYSTEM_HEALTH,
  MOCK_USER_GROWTH,
  MOCK_MODEL_CONFIG,
} from "@/mock/admin.mock";

export const adminApi = {
  getKPIs: async (): Promise<AdminKPI[]> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(API_CONFIG.endpoints.admin.kpis);
        return res.data;
      },
      async () => simulateDelay(MOCK_ADMIN_KPIS)
    );
  },

  getSystemHealth: async (): Promise<SystemHealthService[]> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(API_CONFIG.endpoints.admin.health);
        return res.data;
      },
      async () => simulateDelay(MOCK_SYSTEM_HEALTH)
    );
  },

  getUserGrowth: async (): Promise<UserGrowthCategory[]> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(API_CONFIG.endpoints.admin.users);
        return res.data;
      },
      async () => simulateDelay(MOCK_USER_GROWTH)
    );
  },

  getModelConfig: async (): Promise<AIModelConfiguration> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(API_CONFIG.endpoints.admin.modelConfig);
        return res.data;
      },
      async () => simulateDelay(MOCK_MODEL_CONFIG)
    );
  },
};
