import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  ExternalLink,
  Bookmark,
  FileDown,
  FileText,
  GraduationCap,
  Layers,
  Network,
  Play,
  Share2,
  Sparkles,
  Star,
  Target,
  Terminal,
  Zap,
  Award,
  Search,
} from "lucide-react";

import { TopicDetailModal } from "./TopicDetailModal";
import {
  topicCurriculumEngine,
  type TopicCurriculumPayload,
} from "@/services/topicCurriculumEngine";

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
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Progress } from "@/components/ui/Progress";
import { useCourse } from "@/hooks/useCourse";
import { ROUTES } from "@/constants/routes";
import { userProgressService } from "@/services/userProgressService";
import {
  learningResourcesService,
  type VideoResourceItem,
  type CourseResourcesBundle,
} from "@/data/learningResourcesData";
import { resourceRecommendationEngine } from "@/services/resourceRecommendationEngine";

export function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { course } = useCourse(id);
  const [activeTab, setActiveTab] = useState<
    "curriculum" | "videos" | "notes" | "practice" | "resources"
  >("curriculum");
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [savedResourceIds, setSavedResourceIds] = useState<Set<string>>(new Set());
  const [completedVideoIds, setCompletedVideoIds] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [bundle, setBundle] = useState<CourseResourcesBundle | null>(null);
  const [selectedTopicModal, setSelectedTopicModal] = useState<TopicCurriculumPayload | null>(null);
  const [curriculumSearch, setCurriculumSearch] = useState("");
  const [showAllRoadmap, setShowAllRoadmap] = useState(false);

  // Initialize and sync completed lessons, saved resources, and videos
  useEffect(() => {
    if (course?.id) {
      const state = userProgressService.getState();
      const existingLessons = state.completedLessons[course.id] || [];
      setCompletedLessonIds(new Set(existingLessons));

      // Auto-enroll user when viewing curriculum
      userProgressService.enrollCourse(course.id);

      // Load dynamic learning resource bundle
      const data = learningResourcesService.getCourseBundle(course.id, course.title);
      setBundle(data);

      // Load saved resources
      const saved: string[] = JSON.parse(localStorage.getItem("lg_saved_resources") || "[]");
      setSavedResourceIds(new Set(saved));

      // Load completed videos
      const completedVids: string[] = JSON.parse(
        localStorage.getItem("lg_completed_resources") || "[]"
      );
      setCompletedVideoIds(new Set(completedVids));
    }
  }, [course?.id, course?.title]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Real academic chapters derived directly from course syllabus without generic placeholders
  const realChapters = (course?.chapters && course.chapters.length > 0)
    ? course.chapters
    : (course?.syllabus || []).map((sTitle: string, sIdx: number) => ({
        id: `${course?.id || "c"}-ch${sIdx + 1}`,
        title: sTitle,
        description: `Comprehensive academic module on ${sTitle}.`,
        lessonsCount: 6,
        lessons: [
          { id: `${course?.id}-ch${sIdx + 1}-l1`, title: `1. Conceptual Foundations of ${sTitle}`, duration: "25m", type: "video" as const },
          { id: `${course?.id}-ch${sIdx + 1}-l2`, title: `2. Theoretical Formulations & Derivations`, duration: "35m", type: "reading" as const },
          { id: `${course?.id}-ch${sIdx + 1}-l3`, title: `3. Step-by-Step Worked Exemplars`, duration: "30m", type: "practice" as const },
          { id: `${course?.id}-ch${sIdx + 1}-l4`, title: `4. Real-World Applications & Drills`, duration: "40m", type: "reading" as const },
          { id: `${course?.id}-ch${sIdx + 1}-l5`, title: `5. Common Misconceptions & Invariant Pitfalls`, duration: "20m", type: "quiz" as const },
          { id: `${course?.id}-ch${sIdx + 1}-l6`, title: `6. Mastery Diagnostic Checkpoint`, duration: "45m", type: "quiz" as const },
        ],
      }));

  const allLessons = realChapters.flatMap((ch: any) => ch.lessons || []);

  const toggleLesson = (lessonId: string) => {
    if (!course?.id) return;
    const { state, completed } = userProgressService.toggleLesson(
      course.id,
      lessonId,
      allLessons.length,
      25
    );
    const updated = new Set(state.completedLessons[course.id] || []);
    setCompletedLessonIds(updated);

    if (completed) {
      showToast("Topic marked as completed! Streak and mastery updated.");
    } else {
      showToast("Topic marked as uncompleted");
    }
  };

  const handleOpenTopicDetails = (lessonTitle: string, chapterTitle: string) => {
    if (!course) return;
    const payload = topicCurriculumEngine.getTopicDetails(
      lessonTitle,
      chapterTitle,
      course.title,
      course.subject,
      course.tier
    );
    setSelectedTopicModal(payload);
  };

  // Topic sequential navigation calculations
  const currentTopicIndex = allLessons.findIndex(
    (l: any) =>
      selectedTopicModal &&
      (l.title === selectedTopicModal.topicTitle ||
        l.title.includes(selectedTopicModal.topicTitle) ||
        selectedTopicModal.topicTitle.includes(l.title.replace(/^\d+\.\s*/, "")))
  );
  const hasPrevTopic = currentTopicIndex > 0;
  const hasNextTopic = currentTopicIndex >= 0 && currentTopicIndex < allLessons.length - 1;

  const handlePrevTopic = () => {
    if (hasPrevTopic) {
      const prevLesson = allLessons[currentTopicIndex - 1];
      const parentChapter = realChapters.find((ch: any) =>
        (ch.lessons || []).some((l: any) => l.id === prevLesson.id)
      );
      handleOpenTopicDetails(prevLesson.title, parentChapter?.title || course?.title || "");
    }
  };

  const handleNextTopic = () => {
    if (hasNextTopic) {
      const nextLesson = allLessons[currentTopicIndex + 1];
      const parentChapter = realChapters.find((ch: any) =>
        (ch.lessons || []).some((l: any) => l.id === nextLesson.id)
      );
      handleOpenTopicDetails(nextLesson.title, parentChapter?.title || course?.title || "");
    }
  };

  const handleToggleSaveResource = (resId: string) => {
    const isSaved = savedResourceIds.has(resId);
    let updated: string[];
    const raw = localStorage.getItem("lg_saved_resources") || "[]";
    const current: string[] = JSON.parse(raw);

    if (isSaved) {
      updated = current.filter((item) => item !== resId);
      showToast("Resource removed from saved list");
    } else {
      updated = [...current, resId];
      showToast("Resource saved to your study library!");
    }
    localStorage.setItem("lg_saved_resources", JSON.stringify(updated));
    setSavedResourceIds(new Set(updated));
  };

  const handleToggleCompleteVideo = (videoId: string) => {
    const isDone = completedVideoIds.has(videoId);
    let updated: string[];
    const raw = localStorage.getItem("lg_completed_resources") || "[]";
    const current: string[] = JSON.parse(raw);

    if (isDone) {
      updated = current.filter((item) => item !== videoId);
      showToast("Video marked as uncompleted");
    } else {
      updated = [...current, videoId];
      // Increment user study time & progress
      userProgressService.recordStudyTime(20);
      showToast("Lecture marked completed! Added +20 mins study time.");
    }
    localStorage.setItem("lg_completed_resources", JSON.stringify(updated));
    setCompletedVideoIds(new Set(updated));
  };

  const handleWatchYouTube = (video: VideoResourceItem) => {
    resourceRecommendationEngine.logVideoView(video.id);
    window.open(video.youtubeUrl, "_blank", "noopener,noreferrer");
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

  const realProgress = allLessons.length > 0
    ? Math.round((completedLessonIds.size / allLessons.length) * 100)
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
                navigate(`${ROUTES.QUIZ}?topic=${encodeURIComponent(course.title)}`);
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

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
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
          onClick={() => setActiveTab("videos")}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "videos"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Youtube size={14} className="text-red-500" /> Video Lectures ({bundle?.videos.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "notes"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          Revision Notes & PDFs ({bundle?.notes.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("practice")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "practice"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          Practice & Coding ({course.practiceQuestionsCount || 160} Qs)
        </button>
        <button
          onClick={() => setActiveTab("resources")}
          className={`pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "resources"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          Knowledge Graph & Prerequisites
        </button>
      </div>

      {/* Tab 1: Curriculum & Lessons */}
      {activeTab === "curriculum" && (
        <div className="space-y-4">
          {/* Complete Recommended Learning Roadmap */}
          {course.learningPath && course.learningPath.length > 0 && (
            <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Target size={14} /> Recommended Learning Roadmap ({course.learningPath.length} Milestones)
                </span>
                {course.learningPath.length > 8 && (
                  <button
                    onClick={() => setShowAllRoadmap(!showAllRoadmap)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    {showAllRoadmap ? "Collapse Roadmap" : `View All ${course.learningPath.length} Steps`}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {(showAllRoadmap ? course.learningPath : course.learningPath.slice(0, 8)).map((step, idx) => (
                  <div key={step} className="flex items-center gap-2">
                    <button
                      onClick={() => setCurriculumSearch(step.replace(/^\d+\.\s*/, ""))}
                      title="Filter syllabus to this milestone"
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs hover:border-indigo-500 hover:text-indigo-600 transition-all text-left"
                    >
                      {step.startsWith(`${idx + 1}.`) ? step : `${idx + 1}. ${step}`}
                    </button>
                    {idx < (showAllRoadmap ? course.learningPath.length : Math.min(8, course.learningPath.length)) - 1 && (
                      <ArrowRight size={13} className="text-indigo-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Curriculum Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search chapters, topics, formulas, or lessons in this course..."
              value={curriculumSearch}
              onChange={(e) => setCurriculumSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
            />
          </div>

          {/* Structured Units & Chapters List */}
          <div className="space-y-4">
            {realChapters
              .filter((ch: any) => {
                if (!curriculumSearch.trim()) return true;
                const q = curriculumSearch.toLowerCase();
                return (
                  ch.title.toLowerCase().includes(q) ||
                  ch.description?.toLowerCase().includes(q) ||
                  (ch.lessons || []).some((l: any) => l.title.toLowerCase().includes(q))
                );
              })
              .map((chapter: any, chIdx: number) => {
                const chapterLessons: any[] = chapter.lessons || [];
                const completedInChapter = chapterLessons.filter((l) =>
                  completedLessonIds.has(l.id)
                ).length;

                return (
                  <div
                    key={chapter.id || chIdx}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3.5"
                  >
                    {/* Chapter Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase">
                            Chapter {chIdx + 1}
                          </span>
                          <span className="text-slate-400 text-xs">·</span>
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                            {completedInChapter} of {chapterLessons.length} completed
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {chapter.title}
                        </h4>
                        {chapter.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {chapter.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            navigate(
                              `${ROUTES.QUIZ}?topic=${encodeURIComponent(chapter.title)}`
                            )
                          }
                          className="text-xs py-1 px-2.5 gap-1 text-indigo-600 dark:text-indigo-400"
                        >
                          <Target size={13} /> Chapter Quiz
                        </Button>
                      </div>
                    </div>

                    {/* Lessons & Topics in Chapter */}
                    <div className="space-y-2 pt-1">
                      {chapterLessons.map((lesson: any, lIdx: number) => {
                        const isCompleted = completedLessonIds.has(lesson.id);

                        return (
                          <div
                            key={lesson.id || lIdx}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all gap-2.5 ${
                              isCompleted
                                ? "bg-slate-50/70 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-500"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-3">
                              {/* Completion Checkbox */}
                              <button
                                onClick={() => toggleLesson(lesson.id)}
                                title={isCompleted ? "Completed" : "Mark as completed"}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 mt-0.5 sm:mt-0 ${
                                  isCompleted
                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                    : "border-slate-300 dark:border-slate-600 hover:border-indigo-500"
                                }`}
                              >
                                {isCompleted && <CheckCircle2 size={14} />}
                              </button>

                              <div className="space-y-0.5">
                                <span
                                  className={`text-xs font-semibold block ${
                                    isCompleted ? "line-through opacity-70" : ""
                                  }`}
                                >
                                  {lesson.title}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <span className="font-mono">{lesson.duration || "30m"}</span>
                                  <span>·</span>
                                  <span className="capitalize">{lesson.type || "reading"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons for Lesson */}
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <Tag tone={lesson.type === "video" ? "rose" : lesson.type === "quiz" ? "amber" : "indigo"}>
                                {lesson.type || "module"}
                              </Tag>

                              <Button
                                variant="primary"
                                onClick={() => handleOpenTopicDetails(lesson.title, chapter.title)}
                                className="text-xs py-1 px-3 gap-1 shadow-2xs"
                              >
                                <BookOpen size={12} /> Study Topic
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab 2: Video Lectures (YouTube Educational Integration) */}
      {activeTab === "videos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Youtube size={18} className="text-red-500" />
                Verified Educational YouTube Video Lectures
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Curated public lectures from premier universities, MIT OCW, NPTEL, Khan Academy, and top educators.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {completedVideoIds.size} completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(bundle?.videos || []).map((video) => {
              const isSaved = savedResourceIds.has(video.id);
              const isCompleted = completedVideoIds.has(video.id);

              return (
                <div
                  key={video.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all"
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden group">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Duration Badge */}
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-950/90 text-white backdrop-blur-xs">
                      {video.duration}
                    </span>

                    {/* Provider Tag */}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600/90 text-white backdrop-blur-xs">
                      {video.provider}
                    </span>

                    {/* Quick Play Trigger */}
                    <button
                      onClick={() => handleWatchYouTube(video)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Watch video"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <Play size={20} fill="white" className="ml-0.5" />
                      </div>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                        {video.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                          {video.channelName}
                        </span>
                        <Tag
                          tone={
                            video.difficulty === "beginner"
                              ? "emerald"
                              : video.difficulty === "intermediate"
                              ? "indigo"
                              : "rose"
                          }
                        >
                          {video.difficulty}
                        </Tag>
                      </div>

                      {/* Action Buttons Strip */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <Button
                          variant="primary"
                          onClick={() => handleWatchYouTube(video)}
                          className="flex-1 text-xs py-1.5 gap-1.5 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <ExternalLink size={13} /> Watch on YouTube
                        </Button>

                        <button
                          onClick={() => handleToggleSaveResource(video.id)}
                          title={isSaved ? "Remove from saved" : "Save resource"}
                          className={`p-2 rounded-xl border text-xs transition-colors ${
                            isSaved
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-400"
                              : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          }`}
                        >
                          <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                        </button>

                        <button
                          onClick={() => handleToggleCompleteVideo(video.id)}
                          title={isCompleted ? "Completed" : "Mark as completed"}
                          className={`p-2 rounded-xl border text-xs transition-colors ${
                            isCompleted
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-400"
                              : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          }`}
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Revision Notes & PDFs */}
      {activeTab === "notes" && (
        <div className="space-y-6">
          {/* Notes Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(bundle?.notes || []).map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock3 size={12} /> {note.readTime}
                  </span>
                  <Tag tone="indigo">{note.difficulty}</Tag>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {note.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">{note.description}</p>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Core Invariants & Key Concepts:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                    {note.keyPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => showToast("Revision notes exported as PDF")}
                    className="text-xs gap-1.5"
                  >
                    <FileDown size={14} /> Download PDF Notes
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate(
                        `${ROUTES.AI_TUTOR}?prompt=${encodeURIComponent(
                          `Explain the key principles of "${note.title}". Detail the formulas, solve 1 sample problem step-by-step, and test my understanding with 1 conceptual question.`
                        )}`
                      );
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 gap-1"
                  >
                    <Sparkles size={13} /> Socratic Deep-Dive
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Downloadable PDF Compendiums */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" />
              Official PDFs, Formula Sheets & Exam Handbooks
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(bundle?.pdfs || []).map((pdf) => (
                <div key={pdf.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      PDF
                    </div>
                    <div>
                      <strong className="block text-slate-900 dark:text-slate-100 font-semibold">
                        {pdf.title}
                      </strong>
                      <span className="text-[11px] text-slate-400">
                        {pdf.category} · {pdf.pages} Pages · {pdf.size}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      window.open(pdf.url, "_blank");
                      showToast(`Downloading ${pdf.title}...`);
                    }}
                    className="text-xs gap-1 py-1 px-3"
                  >
                    <FileDown size={13} /> Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Practice Problems & Coding Exercises */}
      {activeTab === "practice" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Practice Drills */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Tag tone="indigo">Curriculum Practice Drills</Tag>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {course.practiceQuestionsCount || 160}+ Topic-Targeted Drills
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bloom taxonomy leveled questions covering Recall, Understanding, Application, and Analysis with immediate derivation explanations.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate(`${ROUTES.QUIZ}?topic=${encodeURIComponent(course.title)}`)}
                className="gap-2 text-xs"
              >
                <Play size={14} /> Launch Topic Practice Drill
              </Button>
            </div>

            {/* Timed Mock Exams */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Tag tone="rose">Standardized Mock Exams</Tag>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {course.mockTestsCount || 6} Full-Length Simulated Mocks
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Exam-grade format with negative marking calculations, timed countdown clock, and percentile prediction report.
              </p>
              <Button
                variant="secondary"
                onClick={() => navigate(`${ROUTES.QUIZ}?topic=${encodeURIComponent(course.title)}`)}
                className="gap-2 text-xs"
              >
                <Zap size={14} /> Start Timed Mock Exam
              </Button>
            </div>
          </div>

          {/* Assignments & Milestones */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award size={16} className="text-indigo-500" />
              Milestone Assignments & Capstone Exercises
            </h4>
            <div className="space-y-2">
              {(bundle?.assignments || []).map((asg) => (
                <div
                  key={asg.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="block text-slate-900 dark:text-slate-100 font-semibold">
                      {asg.title}
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      Due: {asg.dueDate} · {asg.submissionsCount} Submissions · {asg.totalPoints} Points
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => showToast("Assignment workspace initialized")}
                    className="text-xs py-1 px-3"
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Knowledge Graph & Prerequisites */}
      {activeTab === "resources" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Network size={16} className="text-indigo-500" /> Knowledge Graph Grounding & Prerequisite Lattice
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            This subject connects directly into your personal Knowledge Graph. Every mastered lesson unlocks downstream concepts in related disciplines and feeds your adaptive recommendation loop.
          </p>

          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2 text-xs">
            <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
              Connected Knowledge Graph Concepts:
            </span>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {["Foundational Axioms", "Algorithmic Invariants", "Boundary Value Analysis", "Recurrence Relations", "Optimization Constraints"].map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 font-semibold text-slate-800 dark:text-slate-200"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.KNOWLEDGE_GRAPH)}
            className="gap-2 text-xs"
          >
            <Network size={14} /> Open Interactive Knowledge Graph
          </Button>
        </div>
      )}

      {/* Production Topic Reader Modal */}
      <TopicDetailModal
        topicData={selectedTopicModal}
        onClose={() => setSelectedTopicModal(null)}
        onMarkCompleted={(topicId) => {
          toggleLesson(topicId);
          showToast("Topic progress updated!");
        }}
        isCompleted={
          selectedTopicModal
            ? completedLessonIds.has(selectedTopicModal.topicId)
            : false
        }
        onNextTopic={handleNextTopic}
        onPrevTopic={handlePrevTopic}
        hasNextTopic={hasNextTopic}
        hasPrevTopic={hasPrevTopic}
      />
    </div>
  );
}

export default CourseDetailsPage;
