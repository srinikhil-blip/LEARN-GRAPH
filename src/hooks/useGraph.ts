import { useQuery } from "@tanstack/react-query";
import { graphApi } from "@/api/graph";
import { useGraphStore } from "@/store/useGraphStore";

export function useGraph() {
  const { selectedConcept, setSelectedConcept } = useGraphStore();

  const graphQuery = useQuery({
    queryKey: ["graph", "data"],
    queryFn: () => graphApi.getGraph(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const conceptQuery = useQuery({
    queryKey: ["graph", "concept", selectedConcept],
    queryFn: () => graphApi.getConceptDetails(selectedConcept),
    enabled: !!selectedConcept,
    staleTime: 2 * 60 * 1000,
  });

  return {
    graphData: graphQuery.data,
    conceptDetails: conceptQuery.data,
    selectedConcept,
    setSelectedConcept,
    isLoading: graphQuery.isLoading || conceptQuery.isLoading,
    isError: graphQuery.isError || conceptQuery.isError,
    error: graphQuery.error || conceptQuery.error,
    refetchGraph: graphQuery.refetch,
    refetchConcept: conceptQuery.refetch,
  };
}
