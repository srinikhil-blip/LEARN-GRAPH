import type { UserSettings } from "@/types/settings";

export const MOCK_USER_SETTINGS: UserSettings = {
  theme: "light",
  reduceMotion: false,
  highContrast: false,
  notifications: {
    studyReminders: true,
    weeklyProgressReport: true,
    aiRecommendations: false,
    courseUpdates: false,
  },
  connectedApps: [
    {
      id: "app-moodle",
      name: "Moodle",
      statusText: "Synced 4 minutes ago",
      color: "orange",
      connected: true,
    },
    {
      id: "app-classroom",
      name: "Google Classroom",
      statusText: "3 classes connected",
      color: "green",
      connected: true,
    },
    {
      id: "app-canvas",
      name: "Canvas LMS",
      statusText: "Not connected",
      color: "red",
      connected: false,
    },
  ],
};
