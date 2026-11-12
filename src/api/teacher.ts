import { apiClient, simulateDelay } from "./client";
import { API_CONFIG } from "@/config/api.config";
import type { TeacherClassStats, StudentPerformanceRow, TeacherReport } from "@/types/teacher";
import {
  MOCK_TEACHER_STATS,
  MOCK_TEACHER_REPORT,
  MOCK_STUDENT_PERFORMANCE,
} from "@/mock/teacher.mock";

export const teacherApi = {
  getStats: async (): Promise<TeacherClassStats> => {
    if (API_CONFIG.useMock) {
      return simulateDelay(MOCK_TEACHER_STATS);
    }
    const res = await apiClient.get(API_CONFIG.endpoints.teacher.stats);
    return res.data;
  },

  getStudents: async (query?: string): Promise<StudentPerformanceRow[]> => {
    if (API_CONFIG.useMock) {
      let list = MOCK_STUDENT_PERFORMANCE;
      if (query && query.trim()) {
        const q = query.toLowerCase();
        list = list.filter((s) => s.name.toLowerCase().includes(q));
      }
      return simulateDelay(list);
    }
    const res = await apiClient.get(API_CONFIG.endpoints.teacher.students, { params: { q: query } });
    return res.data;
  },

  getReport: async (): Promise<TeacherReport> => {
    if (API_CONFIG.useMock) {
      return simulateDelay(MOCK_TEACHER_REPORT);
    }
    const res = await apiClient.get(API_CONFIG.endpoints.teacher.report);
    return res.data;
  },
};
