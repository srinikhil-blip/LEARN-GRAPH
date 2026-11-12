/**
 * LearnGraph Universal Curriculum & Knowledge Graph Types
 * Comprehensive hierarchical data models spanning School (Class 8-12),
 * Undergrad, Postgrad, Competitive Exams, Placement, and 14 Career Paths.
 */

export type EducationTier =
  | "school"
  | "undergraduate"
  | "postgraduate"
  | "interview_prep"
  | "career_roadmap";

export type SchoolGrade = "Class 8" | "Class 9" | "Class 10" | "Class 11" | "Class 12";

export type UndergradDiscipline =
  | "Computer Science & Engineering"
  | "Information Technology"
  | "Artificial Intelligence & Data Science"
  | "Cyber Security"
  | "Electronics & Communication"
  | "Mechanical Engineering"
  | "Civil Engineering"
  | "Electrical Engineering"
  | "BCA"
  | "B.Sc Computer Science"
  | "Commerce & Finance"
  | "Science (PCM/PCB)";

export type PostgradDiscipline =
  | "M.Tech Computer Science"
  | "MCA (Master of Computer Applications)"
  | "MBA (Technology & Analytics)";

export type CareerTrack =
  | "Frontend Developer"
  | "Backend Developer"
  | "Full Stack Developer"
  | "AI Engineer"
  | "Machine Learning Engineer"
  | "Data Scientist"
  | "Cyber Security Engineer"
  | "Cloud Engineer"
  | "DevOps Engineer"
  | "Android Developer"
  | "Software Engineer"
  | "Game Developer"
  | "Blockchain Developer"
  | "UI/UX Designer";

export type InterviewTrack =
  | "FAANG / Tier-1 Tech"
  | "Product Companies"
  | "Service Companies"
  | "Campus Placement Preparation"
  | "System Design (HLD & LLD)"
  | "Behavioral & Leadership Principles";

export type GraphRelationshipType =
  | "PREREQUISITE"
  | "RELATED_TO"
  | "PART_OF"
  | "ADVANCED_VERSION_OF"
  | "SIMILAR_TO"
  | "USED_IN"
  | "REQUIRES"
  | "DEPENDS_ON";

export type BloomsTaxonomy =
  | "Remember"
  | "Understand"
  | "Apply"
  | "Analyze"
  | "Evaluate"
  | "Create";

export type TopicDifficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface ConceptGraphEdge {
  targetConcept: string;
  relationship: GraphRelationshipType;
  description: string;
  weight?: number; // 0.0 - 1.0
}

export interface TopicPracticeExercise {
  id: string;
  question: string;
  hint: string;
  solution: string;
  difficulty: TopicDifficulty;
}

export interface TopicCodingProblem {
  id: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  sampleInput: string;
  sampleOutput: string;
  starterCode: Record<string, string>; // language -> code
  solutionCode: Record<string, string>;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface TopicMcqQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  bloomsLevel: BloomsTaxonomy;
}

export interface TopicFlashcard {
  id: string;
  front: string;
  back: string;
  mnemonic?: string;
  memoryTip?: string;
  category: string;
}

export interface TopicInterviewQuestion {
  question: string;
  sampleAnswer: string;
  targetCompanyType: "FAANG" | "Product" | "Startup" | "General";
  frequency: "Very High" | "High" | "Medium";
}

/**
 * 20-Facet Canonical Topic Content Definition
 */
export interface TopicContentPayload {
  id: string;
  topicTitle: string;
  chapterTitle: string;
  subjectTitle: string;
  tier: EducationTier;
  targetAudience: string;

  // Facet 1: Topic Overview
  overview: string;

  // Facet 2: Beginner Explanation (Intuitive, analogies)
  beginnerExplanation: string;

  // Facet 3: Advanced Explanation (Math proofs, rigorous mechanics)
  advancedExplanation: string;

  // Facet 4: Real-world Examples
  realWorldExamples: string[];

  // Facet 5: Visual Explanation Description (Mind map / diagrammatic guidance)
  visualExplanation: {
    description: string;
    diagramType: "Flowchart" | "Graph" | "Architecture" | "Cycle" | "Hierarchy";
    asciiOrSvgHint: string;
  };

  // Facet 6: Step-by-step Learning Guide
  stepByStepGuide: { step: number; title: string; instruction: string }[];

  // Facet 7: Practice Exercises
  practiceExercises: TopicPracticeExercise[];

  // Facet 8: Coding Problems (if applicable)
  codingProblems?: TopicCodingProblem[];

  // Facet 9: MCQ Quiz (10 Complete Questions)
  mcqQuiz: TopicMcqQuestion[];

  // Facet 10: Flashcards
  flashcards: TopicFlashcard[];

  // Facet 11: Common Interview Questions
  interviewQuestions: TopicInterviewQuestion[];

  // Facet 12: Common Mistakes & Pitfalls
  commonMistakes: { mistake: string; whyItHappens: string; correctApproach: string }[];

  // Facet 13: Revision Notes
  revisionNotes: string[];

  // Facet 14: AI Summary
  aiSummary: string;

  // Facet 15: Knowledge Graph Relationships (8 Types)
  graphRelationships: ConceptGraphEdge[];

  // Facet 16: Prerequisite Concepts
  prerequisites: string[];

  // Facet 17: Recommended Next Topics
  recommendedNextTopics: string[];

  // Facet 18: Bloom's Taxonomy Level
  bloomsTaxonomyLevel: BloomsTaxonomy;

  // Facet 19: Estimated Study Time
  estimatedStudyTimeMinutes: number;

  // Facet 20: Difficulty Rating
  difficultyRating: TopicDifficulty;
}

export interface CurriculumChapter {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  topics: TopicContentPayload[];
}

export interface CurriculumSubject {
  id: string;
  title: string;
  category: string;
  iconSymbol?: string;
  colorTone: string;
  description: string;
  chapters: CurriculumChapter[];
}

export interface CurriculumNode {
  id: string;
  tier: EducationTier;
  subCategory: string; // e.g. "Class 10", "Computer Science", "Frontend Developer"
  title: string;
  description: string;
  targetRoleOrOutcome: string;
  subjects: CurriculumSubject[];
}
