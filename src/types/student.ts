export interface StudentStats {
  overallMastery: number;
  totalConcepts: number;
  masteredConcepts: number;
  dailyStreak: number;
  longestStreak: number;
  weeklyStreakDays: boolean[]; // 7 days (M-S)
  focusTimeHours: number;
  focusTimeDelta: string;
  conceptsCloseToMastery: number;
}

export interface StudyPlanItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  tag: string;
  tone: "indigo" | "emerald" | "cyan" | "amber" | "red" | "violet" | "rose";
}

export interface AchievementItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  issueDate: string;
  verified: boolean;
}

export interface SkillItem {
  name: string;
  percentage: number;
}
