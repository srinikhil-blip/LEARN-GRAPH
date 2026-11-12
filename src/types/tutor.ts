export interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  timestamp: string;
  content: string;
  chips?: string[];
  richMedia?: {
    type: "visual-math" | "graph-highlight";
    title?: string;
    description?: string;
    sourceChapter?: string;
    connectedConcept?: {
      name: string;
      mastery: number;
    };
  };
}

export interface RelatedGraphConcept {
  name: string;
  status: "mastered" | "learning" | "upcoming";
  masteryText: string;
}

export interface TutorContext {
  activeConcept: string;
  conceptProgress: number;
  relatedConcepts: RelatedGraphConcept[];
  recentTopics: string[];
  monthTopics: string[];
}
