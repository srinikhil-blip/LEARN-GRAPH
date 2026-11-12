/**
 * quiz.ts — Production-Ready Adaptive Quiz System Types
 * Supporting School, Undergraduate, Postgraduate, Competitive Exams & Professional Tracks.
 */

export type EducationLevelTier =
  | "School"
  | "Undergraduate"
  | "Postgraduate"
  | "Programming"
  | "Professional Courses"
  | "Competitive Exams";

export type QuestionDifficulty = "Easy" | "Medium" | "Hard" | "Adaptive";

export type QuestionSourceType = "Previous-Year Question" | "Practice Question";

export type SupportedQuestionType =
  | "Multiple Choice"
  | "Multiple Select"
  | "True/False"
  | "Assertion–Reason"
  | "Fill in the Blank"
  | "Short Answer"
  | "Numerical"
  | "Programming"
  | "Code Output"
  | "Case Study"
  | "Diagram-Based"
  | "Match the Following";

export interface QuizOption {
  id: number;
  label: string; // "A", "B", "C", "D"
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: SupportedQuestionType | string;
  difficulty: QuestionDifficulty;
  sourceType?: QuestionSourceType;
  examReference?: {
    examName: string; // e.g. "GATE CS", "JEE Advanced", "NEET", "CBSE Board", "CAT", "UPSC CSE"
    year?: number | string; // e.g. 2023, 2022
    subject: string;
    topic: string;
  };
  questionText: string;
  mathExpression?: string;
  subText?: string;
  codeSnippet?: string;
  codeLanguage?: string;
  diagramUrl?: string;
  options: QuizOption[];
  correctAnswerIndex: number;
  correctAnswerIndices?: number[]; // For Multiple Select
  correctAnswerText?: string; // For Fill in Blank / Numerical
  explanation: string;
  whyIncorrect?: Record<number, string>; // Detailed reason why each wrong option is invalid
  estimatedTimeSeconds?: number;
  tags?: string[];
  references?: string[];
  educationLevel?: string;
  gradeOrExam?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  weakConceptInsight?: {
    title: string;
    description: string;
    fromConcept: string;
    fromMastery: number;
    toConcept: string;
    toMastery: number;
  };
}

export interface QuizTopicNode {
  id: string;
  name: string;
  educationLevel: EducationLevelTier;
  gradeOrExam: string;
  subject: string;
  chapter: string;
  topic: string;
  estimatedQuestionsAvailable: number;
  hasPreviousYearQuestions: boolean;
}

export interface QuizHierarchy {
  levels: {
    id: EducationLevelTier;
    label: string;
    gradesOrExams: {
      id: string;
      label: string;
      subjects: {
        id: string;
        label: string;
        chapters: {
          id: string;
          label: string;
          topics: string[];
        }[];
      }[];
    }[];
  }[];
}

export interface QuizGenerationConfig {
  educationLevel: EducationLevelTier;
  gradeOrExam: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: QuestionDifficulty;
  questionCount: 5 | 10 | 20 | 30 | 50 | number;
  timeLimitMinutes?: number;
  questionTypes?: SupportedQuestionType[];
  onlyPreviousYearQuestions?: boolean;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  includeExplanations?: boolean;
  adaptiveMode?: boolean;
  targetWeakConcepts?: string[];
}

export interface QuizSubmissionPayload {
  quizId: string;
  topicId?: string;
  topicName: string;
  answers: Record<number, number | number[] | string>; // questionIndex -> answer
  timeTakenSeconds: number;
  config: Partial<QuizGenerationConfig>;
}

export interface TopicPerformance {
  topic: string;
  totalQuestions: number;
  correctCount: number;
  accuracyPercentage: number;
  masteryDelta: number;
}

export interface ConceptMasteryUpdate {
  concept: string;
  previousMastery: number;
  newMastery: number;
  status: "Mastered" | "Improving" | "Needs Attention";
}

export interface PostQuizAnalytics {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  chapter: string;
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  timeTakenSeconds: number;
  averageTimePerQuestionSeconds: number;
  accuracyRating: "Exceptional" | "Proficient" | "Developing" | "Needs Reinforcement";
  topicWisePerformance: TopicPerformance[];
  weakConcepts: string[];
  strongConcepts: string[];
  recommendedLessons: Array<{
    id: string;
    title: string;
    chapter: string;
    courseId?: string;
    duration: string;
    reason: string;
  }>;
  suggestedRevisions: string[];
  knowledgeGraphUpdates: ConceptMasteryUpdate[];
  createdAt: string;
}

export interface QuizState {
  title: string;
  category: string;
  totalQuestions: number;
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  userAnswers: Record<number, number>;
  flaggedQuestions: number[];
  isSubmitted: boolean;
}
