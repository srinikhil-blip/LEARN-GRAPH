/**
 * LearnGraph — Learning Resources & Video API
 * Connects frontend to course resources, YouTube educational catalog, notes, and recommendation engine.
 */

import { apiClient, apiWithFallback, simulateDelay } from "./client";
import {
  learningResourcesService,
  type VideoResourceItem,
  type NoteResourceItem,
  type PracticeResourceItem,
  type CourseResourcesBundle,
} from "@/data/learningResourcesData";
import {
  resourceRecommendationEngine,
  type ResourceRecommendationsResult,
} from "@/services/resourceRecommendationEngine";

export const learningResourcesApi = {
  /**
   * GET /courses/{id}/resources
   * Retrieve all structured learning resources for a specific course.
   */
  getCourseResources: async (courseId: string, courseTitle?: string): Promise<CourseResourcesBundle> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(`/courses/${courseId}/resources`);
        if (res.data?.videos) return res.data;
        throw new Error("Empty remote course resources");
      },
      async () => {
        return simulateDelay(learningResourcesService.getCourseBundle(courseId, courseTitle), 120);
      }
    );
  },

  /**
   * GET /topics/{id}/videos
   * Retrieve educational YouTube videos mapped to a specific topic.
   */
  getTopicVideos: async (topicIdOrKeyword: string): Promise<VideoResourceItem[]> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(`/topics/${encodeURIComponent(topicIdOrKeyword)}/videos`);
        if (Array.isArray(res.data) && res.data.length > 0) return res.data;
        throw new Error("Empty remote topic videos");
      },
      async () => {
        return simulateDelay(learningResourcesService.getVideosByTopic(topicIdOrKeyword), 100);
      }
    );
  },

  /**
   * GET /topics/{id}/notes
   * Retrieve revision notes and formula sheets for a topic or course.
   */
  getTopicNotes: async (courseOrTopicId: string): Promise<NoteResourceItem[]> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(`/topics/${encodeURIComponent(courseOrTopicId)}/notes`);
        if (Array.isArray(res.data) && res.data.length > 0) return res.data;
        throw new Error("Empty remote notes");
      },
      async () => {
        return simulateDelay(learningResourcesService.getNotesByCourse(courseOrTopicId), 90);
      }
    );
  },

  /**
   * GET /topics/{id}/practice
   * Retrieve practice problem sets and coding challenges.
   */
  getTopicPractice: async (courseOrTopicId: string): Promise<PracticeResourceItem[]> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(`/topics/${encodeURIComponent(courseOrTopicId)}/practice`);
        if (Array.isArray(res.data) && res.data.length > 0) return res.data;
        throw new Error("Empty remote practice items");
      },
      async () => {
        return simulateDelay(learningResourcesService.getPracticeByCourse(courseOrTopicId), 90);
      }
    );
  },

  /**
   * GET /recommendations/resources
   * Retrieve AI recommendations for videos, continue watching, and trending material.
   */
  getResourceRecommendations: async (currentTopic?: string): Promise<ResourceRecommendationsResult> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get("/recommendations/resources", {
          params: currentTopic ? { topic: currentTopic } : undefined,
        });
        if (res.data?.recommendedVideos) return res.data;
        throw new Error("Empty remote recommendations");
      },
      async () => {
        return simulateDelay(resourceRecommendationEngine.getRecommendations(currentTopic), 150);
      }
    );
  },
};
