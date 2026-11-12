/**
 * CoursesPage.tsx
 * Hierarchical Course Library: Tier → Sub-category → Courses
 * Levels: School | Undergraduate | Postgraduate | Competitive Exams | Professional Skills
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { userProgressService } from "@/services/userProgressService";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Play,
  Search,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
  Code2,
  Brain,
  Shield,
  Cloud,
  BarChart3,
  Settings2,
  Network,
  BookMarked,
  School,
  Building,
  FlaskConical,
  Briefcase,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Progress } from "@/components/ui/Progress";
import { useCourse } from "@/hooks/useCourse";
import { MOCK_COURSES } from "@/mock/courses.mock";
import { ROUTES } from "@/constants/routes";
import type { Course, CourseTier } from "@/types/course";

/* ─────────────────────────────────────────────────────────────────────────────
   Tier definitions (top-level)
───────────────────────────────────────────────────────────────────────────── */
interface TierDef {
  id: CourseTier;
  label: string;
  tagline: string;
  icon: React.ElementType;
  gradient: string;
  accentColor: string;
  subCategories: SubCategoryDef[];
  stats: { label: string; value: string }[];
}

interface SubCategoryDef {
  id: string;
  label: string;
  icon: string;
  description: string;
  matchFn: (c: Course) => boolean;
}

