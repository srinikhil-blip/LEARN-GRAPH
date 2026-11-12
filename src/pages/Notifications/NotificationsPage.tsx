import {
  BookOpen,
  Check,
  FileText,
  Flame,
  Sparkles,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationsPage() {
  const {
    notifications,
    allItems,
    activeFilter,
    setFilter,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const iconMap: Record<string, any> = {
    Sparkles,
    Flame,
    FileText,
    BookOpen,
    Trophy,
  };

  const tabs = [
    { label: "All", count: allItems.length },
    { label: "AI insights" },
    { label: "Reminders" },
    { label: "Courses" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="INBOX"
        title="Notifications"
        description="Updates, reminders, and insights from across your learning."
        action={
          <button className="text-button" onClick={() => markAllAsRead()}>
            Mark all as read <Check size={14} />
          </button>
        }
      />

      <div className="notification-layout">
        <div className="notification-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              className={activeFilter === tab.label ? "active" : ""}
              onClick={() => setFilter(tab.label)}
            >
              {tab.label} {tab.count !== undefined && <span>{tab.count}</span>}
            </button>
          ))}
        </div>

        <section className="notification-list">
          {notifications.map((item) => {
            const Icon = iconMap[item.iconName || "Sparkles"] || Sparkles;
            return (
              <article
                key={item.id}
                className={!item.read ? "unread" : ""}
                onClick={() => markAsRead(item.id)}
              >
                <span className={`notification-icon ${item.tone}`}>
                  <Icon />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                  <time>{item.time}</time>
                </div>
                <button
                  className="more"
                  aria-label="Notification options"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(item.id);
                  }}
                >
                  •••
                </button>
              </article>
            );
          })}
        </section>
      </div>
    </>
  );
}

export default NotificationsPage;
