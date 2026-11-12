/**
 * userProgressService.ts
 * Real-time, per-user authenticated learning progress engine.
 * 
 * Strict Zero-State Policy:
 * - Brand new accounts start with exact 0s (0 courses, 0 lessons, 0% mastery, 0h study time, 0 streak).
 * - Every learning action (completing a lesson, taking a quiz, starting a course, chatting with AI)
 *   automatically and immediately updates the user's progress and stats.
 * - Stores state in local persistent storage per user ID and syncs with backend /api/v1/student/progress endpoints.
 */

import { apiClient } from "@/api/client";
import type { StudentStats, StudyPlanItem, AchievementItem, CertificateItem } from "@/types/student";

export interface UserLearningState {
  userId: string;
  email: string;
  coursesEnrolled: string[]; // course IDs
  coursesCompleted: string[]; // course IDs
  completedLessons: Record<string, string[]>; // courseId -> lessonIds
  studyTimeMinutes: number;
  quizAttempts: Array<{
    id: string;
    quizId: string;
    title: string;
    score: number;
    maxScore: number;
    timestamp: string;
    conceptId?: string;
  }>;
  chatSessionsCount: number;
  recentChatTopics: string[];
  streakDays: number;
  lastActiveDate: string | null;
  weeklyStreakDays: boolean[]; // 7 days (M-S)
  masteredConcepts: string[];
  learningConcepts: string[];
  weakConcepts: string[];
  bookmarks: string[];
  achievements: AchievementItem[];
  certificates: CertificateItem[];
  _dataVersion?: number; // used to force-clear stale cached data
}

const STORAGE_PREFIX = "learngraph_progress_v2_";
// Increment DATA_VERSION to force-clear all old cached progress data
const DATA_VERSION = 3;

function getActiveUserId(): string {
  try {
    const raw = localStorage.getItem("learngraph_v2_auth_state");
    if (raw) {
      const parsed = JSON.parse(raw);
      const user = parsed?.state?.user;
      if (user?.id) return user.id;
      if (user?.email) return user.email;
    }
  } catch {
    // ignore
  }
  return "guest_user";
}

function getActiveUserEmail(): string {
  try {
    const raw = localStorage.getItem("learngraph_v2_auth_state");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.user?.email || "";
    }
  } catch {
    // ignore
  }
  return "";
}

export function createZeroState(userId: string, email: string): UserLearningState {
  return {
    userId,
    email,
    coursesEnrolled: [],
    coursesCompleted: [],
    completedLessons: {},
    studyTimeMinutes: 0,
    quizAttempts: [],
    chatSessionsCount: 0,
    recentChatTopics: [],
    streakDays: 0,
    lastActiveDate: null,
    weeklyStreakDays: [false, false, false, false, false, false, false],
    masteredConcepts: [],
    learningConcepts: [],
    weakConcepts: [],
    bookmarks: [],
    achievements: [],
    certificates: [],
    _dataVersion: DATA_VERSION,
  };
}

