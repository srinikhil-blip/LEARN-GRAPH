/**
 * streak.ts — Daily Learning Streak API
 * Connects the frontend to the persistent daily streak engine.
 */

import { apiClient, apiWithFallback } from "./client";
import { API_CONFIG } from "@/config/api.config";
import { userProgressService } from "@/services/userProgressService";

export interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  total_active_days: number;
  last_activity_date: string | null;
  is_active_today: boolean;
  today_date: string;
  user_timezone: string;
  weekly_activity: boolean[]; // 7 items (Mon - Sun)
  weekly_labels: string[]; // ["M", "T", "W", "T", "F", "S", "S"]
  motivational_message: string;
  next_milestone: number;
  days_to_next_milestone: number;
  unlocked_milestones: number[];
  new_milestone_achieved?: number | null;
}

export interface LearningActivityPayload {
  activity_type:
    | "lesson_completion"
    | "quiz_completion"
    | "exercise_completion"
    | "milestone_completion";
  course_id?: string;
  lesson_id?: string;
  quiz_id?: string;
  score?: number;
  details?: string;
  timezone?: string;
}

export interface StreakRecordResult {
  success: boolean;
  streak: StreakInfo;
  activity?: {
    id: string;
    activity_type: string;
    activity_date: string;
    created_at: string;
  };
  message: string;
  new_milestone_reached?: number | null;
}

export interface StreakHistoryDay {
  date: string;
  activity_count: number;
  activity_types: string[];
}

export const streakApi = {
  /**
   * Fetch authoritative daily learning streak data.
   */
  getStreak: async (): Promise<StreakInfo> => {
    return apiWithFallback(
      async () => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
        const res = await apiClient.get<StreakInfo>(API_CONFIG.endpoints.streak.get, {
          params: { timezone: tz },
        });
        return res.data;
      },
      async () => {
        return userProgressService.getStreakInfo();
      }
    );
  },

  /**
   * Record a verified qualifying activity (completing lesson, quiz, or exercise).
   * Validated against duplicate increment on the same calendar day.
   */
  recordActivity: async (
    payload: LearningActivityPayload
  ): Promise<StreakRecordResult> => {
    const tz = payload.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    const body = { ...payload, timezone: tz };

    return apiWithFallback(
      async () => {
        const res = await apiClient.post<StreakRecordResult>(
          API_CONFIG.endpoints.streak.activity,
          body
        );
        // Also update local service mirror
        if (res.data?.streak) {
          userProgressService.syncStreakFromBackend(res.data.streak);
        }
        return res.data;
      },
      async () => {
        return userProgressService.recordQualifyingActivity(body);
      }
    );
  },

  /**
   * Fetch past 30 days of calendar streak history.
   */
  getHistory: async (days = 30): Promise<{ history: StreakHistoryDay[] }> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(API_CONFIG.endpoints.streak.history, {
          params: { days },
        });
        return res.data;
      },
      async () => {
        return userProgressService.getStreakHistory(days);
      }
    );
  },
};
