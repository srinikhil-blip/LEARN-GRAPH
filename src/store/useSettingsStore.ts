import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserSettings } from "@/types/settings";
import { MOCK_USER_SETTINGS } from "@/mock/settings.mock";

interface SettingsStoreState {
  settings: UserSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleReduceMotion: () => void;
  toggleHighContrast: () => void;
  toggleNotificationSetting: (key: keyof UserSettings["notifications"]) => void;
}

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      settings: MOCK_USER_SETTINGS,
      activeTab: "Appearance",
      setActiveTab: (activeTab) => set({ activeTab }),
      toggleReduceMotion: () =>
        set((s) => ({
          settings: { ...s.settings, reduceMotion: !s.settings.reduceMotion },
        })),
      toggleHighContrast: () =>
        set((s) => ({
          settings: { ...s.settings, highContrast: !s.settings.highContrast },
        })),
      toggleNotificationSetting: (key) =>
        set((s) => ({
          settings: {
            ...s.settings,
            notifications: {
              ...s.settings.notifications,
              [key]: !s.settings.notifications[key],
            },
          },
        })),
    }),
    {
      name: "learngraph_settings",
    }
  )
);
