import { create } from "zustand";

interface QuizStoreState {
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  answers: Record<number, number>; // questionIndex -> optionIndex
  timeRemaining: number;
  flaggedQuestions: number[];
  isSubmitted: boolean;
  setAnswer: (index: number) => void;
  nextQuestion: (totalQuestions: number) => void;
  previousQuestion: () => void;
  jumpToQuestion: (index: number) => void;
  toggleFlagCurrent: () => void;
  decrementTimer: () => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizStoreState>((set) => ({
  currentQuestionIndex: 0, // Starts cleanly on question 1
  selectedAnswer: null,
  answers: {}, // Clean slate for real user responses
  timeRemaining: 20 * 60, // 20:00 exam timer
  flaggedQuestions: [],
  isSubmitted: false,
  setAnswer: (index) =>
    set((state) => ({
      selectedAnswer: index,
      answers: { ...state.answers, [state.currentQuestionIndex]: index },
    })),
  nextQuestion: (totalQuestions) =>
    set((state) => {
      const nextIdx = Math.min(state.currentQuestionIndex + 1, totalQuestions - 1);
      return {
        currentQuestionIndex: nextIdx,
        selectedAnswer: state.answers[nextIdx] ?? null,
      };
    }),
  previousQuestion: () =>
    set((state) => {
      const prevIdx = Math.max(state.currentQuestionIndex - 1, 0);
      return {
        currentQuestionIndex: prevIdx,
        selectedAnswer: state.answers[prevIdx] ?? null,
      };
    }),
  jumpToQuestion: (index) =>
    set((state) => ({
      currentQuestionIndex: index,
      selectedAnswer: state.answers[index] ?? null,
    })),
  toggleFlagCurrent: () =>
    set((state) => {
      const idx = state.currentQuestionIndex;
      const flagged = state.flaggedQuestions.includes(idx)
        ? state.flaggedQuestions.filter((i) => i !== idx)
        : [...state.flaggedQuestions, idx];
      return { flaggedQuestions: flagged };
    }),
  decrementTimer: () =>
    set((state) => ({
      timeRemaining: Math.max(state.timeRemaining - 1, 0),
    })),
  submitQuiz: () => set({ isSubmitted: true }),
  resetQuiz: () =>
    set({
      currentQuestionIndex: 0,
      selectedAnswer: null,
      answers: {},
      timeRemaining: 20 * 60,
      flaggedQuestions: [],
      isSubmitted: false,
    }),
}));
