/**
 * quiz.ts — LearnGraph Production Adaptive Quiz API
 * Handles topic selection, dynamic syllabus-aligned generation, instant grading,
 * and real-time knowledge graph synchronization.
 */

import { apiClient, apiWithFallback, simulateDelay } from "./client";
import { API_CONFIG } from "@/config/api.config";
import type {
  QuizQuestion,
  QuizGenerationConfig,
  QuizSubmissionPayload,
  PostQuizAnalytics,
} from "@/types/quiz";
import { adaptiveQuizEngine } from "@/services/adaptiveQuizEngine";
import { userProgressService } from "@/services/userProgressService";
import { MOCK_COURSES } from "@/mock/courses.mock";

export const quizApi = {
  /**
   * Generate an adaptive or topic-specific quiz.
   */
  generateQuiz: async (
    config: QuizGenerationConfig
  ): Promise<{
    quizId: string;
    title: string;
    category: string;
    questions: QuizQuestion[];
    config: QuizGenerationConfig;
  }> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.post(API_CONFIG.endpoints.quiz.generate, config);
        if (res.data?.questions && res.data.questions.length > 0) {
          return res.data;
        }
        throw new Error("Empty remote quiz response");
      },
      async () => {
        return simulateDelay(adaptiveQuizEngine.generateQuiz(config), 180);
      }
    );
  },

  /**
   * Submit quiz answers for scoring and detailed analytics.
   */
  submitQuiz: async (
    payload: QuizSubmissionPayload,
    questions: QuizQuestion[]
  ): Promise<PostQuizAnalytics> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.post(API_CONFIG.endpoints.quiz.submit, payload);
        if (res.data && res.data.score !== undefined) {
          return res.data;
        }
        return adaptiveQuizEngine.evaluateSubmission(payload, questions);
      },
      async () => {
        return simulateDelay(adaptiveQuizEngine.evaluateSubmission(payload, questions), 200);
      }
    );
  },

  /**
   * Get student quiz attempt history.
   */
  getHistory: async () => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(API_CONFIG.endpoints.quiz.results);
        return res.data;
      },
      async () => {
        const state = userProgressService.getState();
        return state.quizAttempts;
      }
    );
  },

  /**
   * Legacy method for simple diagnostic quizzes.
   */
  getQuiz: async (
    topicId?: string
  ): Promise<{ title: string; category: string; questions: QuizQuestion[] }> => {
    return apiWithFallback(
      async () => {
        const res = await apiClient.get(API_CONFIG.endpoints.quiz.get, { params: { topicId } });
        if (res.data?.questions && res.data.questions.length > 0) {
          return res.data;
        }
        throw new Error("Empty remote quiz questions");
      },
      async () => {
        const state = userProgressService.getState();
        const activeCourseId = state.coursesEnrolled[0];
        const activeCourse = MOCK_COURSES.find((c) => c.id === activeCourseId);

        const generated = adaptiveQuizEngine.generateQuiz({
          educationLevel: (activeCourse?.tier as any) || "School",
          gradeOrExam: activeCourse?.gradeOrYear || "Class 10",
          subject: activeCourse?.subject || "Science",
          chapter: activeCourse?.chapters?.[0]?.title || "Chemical Reactions and Equations",
          topic: topicId || "Properties of Acids & Bases",
          difficulty: "Medium",
          questionCount: 10,
        });

        return simulateDelay({
          title: generated.title,
          category: generated.category,
          questions: generated.questions,
        });
      }
    );
  },

  /**
   * Submit single answer.
   */
  submitAnswer: async (
    questionId: string,
    selectedOptionIndex: number,
    activeQuestions?: QuizQuestion[]
  ): Promise<{ correct: boolean; explanation: string }> => {
    const q = activeQuestions?.find((item) => item.id === questionId);
    const correct = q ? selectedOptionIndex === q.correctAnswerIndex : true;
    return simulateDelay({
      correct,
      explanation: q?.explanation || "Option evaluated.",
    });
  },
};
