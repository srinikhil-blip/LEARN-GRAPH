import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  Flame,
  HelpCircle,
  Play,
  Sparkles,
  Target,
  Terminal,
  TrendingUp,
  Trophy,
  Zap,
  GraduationCap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Progress } from "@/components/ui/Progress";
import { SparkChart } from "@/components/common/SparkChart";
import { MiniGraph } from "@/components/common/MiniGraph";
import { ROUTES } from "@/constants/routes";
import { useStudent } from "@/hooks/useStudent";
import { useAuth } from "@/hooks/useAuth";
import { userProgressService, type UserLearningState } from "@/services/userProgressService";
import { MOCK_COURSES } from "@/mock/courses.mock";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, studyPlan } = useStudent();
  const [learningState, setLearningState] = useState<UserLearningState>(() =>
    userProgressService.getState()
  );

  useEffect(() => {
    const handleUpdate = () => {
      setLearningState(userProgressService.getState());
    };
    window.addEventListener("learngraph:progress-updated", handleUpdate);
    return () => {
      window.removeEventListener("learngraph:progress-updated", handleUpdate);
    };
  }, []);

  // Real statistics strictly tied to active authenticated user
  const mastery = progress?.overallMastery ?? 0;
  const streak = progress?.dailyStreak ?? 0;
  const focusHours = progress?.focusTimeHours ?? 0;
  const mastered = progress?.masteredConcepts ?? 0;
  const total = progress?.totalConcepts ?? 84;

  const isNewUser =
    learningState.coursesEnrolled.length === 0 &&
    learningState.studyTimeMinutes === 0 &&
    learningState.quizAttempts.length === 0;

  // Real date for header
  const todayDateString = useMemo(() => {
    return new Date()
      .toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
      .toUpperCase();
  }, []);

  // Days of week for streak (Mon - Sun)
  const currentDayOfWeekIdx = (new Date().getDay() + 6) % 7;
  const daysOfWeekLabels = ["M", "T", "W", "T", "F", "S", "S"];

  // Active course lookup
  const activeCourseId = learningState.coursesEnrolled[0];
  const activeCourse = useMemo(() => {
    if (!activeCourseId) return null;
    return MOCK_COURSES.find((c) => c.id === activeCourseId) || null;
  }, [activeCourseId]);

  const activeCourseCompletedLessons = activeCourseId
    ? (learningState.completedLessons[activeCourseId] || []).length
    : 0;
  const activeCourseProgress = activeCourse
    ? Math.min(100, Math.round((activeCourseCompletedLessons / 6) * 100))
    : 0;

  // Exam readiness calculation from real quizzes
  const examReadiness = useMemo(() => {
    if (learningState.quizAttempts.length === 0) return 0;
    const avg =
      learningState.quizAttempts.reduce(
        (sum, q) => sum + (q.score / (q.maxScore || 100)) * 100,
        0
      ) / learningState.quizAttempts.length;
    return Math.round(avg);
  }, [learningState.quizAttempts]);

  return (
    <>
      <PageHeader
        eyebrow={todayDateString}
        title={
          isNewUser
            ? `Welcome to LearnGraph, ${user?.name?.split(" ")[0] || "Scholar"}!`
            : `Good morning, ${user?.name?.split(" ")[0] || "Scholar"}`
        }
        description={
          isNewUser
            ? "Let's begin your learning journey. Explore our Universal Course Library or ask AI Tutor to design your curriculum."
            : activeCourse
            ? `Continuing ${activeCourse.title}. Complete your next milestone to build your streak.`
            : "Your graph is ready. Explore courses and unlock new concepts today."
        }
        action={
          <Button onClick={() => navigate(ROUTES.AI_TUTOR)}>
            <Sparkles size={16} /> Ask AI Tutor
          </Button>
        }
      />

      <div className="stat-grid">
        {/* Stat 1: Overall Mastery */}
        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-icon indigo">
              <Target />
            </span>
            <Tag tone={mastery > 0 ? "emerald" : "indigo"}>
              <TrendingUp size={12} /> {mastery}%
            </Tag>
          </div>
          <small>OVERALL MASTERY</small>
          <h3>
            {mastery}<span>%</span>
          </h3>
          <Progress value={mastery} />
          <p>{mastered > 0 ? `Across ${mastered} of ${total} mapped concepts` : `Across ${total} mapped concepts`}</p>
        </article>

        {/* Stat 2: Daily Streak */}
        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-icon amber">
              <Flame />
            </span>
            <span className="stat-meta">
              {streak > 0 ? `Streak: ${streak} days` : "Start today"}
            </span>
          </div>
          <small>DAILY STREAK</small>
          <h3>
            {streak}<span> days</span>
          </h3>
          <div className="week-row">
            {daysOfWeekLabels.map((d, i) => {
              const isComplete = learningState.weeklyStreakDays[i];
              const isToday = i === currentDayOfWeekIdx;
              return (
                <span
                  key={i}
                  className={isComplete ? "complete" : isToday ? "today" : ""}
                >
                  {isComplete ? <Check size={12} /> : d}
                </span>
              );
            })}
          </div>
        </article>

        {/* Stat 3: Focus Time */}
        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-icon cyan">
              <Clock3 />
            </span>
            <span className="stat-meta">This week</span>
          </div>
          <small>FOCUS TIME</small>
          <h3>
            {focusHours}<span> hours</span>
          </h3>
          <SparkChart color="cyan" />
          <p>{focusHours > 0 ? `${focusHours}h total study time logged` : "No study sessions yet this week"}</p>
        </article>

        {/* Stat 4: Concepts Mastered */}
        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-icon emerald">
              <Trophy />
            </span>
            <span className="stat-meta">
              {mastered > 0 ? `${mastered} Mastered` : "Getting Started"}
            </span>
          </div>
          <small>CONCEPTS MASTERED</small>
          <h3>
            {mastered}<span> / {total}</span>
          </h3>
          <Progress value={total > 0 ? Math.round((mastered / total) * 100) : 0} tone="emerald" />
          <p>{learningState.weakConcepts.length > 0 ? `${learningState.weakConcepts.length} concepts need revision` : `${learningState.learningConcepts.length} concepts in progress`}</p>
        </article>
      </div>

      {/* AI Orchestrator Command Strip */}
      <div className="my-6 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
              <Sparkles size={16} />
            </span>
            <div>
              <h4 className="text-sm font-bold text-[var(--foreground)]">LearnGraph AI Adaptive Hub</h4>
              <p className="text-xs text-[var(--muted)]">Continuous Socratic tutoring, diagnostic testing, mind mapping & memory synthesis</p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="py-1 px-3 text-xs"
            onClick={() => navigate(ROUTES.AI_TUTOR)}
          >
            Launch AI Studio <ArrowRight size={13} />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <button
            onClick={() => navigate(`${ROUTES.AI_TUTOR}?tab=quiz_generator`)}
            className="p-2.5 rounded-xl bg-[var(--soft)] hover:bg-purple-500/10 border border-[var(--line)] hover:border-purple-500/30 text-left transition-all group"
          >
            <div className="p-1.5 w-fit rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 mb-1.5 group-hover:scale-105 transition-transform">
              <HelpCircle size={15} />
            </div>
            <div className="text-xs font-bold text-[var(--foreground)]">Adaptive Quiz</div>
            <div className="text-[10px] text-[var(--muted)]">7 Question Types</div>
          </button>

          <button
            onClick={() => navigate(`${ROUTES.AI_TUTOR}?tab=weak_concept`)}
            className="p-2.5 rounded-xl bg-[var(--soft)] hover:bg-red-500/10 border border-[var(--line)] hover:border-red-500/30 text-left transition-all group"
          >
            <div className="p-1.5 w-fit rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 mb-1.5 group-hover:scale-105 transition-transform">
              <AlertTriangle size={15} />
            </div>
            <div className="text-xs font-bold text-[var(--foreground)]">Weak Concepts</div>
            <div className="text-[10px] text-red-500 font-semibold">
              {learningState.weakConcepts.length > 0 ? `${learningState.weakConcepts.length} Detected Gaps` : "0 Detected Gaps"}
            </div>
          </button>

          <button
            onClick={() => navigate(`${ROUTES.AI_TUTOR}?tab=planner`)}
            className="p-2.5 rounded-xl bg-[var(--soft)] hover:bg-emerald-500/10 border border-[var(--line)] hover:border-emerald-500/30 text-left transition-all group"
          >
            <div className="p-1.5 w-fit rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-1.5 group-hover:scale-105 transition-transform">
              <Calendar size={15} />
            </div>
            <div className="text-xs font-bold text-[var(--foreground)]">Study Schedule</div>
            <div className="text-[10px] text-[var(--muted)]">Spaced Repetition</div>
          </button>

          <button
            onClick={() => navigate(`${ROUTES.AI_TUTOR}?tab=coding`)}
            className="p-2.5 rounded-xl bg-[var(--soft)] hover:bg-indigo-500/10 border border-[var(--line)] hover:border-indigo-500/30 text-left transition-all group"
          >
            <div className="p-1.5 w-fit rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 mb-1.5 group-hover:scale-105 transition-transform">
              <Terminal size={15} />
            </div>
            <div className="text-xs font-bold text-[var(--foreground)]">Code Studio</div>
            <div className="text-[10px] text-[var(--muted)]">Python, C++, Java</div>
          </button>

          <button
            onClick={() => navigate(`${ROUTES.AI_TUTOR}?tab=pdf_analyzer`)}
            className="p-2.5 rounded-xl bg-[var(--soft)] hover:bg-blue-500/10 border border-[var(--line)] hover:border-blue-500/30 text-left transition-all group"
          >
            <div className="p-1.5 w-fit rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 mb-1.5 group-hover:scale-105 transition-transform">
              <FileText size={15} />
            </div>
            <div className="text-xs font-bold text-[var(--foreground)]">Deep PDF Scan</div>
            <div className="text-[10px] text-[var(--muted)]">Mind Maps & Notes</div>
          </button>

          <button
            onClick={() => navigate(`${ROUTES.AI_TUTOR}?tab=flashcard_lab`)}
            className="p-2.5 rounded-xl bg-[var(--soft)] hover:bg-amber-500/10 border border-[var(--line)] hover:border-amber-500/30 text-left transition-all group"
          >
            <div className="p-1.5 w-fit rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 mb-1.5 group-hover:scale-105 transition-transform">
              <BookOpen size={15} />
            </div>
            <div className="text-xs font-bold text-[var(--foreground)]">Flashcard Lab</div>
            <div className="text-[10px] text-[var(--muted)]">Mnemonics & Tips</div>
          </button>
        </div>
      </div>

      {/* Target Exam & Readiness Card */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-xs">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Tag tone="indigo">TARGET EXAM / GOAL</Tag>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {user?.targetExam || "Universal Curriculum"}
              </span>
            </div>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              {examReadiness > 0
                ? `Exam Readiness: ${examReadiness}% (Based on completed quizzes)`
                : "Exam Readiness: 0% (Take a diagnostic test to evaluate readiness)"}
            </h3>
            <p className="text-xs text-[var(--muted)]">
              {learningState.quizAttempts.length > 0
                ? `${learningState.quizAttempts.length} quizzes completed · Diagnostic tracking active`
                : "No mock tests attempted yet · Diagnostic mock tests ready in AI Studio"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="py-1.5 px-3.5 text-xs font-semibold"
            onClick={() => navigate(`${ROUTES.AI_TUTOR}?tab=quiz_generator`)}
          >
            Launch Mock Test <ArrowRight size={13} />
          </Button>
          <Button
            variant="secondary"
            className="py-1.5 px-3 text-xs"
            onClick={() => navigate(ROUTES.SETTINGS)}
          >
            Manage Exam Goal
          </Button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recommendation Panel */}
        <article className="panel recommendation-hero">
          <div className="panel-title">
            <div>
              <span className="eyebrow">AI RECOMMENDATION</span>
              <h2>Your highest-impact next step</h2>
            </div>
            <span className="ai-pulse">
              <Sparkles size={16} />
            </span>
          </div>

          {learningState.weakConcepts.length > 0 ? (
            <div className="recommendation-body">
              <div className="mastery-ring">
                <span>
                  {mastery}<small>%</small>
                </span>
              </div>
              <div>
                <Tag tone="red">WEAK CONCEPT</Tag>
                <h3>{learningState.weakConcepts[0]}</h3>
                <p>
                  Strengthening this concept will unlock advanced topics and elevate your mastery score.
                </p>
                <div className="meta-row">
                  <span>
                    <Clock3 /> 15 min
                  </span>
                  <span>
                    <Zap /> High impact
                  </span>
                  <span>
                    <BookOpen /> Diagnostic ready
                  </span>
                </div>
              </div>
            </div>
          ) : activeCourse ? (
            <div className="recommendation-body">
              <div className="mastery-ring">
                <span>
                  {activeCourseProgress}<small>%</small>
                </span>
              </div>
              <div>
                <Tag tone="indigo">NEXT LESSON</Tag>
                <h3>{activeCourse.title}</h3>
                <p>
                  Continue your progress in {activeCourse.subject}. {activeCourseCompletedLessons} of 6 lessons completed.
                </p>
                <div className="meta-row">
                  <span>
                    <Clock3 /> 25 min
                  </span>
                  <span>
                    <Zap /> Core syllabus
                  </span>
                  <span>
                    <BookOpen /> Interactive
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="recommendation-body">
              <div className="mastery-ring">
                <span>
                  0<small>%</small>
                </span>
              </div>
              <div>
                <Tag tone="indigo">GET STARTED</Tag>
                <h3>Explore Course Library</h3>
                <p>
                  Select your first course from over 150+ curricula across School (Classes 5-12), Undergraduate, Competitive Exams, and Professional tracks.
                </p>
                <div className="meta-row">
                  <span>
                    <BookOpen /> 150+ Courses
                  </span>
                  <span>
                    <GraduationCap /> K-12 to PG
                  </span>
                  <span>
                    <Sparkles /> AI-Powered
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-4">
            {activeCourse ? (
              <Button onClick={() => navigate(`/courses/${activeCourse.id}`)}>
                Continue Course <ArrowRight size={15} />
              </Button>
            ) : (
              <Button onClick={() => navigate(ROUTES.COURSES)}>
                Explore Courses <ArrowRight size={15} />
              </Button>
            )}
            <Button
              variant="secondary"
              className="py-1 px-3 text-xs"
              onClick={() => navigate(`${ROUTES.AI_TUTOR}?tab=weak_concept`)}
            >
              <AlertTriangle size={13} className="text-red-500" /> Diagnose Gap
            </Button>
            <Button
              variant="secondary"
              className="py-1 px-3 text-xs"
              onClick={() => navigate(`${ROUTES.AI_TUTOR}?tab=quiz_generator`)}
            >
              <HelpCircle size={13} className="text-purple-500" /> Adaptive Quiz
            </Button>
          </div>
        </article>

        {/* Continue Learning Panel */}
        <article className="panel continue-card">
          <div className="panel-title">
            <div>
              <span className="eyebrow">CONTINUE LEARNING</span>
              <h2>Pick up where you left off</h2>
            </div>
            <button
              className="icon-btn"
              onClick={() => navigate(ROUTES.COURSES)}
              aria-label="View courses"
            >
              <ArrowRight />
            </button>
          </div>

          {activeCourse ? (
            <div className="lesson-preview">
              <div className="course-art violet">
                <span>{activeCourse.iconSymbol || activeCourse.subject.slice(0, 2).toUpperCase()}</span>
                <i />
                <i />
                <i />
              </div>
              <div>
                <Tag tone={activeCourse.tone}>{activeCourse.tier.toUpperCase()}</Tag>
                <h3>{activeCourse.title}</h3>
                <p>Lesson {activeCourseCompletedLessons + 1} of 6 · {activeCourse.instructor}</p>
                <Progress value={activeCourseProgress} />
                <div className="lesson-foot">
                  <span>{activeCourseProgress}% complete</span>
                  <button onClick={() => navigate(`/courses/${activeCourse.id}`)}>
                    <Play size={13} fill="currentColor" /> Continue
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lesson-preview">
              <div className="course-art cyan">
                <span>🎓</span>
                <i />
                <i />
                <i />
              </div>
              <div>
                <Tag tone="cyan">ONBOARDING</Tag>
                <h3>No courses started yet</h3>
                <p>Explore our Course Library and begin your first lesson.</p>
                <Progress value={0} />
                <div className="lesson-foot">
                  <span>0% complete</span>
                  <button onClick={() => navigate(ROUTES.COURSES)}>
                    <Play size={13} fill="currentColor" /> Browse Courses
                  </button>
                </div>
              </div>
            </div>
          )}
        </article>

        {/* Knowledge Pulse / Graph Preview */}
        <article className="panel graph-preview">
          <div className="panel-title">
            <div>
              <span className="eyebrow">KNOWLEDGE PULSE</span>
              <h2>Your graph this week</h2>
            </div>
            <button
              onClick={() => navigate(ROUTES.KNOWLEDGE_GRAPH)}
              className="text-button"
            >
              Open graph <ArrowRight size={14} />
            </button>
          </div>
          <MiniGraph />
          <div className="graph-summary">
            <span>
              <i className="mastered" /> {mastered} mastered
            </span>
            <span>
              <i className="learning" /> {learningState.learningConcepts.length} learning
            </span>
            <span>
              <i className="weak" /> {learningState.weakConcepts.length} weak
            </span>
          </div>
        </article>

        {/* Today's Study Plan */}
        <article className="panel schedule-card">
          <div className="panel-title">
            <div>
              <span className="eyebrow">TODAY</span>
              <h2>Your study plan</h2>
            </div>
            <button
              onClick={() => navigate(`${ROUTES.AI_TUTOR}?tab=planner`)}
              className="p-1.5 rounded-lg hover:bg-[var(--soft)] text-[var(--muted)] hover:text-emerald-600 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Launch AI Study Planner"
            >
              <CalendarDays size={16} />
              <span className="hidden sm:inline">AI Planner</span>
            </button>
          </div>
          {studyPlan.map((x) => (
            <div className="schedule-item" key={x.id}>
              <time>{x.time}</time>
              <i className={x.tone} />
              <div>
                <strong>{x.title}</strong>
                <span>{x.subtitle}</span>
              </div>
              <Tag tone={x.tone}>{x.tag}</Tag>
            </div>
          ))}
        </article>
      </div>
    </>
  );
}

export default DashboardPage;
