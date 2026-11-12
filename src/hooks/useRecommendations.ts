import { useQuery } from "@tanstack/react-query";
import { recommendationApi } from "@/api/recommendation";

export function useRecommendations() {
  const recommendationsQuery = useQuery({
    queryKey: ["recommendations", "list"],
    queryFn: () => recommendationApi.getRecommendations(),
    staleTime: 5 * 60 * 1000,
  });

  const learningPathQuery = useQuery({
    queryKey: ["recommendations", "learningPath"],
    queryFn: () => recommendationApi.getLearningPath(),
    staleTime: 5 * 60 * 1000,
  });

  const compactRecsQuery = useQuery({
    queryKey: ["recommendations", "compact"],
    queryFn: () => recommendationApi.getCompactRecommendations(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    recommendations: recommendationsQuery.data || [],
    learningPath: learningPathQuery.data,
    compactRecommendations: compactRecsQuery.data || [],
    isLoading:
      recommendationsQuery.isLoading ||
      learningPathQuery.isLoading ||
      compactRecsQuery.isLoading,
    isError:
      recommendationsQuery.isError ||
      learningPathQuery.isError ||
      compactRecsQuery.isError,
    error: recommendationsQuery.error || learningPathQuery.error,
    refetch: () => {
      recommendationsQuery.refetch();
      learningPathQuery.refetch();
      compactRecsQuery.refetch();
    },
  };
}
