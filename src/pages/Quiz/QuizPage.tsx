import { useState, useEffect, useMemo } from "react";
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
  ExternalLink,
  Network,
  Play,
  Bookmark,
} from "lucide-react";

// Official YouTube SVG Icon
const Youtube = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
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
import { resourceRecommendationEngine } from "@/services/resourceRecommendationEngine";
import { learningResourcesService } from "@/data/learningResourcesData";

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
    // Evaluate submission via adaptiveQuizEngine and persist to real learning state
    adaptiveQuizEngine.evaluateSubmission(
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

  // Post-quiz learning recommendations
  const postQuizRecs = useMemo(() => {
    return resourceRecommendationEngine.getRecommendations(weakConcept || quizTitle);
  }, [weakConcept, quizTitle]);

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
              {showAdaptiveGenerator ? "Back to Active Quiz" : "Adaptive Topic & PYQ Lab"}
            </Button>
          </div>
          <h2>{showAdaptiveGenerator ? "Personalized Adaptive Diagnostic Lab" : quizTitle}</h2>
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
        /* Comprehensive Post-Quiz Analytics & Learning Recommendations View */
        <div className="max-w-4xl mx-auto my-8 p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl text-center space-y-6 animate-fadeIn">
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

          {/* Weak vs Strong Concept Diagnosis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Target Concepts
              </span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${accuracyPercent >= 70 ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {accuracyPercent >= 70 ? "Mastered Concept:" : "Remedial Concept:"} {weakConcept}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {accuracyPercent >= 70
                  ? "Demonstrated reliable comprehension of core principles and boundary calculations."
                  : "Review formulas and theoretical formulations to reinforce long-term retention."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Next Topic Milestone
              </span>
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Advanced Invariants in {quizTitle.split("—")[0]}
              </h4>
              <p className="text-xs text-indigo-700 dark:text-indigo-300/80 leading-relaxed">
                Unlock downstream nodes in your personal Knowledge Graph by verifying foundational mastery.
              </p>
            </div>
          </div>

          {/* Real-time sync confirmation */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-left text-xs space-y-1">
            <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Real-time Analytics & Knowledge Graph Grounding Synchronized
            </div>
            <p className="text-emerald-700/80 dark:text-emerald-400/80">
              Your overall mastery curve, study streak, quiz count, and concept nodes have been updated across your LearnGraph dashboard.
            </p>
          </div>

          {/* Recommended Educational Videos Section (YouTube Integration) */}
          <div className="text-left space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Youtube size={16} className="text-red-500" />
                Recommended Video Lectures for Concept Reinforcement
              </h3>
              <span className="text-xs text-slate-400">Curated by AI recommendation engine</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {postQuizRecs.recommendedVideos.slice(0, 2).map((video) => (
                <div
                  key={video.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-16 h-11 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <strong className="block text-slate-900 dark:text-slate-100 font-semibold truncate">
                        {video.title}
                      </strong>
                      <span className="text-[11px] text-slate-500 block">
                        {video.channelName} · {video.duration}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => {
                      resourceRecommendationEngine.logVideoView(video.id);
                      window.open(video.youtubeUrl, "_blank", "noopener,noreferrer");
                    }}
                    className="text-xs py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white gap-1 shrink-0"
                  >
                    <ExternalLink size={12} /> Watch
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="secondary"
              onClick={resetQuiz}
              className="gap-2 text-xs"
            >
              <RotateCcw size={14} /> Retake Assessment
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.KNOWLEDGE_GRAPH)}
              className="gap-2 text-xs"
            >
              <Network size={14} /> View Knowledge Graph
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
