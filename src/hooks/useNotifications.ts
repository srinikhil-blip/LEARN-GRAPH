import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/api/notification";
import { useNotificationStore } from "@/store/useNotificationStore";

export function useNotifications() {
  const queryClient = useQueryClient();
  const { markAsRead: storeMarkRead, markAllAsRead: storeMarkAllRead, activeFilter, setFilter } = useNotificationStore();

  const notificationsQuery = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationApi.getNotifications(),
    staleTime: 60 * 1000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: (_, id) => {
      storeMarkRead(id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      storeMarkAllRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const items = notificationsQuery.data || [];
  const filteredItems = items.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "AI insights") return item.category === "ai";
    if (activeFilter === "Reminders") return item.category === "reminders";
    if (activeFilter === "Courses") return item.category === "courses";
    return true;
  });

  const unreadCount = items.filter((n) => !n.read).length;

  return {
    notifications: filteredItems,
    allItems: items,
    unreadCount,
    activeFilter,
    setFilter,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    markAsRead: markReadMutation.mutateAsync,
    markAllAsRead: markAllReadMutation.mutateAsync,
    refetch: notificationsQuery.refetch,
  };
}