export const userProgressService = {
  /**
   * Load the current active user's persistent learning state.
   */
  getState(): UserLearningState {
    const userId = getActiveUserId();
    const email = getActiveUserEmail();
    const storageKey = STORAGE_PREFIX + userId;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          // Force-clear if data version doesn't match (removes old fake/mock data)
          if ((parsed._dataVersion || 0) < DATA_VERSION) {
            console.info("[LearnGraph] Clearing stale progress cache (version mismatch). Starting fresh.");
            localStorage.removeItem(storageKey);
            const freshState = createZeroState(userId, email);
            this.saveState(freshState);
            return freshState;
          }
          return {
            ...createZeroState(userId, email),
            ...parsed,
            userId,
            email,
          };
        }
      }
    } catch {
      // ignore
    }

    const freshZeroState = createZeroState(userId, email);
    this.saveState(freshZeroState);
    return freshZeroState;
  },

  /**
   * Save the state to localStorage and broadcast real-time event.
   */
  saveState(state: UserLearningState): void {
    const storageKey = STORAGE_PREFIX + state.userId;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }

    // Broadcast across windows and components
    window.dispatchEvent(
      new CustomEvent("learngraph:progress-updated", { detail: state })
    );

    // Sync with backend API silently if user is logged in
    if (state.userId !== "guest_user") {
      apiClient.post("/student/progress/sync", state).catch(() => {
        // graceful offline fallback
      });
    }
  },

  /**
   * Enroll the user in a course.
   */
  enrollCourse(courseId: string): UserLearningState {
    const state = this.getState();
    if (!state.coursesEnrolled.includes(courseId)) {
      state.coursesEnrolled.push(courseId);
      this.updateStreak(state);
      this.saveState(state);
    }
    return state;
  },

  /**
   * Complete or uncomplete a lesson in a course.
   * Updates study time (+25 min), streak, and course completion.
   */
  toggleLesson(
    courseId: string,
    lessonId: string,
    totalCourseLessons = 10,
    durationMinutes = 25
  ): { state: UserLearningState; completed: boolean } {
    const state = this.getState();
    if (!state.coursesEnrolled.includes(courseId)) {
      state.coursesEnrolled.push(courseId);
    }

    const currentLessons = state.completedLessons[courseId] || [];
    const isAlreadyCompleted = currentLessons.includes(lessonId);

    let completed = false;
    if (isAlreadyCompleted) {
      state.completedLessons[courseId] = currentLessons.filter((id) => id !== lessonId);
      state.studyTimeMinutes = Math.max(0, state.studyTimeMinutes - durationMinutes);
      completed = false;
    } else {
      state.completedLessons[courseId] = [...currentLessons, lessonId];
      state.studyTimeMinutes += durationMinutes;
      this.updateStreak(state);
      completed = true;

      // Check if course is fully completed
      if (
        state.completedLessons[courseId].length >= totalCourseLessons &&
        !state.coursesCompleted.includes(courseId)
      ) {
        state.coursesCompleted.push(courseId);
        // Generate certificate
        const certId = "cert-" + Date.now();
        state.certificates.push({
          id: certId,
          title: `Certification of Completion: ${courseId}`,
          issueDate: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          verified: true,
        });
      }
    }

    this.saveState(state);
    return { state, completed };
  },

  /**
   * Record a quiz attempt with score.
   * Recalculates average score, mastery %, and weak/mastered concepts.
   */
  recordQuiz(
    quizId: string,
    title: string,
    score: number,
    maxScore: number,
    conceptName?: string
  ): UserLearningState {
    const state = this.getState();
    const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    state.quizAttempts.push({
      id: "qa-" + Date.now(),
      quizId,
      title,
      score,
      maxScore,
      timestamp: new Date().toISOString(),
      conceptId: conceptName,
    });

    state.studyTimeMinutes += 15; // +15 mins for quiz
    this.updateStreak(state);

    if (conceptName) {
      if (percent >= 80) {
        if (!state.masteredConcepts.includes(conceptName)) {
          state.masteredConcepts.push(conceptName);
        }
        state.weakConcepts = state.weakConcepts.filter((c) => c !== conceptName);
      } else if (percent < 60) {
        if (!state.weakConcepts.includes(conceptName)) {
          state.weakConcepts.push(conceptName);
        }
      }
    }

    this.saveState(state);
    return state;
  },

  /**
   * Record an AI Tutor chat interaction.
   */
  recordChat(topic: string): UserLearningState {
    const state = this.getState();
    state.chatSessionsCount += 1;
    if (topic && !state.recentChatTopics.includes(topic)) {
      state.recentChatTopics.unshift(topic);
      if (state.recentChatTopics.length > 5) state.recentChatTopics.pop();
    }
    this.updateStreak(state);
    this.saveState(state);
    return state;
  },

  /**
   * Bookmark or unbookmark a course.
   */
  toggleBookmark(courseId: string): { state: UserLearningState; bookmarked: boolean } {
    const state = this.getState();
    const index = state.bookmarks.indexOf(courseId);
    let bookmarked = false;
    if (index >= 0) {
      state.bookmarks.splice(index, 1);
      bookmarked = false;
    } else {
      state.bookmarks.push(courseId);
      bookmarked = true;
    }
    this.saveState(state);
    return { state, bookmarked };
  },

  /**
   * Helper to advance daily streak and weekly active day flags.
   */
  updateStreak(state: UserLearningState): void {
    const today = new Date().toISOString().slice(0, 10);
    const dayOfWeek = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

    state.weeklyStreakDays[dayOfWeek] = true;

    if (state.lastActiveDate !== today) {
      if (!state.lastActiveDate) {
        state.streakDays = 1;
      } else {
        const last = new Date(state.lastActiveDate);
        const diffMs = new Date(today).getTime() - last.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          state.streakDays += 1;
        } else if (diffDays > 1) {
          state.streakDays = 1;
        }
      }
      state.lastActiveDate = today;
    }
  },

  /**
   * Convert current learning state to StudentStats object for Dashboard.
   */
  getStudentStats(): StudentStats {
    const state = this.getState();
    const totalLessonsCompleted = Object.values(state.completedLessons).reduce(
      (sum, list) => sum + list.length,
      0
    );

    // Calculate dynamic mastery
    let calculatedMastery = 0;
    if (state.quizAttempts.length > 0) {
      const avgQuizScore =
        state.quizAttempts.reduce((acc, q) => acc + (q.score / (q.maxScore || 100)) * 100, 0) /
        state.quizAttempts.length;
      calculatedMastery = Math.min(100, Math.round(avgQuizScore * 0.7 + totalLessonsCompleted * 3));
    } else if (totalLessonsCompleted > 0) {
      calculatedMastery = Math.min(100, totalLessonsCompleted * 10);
    } else {
      calculatedMastery = 0;
    }

    const focusHours = parseFloat((state.studyTimeMinutes / 60).toFixed(1));

    return {
      overallMastery: calculatedMastery,
      totalConcepts: 84,
      masteredConcepts: state.masteredConcepts.length,
      dailyStreak: state.streakDays,
      longestStreak: Math.max(state.streakDays, 0),
      weeklyStreakDays: state.weeklyStreakDays,
      focusTimeHours: focusHours,
      focusTimeDelta: focusHours > 0 ? `${focusHours}h logged` : "0h this week",
      conceptsCloseToMastery: state.learningConcepts.length,
    };
  },

  /**
   * Dynamic study plan based on user's real state.
   */
  getStudyPlan(): StudyPlanItem[] {
    const state = this.getState();
    const hasStarted = state.coursesEnrolled.length > 0;

    if (!hasStarted) {
      return [
        {
          id: "sp-onboard-1",
          time: "Step 1",
          title: "Select your first course",
          subtitle: "Explore 150+ curricula across K-12, B.Tech, and Competitive Exams",
          tag: "Explore",
          tone: "indigo",
        },
        {
          id: "sp-onboard-2",
          time: "Step 2",
          title: "Complete your first lesson",
          subtitle: "Watch video or read study notes to unlock your streak",
          tag: "Lesson",
          tone: "emerald",
        },
        {
          id: "sp-onboard-3",
          time: "Step 3",
          title: "Diagnostic Checkpoint",
          subtitle: "Test baseline knowledge with AI Tutor",
          tag: "AI Tutor",
          tone: "cyan",
        },
      ];
    }

    return [
      {
        id: "sp-active-1",
        time: "Today",
        title: "Continue Active Course",
        subtitle: `In progress: ${state.coursesEnrolled[0]}`,
        tag: "In Progress",
        tone: "indigo",
      },
      {
        id: "sp-active-2",
        time: "Practice",
        title: "Adaptive Practice Session",
        subtitle: "Reinforce newly covered concepts with AI Tutor",
        tag: "Practice",
        tone: "emerald",
      },
      {
        id: "sp-active-3",
        time: "Checkpoint",
        title: "Weekly Knowledge Quiz",
        subtitle: "Measure concept retention and update mastery curve",
        tag: "Quiz",
        tone: "amber",
      },
    ];
  },
};
