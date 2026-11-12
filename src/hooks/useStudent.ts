import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "@/api/student";

export function useStudent() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleProgressUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["student"] });
    };
    window.addEventListener("learngraph:progress-updated", handleProgressUpdate);
    return () => {
      window.removeEventListener("learngraph:progress-updated", handleProgressUpdate);
    };
  }, [queryClient]);

  const progressQuery = useQuery({
    queryKey: ["student", "progress"],
    queryFn: () => studentApi.getProgress(),
    staleTime: 10 * 1000,
    retry: 2,
  });

  const profileQuery = useQuery({
    queryKey: ["student", "profile"],
    queryFn: () => studentApi.getProfile(),
    staleTime: 60 * 1000,
  });

  const studyPlanQuery = useQuery({
    queryKey: ["student", "studyPlan"],
    queryFn: () => studentApi.getStudyPlan(),
    staleTime: 30 * 1000,
  });

  return {
    progress: progressQuery.data,
    profile: profileQuery.data,
    studyPlan: studyPlanQuery.data || [],
    isLoading: progressQuery.isLoading || profileQuery.isLoading || studyPlanQuery.isLoading,
    isError: progressQuery.isError || profileQuery.isError || studyPlanQuery.isError,
    error: progressQuery.error || profileQuery.error || studyPlanQuery.error,
    refetchProgress: progressQuery.refetch,
    refetchProfile: profileQuery.refetch,
    refetchStudyPlan: studyPlanQuery.refetch,
  };
}