const TIER_DEFS: TierDef[] = [
  /* ── SCHOOL ─────────────────────────────────────────────────── */
  {
    id: "School",
    label: "School",
    tagline: "Class 5 – Class 12 · CBSE / ICSE / State Boards",
    icon: School,
    gradient: "from-violet-600 to-indigo-700",
    accentColor: "text-violet-600 dark:text-violet-400",
    stats: [
      { label: "Classes", value: "8 (5–12)" },
      { label: "Subjects", value: "14+" },
      { label: "Lessons", value: "900+" },
      { label: "Mock Tests", value: "60+" },
    ],
    subCategories: [
      {
        id: "school-5-7",
        label: "Class 5 – 7",
        icon: "🏫",
        description: "Foundation: Arithmetic, Science, Social Studies, English, EVS",
        matchFn: (c) =>
          c.tier === "School" &&
          ["Class 5", "Class 6", "Class 7"].some((g) =>
            c.gradeOrYear?.includes(g)
          ),
      },
      {
        id: "school-8-10",
        label: "Class 8 – 10",
        icon: "📐",
        description: "Board Prep: Algebra, Physics, Chemistry, Biology, History",
        matchFn: (c) =>
          c.tier === "School" &&
          ["Class 8", "Class 9", "Class 10"].some((g) =>
            c.gradeOrYear?.includes(g)
          ),
      },
      {
        id: "school-11-12",
        label: "Class 11 – 12",
        icon: "🔬",
        description: "Senior Sec: PCM/PCB, Commerce, Humanities, Computer Sc.",
        matchFn: (c) =>
          c.tier === "School" &&
          ["Class 11", "Class 12"].some((g) =>
            c.gradeOrYear?.includes(g)
          ),
      },
      {
        id: "school-math",
        label: "Mathematics",
        icon: "∑",
        description: "Number Systems → Calculus across all classes",
        matchFn: (c) =>
          c.tier === "School" && c.subject === "Mathematics",
      },
      {
        id: "school-science",
        label: "Science",
        icon: "⚗️",
        description: "Physics, Chemistry, Biology — class-wise",
        matchFn: (c) =>
          c.tier === "School" &&
          ["Physics", "Chemistry", "Biology", "Science"].includes(c.subject),
      },
    ],
  },

  /* ── UNDERGRADUATE ───────────────────────────────────────────── */
  {
    id: "Undergraduate",
    label: "Undergraduate",
    tagline: "B.Tech · B.Sc · BCA · B.Com · BA · Diploma",
    icon: GraduationCap,
    gradient: "from-blue-600 to-cyan-600",
    accentColor: "text-blue-600 dark:text-blue-400",
    stats: [
      { label: "Degree Streams", value: "6+" },
      { label: "Core Subjects", value: "30+" },
      { label: "Lessons", value: "700+" },
      { label: "Mock Tests", value: "50+" },
    ],
    subCategories: [
      {
        id: "ug-btech-cs",
        label: "B.Tech – CS / IT / AI",
        icon: "💻",
        description: "DSA, OS, DBMS, CN, OOP, Compiler Design, ML, AI",
        matchFn: (c) =>
          c.tier === "Undergraduate" &&
          ["Computer Science", "Artificial Intelligence"].includes(c.subject),
      },
      {
        id: "ug-btech-engg",
        label: "B.Tech – Engineering",
        icon: "⚙️",
        description: "Engineering Maths, Electronics, Signals, Mechanics",
        matchFn: (c) =>
          c.tier === "Undergraduate" &&
          ["Electronics", "Mechanical", "Civil", "Electrical"].includes(
            c.subject
          ),
      },
      {
        id: "ug-bcom",
        label: "B.Com / Commerce",
        icon: "📊",
        description: "Accounting, Finance, Business Studies, Economics",
        matchFn: (c) =>
          c.tier === "Undergraduate" && c.subject === "Commerce",
      },
      {
        id: "ug-bsc-ba",
        label: "B.Sc / BA / BCA",
        icon: "🧪",
        description: "Economics, Psychology, Political Science, Statistics",
        matchFn: (c) =>
          c.tier === "Undergraduate" &&
          ["Economics", "Statistics", "Arts", "Psychology", "Science", "Management"].includes(
            c.subject
          ),
      },
      {
        id: "ug-all",
        label: "All Undergraduate",
        icon: "🎓",
        description: "Browse the complete undergraduate catalog",
        matchFn: (c) => c.tier === "Undergraduate",
      },
    ],
  },

  /* ── POSTGRADUATE ────────────────────────────────────────────── */
  {
    id: "Postgraduate",
    label: "Postgraduate",
    tagline: "M.Tech · MBA · MCA · M.Sc · MTech AI/ML",
    icon: Building,
    gradient: "from-purple-600 to-rose-600",
    accentColor: "text-purple-600 dark:text-purple-400",
    stats: [
      { label: "PG Programs", value: "5+" },
      { label: "Specializations", value: "15+" },
      { label: "Lessons", value: "400+" },
      { label: "Research Topics", value: "80+" },
    ],
    subCategories: [
      {
        id: "pg-mtech-cs",
        label: "M.Tech – CS / AI / ML",
        icon: "🤖",
        description: "Advanced Algorithms, Distributed Systems, Deep Learning",
        matchFn: (c) =>
          c.tier === "Postgraduate" &&
          ["Computer Science", "Artificial Intelligence"].includes(c.subject),
      },
      {
        id: "pg-mba",
        label: "MBA",
        icon: "📈",
        description: "Product Strategy, Operations, Finance, Marketing, HR",
        matchFn: (c) =>
          c.tier === "Postgraduate" && c.subject === "Management",
      },
      {
        id: "pg-msc",
        label: "M.Sc – Science",
        icon: "🔭",
        description: "Applied Maths, Data Science, Statistics, Physics",
        matchFn: (c) =>
          c.tier === "Postgraduate" &&
          ["Mathematics", "Data Science", "Statistics"].includes(c.subject),
      },
      {
        id: "pg-all",
        label: "All Postgraduate",
        icon: "🏛️",
        description: "Browse the complete postgraduate catalog",
        matchFn: (c) => c.tier === "Postgraduate",
      },
    ],
  },

  /* ── COMPETITIVE EXAMS ───────────────────────────────────────── */
  {
    id: "Competitive Exams",
    label: "Competitive Exams",
    tagline: "JEE · NEET · GATE · UPSC · SSC · CAT · GRE · IELTS",
    icon: Trophy,
    gradient: "from-amber-500 to-orange-600",
    accentColor: "text-amber-600 dark:text-amber-400",
    stats: [
      { label: "Exams Covered", value: "12+" },
      { label: "Practice Qs", value: "10,000+" },
      { label: "Mock Tests", value: "120+" },
      { label: "Rank Predictors", value: "Available" },
    ],
    subCategories: [
      {
        id: "exam-engineering",
        label: "Engineering Entrance",
        icon: "🏗️",
        description: "JEE Main, JEE Advanced, BITSAT, State CETs",
        matchFn: (c) =>
          c.tier === "Competitive Exams" &&
          ["JEE", "BITSAT"].some((k) => c.id.includes(k.toLowerCase())),
      },
      {
        id: "exam-medical",
        label: "Medical Entrance",
        icon: "🏥",
        description: "NEET UG, AIIMS preparation, State PMT",
        matchFn: (c) =>
          c.tier === "Competitive Exams" && c.id.includes("neet"),
      },
      {
        id: "exam-psu",
        label: "PSU / Government",
        icon: "🏛️",
        description: "GATE, UPSC CSE, SSC CGL, Banking PO, Railway, Defense",
        matchFn: (c) =>
          c.tier === "Competitive Exams" &&
          ["gate", "upsc", "ssc", "bank", "rrb", "nda"].some((k) => c.id.toLowerCase().includes(k)),
      },
      {
        id: "exam-mba",
        label: "MBA Entrance",
        icon: "🎯",
        description: "CAT, XAT, MAT, SNAP, IIFT",
        matchFn: (c) =>
          c.tier === "Competitive Exams" && c.id.includes("cat"),
      },
      {
        id: "exam-international",
        label: "International / Study Abroad",
        icon: "🌐",
        description: "GRE, GMAT, IELTS, TOEFL",
        matchFn: (c) =>
          c.tier === "Competitive Exams" &&
          ["gre", "gmat", "ielts"].some((k) => c.id.includes(k)),
      },
      {
        id: "exam-all",
        label: "All Exams",
        icon: "📋",
        description: "Browse all competitive exam courses",
        matchFn: (c) => c.tier === "Competitive Exams",
      },
    ],
  },

  /* ── PROFESSIONAL SKILLS ─────────────────────────────────────── */
  {
    id: "Professional",
    label: "Professional Skills",
    tagline: "Programming · AI · Cloud · Cyber · DevOps · System Design",
    icon: Briefcase,
    gradient: "from-emerald-600 to-teal-600",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    stats: [
      { label: "Career Tracks", value: "10+" },
      { label: "Tech Domains", value: "25+" },
      { label: "Lessons", value: "600+" },
      { label: "Interview Preps", value: "FAANG ready" },
    ],
    subCategories: [
      {
        id: "pro-programming",
        label: "Programming",
        icon: "🐍",
        description: "Python, JavaScript, TypeScript, Go, Rust, Java, C++",
        matchFn: (c) =>
          c.tier === "Professional" && c.subject === "Programming",
      },
      {
        id: "pro-ai-ml",
        label: "AI / ML / Data Science",
        icon: "🤖",
        description: "Machine Learning, Deep Learning, NLP, Generative AI",
        matchFn: (c) =>
          c.tier === "Professional" &&
          ["Artificial Intelligence", "Data Science", "Machine Learning"].includes(
            c.subject
          ),
      },
      {
        id: "pro-cloud",
        label: "Cloud Computing",
        icon: "☁️",
        description: "AWS, Azure, GCP, Terraform, Cloud Architecture",
        matchFn: (c) =>
          c.tier === "Professional" && c.subject === "Cloud Computing",
      },
      {
        id: "pro-devops",
        label: "DevOps & SRE",
        icon: "⚙️",
        description: "Docker, Kubernetes, CI/CD, Monitoring, GitOps",
        matchFn: (c) =>
          c.tier === "Professional" && c.subject === "DevOps",
      },
      {
        id: "pro-security",
        label: "Cyber Security",
        icon: "🔐",
        description: "Ethical Hacking, OWASP, Cryptography, Pen Testing",
        matchFn: (c) =>
          c.tier === "Professional" && c.subject === "Cyber Security",
      },
      {
        id: "pro-system-design",
        label: "System Design",
        icon: "🏗️",
        description: "HLD, LLD, Distributed Systems, FAANG Interviews",
        matchFn: (c) =>
          c.tier === "Professional" && c.subject === "System Design",
      },
      {
        id: "pro-all",
        label: "All Professional",
        icon: "💼",
        description: "Browse all professional skill tracks",
        matchFn: (c) => c.tier === "Professional",
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Course Card
───────────────────────────────────────────────────────────────────────────── */
function CourseCard({
  course,
  isBookmarked,
  onBookmark,
  onClick,
}: {
  course: Course;
  isBookmarked: boolean;
  onBookmark: (id: string, e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  // Real user progress — 0% for new users, actual % as they complete lessons
  const realProgress = useMemo(() => {
    const state = userProgressService.getState();
    const completedLessonsForCourse = state.completedLessons[course.id] || [];
    const totalLessons = course.chapters
      ? course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)
      : 0;
    if (totalLessons === 0) return 0;
    return Math.round((completedLessonsForCourse.length / totalLessons) * 100);
  }, [course.id, course.chapters]);
  return (
    <article
      onClick={onClick}
      className="group flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer"
    >
      {/* Cover */}
      <div className="p-5 relative bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-bold text-xs font-mono text-indigo-300">
              {course.iconSymbol || course.subject.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <Tag tone={course.tone}>{course.tier}</Tag>
              {course.gradeOrYear && (
                <span className="text-[10px] text-slate-300 font-semibold block mt-0.5">
                  {course.gradeOrYear}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={(e) => onBookmark(course.id, e)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            title={isBookmarked ? "Remove bookmark" : "Bookmark course"}
          >
            <Bookmark
              size={15}
              className={isBookmarked ? "fill-amber-400 text-amber-400" : "text-white"}
            />
          </button>
        </div>
        <div className="mt-4 relative z-10">
          <h3 className="text-sm font-bold line-clamp-1 group-hover:text-indigo-300 transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">{course.instructor}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3 flex-1">
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {course.description}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <BookOpen size={12} /> {course.lessons}
          </span>
          <span className="flex items-center gap-1">
            <Clock3 size={12} /> {course.time}
          </span>
          {course.rating && (
            <span className="flex items-center gap-1 font-bold text-amber-500">
              <Star size={12} className="fill-amber-400 text-amber-400" /> {course.rating}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-500">
            <span>{realProgress}% completed</span>
            <span>{course.level}</span>
          </div>
          <Progress value={realProgress} tone={course.tone} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
          View Syllabus <ArrowRight size={12} />
        </span>
        <Button
          variant={realProgress > 0 ? "primary" : "secondary"}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="gap-1.5 text-xs"
        >
          <Play size={12} fill="currentColor" />{" "}
          {realProgress > 0 ? "Continue" : "Start"}
        </Button>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────────────────────── */
export function CoursesPage() {
  const navigate = useNavigate();
  const { courses: fetchedCourses, isLoading } = useCourse(undefined, "");
  // Always use MOCK_COURSES as guaranteed baseline — never empty
  const courses = (fetchedCourses && fetchedCourses.length > 0) ? fetchedCourses : MOCK_COURSES;

  // Navigation state
  const [selectedTier, setSelectedTier] = useState<TierDef | null>(null);
  const [selectedSubCat, setSelectedSubCat] = useState<SubCategoryDef | null>(null);
  const [search, setSearch] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    new Set(["c8-math", "c10-math", "ug-dsa", "pro-system-design"])
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = new Set(bookmarkedIds);
    if (updated.has(id)) {
      updated.delete(id);
      showToast("Removed from bookmarks");
    } else {
      updated.add(id);
      showToast("Bookmarked!");
    }
    setBookmarkedIds(updated);
  };

  // Courses to show at the final level
  const visibleCourses = useMemo(() => {
    if (!selectedSubCat) return [];
    const q = search.toLowerCase();
    return courses.filter((c) => {
      const matchesSub = selectedSubCat.matchFn(c);
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.gradeOrYear?.toLowerCase().includes(q);
      return matchesSub && matchesSearch;
    });
  }, [courses, selectedSubCat, search]);

  // Tier stats derived from real data
  const tierCourseCounts = useMemo(() => {
    const map: Partial<Record<CourseTier, number>> = {};
    for (const c of courses) {
      map[c.tier] = (map[c.tier] || 0) + 1;
    }
    return map;
  }, [courses]);

  /* ── View: Courses list ─────────────────────────── */
  if (selectedSubCat && selectedTier) {
    return (
      <div className="space-y-6 pb-12">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl animate-fadeIn">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => { setSelectedTier(null); setSelectedSubCat(null); setSearch(""); }}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
          >
            Course Library
          </button>
          <ChevronRight size={14} className="text-slate-400" />
          <button
            onClick={() => { setSelectedSubCat(null); setSearch(""); }}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
          >
            {selectedTier.label}
          </button>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-semibold">
            {selectedSubCat.label}
          </span>
        </div>

        {/* Header */}
        <div className={`rounded-2xl p-6 bg-gradient-to-r ${selectedTier.gradient} text-white`}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <span className="text-2xl">{selectedSubCat.icon}</span>
              <h1 className="text-xl font-bold mt-1">{selectedSubCat.label}</h1>
              <p className="text-sm opacity-90 mt-0.5">{selectedSubCat.description}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.AI_TUTOR)}
              className="shrink-0 gap-2 text-xs"
            >
              <Sparkles size={14} /> Ask AI Tutor
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder={`Search in ${selectedSubCat.label}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : visibleCourses.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <BookOpen size={40} className="mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No courses found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try clearing the search filter, or explore another sub-category.
            </p>
            <Button variant="secondary" onClick={() => setSearch("")}>
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCourses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                isBookmarked={bookmarkedIds.has(c.id)}
                onBookmark={handleToggleBookmark}
                onClick={() => navigate(`/courses/${c.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── View: Sub-categories for a tier ───────────── */
  if (selectedTier) {
    const tierCourses = courses.filter((c) => c.tier === selectedTier.id);
    const totalPracticeQ = tierCourses.reduce(
      (sum, c) => sum + (c.practiceQuestionsCount || 0),
      0
    );

    return (
      <div className="space-y-6 pb-12">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl animate-fadeIn">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => setSelectedTier(null)}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
          >
            Course Library
          </button>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-semibold">
            {selectedTier.label}
          </span>
        </div>

        {/* Hero Banner */}
        <div
          className={`rounded-2xl p-6 sm:p-8 bg-gradient-to-r ${selectedTier.gradient} text-white relative overflow-hidden`}
        >
          {/* BG decoration */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <selectedTier.icon size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{selectedTier.label}</h1>
                  <p className="text-sm opacity-90">{selectedTier.tagline}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                {selectedTier.stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-lg font-bold">{s.value}</div>
                    <div className="text-[11px] opacity-80">{s.label}</div>
                  </div>
                ))}
                <div>
                  <div className="text-lg font-bold">{totalPracticeQ.toLocaleString()}+</div>
                  <div className="text-[11px] opacity-80">Practice Questions</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                variant="secondary"
                onClick={() => navigate(ROUTES.AI_TUTOR)}
                className="gap-2 text-xs whitespace-nowrap"
              >
                <Sparkles size={14} /> Open AI Tutor
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedTier(null)}
                className="gap-2 text-xs text-white/80 hover:text-white whitespace-nowrap"
              >
                <ArrowLeft size={14} /> All Categories
              </Button>
            </div>
          </div>
        </div>

        {/* Sub-Category Grid */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
            Choose a Sub-Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedTier.subCategories.map((sub) => {
              const count = tierCourses.filter(sub.matchFn).length;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCat(sub)}
                  className="group text-left p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{sub.icon}</span>
                    <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                      {count} {count === 1 ? "course" : "courses"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {sub.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                    Browse courses <ArrowRight size={12} className="ml-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured in this tier */}
        {tierCourses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                ⭐ Top Rated in {selectedTier.label}
              </h2>
              <button
                onClick={() => setSelectedSubCat(selectedTier.subCategories[selectedTier.subCategories.length - 1])}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tierCourses
                .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
                .slice(0, 3)
                .map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    isBookmarked={bookmarkedIds.has(c.id)}
                    onBookmark={handleToggleBookmark}
                    onClick={() => navigate(`/courses/${c.id}`)}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── View: Landing — 5 Tier Cards ──────────────── */
  const totalCourses = courses.length;
  const totalPractice = courses.reduce(
    (sum, c) => sum + (c.practiceQuestionsCount || 0),
    0
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl animate-fadeIn">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        eyebrow="ADAPTIVE CURRICULUM CATALOG"
        title="Universal Course Library"
        description="Every education level, every subject — structured into a unified AI-powered knowledge graph. From Class 5 to M.Tech, competitive exams to professional engineering."
        action={
          <Button onClick={() => navigate(ROUTES.AI_TUTOR)}>
            <Sparkles size={16} /> Explore with AI Tutor
          </Button>
        }
      />

      {/* Stats Banner */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
            Curriculum Range
          </span>
          <h3 className="text-xl font-bold mt-0.5">Class 5 – M.Tech</h3>
          <p className="text-[11px] text-slate-300">Complete K–PG spectrum</p>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
            Total Courses
          </span>
          <h3 className="text-xl font-bold mt-0.5">{totalCourses}+</h3>
          <p className="text-[11px] text-slate-300">Across 5 education tiers</p>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
            Practice Questions
          </span>
          <h3 className="text-xl font-bold mt-0.5">{totalPractice.toLocaleString()}+</h3>
          <p className="text-[11px] text-slate-300">Adaptive & exam-pattern</p>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
            Exams Covered
          </span>
          <h3 className="text-xl font-bold mt-0.5">12+ National</h3>
          <p className="text-[11px] text-slate-300">JEE, NEET, GATE, UPSC…</p>
        </div>
      </section>

      {/* Global Search */}
      <div className="relative max-w-xl">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Quick search: 'Class 10 Physics', 'DSA', 'GATE 2026', 'Python'..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
      </div>

      {/* Quick search results */}
      {search.trim() !== "" && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Search results for "{search}"
          </h2>
          {(() => {
            const q = search.toLowerCase();
            const results = courses.filter(
              (c) =>
                c.title.toLowerCase().includes(q) ||
                c.subject.toLowerCase().includes(q) ||
                c.description?.toLowerCase().includes(q) ||
                c.gradeOrYear?.toLowerCase().includes(q)
            );
            return results.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <BookOpen size={36} className="mx-auto text-slate-400" />
                <p className="text-sm text-slate-500">No courses match "{search}"</p>
                <Button variant="secondary" onClick={() => setSearch("")}>
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    isBookmarked={bookmarkedIds.has(c.id)}
                    onBookmark={handleToggleBookmark}
                    onClick={() => navigate(`/courses/${c.id}`)}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* 5 Tier Cards — main landing */}
      {search.trim() === "" && (
        <>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Select Your Education Level
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Choose a tier to explore its structured curriculum hierarchy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {TIER_DEFS.map((tier) => {
                const count = tierCourseCounts[tier.id] || 0;
                const TierIcon = tier.icon;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier)}
                    className="group text-left rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-transparent hover:shadow-xl transition-all bg-white dark:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    {/* Gradient header */}
                    <div
                      className={`bg-gradient-to-br ${tier.gradient} p-6 relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-white translate-x-1/4 translate-y-1/4" />
                      </div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                          <TierIcon size={24} className="text-white" />
                        </div>
                        <span className="text-[11px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">
                          {count} courses
                        </span>
                      </div>
                      <div className="relative z-10 mt-4">
                        <h3 className="text-lg font-bold text-white group-hover:scale-[1.02] transition-transform">
                          {tier.label}
                        </h3>
                        <p className="text-xs text-white/80 mt-0.5 leading-snug">
                          {tier.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {tier.stats.slice(0, 4).map((s) => (
                        <div key={s.label} className="space-y-0.5">
                          <div className={`text-sm font-bold ${tier.accentColor}`}>
                            {s.value}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Sub-category previews */}
                    <div className="px-4 pb-4 space-y-1">
                      {tier.subCategories.slice(0, 3).map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                        >
                          <span>{sub.icon}</span>
                          <span className="font-medium">{sub.label}</span>
                        </div>
                      ))}
                      {tier.subCategories.length > 3 && (
                        <div className="text-[11px] text-slate-400">
                          +{tier.subCategories.length - 3} more sub-categories
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="px-4 pb-4">
                      <div
                        className={`flex items-center gap-1 text-xs font-bold ${tier.accentColor} group-hover:underline`}
                      >
                        Explore {tier.label} <ArrowRight size={13} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Access: Continue Learning */}
          {(() => {
            const inProgress = courses.filter(
              (c) => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100
            );
            if (inProgress.length === 0) return null;
            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Zap size={16} className="text-amber-500" /> Continue Learning
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgress.slice(0, 3).map((c) => (
                    <CourseCard
                      key={c.id}
                      course={c}
                      isBookmarked={bookmarkedIds.has(c.id)}
                      onBookmark={handleToggleBookmark}
                      onClick={() => navigate(`/courses/${c.id}`)}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

export default CoursesPage;
