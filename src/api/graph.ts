import { apiClient, apiWithFallback, simulateDelay } from "./client";
import { API_CONFIG } from "@/config/api.config";
import type { GraphNode, GraphEdge, ConceptDetails } from "@/types/graph";
import { MOCK_GRAPH_NODES, MOCK_GRAPH_EDGES, MOCK_CONCEPT_DETAILS } from "@/mock/graph.mock";

export const graphApi = {
  getGraph: async (): Promise<{ nodes: GraphNode[]; edges: GraphEdge[]; subject: string; totalConcepts: number }> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(API_CONFIG.endpoints.graph.data);
        return {
          nodes: res.data.nodes?.length ? res.data.nodes : MOCK_GRAPH_NODES,
          edges: res.data.edges?.length ? res.data.edges : MOCK_GRAPH_EDGES,
          subject: "Adaptive Knowledge Graph",
          totalConcepts: res.data.nodes?.length || 84,
        };
      },
      async () =>
        simulateDelay({
          nodes: MOCK_GRAPH_NODES,
          edges: MOCK_GRAPH_EDGES,
          subject: "Mathematics",
          totalConcepts: 84,
        })
    );
  },

  getConceptDetails: async (conceptName: string): Promise<ConceptDetails> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(API_CONFIG.endpoints.graph.concept(conceptName));
        return res.data;
      },
      async () => {
        const details =
          MOCK_CONCEPT_DETAILS[conceptName] || {
            id: `concept-${conceptName.toLowerCase()}`,
            name: conceptName,
            category: "Foundational concept · Calculus",
            status: "learning" as const,
            masteryPercentage: 68,
            interactionsCount: 16,
            description: `Key principles and mathematical properties related to ${conceptName}.`,
            resources: [
              {
                id: "res-gen-1",
                type: "video" as const,
                title: `Introduction to ${conceptName}`,
                duration: "10 min",
                meta: "Video · 10 min",
              },
            ],
          };
        return simulateDelay(details);
      }
    );
  },
};
