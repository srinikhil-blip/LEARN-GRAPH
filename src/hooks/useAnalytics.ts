import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analytics";

export function useAnalytics() {
  const overviewQuery = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => analyticsApi.getOverview(),
    staleTime: 60 * 1000,
  });

  const activityQuery = useQuery({
    queryKey: ["analytics", "activity"],
    queryFn: () => analyticsApi.getActivityData(),
    staleTime: 2 * 60 * 1000,
  });

  const predictionQuery = useQuery({
    queryKey: ["analytics", "prediction"],
    queryFn: () => analyticsApi.getPrediction(),
    staleTime: 5 * 60 * 1000,
  });

  const subjectMasteryQuery = useQuery({
    queryKey: ["analytics", "subjects"],
    queryFn: () => analyticsApi.getSubjectMastery(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    overview: overviewQuery.data,
    activityData: activityQuery.data || [],
    prediction: predictionQuery.data,
    subjectMastery: subjectMasteryQuery.data || [],
    isLoading:
      overviewQuery.isLoading ||
      activityQuery.isLoading ||
      predictionQuery.isLoading ||
      subjectMasteryQuery.isLoading,
    isError:
      overviewQuery.isError ||
      activityQuery.isError ||
      predictionQuery.isError ||
      subjectMasteryQuery.isError,
    error: overviewQuery.error || activityQuery.error,
    refetch: () => {
      overviewQuery.refetch();
      activityQuery.refetch();
      predictionQuery.refetch();
      subjectMasteryQuery.refetch();
    },
  };
}
