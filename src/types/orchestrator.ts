export type SupportedLanguage =
  | "Python"
  | "Java"
  | "C"
  | "C++"
  | "JavaScript"
  | "TypeScript"
  | "SQL";

export type ExplanationStyle = "Intuitive & Analogies" | "Socratic Questioning" | "Academic & Rigorous";

export type WeakConceptSeverity = "Critical" | "High" | "Moderate" | "Low";

export type OrchestratorIntent =
  | "Learning"
  | "PDF"
  | "Quiz"
  | "Recommendations"
  | "Knowledge Graph"
  | "Coding"
  | "Study Plan"
  | "Weak Concept";

// ── 1. Weak Concept & Mistake Analysis ────────────────────────────────────────

export interface MistakeDetail {
  quizTitle: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  errorPattern: string;
  frequency: number;
}

export interface WeakConceptAnalysisItem {
  concept: string;
  severity: WeakConceptSeverity;
  confidence: number; // 0.0 - 1.0
  reason: string; // Detailed diagnostic of why this error repeats
  suggestedLearningPath: string[]; // Step-by-step remedial roadmap
  estimatedImprovementTime: string; // e.g. "45 minutes", "2 hours"
  relatedPrerequisites: string[];
}

export interface WeakConceptDetectorResult {
  analyzedAt: string;
  totalQuizzesAudited: number;
  repeatedErrorPatterns: MistakeDetail[];
  skippedTopics: string[];
  weakConcepts: WeakConceptAnalysisItem[];
  globalImprovementPlan: string;
}

// ── 2. Personalized Study Schedule (Planner) ──────────────────────────────────

export interface DailyStudySlot {
  timeSlot: string; // e.g. "09:00 - 10:30"
  topic: string;
  activityType: "Concept Review" | "Practice Problems" | "Mock Quiz" | "Flashcard Revision" | "Project Work";
  durationMinutes: number;
  objectives: string[];
}

export interface DailySchedulePlan {
  dayNumber: number;
  dateString: string; // e.g. "2026-11-12"
  dayName: string; // e.g. "Thursday"
  totalStudyHours: number;
  slots: DailyStudySlot[];
  pomodoroBreakSchedule: string; // e.g. "25m focus / 5m break, 15m break after slot 2"
}

export interface WeeklyStudyGoal {
  weekNumber: number;
  focusArea: string;
  targetConcepts: string[];
  checkpointGoal: string;
}

export interface MockTestSchedule {
  testDate: string;
  title: string;
  topicsCovered: string[];
  durationMinutes: number;
  passTargetScore: number;
}

export interface SpacedRevisionSchedule {
  interval: "Day 1 (Immediate)" | "Day 3 (Reinforcement)" | "Day 7 (Retention)" | "Day 14 (Long-term)";
  conceptsToReview: string[];
  technique: string;
}

export interface StudySchedulePayload {
  examDate: string;
  daysRemaining: number;
  dailyHoursAvailable: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  weeklyGoals: WeeklyStudyGoal[];
  dailyPlan: DailySchedulePlan[];
  breakReminders: string[];
  revisionSchedule: SpacedRevisionSchedule[];
  mockTests: MockTestSchedule[];
  progressCheckpoints: Array<{ milestone: string; targetDate: string; criteria: string }>;
}

// ── 3. ChatGPT-Style Coding Assistant ─────────────────────────────────────────

export interface ComplexityAnalysis {
  timeComplexity: string; // e.g. "O((V + E) log V)"
  timeExplanation: string;
  spaceComplexity: string; // e.g. "O(V)"
  spaceExplanation: string;
}

export interface CodePracticeQuestion {
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  starterSnippet: string;
  solutionSnippet: string;
}

export interface CodingAssistantResponse {
  language: SupportedLanguage;
  codeSnippet: string;
  explanation: string;
  complexity: ComplexityAnalysis;
  optimizationTips: string[];
  debuggingAdvice: string[];
  practiceQuestions: CodePracticeQuestion[];
  synthesisProjectIdea: string;
  securityNotice: string; // Guarantees zero SQL injection, buffer safety, etc.
}

// ── 4. Session Memory Manager ────────────────────────────────────────────────

export interface SessionMemory {
  studentName: string;
  learningGoals: string[];
  weakConcepts: string[];
  preferredLanguage: SupportedLanguage;
  preferredExplanationStyle: ExplanationStyle;
  currentCourse: string;
  masteredConcepts: string[];
  quizHistory: Array<{ title: string; score: number; passed: boolean; date: string }>;
  recommendations: string[];
}

// ── 5. AI Orchestrator ────────────────────────────────────────────────────────

export interface OrchestrationResult {
  detectedIntent: OrchestratorIntent;
  confidence: number;
  tutorReply: string;
  actionDestination?: string; // route or tab
  actionLabel?: string;
  structuredPayload?: unknown;
}
