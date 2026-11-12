export interface RecommendationItem {
  id: string;
  type: "TOPIC" | "VIDEO" | "READING" | "PRACTICE";
  title: string;
  text: string;
  tone: "red" | "cyan" | "amber" | "emerald" | "indigo";
  matchedReason?: string;
}

export interface LearningPathStep {
  name: string;
  isDone: boolean;
  isActive: boolean;
}

export interface LearningPath {
  title: string;
  description: string;
  estimatedTime: string;
  steps: LearningPathStep[];
}

export interface CompactRecommendation {
  id: string;
  tag: string;
  title: string;
  duration: string;
  level: string;
}
