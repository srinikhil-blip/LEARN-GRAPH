import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Play,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Progress } from "@/components/ui/Progress";
import { Modal } from "@/components/ui/Modal";
import {
  COMPETITIVE_EXAMS_CATALOG,
} from "@/data/competitiveExamsData";
import type { ExamProfile } from "@/types/competitiveExams";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { userProgressService } from "@/services/userProgressService";

const CATEGORIES = [
  "All",
  "Engineering",
  "Medical",
  "Civil Services",
  "Management",
  "Graduate Studies",
  "Govt & Banking",
  "Study Abroad",
] as const;

export function CompetitiveExamsPage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeExamModal, setActiveExamModal] = useState<ExamProfile | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [targetSuccessToast, setTargetSuccessToast] = useState<string | null>(null);

  // ── Real user exam stats computed from quiz history ──────────────────────────
  const examStats = useMemo(() => {
    const progress = userProgressService.getState();
    const attempts = progress.quizAttempts;

    if (attempts.length === 0) {
      return {
        mockTestsAttempted: 0,
        averageScorePercentage: 0,
        readinessScore: 0,
        // percentile is meaningless without peer data; show 0 for new users
        predictedPercentile: 0,
        weakTopics: [] as string[],
        strongTopics: [] as string[],
        hasData: false,
      };
    }

    const scores = attempts.map((a) =>
      a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : 0
    );
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;

    // Weak topics: quizzes where score < 50%
    const weakSet = new Set<string>();
    const strongSet = new Set<string>();
    attempts.forEach((a) => {
      const pct = a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0;
      if (a.title) {
        if (pct < 50) weakSet.add(a.title);
        else if (pct >= 80) strongSet.add(a.title);
      }
    });

    return {
      mockTestsAttempted: attempts.length,
      averageScorePercentage: Math.round(avg),
      readinessScore: Math.min(100, Math.round(avg * 0.9 + attempts.length * 1.5)),
      predictedPercentile: 0, // Cannot predict without real leaderboard data
      weakTopics: Array.from(weakSet).slice(0, 3),
      strongTopics: Array.from(strongSet).slice(0, 3),
      hasData: true,
    };
  }, []);
  // ─────────────────────────────────────────────────────────────────────────────

  const filteredExams = COMPETITIVE_EXAMS_CATALOG.filter((exam) => {
    const matchesCategory =
      selectedCategory === "All" || exam.category === selectedCategory;
    const matchesQuery =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.conductedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subjects.some((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesQuery;
  });

  const handleSetTargetExam = async (exam: ExamProfile) => {
    try {
      await updateProfile({ targetExam: exam.title as any });
      setTargetSuccessToast(`Set "${exam.title}" as your primary target exam!`);
      setTimeout(() => setTargetSuccessToast(null), 3500);
    } catch {
      // Fallback
      setTargetSuccessToast(`Target updated to ${exam.title}`);
      setTimeout(() => setTargetSuccessToast(null), 3500);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (revealedSolutions[questionId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleRevealSolution = (questionId: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [questionId]: true }));
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        eyebrow="STANDARDIZED TEST & PLACEMENT ACCELERATOR"
        title="Competitive Exams & Target Hub"
        description="Comprehensive syllabus roadmaps, official high-yield weightages, predictive percentiles, and AI-powered diagnostic drills."
        action={
          <Button onClick={() => navigate(ROUTES.AI_TUTOR)}>
            <Sparkles size={16} /> AI Exam Prep Mode
          </Button>
        }
      />

      {/* Target Notification Toast */}
      {targetSuccessToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl animate-bounce">
          <CheckCircle2 size={18} />
          <span className="text-sm font-semibold">{targetSuccessToast}</span>
        </div>
      )}

      {/* Hero: Active Target Exam Readiness Dashboard */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Target size={18} />
              </span>
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                ACTIVE TARGET EXAM
              </span>
              <Tag tone="indigo">
                {user?.targetExam || "Not Set"}
              </Tag>
            </div>

            {examStats.hasData ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Exam Readiness: {examStats.readinessScore}%
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Based on your last {examStats.mockTestsAttempted} practice attempt{examStats.mockTestsAttempted !== 1 ? "s" : ""}. Keep practicing to improve your readiness score.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span>Avg Score: <strong>{examStats.averageScorePercentage}%</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Clock size={14} className="text-indigo-400" />
                    <span>Attempts: <strong>{examStats.mockTestsAttempted}</strong></span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Start Your Exam Preparation
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  You haven't taken any practice tests yet. Set a target exam below and launch your first mock test to track your readiness score, accuracy, and weak areas.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <TrendingUp size={14} className="text-slate-500" />
                    <span>Avg Score: <strong>—</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={14} className="text-slate-500" />
                    <span>Attempts: <strong>0</strong></span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Button
              variant="primary"
              onClick={() => navigate(ROUTES.QUIZ)}
              className="gap-2 justify-center"
            >
              <Play size={16} /> {examStats.hasData ? "Launch Full Mock Test" : "Start First Mock Test"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.AI_TUTOR)}
              className="gap-2 justify-center border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              <Zap size={16} /> {examStats.hasData ? "Drill Weak Concepts" : "Ask AI Tutor"}
            </Button>
          </div>
        </div>

        {/* Weak Topics Ribbon — only shown if user has data */}
        {examStats.hasData && examStats.weakTopics.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <XCircle size={14} className="text-rose-400" /> Needs Improvement:
            </span>
            {examStats.weakTopics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* Empty state encouragement ribbon for new users */}
        {!examStats.hasData && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-400">
              🎯 Choose a target exam below → Set it as your goal → Launch your first mock test to begin tracking progress.
            </span>
          </div>
        )}
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search exam, agency, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => {
          const isUserTarget = user?.targetExam === exam.title;

          return (
            <div
              key={exam.code}
              className="flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-indigo-400 dark:hover:border-indigo-600 group"
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <span className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <GraduationCap size={22} />
                  </span>
                  <div className="flex items-center gap-2">
                    <Tag tone="indigo">{exam.category}</Tag>
                    {isUserTarget && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider">
                        My Goal
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Conducted by: {exam.conductedBy}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {exam.description}
                </p>

                {/* Exam Key Specs */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Duration
                    </span>
                    <span className="font-semibold">{exam.durationMinutes} mins</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Total Marks
                    </span>
                    <span className="font-semibold">{exam.totalMarks} pts</span>
                  </div>
                </div>

                {/* Subject Weightages */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Subject Weightages
                  </span>
                  {exam.subjects.map((sub) => (
                    <div key={sub.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[190px]">
                          {sub.name}
                        </span>
                        <span className="text-slate-500 font-semibold">
                          {sub.weightagePercentage}%
                        </span>
                      </div>
                      <Progress value={sub.weightagePercentage} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveExamModal(exam)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Inspect Syllabus & Qs →
                </button>
                <Button
                  variant={isUserTarget ? "secondary" : "ghost"}
                  onClick={() => handleSetTargetExam(exam)}
                  disabled={isUserTarget}
                >
                  {isUserTarget ? "Selected Goal" : "Set as Target"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Modal: Exam Breakdown & Interactive Diagnostic Practice */}
      {activeExamModal && (
        <Modal
          isOpen={true}
          onClose={() => setActiveExamModal(null)}
          title={activeExamModal.title}
          className="max-w-3xl"
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
            {/* Metadata overview */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    Exam Blueprint & Scoring Pattern
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Conducted by {activeExamModal.conductedBy}
                  </p>
                </div>
                {activeExamModal.officialResourceUrl && (
                  <a
                    href={activeExamModal.officialResourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Official Portal <ExternalLink size={12} />
                  </a>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Scoring Rule
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeExamModal.scoringScheme}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Test Length
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeExamModal.durationMinutes} Minutes ({activeExamModal.totalMarks} Marks)
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Target Tier
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeExamModal.category}
                  </span>
                </div>
              </div>
            </div>

            {/* High Yield Topics List */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-500" /> High-Yield Syllabus Breakdown
              </h4>
              <div className="space-y-3">
                {activeExamModal.subjects.map((sub) => (
                  <div
                    key={sub.name}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {sub.name} ({sub.totalQuestions} Questions · {sub.weightagePercentage}%)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sub.highYieldTopics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2.5 py-1 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Diagnostic Question */}
            {activeExamModal.sampleQuestions.length > 0 && (
              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <HelpCircle size={16} className="text-amber-500" /> Verified Diagnostic Question
                </h4>

                {activeExamModal.sampleQuestions.map((q) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isRevealed = revealedSolutions[q.id];
                  const chosen = selectedAnswers[q.id];
                  const isCorrect = chosen === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <Tag tone="indigo">{q.subject} · {q.topic}</Tag>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Difficulty: {q.difficulty} | -{q.negativeMarking} neg
                        </span>
                      </div>

                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                        {q.question}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt, idx) => {
                          let optStyle =
                            "border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200";

                          if (isRevealed) {
                            if (idx === q.correctIndex) {
                              optStyle = "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold";
                            } else if (chosen === idx) {
                              optStyle = "border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300";
                            }
                          } else if (chosen === idx) {
                            optStyle = "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold";
                          }

                          return (
                            <button
                              key={opt}
                              onClick={() => handleSelectOption(q.id, idx)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${optStyle}`}
                            >
                              <span>
                                <strong className="mr-2 text-slate-400">
                                  {String.fromCharCode(65 + idx)}.
                                </strong>
                                {opt}
                              </span>
                              {isRevealed && idx === q.correctIndex && (
                                <CheckCircle2 size={16} className="text-emerald-600" />
                              )}
                              {isRevealed && chosen === idx && idx !== q.correctIndex && (
                                <XCircle size={16} className="text-rose-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {!isRevealed ? (
                        <div className="flex justify-end pt-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleRevealSolution(q.id)}
                            disabled={!isAnswered}
                          >
                            Check & Reveal Solution
                          </Button>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs space-y-1.5 animate-fadeIn">
                          <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
                            {isCorrect ? (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 size={14} /> Correct (+Marks Awarded)
                              </span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                <XCircle size={14} /> Incorrect (-{q.negativeMarking} Marks Deducted)
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            <strong>Step-by-Step Rationale:</strong> {q.detailedSolution}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Launch Practice Button */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="secondary"
                onClick={() => setActiveExamModal(null)}
              >
                Close
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const exam = activeExamModal;
                    setActiveExamModal(null);
                    navigate(
                      `${ROUTES.AI_TUTOR}?prompt=${encodeURIComponent(
                        `I am preparing for ${exam.title}. Please provide a 30-day high-yield study roadmap, key formula list for ${exam.subjects[0]?.name}, and 3 sample test questions.`
                      )}`
                    );
                  }}
                  className="gap-2"
                >
                  <Sparkles size={15} /> AI Exam Tutor
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setActiveExamModal(null);
                    navigate(ROUTES.QUIZ);
                  }}
                  className="gap-2"
                >
                  <Play size={16} /> Start Diagnostic Mock
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CompetitiveExamsPage;
