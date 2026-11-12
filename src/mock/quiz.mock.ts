import type { QuizQuestion } from "@/types/quiz";
import { COURSE_QUIZ_BANK, DEFAULT_PYQ_QUESTIONS, getQuizForCourse } from "@/data/courseQuizBank";

export { COURSE_QUIZ_BANK, getQuizForCourse };

/**
 * Default previous-paper questions based on authentic GATE / JEE / University examination patterns.
 */
export const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = DEFAULT_PYQ_QUESTIONS;
