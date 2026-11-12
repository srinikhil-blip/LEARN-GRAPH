import { create } from "zustand";
import type { NotificationItem } from "@/types/notification";
import { MOCK_NOTIFICATIONS } from "@/mock/notifications.mock";

interface NotificationStoreState {
  notifications: NotificationItem[];
  unreadCount: number;
  activeFilter: string;
  setFilter: (filter: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.read).length,
  activeFilter: "All",
  setFilter: (activeFilter) => set({ activeFilter }),
  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
