export type NodeStatus = "mastered" | "learning" | "weak" | "upcoming";

export interface GraphNode {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  status: NodeStatus;
  masteryPercentage: number;
  subject?: string;
}

export interface GraphEdge {
  id: string;
  source: number; // index in nodes or id
  target: number;
  isWeak?: boolean;
}

export interface ConceptResource {
  id: string;
  type: "video" | "practice" | "reading";
  title: string;
  duration: string;
  meta: string;
}

export interface ConceptDetails {
  id: string;
  name: string;
  category: string;
  status: NodeStatus;
  masteryPercentage: number;
  interactionsCount: number;
  description: string;
  resources: ConceptResource[];
}
