import {
  UNIVERSAL_CURRICULUM_CATALOG,
  TOPIC_DIJKSTRA_ALGORITHM,
  TOPIC_LIMITS_CONTINUITY,
  TOPIC_RATE_LIMITER,
} from "@/data/curriculumData";
import type {
  CurriculumNode,
  EducationTier,
  TopicContentPayload,
} from "@/types/curriculum";

export interface SemanticSearchQuery {
  term?: string;
  tier?: EducationTier;
  subject?: string;
  difficulty?: string;
  career?: string;
}

export const curriculumApi = {
  /**
   * Get all curriculum nodes (School, Undergrad, Postgrad, Interview, Career)
   */
  getCurriculumCatalog(): CurriculumNode[] {
    return UNIVERSAL_CURRICULUM_CATALOG;
  },

  /**
   * Get curriculum nodes filtered by tier
   */
  getByTier(tier: EducationTier): CurriculumNode[] {
    return UNIVERSAL_CURRICULUM_CATALOG.filter((node) => node.tier === tier);
  },

  /**
   * Get a canonical topic payload by ID
   */
  getTopicById(topicId: string): TopicContentPayload | null {
    if (topicId.includes("dijkstra")) return TOPIC_DIJKSTRA_ALGORITHM;
    if (topicId.includes("limits")) return TOPIC_LIMITS_CONTINUITY;
    if (topicId.includes("rate-limiter")) return TOPIC_RATE_LIMITER;

    // Search across catalog
    for (const node of UNIVERSAL_CURRICULUM_CATALOG) {
      for (const subject of node.subjects) {
        for (const chapter of subject.chapters) {
          const match = chapter.topics.find((t) => t.id === topicId);
          if (match) return match;
        }
      }
    }
    return TOPIC_DIJKSTRA_ALGORITHM; // Fallback canonical topic
  },

  /**
   * Semantic search across all topics, concepts, prerequisites, and skills
   */
  searchCurriculum(query: SemanticSearchQuery): TopicContentPayload[] {
    const q = (query.term || "").toLowerCase().trim();

    // Flatten all topics across catalog
    const allTopics: TopicContentPayload[] = [];
    for (const node of UNIVERSAL_CURRICULUM_CATALOG) {
      for (const subject of node.subjects) {
        for (const chapter of subject.chapters) {
          allTopics.push(...chapter.topics);
        }
      }
    }

    if (!q && !query.tier && !query.difficulty) {
      return allTopics;
    }

    return allTopics.filter((topic) => {
      if (query.tier && topic.tier !== query.tier) return false;
      if (query.difficulty && topic.difficultyRating !== query.difficulty)
        return false;

      if (!q) return true;

      const matchesTitle = topic.topicTitle.toLowerCase().includes(q);
      const matchesChapter = topic.chapterTitle.toLowerCase().includes(q);
      const matchesSubject = topic.subjectTitle.toLowerCase().includes(q);
      const matchesOverview = topic.overview.toLowerCase().includes(q);
      const matchesPrereq = topic.prerequisites.some((p) =>
        p.toLowerCase().includes(q)
      );
      const matchesNext = topic.recommendedNextTopics.some((n) =>
        n.toLowerCase().includes(q)
      );

      return (
        matchesTitle ||
        matchesChapter ||
        matchesSubject ||
        matchesOverview ||
        matchesPrereq ||
        matchesNext
      );
    });
  },

  /**
   * Get list of all career tracks
   */
  getCareerTracks(): string[] {
    return [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "AI Engineer",
      "Machine Learning Engineer",
      "Data Scientist",
      "Cyber Security Engineer",
      "Cloud Engineer",
      "DevOps Engineer",
      "Android Developer",
      "Software Engineer",
      "Game Developer",
      "Blockchain Developer",
      "UI/UX Designer",
    ];
  },
};
