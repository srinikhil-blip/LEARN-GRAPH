/**
 * useCourse.ts — React Query hooks for Course Library
 * Features instant initialData rendering so cards never flicker "0 courses"
 */

import { useQuery } from "@tanstack/react-query";
import { courseApi } from "@/api/course";
import { MOCK_COURSES } from "@/mock/courses.mock";

interface UseCourseFilters {
  tier?: string;
  subject?: string;
  grade?: string;
}

export function useCourse(courseId?: string, search?: string, filters?: UseCourseFilters) {
  const coursesQuery = useQuery({
    queryKey: ["courses", search || "all", filters],
    queryFn: () => courseApi.getCourses(search, filters),
    initialData: () => {
      if (!search && !filters) return MOCK_COURSES;
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const singleCourseQuery = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => (courseId ? courseApi.getCourseById(courseId) : null),
    initialData: () => {
      if (courseId) {
        return MOCK_COURSES.find((c) => c.id === courseId || c.id === courseId.toLowerCase());
      }
      return undefined;
    },
    enabled: !!courseId,
    staleTime: 10 * 60 * 1000,
  });

  // Guarantee courses is never an empty array when mock catalog has data
  const resolvedCourses =
    coursesQuery.data && coursesQuery.data.length > 0
      ? coursesQuery.data
      : MOCK_COURSES;

  return {
    courses: resolvedCourses,
    course: singleCourseQuery.data,
    isLoading: coursesQuery.isLoading && !resolvedCourses.length,
    isError: coursesQuery.isError || singleCourseQuery.isError,
    error: coursesQuery.error || singleCourseQuery.error,
    refetchCourses: coursesQuery.refetch,
    refetchCourse: singleCourseQuery.refetch,
  };
}
