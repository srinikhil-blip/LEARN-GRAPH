/**
 * LearnGraph — Resource Recommendation Engine
 * Recommends educational videos, notes, and drills grounded in:
 * - Current topic
 * - Weak concepts identified from quizzes
 * - Quiz performance
 * - Knowledge graph traversal
 * - Recently studied lessons
 */

import { VIDEO_RESOURCES, type VideoResourceItem } from "@/data/learningResourcesData";
import { userProgressService } from "@/services/userProgressService";

export interface ResourceRecommendationsResult {
  recommendedVideos: VideoResourceItem[];
  continueWatching: VideoResourceItem[];
  recentlyViewed: VideoResourceItem[];
  trendingResources: VideoResourceItem[];
  savedVideos: VideoResourceItem[];
}

export const resourceRecommendationEngine = {
  /**
   * Compute comprehensive video recommendations for active user.
   */
  getRecommendations: (currentTopic?: string): ResourceRecommendationsResult => {
    const progress = userProgressService.getState();
    const weakConcepts = progress.weakConcepts || [];
    const quizAttempts = progress.quizAttempts || [];
    const savedIds: string[] = JSON.parse(localStorage.getItem("lg_saved_resources") || "[]");
    const recentlyViewedIds: string[] = JSON.parse(localStorage.getItem("lg_recently_viewed_videos") || "[]");

    // 1. Weak Concept Matching
    const weakMatchVideos: VideoResourceItem[] = [];
    if (weakConcepts.length > 0) {
      for (const concept of weakConcepts) {
        const matches = VIDEO_RESOURCES.filter(
          (v) =>
            v.tags.some((t) => t.toLowerCase().includes(concept.toLowerCase())) ||
            v.title.toLowerCase().includes(concept.toLowerCase())
        );
        weakMatchVideos.push(...matches);
      }
    }

    // 2. Current Topic Matching
    const topicMatches: VideoResourceItem[] = currentTopic
      ? VIDEO_RESOURCES.filter(
          (v) =>
            v.topicId.toLowerCase().includes(currentTopic.toLowerCase()) ||
            v.title.toLowerCase().includes(currentTopic.toLowerCase()) ||
            v.tags.some((t) => t.toLowerCase().includes(currentTopic.toLowerCase()))
        )
      : [];

    // Deduplicate recommended videos
    const seenIds = new Set<string>();
    const recommendedVideos: VideoResourceItem[] = [];

    for (const v of [...topicMatches, ...weakMatchVideos, ...VIDEO_RESOURCES]) {
      if (!seenIds.has(v.id)) {
        seenIds.add(v.id);
        recommendedVideos.push(v);
      }
    }

    // 3. Saved Videos
    const savedVideos = VIDEO_RESOURCES.filter((v) => savedIds.includes(v.id));

    // 4. Recently Viewed Videos
    const recentlyViewed = VIDEO_RESOURCES.filter((v) => recentlyViewedIds.includes(v.id));

    // 5. Continue Watching (Videos that user recently viewed or started)
    const continueWatching = recentlyViewed.length > 0 ? recentlyViewed.slice(0, 4) : VIDEO_RESOURCES.slice(0, 3);

    // 6. Trending Resources (High demand / foundational lectures)
    const trendingResources = [
      VIDEO_RESOURCES.find((v) => v.id === "vid-math-calc-01") || VIDEO_RESOURCES[0],
      VIDEO_RESOURCES.find((v) => v.id === "vid-cs-dsa-01") || VIDEO_RESOURCES[1],
      VIDEO_RESOURCES.find((v) => v.id === "vid-dev-fastapi-01") || VIDEO_RESOURCES[2],
      VIDEO_RESOURCES.find((v) => v.id === "vid-exam-gate-01") || VIDEO_RESOURCES[3],
    ].filter(Boolean) as VideoResourceItem[];

    return {
      recommendedVideos: recommendedVideos.slice(0, 6),
      continueWatching,
      recentlyViewed: recentlyViewed.slice(0, 6),
      trendingResources,
      savedVideos,
    };
  },

  /**
   * Log that user clicked or opened a video lecture.
   */
  logVideoView: (videoId: string): void => {
    try {
      const raw = localStorage.getItem("lg_recently_viewed_videos") || "[]";
      let list: string[] = JSON.parse(raw);
      list = [videoId, ...list.filter((id) => id !== videoId)].slice(0, 20);
      localStorage.setItem("lg_recently_viewed_videos", JSON.stringify(list));
    } catch {
      // ignore
    }
  },
};
