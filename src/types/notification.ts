export interface NotificationItem {
  id: string;
  title: string;
  text: string;
  time: string;
  tone: "indigo" | "amber" | "cyan" | "emerald" | "violet";
  read: boolean;
  category: "all" | "ai" | "reminders" | "courses";
  iconName?: string;
}
