/**
 * userProgressService.ts
 * Real-time, per-user authenticated learning progress engine.
 * 
 * Strict Zero-State Policy:
 * - Brand new accounts start with exact 0s (0 courses, 0 lessons, 0% mastery, 0h study time, 0 streak).
 * - Every verified learning action (completing a lesson, taking a quiz)
 *   automatically and immediately updates the user's progress and daily streak.
 * - Stores state in local persistent storage per user ID and syncs with backend APIs.
 */

import { apiClient } from "@/api/client";
import type { StudentStats, StudyPlanItem, AchievementItem, CertificateItem } from "@/types/student";
import type { StreakInfo, StreakRecordResult, StreakHistoryDay } from "@/api/streak";

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
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string | null;
  weeklyStreakDays: boolean[]; // 7 days (M-S)
  dailyActivities: Array<{
    id: string;
    type: string;
    date: string;
    timestamp: string;
    courseId?: string;
    lessonId?: string;
    quizId?: string;
    score?: number;
  }>;
  celebratedMilestones: number[];
  masteredConcepts: string[];
  learningConcepts: string[];
  weakConcepts: string[];
  bookmarks: string[];
  achievements: AchievementItem[];
  certificates: CertificateItem[];
  _dataVersion?: number; // used to force-clear stale cached data
}

const STORAGE_PREFIX = "learngraph_progress_v2_";
const DATA_VERSION = 4; // Bumped for persistent daily streak architecture

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

/**
 * Get authoritative local calendar date (YYYY-MM-DD) for a given timezone.
 * Defaults to Asia/Kolkata if no timezone provided.
 */
export function getLocalCalendarDate(tz?: string): string {
  try {
    const timeZone = tz || Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toLocaleDateString("en-CA");
  }
}

/**
 * Deterministically compute the calendar date of the preceding day (YYYY-MM-DD).
 */
