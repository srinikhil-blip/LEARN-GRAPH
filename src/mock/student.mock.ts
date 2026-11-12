import type {
  StudentStats,
  StudyPlanItem,
  AchievementItem,
  CertificateItem,
  SkillItem,
} from "@/types/student";

export const MOCK_STUDENT_STATS: StudentStats = {
  overallMastery: 72,
  totalConcepts: 84,
  masteredConcepts: 46,
  dailyStreak: 12,
  longestStreak: 21,
  weeklyStreakDays: [true, true, true, true, true, false, false],
  focusTimeHours: 8.4,
  focusTimeDelta: "1.2h more than last week",
  conceptsCloseToMastery: 5,
};

export const MOCK_STUDY_PLAN: StudyPlanItem[] = [
  {
    id: "sp-1",
    time: "10:00",
    title: "Calculus practice",
    subtitle: "30 minute focus block",
    tag: "Quiz",
    tone: "indigo",
  },
  {
    id: "sp-2",
    time: "14:30",
    title: "Physics study group",
    subtitle: "30 minute focus block",
    tag: "Live",
    tone: "emerald",
  },
  {
    id: "sp-3",
    time: "18:00",
    title: "Review weak concepts",
    subtitle: "30 minute focus block",
    tag: "AI",
    tone: "cyan",
  },
];

export const MOCK_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: "ach-1",
    title: "On Fire",
    subtitle: "10 day streak",
    icon: "Flame",
  },
  {
    id: "ach-2",
    title: "Graph Builder",
    subtitle: "50 connections",
    icon: "BrainCircuit",
  },
  {
    id: "ach-3",
    title: "Precision",
    subtitle: "90% quiz score",
    icon: "Target",
  },
  {
    id: "ach-4",
    title: "Deep Work",
    subtitle: "5 focus hours",
    icon: "Clock3",
  },
];

export const MOCK_CERTIFICATES: CertificateItem[] = [
  {
    id: "cert-1",
    title: "Calculus I Foundations",
    issueDate: "April 2026",
    verified: true,
  },
  {
    id: "cert-2",
    title: "Python Data Structures",
    issueDate: "March 2026",
    verified: true,
  },
];

export const MOCK_SKILLS: SkillItem[] = [
  { name: "Problem solving", percentage: 92 },
  { name: "Programming", percentage: 86 },
  { name: "Mathematics", percentage: 78 },
  { name: "Data analysis", percentage: 72 },
];
