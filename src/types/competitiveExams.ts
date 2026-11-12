export type ExamCode =
  | "jee-main"
  | "jee-advanced"
  | "neet"
  | "gate-cs"
  | "upsc-cse"
  | "cat-mba"
  | "gre-general"
  | "gmat"
  | "ssc-cgl"
  | "banking-po"
  | "ielts"
  | "rrb-railway"
  | "state-psc";

export interface ExamSubject {
  name: string;
  weightagePercentage: number;
  totalQuestions: number;
  highYieldTopics: string[];
}

export interface ExamPracticeQuestion {
  id: string;
  exam: ExamCode;
  subject: string;
  topic: string;
  difficulty: "Medium" | "Hard" | "Advanced";
  question: string;
  options: string[];
  correctIndex: number;
  detailedSolution: string;
  examYearHint?: string;
  negativeMarking: number;
}

export interface ExamProfile {
  code: ExamCode;
  title: string;
  category: "Engineering" | "Medical" | "Civil Services" | "Management" | "Graduate Studies" | "Govt & Banking" | "Study Abroad";
  conductedBy: string;
  durationMinutes: number;
  totalMarks: number;
  scoringScheme: string;
  officialResourceUrl?: string;
  description: string;
  subjects: ExamSubject[];
  sampleQuestions: ExamPracticeQuestion[];
}

export interface UserExamProgress {
  examCode: ExamCode;
  readinessScore: number; // 0 - 100
  mockTestsAttempted: number;
  averageScorePercentage: number;
  predictedPercentile: number;
  weakTopics: string[];
  strongTopics: string[];
  estimatedDaysToExam: number;
}