export function getYesterdayCalendarDate(todayStr: string): string {
  const parts = todayStr.split("-").map(Number);
  const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

/**
 * Get index of current day in Monday-Sunday week (0 = Monday, 6 = Sunday).
 */
export function getLocalDayOfWeekIndex(tz?: string): number {
  try {
    const timeZone = tz || Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    // Get weekday in user timezone
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
    }).format(new Date());
    const dayMap: Record<string, number> = {
      Mon: 0,
      Tue: 1,
      Wed: 2,
      Thu: 3,
      Fri: 4,
      Sat: 5,
      Sun: 6,
    };
    return dayMap[parts] ?? (new Date().getDay() + 6) % 7;
  } catch {
    return (new Date().getDay() + 6) % 7;
  }
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
    longestStreak: 0,
    totalActiveDays: 0,
    lastActiveDate: null,
    weeklyStreakDays: [false, false, false, false, false, false, false],
    dailyActivities: [],
    celebratedMilestones: [],
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
          // If version matches or upgraded, ensure all fields exist
          return {
            ...createZeroState(userId, email),
            ...parsed,
            userId,
            email,
            dailyActivities: parsed.dailyActivities || [],
            celebratedMilestones: parsed.celebratedMilestones || [],
            longestStreak: parsed.longestStreak ?? parsed.streakDays ?? 0,
            totalActiveDays: parsed.totalActiveDays ?? (parsed.streakDays > 0 ? parsed.streakDays : 0),
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
   * Save state to localStorage and broadcast real-time event.
   */
  saveState(state: UserLearningState): void {
    const storageKey = STORAGE_PREFIX + state.userId;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // ignore quota
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
   * Enroll the user in a course (does NOT advance streak; streak requires learning activity).
   */
  enrollCourse(courseId: string): UserLearningState {
    const state = this.getState();
    if (!state.coursesEnrolled.includes(courseId)) {
      state.coursesEnrolled.push(courseId);
      this.saveState(state);
    }
    return state;
  },

  /**
   * Complete or uncomplete a lesson in a course.
   * Completing a lesson is a verified qualifying learning activity that advances the daily streak.
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
      this.saveState(state);
    } else {
      state.completedLessons[courseId] = [...currentLessons, lessonId];
      state.studyTimeMinutes += durationMinutes;
      completed = true;

      // Check if course is fully completed
      if (
        state.completedLessons[courseId].length >= totalCourseLessons &&
        !state.coursesCompleted.includes(courseId)
      ) {
        state.coursesCompleted.push(courseId);
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

      this.saveState(state);

      // Record verified learning activity & advance daily streak
      this.recordQualifyingActivity({
        activity_type: "lesson_completion",
        course_id: courseId,
        lesson_id: lessonId,
      });

      // Asynchronously sync with backend endpoint
      if (state.userId !== "guest_user") {
        apiClient
          .post("/streak/activity", {
            activity_type: "lesson_completion",
            course_id: courseId,
            lesson_id: lessonId,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
          })
          .catch(() => {});
      }
    }

    return { state, completed };
  },

  /**
   * Record a quiz attempt.
   * Submitting a quiz is a verified qualifying learning activity that advances the daily streak.
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

    // Record verified qualifying activity & advance daily streak
    this.recordQualifyingActivity({
      activity_type: "quiz_completion",
      quiz_id: quizId,
      score: percent,
    });

    // Asynchronously sync with backend endpoint
    if (state.userId !== "guest_user") {
      apiClient
        .post("/streak/activity", {
          activity_type: "quiz_completion",
          quiz_id: quizId,
          score: percent,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        })
        .catch(() => {});
    }

    return state;
  },

  /**
   * Record a verified qualifying learning activity.
   * - Enforces maximum 1 streak increment per calendar date.
   * - Increases streak on consecutive calendar days.
   * - Breaks streak if a complete calendar day is missed.
   * - Restarts streak at 1 on returning after a break.
   * - Preserves longest streak permanently.
   */
  recordQualifyingActivity(payload: {
    activity_type: string;
    course_id?: string;
    lesson_id?: string;
    quiz_id?: string;
    score?: number;
    timezone?: string;
  }): StreakRecordResult {
    const state = this.getState();
    const tz = payload.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    const today = getLocalCalendarDate(tz);
    const yesterday = getYesterdayCalendarDate(today);

    // Update 7-day indicator
    const localDayIdx = getLocalDayOfWeekIndex(tz);
    state.weeklyStreakDays[localDayIdx] = true;

    // Check if already active today
    const alreadyActiveToday =
      state.dailyActivities.some((a) => a.date === today) || state.lastActiveDate === today;

    const activityId = "act-" + Date.now();
    const nowIso = new Date().toISOString();
    state.dailyActivities.push({
      id: activityId,
      type: payload.activity_type,
      date: today,
      timestamp: nowIso,
      courseId: payload.course_id,
      lessonId: payload.lesson_id,
      quizId: payload.quiz_id,
      score: payload.score,
    });

    let newMilestone: number | null = null;
    let message = "";

    if (alreadyActiveToday) {
      // Activity recorded; streak already maintained today
      message = "Learning activity verified! Streak maintained for today.";
    } else {
      // First qualifying activity of today!
      if (state.lastActiveDate === yesterday) {
        state.streakDays += 1;
        message = `Daily streak advanced to ${state.streakDays} days!`;
      } else {
        // First activity or restarting after missing a full calendar day
        state.streakDays = 1;
        message = "Daily streak started! 1 day recorded.";
      }

      state.lastActiveDate = today;
      state.totalActiveDays = (state.totalActiveDays || 0) + 1;
      state.longestStreak = Math.max(state.longestStreak || 0, state.streakDays);

      const MILESTONES = [3, 7, 14, 30, 50, 100];
      if (
        MILESTONES.includes(state.streakDays) &&
        !state.celebratedMilestones.includes(state.streakDays)
      ) {
        newMilestone = state.streakDays;
        state.celebratedMilestones.push(state.streakDays);
        message = `Incredible milestone reached: ${state.streakDays}-Day Streak!`;
        window.dispatchEvent(
          new CustomEvent("learngraph:streak-milestone", { detail: { milestone: state.streakDays } })
        );
      }
    }

    this.saveState(state);

    return {
      success: true,
      streak: this.getStreakInfo(),
      activity: {
        id: activityId,
        activity_type: payload.activity_type,
        activity_date: today,
        created_at: nowIso,
      },
      message,
      new_milestone_reached: newMilestone,
    };
  },

  /**
   * Inspect authoritative streak state for the active student.
   */
  getStreakInfo(): StreakInfo {
    const state = this.getState();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    const today = getLocalCalendarDate(tz);
    const yesterday = getYesterdayCalendarDate(today);

    const is_active_today =
      state.lastActiveDate === today || state.dailyActivities.some((a) => a.date === today);

    let currentStreak = state.streakDays;

    if (!state.lastActiveDate) {
      currentStreak = 0;
    } else if (is_active_today) {
      currentStreak = state.streakDays;
    } else if (state.lastActiveDate === yesterday) {
      // Studied yesterday, hasn't completed a lesson yet today.
      // Preserved! Do NOT prematurely reset to 0 before the day ends.
      currentStreak = state.streakDays;
    } else {
      // Missed at least 1 full calendar day
      currentStreak = 0;
    }

    const longestStreak = Math.max(state.longestStreak || 0, state.streakDays);
    const MILESTONES = [3, 7, 14, 30, 50, 100];
    const unlocked = MILESTONES.filter((m) => currentStreak >= m);
    const remaining = MILESTONES.filter((m) => currentStreak < m);
    const next_m = remaining.length > 0 ? remaining[0] : 150;
    const days_left = Math.max(0, next_m - currentStreak);

    let msg = "";
    if (currentStreak === 0) {
      msg = "Complete a lesson or quiz today to start your daily streak!";
    } else if (is_active_today) {
      msg = `Streak active! Great job learning today (${currentStreak}-day streak).`;
    } else {
      msg = `Streak alive! Complete a lesson today to continue your ${currentStreak}-day streak.`;
    }

    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_active_days: state.totalActiveDays || (currentStreak > 0 ? currentStreak : 0),
      last_activity_date: state.lastActiveDate,
      is_active_today,
      today_date: today,
      user_timezone: tz,
      weekly_activity: state.weeklyStreakDays,
      weekly_labels: ["M", "T", "W", "T", "F", "S", "S"],
      motivational_message: msg,
      next_milestone: next_m,
      days_to_next_milestone: days_left,
      unlocked_milestones: unlocked,
      new_milestone_achieved: null,
    };
  },

  /**
   * Sync streak attributes when verified data arrives from the backend API.
   */
  syncStreakFromBackend(backendStreak: StreakInfo): void {
    const state = this.getState();
    state.streakDays = backendStreak.current_streak;
    state.longestStreak = Math.max(state.longestStreak || 0, backendStreak.longest_streak);
    state.lastActiveDate = backendStreak.last_activity_date || state.lastActiveDate;
    state.totalActiveDays = backendStreak.total_active_days;
    state.weeklyStreakDays = backendStreak.weekly_activity;
    this.saveState(state);
  },

  /**
   * Retrieve calendar history for the past N days.
   */
  getStreakHistory(days = 30): { history: StreakHistoryDay[] } {
    const state = this.getState();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    const today = getLocalCalendarDate(tz);

    const history: StreakHistoryDay[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const parts = today.split("-").map(Number);
      const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      d.setUTCDate(d.getUTCDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      const matchingActs = state.dailyActivities.filter((a) => a.date === dateStr);
      history.push({
        date: dateStr,
        activity_count: matchingActs.length,
        activity_types: Array.from(new Set(matchingActs.map((a) => a.type))),
      });
    }

    return { history };
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
   * Convert current learning state to StudentStats object for Dashboard.
   */
  getStudentStats(): StudentStats {
    const state = this.getState();
    const streakInfo = this.getStreakInfo();

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
      dailyStreak: streakInfo.current_streak,
      longestStreak: streakInfo.longest_streak,
      weeklyStreakDays: streakInfo.weekly_activity,
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
          subtitle: "Explore 213+ curricula across K-12, B.Tech, and Competitive Exams",
          tag: "Explore",
          tone: "indigo",
        },
        {
          id: "sp-onboard-2",
          time: "Step 2",
          title: "Complete your first lesson",
          subtitle: "Read notes or watch tutorial to start your daily streak",
          tag: "Lesson",
          tone: "emerald",
        },
        {
          id: "sp-onboard-3",
          time: "Step 3",
          title: "Diagnostic Checkpoint",
          subtitle: "Test baseline knowledge with Quiz Lab",
          tag: "Quiz",
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
        subtitle: "Measure concept retention and advance daily streak",
        tag: "Quiz",
        tone: "amber",
      },
    ];
  },
};
