import type {
  RecommendationItem,
  LearningPath,
  CompactRecommendation,
} from "@/types/recommendation";

export const MOCK_LEARNING_PATH: LearningPath = {
  title: "From Functions to Derivatives",
  description: "A personalized 5-step path built from your current knowledge graph.",
  estimatedTime: "2h 45m",
  steps: [
    { name: "Functions", isDone: true, isActive: false },
    { name: "Limits", isDone: false, isActive: true },
    { name: "Continuity", isDone: false, isActive: false },
    { name: "Slope", isDone: false, isActive: false },
    { name: "Derivatives", isDone: false, isActive: false },
  ],
};

export const MOCK_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: "rec-1",
    type: "TOPIC",
    title: "Limits & Continuity",
    text: "Closes your highest-impact knowledge gap.",
    tone: "red",
  },
  {
    id: "rec-2",
    type: "VIDEO",
    title: "Limits, Visually Explained",
    text: "8 min · 4.9 rating · 12k learners",
    tone: "cyan",
  },
  {
    id: "rec-3",
    type: "READING",
    title: "The Calculus Story",
    text: "Chapter 3 · 14 min read",
    tone: "amber",
  },
  {
    id: "rec-4",
    type: "PRACTICE",
    title: "Adaptive Limits Set",
    text: "12 questions · adjusts to you",
    tone: "emerald",
  },
];

export const MOCK_COMPACT_RECS: CompactRecommendation[] = [
  {
    id: "cr-1",
    tag: "NEXT TOPIC",
    title: "Graphing derivatives",
    duration: "12 min",
    level: "Intermediate",
  },
  {
    id: "cr-2",
    tag: "PRACTICE",
    title: "Optimization problems",
    duration: "16 min",
    level: "Intermediate",
  },
  {
    id: "cr-3",
    tag: "PRACTICE",
    title: "Related rates",
    duration: "20 min",
    level: "Intermediate",
  },
];
