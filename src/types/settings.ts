export interface ConnectedApp {
  id: string;
  name: string;
  statusText: string;
  color: "orange" | "green" | "red" | "blue";
  connected: boolean;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  reduceMotion: boolean;
  highContrast: boolean;
  notifications: {
    studyReminders: boolean;
    weeklyProgressReport: boolean;
    aiRecommendations: boolean;
    courseUpdates: boolean;
  };
  connectedApps: ConnectedApp[];
}
