import type {
  AnalyticsOverview,
  ActivityDataPoint,
  AIPrediction,
  SubjectMastery,
} from "@/types/analytics";

export const MOCK_ANALYTICS_OVERVIEW: AnalyticsOverview = {
  learningTimeHours: 32.8,
  learningTimeTrend: "↑ 12%",
  averageAccuracy: 84,
  averageAccuracyTrend: "↑ 4%",
  lessonsCompleted: 28,
  lessonsCompletedSubtext: "6 this week",
  currentStreakDays: 12,
  currentStreakSubtext: "Best: 21",
};

export const MOCK_ACTIVITY_DATA: ActivityDataPoint[] = [
  { date: "Apr 8", hours: 3.5, accuracy: 78 },
  { date: "Apr 12", hours: 5.2, accuracy: 82 },
  { date: "Apr 16", hours: 2.8, accuracy: 74 },
  { date: "Apr 20", hours: 7.1, accuracy: 88 },
  { date: "Apr 24", hours: 6.0, accuracy: 86 },
  { date: "Apr 28", hours: 8.5, accuracy: 92 },
  { date: "May 2", hours: 7.6, accuracy: 90 },
];

export const MOCK_PREDICTION: AIPrediction = {
  targetDate: "June 18",
  subject: "Calculus II",
  confidencePercentage: 87,
  dailyRequirementMinutes: 45,
};

export const MOCK_SUBJECT_MASTERY: SubjectMastery[] = [
  { subject: "Mathematics", percentage: 78, tone: "indigo" },
  { subject: "Computer Science", percentage: 71, tone: "cyan" },
  { subject: "Physics", percentage: 63, tone: "emerald" },
  { subject: "Chemistry", percentage: 48, tone: "amber" },
];
