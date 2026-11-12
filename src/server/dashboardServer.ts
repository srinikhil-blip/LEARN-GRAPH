/**
 * dashboardServer.ts
 * Vite server-side Dashboard & Student Analytics API handlers.
 * Backed by persistent storage at backend/data/user_progress_db.json.
 * 
 * Strict Zero-State Implementation:
 * Brand new accounts always return exact 0s for mastery, streaks, study hours,
 * and empty arrays for courses, lessons, chats, and quiz history.
 */

import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { verifyJWT } from "./authServer.ts";

const DB_FILE = path.resolve(process.cwd(), "backend", "data", "user_progress_db.json");

interface UserProgressDbRecord {
  userId: string;
  email: string;
  coursesEnrolled: string[];
  coursesCompleted: string[];
  completedLessons: Record<string, string[]>;
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
  weeklyStreakDays: boolean[];
  masteredConcepts: string[];
  learningConcepts: string[];
  weakConcepts: string[];
  bookmarks: string[];
  achievements: any[];
  certificates: any[];
}

interface ProgressDatabase {
  users: Record<string, UserProgressDbRecord>;
}

function loadDatabase(): ProgressDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("[dashboardServer] Error reading DB:", e);
  }
  return { users: {} };
}

function saveDatabase(db: ProgressDatabase): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("[dashboardServer] Error saving DB:", e);
  }
}

function getOrCreateUserRecord(userId: string, email: string): UserProgressDbRecord {
  const db = loadDatabase();
  if (db.users[userId]) {
    return db.users[userId];
  }

  // Create brand new ZERO state record
  const zeroRecord: UserProgressDbRecord = {
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
  };

  db.users[userId] = zeroRecord;
  saveDatabase(db);
  return zeroRecord;
}

function sendJson(res: ServerResponse, status = 200, data: unknown): void {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

function parseUrl(raw: string): { pathname: string; searchParams: URLSearchParams } {
  try {
    const u = new URL(raw, "http://localhost");
    return { pathname: u.pathname, searchParams: u.searchParams };
  } catch {
    const [pathname, qs = ""] = raw.split("?");
    return { pathname, searchParams: new URLSearchParams(qs) };
  }
}

async function readBody<T = any>(req: IncomingMessage): Promise<T | null> {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : null);
      } catch {
        resolve(null);
      }
    });
    req.on("error", () => resolve(null));
  });
}

function extractUserFromHeader(req: IncomingMessage): { userId: string; email: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  const verified = verifyJWT(token);
  if (verified.valid && verified.payload?.sub) {
    return {
      userId: verified.payload.sub,
      email: verified.payload.email || "",
    };
  }
  return null;
}

