export type CourseTone =
  | "violet"
  | "cyan"
  | "emerald"
  | "amber"
  | "rose"
  | "blue"
  | "indigo"
  | "purple"
  | "teal"
  | "orange";

export type CourseTier =
  | "School"
  | "Undergraduate"
  | "Postgraduate"
  | "Competitive Exams"
  | "Professional";

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
  type: "video" | "reading" | "quiz" | "practice";
}

export interface CourseChapter {
  id: string;
  title: string;
  lessonsCount: number;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  progress: number;
  lessons: string;
  time: string;
  tone: CourseTone;
  level: "Beginner" | "Intermediate" | "Advanced";
  iconSymbol?: string;
  description?: string;
  tier: CourseTier;
  gradeOrYear?: string;
  rating?: number;
  isBookmarked?: boolean;
  isRecentlyStudied?: boolean;
  chapters?: CourseChapter[];
  learningPath?: string[];
  notes?: string[];
  practiceQuestionsCount?: number;
  mockTestsCount?: number;
  syllabus?: string[];
}
