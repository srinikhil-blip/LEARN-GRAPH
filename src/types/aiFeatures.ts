export type QuestionTypeEnum =
  | "MCQ"
  | "True/False"
  | "Fill in the blanks"
  | "Coding"
  | "Short answer"
  | "Long answer"
  | "Case study";

export type BloomsTaxonomyLevel =
  | "Remember"
  | "Understand"
  | "Apply"
  | "Analyze"
  | "Evaluate"
  | "Create";

export type EducationLevel = "Beginner" | "Intermediate" | "Advanced";

export type SubjectDomain =
  | "Code"
  | "Math"
  | "Science"
  | "Engineering"
  | "Business"
  | "Humanities"
  | "Programming"
  | "Data Structures"
  | "Algorithms"
  | "AI"
  | "Machine Learning";

// ── 1. Personalized Quiz Types ───────────────────────────────────────────────

export interface PersonalizedQuizQuestion {
  id: string;
  type: QuestionTypeEnum;
  question: string;
  options?: string[]; // For MCQ & True/False
  codeSnippet?: string; // For Coding questions
  starterCode?: string; // For Coding questions
  correctAnswer: string;
  explanation: string;
  difficulty: EducationLevel;
  concept: string;
  bloomsTaxonomyLevel: BloomsTaxonomyLevel;
  hints: string[];
  estimatedSolvingTime: string;
}

export interface PersonalizedQuizPayload {
  title: string;
  targetMasteryScore: number;
  targetedWeakConcepts: string[];
  difficulty: EducationLevel;
  totalQuestions: number;
  questionTypes: QuestionTypeEnum[];
  questions: PersonalizedQuizQuestion[];
}

// ── 2. Learning Path Recommendation Types ─────────────────────────────────────

export interface RecommendedResource {
  title: string;
  authorOrSource: string;
  durationOrPages: string;
  type: "video" | "book" | "article" | "problem" | "project";
  why: string; // Crucial: Explains WHY this recommendation is made!
  url?: string;
  difficulty: EducationLevel;
}

export interface RecommendedConceptItem {
  name: string;
  rationale: string; // Explains WHY this concept comes next
  urgency: "High" | "Medium" | "Next Frontier";
  estimatedMinutes: number;
  prerequisitesMet: boolean;
}

export interface RecommendedProject {
  title: string;
  description: string;
  technologies: string[];
  estimatedHours: string;
  why: string;
}

export interface LearningPathRecommendationOutput {
  pathTitle: string;
  studentCurrentProgress: number;
  estimatedTotalLearningTime: string;
  confidenceScore: number; // e.g. 0.94
  whySummary: string; // Global architectural rationale
  nextConcepts: RecommendedConceptItem[];
  videos: RecommendedResource[];
  books: RecommendedResource[];
  articles: RecommendedResource[];
  practiceProblems: RecommendedResource[];
  projects: RecommendedProject[];
}

// ── 3. Advanced Flashcard Types ──────────────────────────────────────────────

export interface AdvancedFlashcardItem {
  id: string;
  question: string;
  answer: string;
  difficulty: EducationLevel;
  category: string;
  tags: string[];
  memoryTip: string;
  mnemonic: string;
}

export interface FlashcardDeckPayload {
  title: string;
  subject: string;
  flashcards: AdvancedFlashcardItem[];
}

// ── 4. Deep PDF & Document Analyzer Types ────────────────────────────────────

export interface ImportantConceptSummary {
  name: string;
  definition: string;
  importanceScore: number;
}

export interface ImportantFormula {
  name: string;
  formula: string;
  explanation: string;
  variables: Record<string, string>;
}

export interface MindMapBranch {
  name: string;
  subtopics: string[];
}

export interface MindMapData {
  rootTopic: string;
  branches: MindMapBranch[];
}

export interface StudyNoteSection {
  heading: string;
  content: string;
  keyTakeaways: string[];
}

export interface WeakConceptPitfall {
  concept: string;
  pitfallExplanation: string;
  remediationAdvice: string;
}

export interface DeepPdfAnalysisResult {
  documentTitle: string;
  summary: string;
  important_concepts: ImportantConceptSummary[];
  important_formulas: ImportantFormula[];
  mind_map: MindMapData;
  knowledge_graph: {
    nodes: Array<{ id: string; name: string; type: string }>;
    relationships: Array<{ from: string; to: string; type: string; confidence: number }>;
  };
  flashcards: AdvancedFlashcardItem[];
  quiz: PersonalizedQuizQuestion[];
  prerequisites: string[];
  study_notes: StudyNoteSection[];
  weak_concepts: WeakConceptPitfall[];
}