export async function handleDashboardApiRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const rawUrl = req.url ?? "";
  const method = req.method ?? "GET";

  const DASHBOARD_ROUTES = [
    "/api/v1/dashboard",
    "/api/v1/students/dashboard",
    "/api/v1/students/progress",
    "/api/v1/students/study-plan",
    "/api/v1/student/progress",
    "/api/v1/analytics/weekly",
    "/api/v1/analytics/activity",
  ];

  const matches = DASHBOARD_ROUTES.some((route) => rawUrl.startsWith(route));
  if (!matches) return false;

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return true;
  }

  const { pathname } = parseUrl(rawUrl);
  const authUser = extractUserFromHeader(req);
  const userId = authUser?.userId || "guest_user";
  const userEmail = authUser?.email || "guest@learngraph.internal";

  const record = getOrCreateUserRecord(userId, userEmail);

  // 1. Sync endpoint
  if (pathname === "/api/v1/student/progress/sync" && method === "POST") {
    const payload = await readBody<UserProgressDbRecord>(req);
    if (payload && userId !== "guest_user") {
      const db = loadDatabase();
      db.users[userId] = {
        ...getOrCreateUserRecord(userId, userEmail),
        ...payload,
        userId,
        email: userEmail,
      };
      saveDatabase(db);
    }
    sendJson(res, 200, { success: true });
    return true;
  }

  // 2. Student dashboard KPIs / /api/v1/students/dashboard
  if (pathname === "/api/v1/students/dashboard" || pathname === "/api/v1/dashboard/stats") {
    const totalLessons = Object.values(record.completedLessons).reduce(
      (sum, list) => sum + list.length,
      0
    );
    const avgScore =
      record.quizAttempts.length > 0
        ? record.quizAttempts.reduce((sum, q) => sum + (q.score / (q.maxScore || 100)) * 100, 0) /
          record.quizAttempts.length
        : 0;
    const masteryScore =
      record.quizAttempts.length > 0
        ? Math.min(100, Math.round(avgScore * 0.7 + totalLessons * 3))
        : totalLessons > 0
        ? Math.min(100, totalLessons * 10)
        : 0;

    const focusHours = parseFloat((record.studyTimeMinutes / 60).toFixed(1));

    sendJson(res, 200, {
      kpis: {
        mastery_score: masteryScore / 100,
        streak_days: record.streakDays,
        total_study_hours: focusHours,
        total_concepts: 84,
        mastered_concepts: record.masteredConcepts.length,
        lessons_completed: totalLessons,
        quizzes_taken: record.quizAttempts.length,
        average_quiz_score: Math.round(avgScore),
      },
      user: {
        userId: record.userId,
        email: record.email,
        streakDays: record.streakDays,
        focusTimeHours: focusHours,
        coursesEnrolledCount: record.coursesEnrolled.length,
        coursesCompletedCount: record.coursesCompleted.length,
        bookmarksCount: record.bookmarks.length,
      },
    });
    return true;
  }

  // 3. /api/v1/students/study-plan
  if (pathname === "/api/v1/students/study-plan") {
    if (record.coursesEnrolled.length === 0) {
      sendJson(res, 200, [
        {
          id: "sp-1",
          time: "Step 1",
          title: "Select your first course",
          subtitle: "Explore 150+ curricula across K-12, B.Tech, and Competitive Exams",
          tag: "Explore",
          tone: "indigo",
        },
        {
          id: "sp-2",
          time: "Step 2",
          title: "Complete your first lesson",
          subtitle: "Watch video or read study notes to unlock your streak",
          tag: "Lesson",
          tone: "emerald",
        },
        {
          id: "sp-3",
          time: "Step 3",
          title: "Diagnostic Checkpoint",
          subtitle: "Test baseline knowledge with AI Tutor",
          tag: "AI Tutor",
          tone: "cyan",
        },
      ]);
    } else {
      sendJson(res, 200, [
        {
          id: "sp-1",
          time: "Today",
          title: "Continue Active Course",
          subtitle: `Active: ${record.coursesEnrolled[0]}`,
          tag: "In Progress",
          tone: "indigo",
        },
        {
          id: "sp-2",
          time: "Practice",
          title: "Adaptive Practice Session",
          subtitle: "Reinforce newly covered concepts with AI Tutor",
          tag: "Practice",
          tone: "emerald",
        },
      ]);
    }
    return true;
  }

  // 4. /api/v1/analytics/weekly
  if (pathname === "/api/v1/analytics/weekly") {
    const totalLessons = Object.values(record.completedLessons).reduce(
      (sum, list) => sum + list.length,
      0
    );
    const avgScore =
      record.quizAttempts.length > 0
        ? record.quizAttempts.reduce((sum, q) => sum + (q.score / (q.maxScore || 100)) * 100, 0) /
          record.quizAttempts.length
        : 0;
    const focusHours = parseFloat((record.studyTimeMinutes / 60).toFixed(1));

    sendJson(res, 200, {
      total_study_hours: focusHours,
      average_quiz_score: Math.round(avgScore),
      quizzes_taken: record.quizAttempts.length,
      streak_days: record.streakDays,
      lessons_completed: totalLessons,
    });
    return true;
  }

  // 5. /api/v1/analytics/activity
  if (pathname === "/api/v1/analytics/activity") {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const breakdown = days.map((day, idx) => ({
      date: day,
      hours: record.weeklyStreakDays[idx] ? parseFloat((record.studyTimeMinutes / (60 * 7)).toFixed(1)) : 0,
      accuracy: record.quizAttempts.length > 0 ? 80 : 0,
    }));
    sendJson(res, 200, { daily_breakdown: breakdown });
    return true;
  }

  // Default dashboard payload
  sendJson(res, 200, {
    user: record,
    isNewUser: record.coursesEnrolled.length === 0 && Object.keys(record.completedLessons).length === 0,
  });
  return true;
}
