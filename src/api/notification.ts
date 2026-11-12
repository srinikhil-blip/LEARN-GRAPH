import { apiClient, apiWithFallback, simulateDelay } from "./client";
import { API_CONFIG } from "@/config/api.config";
import type { NotificationItem } from "@/types/notification";
import { MOCK_NOTIFICATIONS } from "@/mock/notifications.mock";

export const notificationApi = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(API_CONFIG.endpoints.notifications.list);
        if (Array.isArray(res.data)) {
          return res.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            text: n.body,
            time: n.created_at ? "Recently" : "1h ago",
            read: n.is_read,
            tone: "indigo" as const,
            category: "all" as const,
          }));
        }
        return MOCK_NOTIFICATIONS;
      },
      async () => simulateDelay(MOCK_NOTIFICATIONS)
    );
  },

  markAsRead: async (id: string): Promise<{ success: boolean }> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.post(API_CONFIG.endpoints.notifications.markRead(id));
        return res.data;
      },
      async () => simulateDelay({ success: true })
    );
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.post(API_CONFIG.endpoints.notifications.markAllRead);
        return res.data;
      },
      async () => simulateDelay({ success: true })
    );
  },
};
