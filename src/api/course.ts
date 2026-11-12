/**
 * course.ts — LearnGraph Course API
 * Communicates with /api/v1/courses and provides instant zero-latency fallback to
 * the full 69+ course catalog so courses always display reliably under all conditions.
 */

import { apiClient, apiWithFallback } from "./client";
import type { Course } from "@/types/course";
import { MOCK_COURSES } from "@/mock/courses.mock";

export interface CourseListResponse {
  items: Course[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export const courseApi = {
  /**
   * Fetch all courses (optionally filtered).
   */
  getCourses: async (
    search?: string,
    filters?: { tier?: string; subject?: string; grade?: string }
  ): Promise<Course[]> => {
    return apiWithFallback(
      async () => {
        const params: Record<string, string> = {};
        if (search && search.trim()) params.search = search.trim();
        if (filters?.tier) params.tier = filters.tier;
        if (filters?.subject) params.subject = filters.subject;
        if (filters?.grade) params.grade = filters.grade;
        params.pageSize = "500"; // load all for client-side tier/sub-category navigation

        const res = await apiClient.get("/courses", { params });
        const data: CourseListResponse = res.data;
        if (Array.isArray(data?.items) && data.items.length > 0) {
          return data.items;
        }
        return MOCK_COURSES;
      },
      async () => {
        let list = [...MOCK_COURSES];
        if (filters?.tier) list = list.filter((c) => c.tier === filters.tier);
        if (filters?.subject) list = list.filter((c) => c.subject === filters.subject);
        if (filters?.grade) {
          list = list.filter((c) => (c.gradeOrYear ?? "").includes(filters.grade!));
        }
        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          list = list.filter(
            (c) =>
              c.title.toLowerCase().includes(q) ||
              c.subject.toLowerCase().includes(q) ||
              c.description?.toLowerCase().includes(q) ||
              c.gradeOrYear?.toLowerCase().includes(q) ||
              c.instructor.toLowerCase().includes(q)
          );
        }
        return list;
      }
    );
  },

  /**
   * Fetch a single course by ID.
   */
  getCourseById: async (id: string): Promise<Course | null> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(`/courses/${encodeURIComponent(id)}`);
        if (res.data && res.data.id) return res.data;
        return MOCK_COURSES.find((c) => c.id === id || c.id === id.toLowerCase()) || null;
      },
      async () => {
        const found = MOCK_COURSES.find((c) => c.id === id || c.id === id.toLowerCase());
        return found || MOCK_COURSES[0] || null;
      }
    );
  },

  /**
   * Search the curriculum catalog.
   */
  searchCurriculum: async (
    q: string,
    opts?: { tier?: string; subject?: string; grade?: string; page?: number; pageSize?: number }
  ): Promise<CourseListResponse> => {
    return apiWithFallback(
      async () => {
        const params: Record<string, string | number> = { q };
        if (opts?.tier) params.tier = opts.tier;
        if (opts?.subject) params.subject = opts.subject;
        if (opts?.grade) params.grade = opts.grade;
        if (opts?.page) params.page = opts.page;
        if (opts?.pageSize) params.pageSize = opts.pageSize;

        const res = await apiClient.get("/curriculum/search", { params });
        return res.data;
      },
      async () => {
        const term = q.toLowerCase().trim();
        let list = [...MOCK_COURSES];
        if (opts?.tier) list = list.filter((c) => c.tier === opts.tier);
        if (opts?.subject) list = list.filter((c) => c.subject === opts.subject);
        if (opts?.grade) list = list.filter((c) => (c.gradeOrYear ?? "").includes(opts.grade!));
        if (term) {
          list = list.filter(
            (c) =>
              c.title.toLowerCase().includes(term) ||
              c.subject.toLowerCase().includes(term) ||
              c.description?.toLowerCase().includes(term) ||
              c.gradeOrYear?.toLowerCase().includes(term)
          );
        }
        const page = opts?.page || 1;
        const pageSize = opts?.pageSize || 20;
        const start = (page - 1) * pageSize;
        return {
          items: list.slice(start, start + pageSize),
          total: list.length,
          page,
          pageSize,
          hasMore: start + pageSize < list.length,
        };
      }
    );
  },
};
