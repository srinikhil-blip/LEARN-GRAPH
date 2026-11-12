import { useQuery, useMutation } from "@tanstack/react-query";
import { quizApi } from "@/api/quiz";
import { useQuizStore } from "@/store/useQuizStore";

export function useQuiz(topicId?: string) {
  const quizStore = useQuizStore();

  const quizQuery = useQuery({
    queryKey: ["quiz", topicId || "default"],
    queryFn: () => quizApi.getQuiz(topicId),
    staleTime: 5 * 60 * 1000,
  });

  const submitAnswerMutation = useMutation({
    mutationFn: ({ questionId, optionIndex }: { questionId: string; optionIndex: number }) =>
      quizApi.submitAnswer(questionId, optionIndex),
  });

  const questions = quizQuery.data?.questions || [];
  const currentQuestion = questions[quizStore.currentQuestionIndex];

  return {
    quizTitle: quizQuery.data?.title || "Limits & Continuity",
    category: quizQuery.data?.category || "AI-GENERATED QUIZ",
    questions,
    currentQuestion,
    currentQuestionIndex: quizStore.currentQuestionIndex,
    selectedAnswer: quizStore.selectedAnswer,
    answers: quizStore.answers,
    timeRemaining: quizStore.timeRemaining,
    flaggedQuestions: quizStore.flaggedQuestions,
    isSubmitted: quizStore.isSubmitted,
    setAnswer: quizStore.setAnswer,
    nextQuestion: () => quizStore.nextQuestion(questions.length),
    previousQuestion: quizStore.previousQuestion,
    jumpToQuestion: quizStore.jumpToQuestion,
    toggleFlagCurrent: quizStore.toggleFlagCurrent,
    submitAnswer: submitAnswerMutation.mutateAsync,
    submitQuiz: quizStore.submitQuiz,
    resetQuiz: quizStore.resetQuiz,
    isLoading: quizQuery.isLoading,
    isError: quizQuery.isError,
    error: quizQuery.error,
  };
}
