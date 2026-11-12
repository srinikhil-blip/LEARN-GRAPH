import { create } from "zustand";
import type { StudentStats } from "@/types/student";
import { MOCK_STUDENT_STATS } from "@/mock/student.mock";

interface StudentStoreState {
  stats: StudentStats;
  updateStats: (partial: Partial<StudentStats>) => void;
  incrementStreak: () => void;
}

export const useStudentStore = create<StudentStoreState>((set) => ({
  stats: MOCK_STUDENT_STATS,
  updateStats: (partial) => set((s) => ({ stats: { ...s.stats, ...partial } })),
  incrementStreak: () =>
    set((s) => ({
      stats: { ...s.stats, dailyStreak: s.stats.dailyStreak + 1 },
    })),
}));
