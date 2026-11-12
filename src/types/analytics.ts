export interface AnalyticsOverview {
  learningTimeHours: number;
  learningTimeTrend: string;
  averageAccuracy: number;
  averageAccuracyTrend: string;
  lessonsCompleted: number;
  lessonsCompletedSubtext: string;
  currentStreakDays: number;
  currentStreakSubtext: string;
}

export interface ActivityDataPoint {
  date: string;
  hours: number;
  accuracy: number;
}

export interface AIPrediction {
  targetDate: string;
  subject: string;
  confidencePercentage: number;
  dailyRequirementMinutes: number;
}

export interface SubjectMastery {
  subject: string;
  percentage: number;
  tone: string;
}
