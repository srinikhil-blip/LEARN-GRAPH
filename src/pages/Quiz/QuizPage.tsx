import { useState, useEffect } from "react";
import {
  Clock3,
  Sparkles,
  CheckCircle2,
  Trophy,
  RotateCcw,
  BarChart2,
  ArrowRight,
  BookOpen,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { QuestionCard } from "./QuestionCard";
import { QuizNav } from "./QuizNav";
import { QuizInsight } from "./QuizInsight";
import { useQuiz } from "@/hooks/useQuiz";
import { formatTimeRemaining } from "@/utils/formatters";
import { useQuizStore } from "@/store/useQuizStore";
import { ROUTES } from "@/constants/routes";
import { PersonalizedQuizGenerator } from "@/components/features/PersonalizedQuizGenerator";
import { userProgressService } from "@/services/userProgressService";
import { adaptiveQuizEngine } from "@/services/adaptiveQuizEngine";

export function QuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlTopic = searchParams.get("topic") || undefined;

  const [showAdaptiveGenerator, setShowAdaptiveGenerator] = useState(false);
  const {
    quizTitle,
    category,
    questions,
    currentQuestion,
    currentQuestionIndex,
    selectedAnswer,
    answers,
    timeRemaining,
    flaggedQuestions,
    isSubmitted,
    setAnswer,
    nextQuestion,
    previousQuestion,
    jumpToQuestion,
    toggleFlagCurrent,
    submitQuiz,
    resetQuiz,
  } = useQuiz(urlTopic);

  const { decrementTimer } = useQuizStore();

  useEffect(() => {
    if (!showAdaptiveGenerator && !isSubmitted) {
      const timer = setInterval(() => {
        decrementTimer();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [decrementTimer, showAdaptiveGenerator, isSubmitted]);

  const total = questions.length || 10;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / total) * 100);

  const handleSubmitQuiz = () => {
    // Evaluate submission via adaptiveQuizEngine
    const evaluation = adaptiveQuizEngine.evaluateSubmission(
      {
        quizId: `quiz-${Date.now()}`,
        topicName: quizTitle,
        answers,
        timeTakenSeconds: Math.max(0, 20 * 60 - timeRemaining),
        config: {
          topic: quizTitle,
        },
      },
      questions
    );

    submitQuiz();
  };

  // Calculate score if submitted
  const correctCount = questions.reduce((sum, q, idx) => {
    return sum + (answers[idx] === q.correctAnswerIndex ? 1 : 0);
  }, 0);
  const incorrectCount = total - correctCount;
  const accuracyPercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const weakConcept =
    currentQuestion?.weakConceptInsight?.toConcept ||
    questions[0]?.weakConceptInsight?.toConcept ||
    quizTitle;

  return (
    <div className="quiz-page">
      <header className="quiz-head flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag tone="indigo">{category}</Tag>
            <Button
              variant={showAdaptiveGenerator ? "primary" : "secondary"}
              className="py-1 px-2.5 text-xs gap-1.5"
              onClick={() => setShowAdaptiveGenerator(!showAdaptiveGenerator)}
            >
              <Sparkles size={13} />
              {showAdaptiveGenerator ? "Back to Standard Quiz" : "Adaptive Topic & PYQ Lab"}
            </Button>
          </div>
          <h2>{showAdaptiveGenerator ? "Personalized AI Diagnostic Lab" : quizTitle}</h2>
        </div>

        {!showAdaptiveGenerator && !isSubmitted && (
          <div className="flex items-center gap-4">
            <div className="quiz-progress">
              <span>
                Question <strong>{currentQuestionIndex + 1}</strong> of {total}
              </span>
              <Progress value={progressPercent} />
            </div>
            <div className="quiz-timer">
              <Clock3 />
              <span>{formatTimeRemaining(timeRemaining)}</span>
            </div>
            {answeredCount > 0 && (
              <Button
                variant="primary"
                onClick={handleSubmitQuiz}
                className="text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
              >
                Submit ({answeredCount}/{total})
              </Button>
            )}
          </div>
        )}
      </header>

      {showAdaptiveGenerator ? (
        <PersonalizedQuizGenerator onBack={() => setShowAdaptiveGenerator(false)} />
      ) : isSubmitted ? (
        /* Comprehensive Post-Quiz Analytics View */
        <div className="max-w-3xl mx-auto my-8 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Trophy size={36} />
          </div>

          <div>
            <Tag tone={accuracyPercent >= 80 ? "emerald" : accuracyPercent >= 60 ? "indigo" : "amber"}>
              {accuracyPercent >= 80
                ? "EXAM MASTERY ACHIEVED"
                : accuracyPercent >= 60
                ? "PROFICIENT KNOWLEDGE"
                : "REMEDIAL GAP IDENTIFIED"}
            </Tag>
            <h2 className="text-2xl font-bold mt-2 text-slate-900 dark:text-slate-100">
              Assessment Performance Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-1">{quizTitle}</p>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-4 gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {correctCount} / {total}
              </div>
              <div className="text-xs text-slate-500 mt-1">Score</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {accuracyPercent}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-red-500">
                {incorrectCount}
              </div>
              <div className="text-xs text-slate-500 mt-1">Incorrect</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-200">
                {formatTimeRemaining(Math.max(0, 20 * 60 - timeRemaining))}
              </div>
              <div className="text-xs text-slate-500 mt-1">Time Taken</div>
            </div>
          </div>

          {/* Concept Gap & Revision Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Target Concepts
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {accuracyPercent >= 70 ? "Strong Concept:" : "Focus Topic:"} {weakConcept}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {accuracyPercent >= 70
                  ? "Demonstrated reliable comprehension of core principles and boundary calculations."
                  : "Review formulas and theoretical formulations to reinforce retention."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Recommended Lesson
              </span>
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Deep Dive: {weakConcept} Mastery
              </h4>
              <p className="text-xs text-indigo-700 dark:text-indigo-300/80 leading-relaxed">
                Step-by-step Socratic walkthrough of foundational problems with AI Tutor.
              </p>
            </div>
          </div>

          {/* Sync notification */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-left text-xs space-y-1">
            <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Real-time Analytics & Knowledge Graph Synchronized
            </div>
            <p className="text-emerald-700/80 dark:text-emerald-400/80">
              Your overall mastery curve, study streak, quiz count, and concept nodes have been updated across your LearnGraph dashboard.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={resetQuiz}
              className="gap-2 text-xs"
            >
              <RotateCcw size={14} /> Retake Assessment
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.ANALYTICS)}
              className="gap-2 text-xs"
            >
              <BarChart2 size={14} /> View Analytics
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="gap-2 text-xs"
            >
              Back to Dashboard <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="quiz-layout">
          <QuizNav
            totalQuestions={total}
            currentIndex={currentQuestionIndex}
            answers={answers}
            flaggedQuestions={flaggedQuestions}
            onSelectQuestion={jumpToQuestion}
            onToggleFlag={toggleFlagCurrent}
          />

          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              onSelectOption={setAnswer}
              onPrevious={previousQuestion}
              onNext={nextQuestion}
              isLastQuestion={currentQuestionIndex === total - 1}
              onSubmitQuiz={handleSubmitQuiz}
            />
          )}

          <QuizInsight
            insight={currentQuestion?.weakConceptInsight}
            onAskHint={() => navigate(ROUTES.AI_TUTOR)}
          />
        </div>
      )}
    </div>
  );
}

export default QuizPage;
