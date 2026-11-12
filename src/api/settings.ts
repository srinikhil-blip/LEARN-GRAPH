import { simulateDelay } from "./client";
import type { UserSettings } from "@/types/settings";
import { MOCK_USER_SETTINGS } from "@/mock/settings.mock";

export const settingsApi = {
  getSettings: async (): Promise<UserSettings> => {
    return simulateDelay(MOCK_USER_SETTINGS);
  },

  updateSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    return simulateDelay({ ...MOCK_USER_SETTINGS, ...settings });
  },
};
