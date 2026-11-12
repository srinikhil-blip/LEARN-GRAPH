export interface ExtractedConceptDetail {
  name: string;
  definition: string;
  formula?: string;
  algorithm?: string;
  time_complexity?: string;
  space_complexity?: string;
  importance_score?: number;
  category?: string;
}

export interface ConceptExtractionResult {
  title: string;
  subject: string;
  topics: string[];
  concepts: ExtractedConceptDetail[];
  keywords: string[];
  prerequisites: string[];
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | string;
  learning_objectives: string[];
  summary: string;
  estimated_learning_time: string;
}

export interface GraphNodeItem {
  id: string;
  labels: ("Concept" | "Topic" | "Subject" | "Skill" | string)[];
  properties: {
    uuid: string;
    name: string;
    description?: string;
    difficulty?: string;
    difficultyScore?: number;
    category?: string;
    status?: "mastered" | "learning" | "weak" | "upcoming" | "active";
    bloomTaxonomyLevel?: string;
    [key: string]: unknown;
  };
}

export interface GraphRelationshipItem {
  type: "PREREQUISITE" | "RELATED_TO" | "PART_OF" | "DEPENDS_ON" | "SIMILAR_TO" | "IMPROVES";
  from: string;
  to: string;
  confidence: number;
  properties?: {
    strength?: number;
    weight?: number;
    similarityScore?: number;
    isRequired?: boolean;
    contrastNote?: string;
    sharedPrinciple?: string;
    [key: string]: unknown;
  };
}

export interface KnowledgeGraphBuilderOutput {
  graph_metadata: {
    target_database: "Neo4j";
    generated_at: string;
    total_nodes: number;
    total_relationships: number;
  };
  nodes: GraphNodeItem[];
  relationships: GraphRelationshipItem[];
  cypherScript?: string;
}

export interface FlashcardItem {
  id: string;
  conceptName: string;
  question: string;
  answer: string;
  tip?: string;
  status: "unreviewed" | "learning" | "mastered";
}

export interface SocraticQuizQuestion {
  id: string;
  concept: string;
  question: string;
  options: string[];
  correctIndex: number;
  intuition: string;
  explanation: string;
}
