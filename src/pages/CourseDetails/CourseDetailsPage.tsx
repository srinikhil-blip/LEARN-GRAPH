import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  FileDown,
  FileText,
  GraduationCap,
  HelpCircle,
  Layers,
  Network,
  Play,
  Share2,
  Sparkles,
  Star,
  Target,
  Terminal,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Progress } from "@/components/ui/Progress";
import { useCourse } from "@/hooks/useCourse";
import { ROUTES } from "@/constants/routes";
import { userProgressService } from "@/services/userProgressService";

export function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { course } = useCourse(id);
  const [activeTab, setActiveTab] = useState<"curriculum" | "notes" | "practice" | "resources">("curriculum");
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync completed lessons from user progress
  useEffect(() => {
    if (course?.id) {
      const state = userProgressService.getState();
      const existing = state.completedLessons[course.id] || [];
      setCompletedLessonIds(new Set(existing));
      // Auto-enroll user when viewing curriculum
      userProgressService.enrollCourse(course.id);
    }
  }, [course?.id]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const sampleLessons = [
    { id: "l-1", title: "1. Core Principles, Historical Axioms & Scope", duration: "25m", type: "video" as const },
    { id: "l-2", title: "2. Formal Mathematical / Algorithmic Representations", duration: "35m", type: "reading" as const },
    { id: "l-3", title: "3. Interactive Diagnostic Checkpoint Quiz", duration: "15m", type: "quiz" as const },
    { id: "l-4", title: "4. Practical Real-World Case Studies & Code Synthesis", duration: "40m", type: "practice" as const },
    { id: "l-5", title: "5. Edge Cases, Optimization Pitfalls & Invariants", duration: "30m", type: "reading" as const },
    { id: "l-6", title: "6. Comprehensive Topic Exam & Solution Walkthrough", duration: "45m", type: "quiz" as const },
  ];

  const toggleLesson = (lessonId: string) => {
    if (!course?.id) return;
    const { state, completed } = userProgressService.toggleLesson(
      course.id,
      lessonId,
      sampleLessons.length,
      25
    );
    const updated = new Set(state.completedLessons[course.id] || []);
    setCompletedLessonIds(updated);

    if (completed) {
      showToast("Lesson marked as completed! Streak and mastery updated.");
    } else {
      showToast("Lesson marked as uncompleted");
    }
  };

  if (!course) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Course not found</h2>
        <p className="text-xs text-slate-500">
          The requested curriculum syllabus could not be located in the catalog.
        </p>
        <Button onClick={() => navigate(ROUTES.COURSES)}>Back to Courses</Button>
      </div>
    );
  }

  const realProgress = sampleLessons.length > 0
    ? Math.round((completedLessonIds.size / sampleLessons.length) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl animate-fadeIn">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => navigate(ROUTES.COURSES)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ChevronLeft size={16} /> Back to Course Library
      </button>

      {/* Page Header */}
      <PageHeader
        eyebrow={`${course.tier.toUpperCase()} · ${course.gradeOrYear || course.subject.toUpperCase()}`}
        title={course.title}
        description={course.description || "Master foundational and advanced principles in this comprehensive curriculum."}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast("Course link copied to clipboard!");
              }}
              className="gap-1.5 text-xs"
            >
              <Share2 size={14} /> Share
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                navigate(
                  `${ROUTES.AI_TUTOR}?prompt=${encodeURIComponent(
                    `Teach me the complete syllabus for "${course.title}". Start with the foundational concepts, give an analogy, and create a 3-step learning plan.`
                  )}`
                )
              }
              className="gap-1.5 text-xs text-indigo-600 dark:text-indigo-400"
            >
              <Sparkles size={14} /> AI Course Tutor
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                userProgressService.enrollCourse(course.id);
                navigate(ROUTES.QUIZ);
              }}
              className="gap-1.5 text-xs"
            >
              <Play size={14} fill="currentColor" /> {realProgress > 0 ? "Continue" : "Start Course"}
            </Button>
          </div>
        }
      />

      {/* Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Lessons</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
            <BookOpen size={14} className="text-indigo-500" /> {course.lessons}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Learning Time</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
            <Clock3 size={14} className="text-blue-500" /> {course.time}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Instructor</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
            <GraduationCap size={14} className="text-emerald-500" /> {course.instructor}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Rating</span>
          <span className="text-sm font-bold text-amber-500 flex items-center gap-1.5 mt-0.5">
            <Star size={14} className="fill-amber-400" /> {course.rating || 4.9} / 5.0
          </span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "curriculum"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          Curriculum & Lessons
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "notes"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          Revision Notes
        </button>
        <button
          onClick={() => setActiveTab("practice")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "practice"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          Practice & Mocks ({course.practiceQuestionsCount || 160} Qs)
        </button>
        <button
          onClick={() => setActiveTab("resources")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "resources"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          Knowledge Graph & Resources
        </button>
      </div>

      {/* Tab 1: Curriculum & Lessons */}
      {activeTab === "curriculum" && (
        <div className="space-y-4">
          {/* Learning Path Flow */}
          {course.learningPath && (
            <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Target size={14} /> Recommended Learning Path
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {course.learningPath.map((step, idx) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
                      {idx + 1}. {step}
                    </span>
                    {idx < (course.learningPath?.length || 0) - 1 && (
                      <ArrowRight size={13} className="text-indigo-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lessons List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>Chapter Syllabus & Topic Milestones</span>
              <span className="text-xs font-normal text-slate-400">
                {completedLessonIds.size} of {sampleLessons.length} completed
              </span>
            </h3>

            <div className="space-y-2 pt-2">
              {sampleLessons.map((lesson) => {
                const isCompleted = completedLessonIds.has(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => toggleLesson(lesson.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isCompleted
                        ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isCompleted
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isCompleted && <CheckCircle2 size={14} />}
                      </div>
                      <span className={`text-xs font-semibold ${isCompleted ? "line-through opacity-70" : ""}`}>
                        {lesson.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Tag tone="indigo">{lesson.type}</Tag>
                      <span className="text-slate-400 font-mono text-[11px]">{lesson.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Revision Notes */}
      {activeTab === "notes" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" /> High-Yield Revision Notes
            </h3>
            <Button
              variant="secondary"
              onClick={() => showToast("Revision notes exported as PDF")}
              className="text-xs gap-1.5"
            >
              <FileDown size={14} /> Download Notes
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs leading-relaxed space-y-2 text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Key Invariants & Common Pitfalls:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Always check prerequisite constraints before applying relaxation formulas.</li>
              <li>Edge cases with boundary values (zero, negative, or infinity) require special guard clauses.</li>
              <li>Re-evaluate asymptotic complexity tradeoffs between matrix representations ($O(V^2)$) and min-heaps ($O((V+E)\log V)$).</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Practice & Mocks */}
      {activeTab === "practice" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <Tag tone="indigo">Practice Questions</Tag>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {course.practiceQuestionsCount || 160}+ Adaptive Practice Drills
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bloom taxonomy leveled questions covering Recall, Understanding, Application, and Analysis.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate(ROUTES.QUIZ)}
              className="gap-2 text-xs"
            >
              <Play size={14} /> Launch Practice Session
            </Button>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <Tag tone="rose">Timed Mock Exams</Tag>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {course.mockTestsCount || 6} Full Mock Tests
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Standardized examination format with negative marking calculation, timed countdowns, and percentile prediction.
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.QUIZ)}
              className="gap-2 text-xs"
            >
              <Zap size={14} /> Start Full Mock
            </Button>
          </div>
        </div>
      )}

      {/* Tab 4: Knowledge Graph & Resources */}
      {activeTab === "resources" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Network size={16} className="text-indigo-500" /> Knowledge Graph Grounding
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            This subject connects directly into your personal Knowledge Graph. Every mastered lesson unlocks downstream concepts in related disciplines.
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.KNOWLEDGE_GRAPH)}
            className="gap-2 text-xs"
          >
            <Network size={14} /> Explore Connected Graph Nodes
          </Button>
        </div>
      )}
    </div>
  );
}

export default CourseDetailsPage;
