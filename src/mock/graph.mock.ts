import type { GraphNode, GraphEdge, ConceptDetails } from "@/types/graph";

export const MOCK_GRAPH_NODES: GraphNode[] = [
  { id: "node-0", name: "Calculus", x: 390, y: 235, radius: 52, status: "learning", masteryPercentage: 68, subject: "Mathematics" },
  { id: "node-1", name: "Algebra", x: 210, y: 120, radius: 39, status: "mastered", masteryPercentage: 92, subject: "Mathematics" },
  { id: "node-2", name: "Functions", x: 220, y: 325, radius: 43, status: "mastered", masteryPercentage: 86, subject: "Mathematics" },
  { id: "node-3", name: "Limits", x: 560, y: 115, radius: 40, status: "weak", masteryPercentage: 46, subject: "Mathematics" },
  { id: "node-4", name: "Derivatives", x: 600, y: 305, radius: 45, status: "learning", masteryPercentage: 68, subject: "Mathematics" },
  { id: "node-5", name: "Integrals", x: 760, y: 210, radius: 41, status: "upcoming", masteryPercentage: 0, subject: "Mathematics" },
  { id: "node-6", name: "Trig", x: 75, y: 235, radius: 35, status: "mastered", masteryPercentage: 95, subject: "Mathematics" },
  { id: "node-7", name: "Series", x: 805, y: 380, radius: 35, status: "upcoming", masteryPercentage: 0, subject: "Mathematics" },
  { id: "node-8", name: "Vectors", x: 430, y: 420, radius: 37, status: "weak", masteryPercentage: 42, subject: "Mathematics" },
];

export const MOCK_GRAPH_EDGES: GraphEdge[] = [
  { id: "edge-0-1", source: 0, target: 1 },
  { id: "edge-0-2", source: 0, target: 2 },
  { id: "edge-0-3", source: 0, target: 3, isWeak: true },
  { id: "edge-0-4", source: 0, target: 4 },
  { id: "edge-0-5", source: 0, target: 5 },
  { id: "edge-1-6", source: 1, target: 6 },
  { id: "edge-2-6", source: 2, target: 6 },
  { id: "edge-2-8", source: 2, target: 8, isWeak: true },
  { id: "edge-3-4", source: 3, target: 4, isWeak: true },
  { id: "edge-4-5", source: 4, target: 5 },
  { id: "edge-4-8", source: 4, target: 8, isWeak: true },
  { id: "edge-5-7", source: 5, target: 7 },
];

export const MOCK_CONCEPT_DETAILS: Record<string, ConceptDetails> = {
  Limits: {
    id: "concept-limits",
    name: "Limits",
    category: "Foundational concept · Calculus",
    status: "weak",
    masteryPercentage: 46,
    interactionsCount: 12,
    description:
      "A limit describes the value a function approaches as the input gets closer to a certain point. It’s the bridge between algebra and calculus.",
    resources: [
      {
        id: "res-1",
        type: "video",
        title: "Understanding Limits Visually",
        duration: "8 min",
        meta: "Video · 8 min",
      },
      {
        id: "res-2",
        type: "practice",
        title: "Targeted practice set",
        duration: "8 questions",
        meta: "8 questions · Adaptive",
      },
    ],
  },
  Derivatives: {
    id: "concept-derivatives",
    name: "Derivatives",
    category: "Core mechanics · Calculus",
    status: "learning",
    masteryPercentage: 68,
    interactionsCount: 24,
    description:
      "The instantaneous rate of change of a function with respect to one of its variables. Equivalent to the slope of the tangent line.",
    resources: [
      {
        id: "res-3",
        type: "video",
        title: "The Essence of Calculus: Derivatives",
        duration: "14 min",
        meta: "Video · 14 min",
      },
    ],
  },
};
