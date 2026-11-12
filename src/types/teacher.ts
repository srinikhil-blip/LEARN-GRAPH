export interface TeacherClassStats {
  classMastery: number;
  classMasteryDelta: string;
  activeStudents: number;
  totalStudents: number;
  atRiskCount: number;
  assignmentAvg: number;
}

export interface StudentPerformanceRow {
  id: string;
  name: string;
  initials: string;
  mastery: number;
  focusTime: string;
  accuracy: string;
  lastActive: string;
  status: "On track" | "Watch" | "At risk";
}

export interface TeacherReport {
  scoreGrade: string;
  summary: string;
  momentumDelta: string;
  items: string[];
  aiInsight: string;
}
