import type {
  TeacherClassStats,
  StudentPerformanceRow,
  TeacherReport,
} from "@/types/teacher";

export const MOCK_TEACHER_STATS: TeacherClassStats = {
  classMastery: 68,
  classMasteryDelta: "↑ 6% this month",
  activeStudents: 29,
  totalStudents: 32,
  atRiskCount: 4,
  assignmentAvg: 82,
};

export const MOCK_TEACHER_REPORT: TeacherReport = {
  scoreGrade: "B+",
  summary: "Strong progress",
  momentumDelta: "Class momentum improved by 12%",
  items: [
    "Algebra foundations are strong",
    "Limits need reinforcement",
    "6 students ready for advanced work",
  ],
  aiInsight:
    "41% of students are struggling with Limits. Consider reviewing it before introducing Derivatives.",
};

export const MOCK_STUDENT_PERFORMANCE: StudentPerformanceRow[] = [
  {
    id: "stud-1",
    name: "Maya Singh",
    initials: "MS",
    mastery: 82,
    focusTime: "6.4h",
    accuracy: "91%",
    lastActive: "8m ago",
    status: "On track",
  },
  {
    id: "stud-2",
    name: "James Wilson",
    initials: "JW",
    mastery: 76,
    focusTime: "5.8h",
    accuracy: "84%",
    lastActive: "1h ago",
    status: "On track",
  },
  {
    id: "stud-3",
    name: "Lina Chen",
    initials: "LC",
    mastery: 61,
    focusTime: "3.2h",
    accuracy: "72%",
    lastActive: "Yesterday",
    status: "Watch",
  },
  {
    id: "stud-4",
    name: "Noah Davis",
    initials: "ND",
    mastery: 43,
    focusTime: "1.8h",
    accuracy: "58%",
    lastActive: "3 days ago",
    status: "At risk",
  },
];
