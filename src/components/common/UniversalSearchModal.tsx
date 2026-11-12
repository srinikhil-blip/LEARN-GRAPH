import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Network,
  Bot,
  Layers,
  FileText,
  Award,
  ArrowRight,
  Sparkles,
  Command,
  X,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { COMPETITIVE_EXAMS_CATALOG } from "@/data/competitiveExamsData";
import catalogJson from "@/data/generatedCurriculumCatalog.json";

// Use generated catalog instead of static mock array
const CATALOG_COURSES: Array<{
  id: string;
  title: string;
  subject: string;
  tier: string;
  lessons: string;
}> = (catalogJson as any).courses ?? [];

interface SearchResultItem {
  id: string;
  title: string;
  category: "Course" | "Concept" | "AI Chat" | "Flashcard" | "Exam" | "Quiz";
  path: string;
  snippet: string;
}

const STATIC_CONCEPTS: SearchResultItem[] = [
  {
    id: "sc-1",
    title: "Dijkstra's Shortest Path Algorithm",
    category: "Concept",
    path: `${ROUTES.AI_TUTOR}?prompt=Explain+Dijkstra+Algorithm`,
    snippet: "Greedy single-source shortest path with non-negative edge weights.",
  },
  {
    id: "sc-2",
    title: "King's Rule in Definite Integrals",
    category: "Concept",
    path: `${ROUTES.MATH_SOLVER}`,
    snippet: "Integral reflection symmetry: integral f(x) equals integral f(a+b-x).",
  },
  {
    id: "sc-3",
    title: "Distributed Rate Limiter (Token Bucket)",
    category: "Concept",
    path: `${ROUTES.AI_TUTOR}?prompt=Explain+Distributed+Rate+Limiter`,
    snippet: "High-throughput traffic throttling with Redis and atomic Lua scripts.",
  },
  {
    id: "sc-4",
    title: "Virtual Memory Paging & Inverted Page Tables",
    category: "Concept",
    path: `${ROUTES.KNOWLEDGE_GRAPH}`,
    snippet: "Address translation with TLB caching and page fault handling.",
  },
  {
    id: "sc-5",
    title: "Leitner Spaced Repetition Flashcards",
    category: "Flashcard",
    path: `${ROUTES.FLASHCARDS}`,
    snippet: "Review cards with exponential spacing intervals and mnemonics.",
  },
  {
    id: "sc-6",
    title: "Personalized Exam Study Planner",
    category: "AI Chat",
    path: `${ROUTES.STUDY_PLANNER}`,
    snippet: "Daily milestones, cognitive break schedule, and countdown tracker.",
  },
  {
    id: "sc-7",
    title: "Diagnostic Socratic Quiz Lab",
    category: "Quiz",
    path: `${ROUTES.QUIZ}`,
    snippet: "Adaptive questions evaluating Bloom taxonomy mastery levels.",
  },
];

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UniversalSearchModal({ isOpen, onClose }: UniversalSearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build live search results
  const q = query.toLowerCase().trim();

  const courseResults: SearchResultItem[] = CATALOG_COURSES.filter(
    (c) =>
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.tier.toLowerCase().includes(q)
  )
    .slice(0, 4)
    .map((c) => ({
      id: c.id,
      title: c.title,
      category: "Course",
      path: `/courses/${c.id}`,
      snippet: `${c.tier} · ${c.subject} · ${c.lessons ?? ""}`,
    }));

  const examResults: SearchResultItem[] = COMPETITIVE_EXAMS_CATALOG.filter(
    (e) => !q || e.title.toLowerCase().includes(q) || e.conductedBy.toLowerCase().includes(q)
  )
    .slice(0, 3)
    .map((e) => ({
      id: e.code,
      title: e.title,
      category: "Exam",
      path: ROUTES.COMPETITIVE_EXAMS,
      snippet: `${e.category} · Conducted by ${e.conductedBy} · ${e.durationMinutes} mins`,
    }));

  const conceptResults: SearchResultItem[] = STATIC_CONCEPTS.filter(
    (c) => !q || c.title.toLowerCase().includes(q) || c.snippet.toLowerCase().includes(q)
  ).slice(0, 4);

  const allResults = [...courseResults, ...conceptResults, ...examResults];

  const handleSelectResult = (item: SearchResultItem) => {
    onClose();
    navigate(item.path);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 animate-fadeIn">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Universal Search across Courses, Concepts, Flashcards, Quizzes, Exams..."
            className="w-full text-xs sm:text-sm bg-transparent border-0 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results Stream */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs scrollbar-thin">
          {allResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <Search size={28} className="mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold">No results found for "{query}"</p>
              <p className="text-xs">Try searching for "Calculus", "Dijkstra", "GATE", or "Python"</p>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {query ? "Matching Results" : "Suggested & High-Yield Learning"}
              </span>

              {allResults.map((item) => (
                <div
                  key={`${item.category}-${item.id}`}
                  onClick={() => handleSelectResult(item)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className={`p-2 rounded-lg shrink-0 ${
                        item.category === "Course"
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                          : item.category === "Exam"
                          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                          : item.category === "Concept"
                          ? "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400"
                          : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {item.category === "Course" && <BookOpen size={16} />}
                      {item.category === "Exam" && <Award size={16} />}
                      {item.category === "Concept" && <Network size={16} />}
                      {item.category === "Flashcard" && <Layers size={16} />}
                      {item.category === "Quiz" && <Sparkles size={16} />}
                      {item.category === "AI Chat" && <Bot size={16} />}
                    </span>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.snippet}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    size={14}
                    className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer Key Hints */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-[10px] font-mono mr-1">
                ESC
              </kbd>
              to close
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-[10px] font-mono mr-1">
                ENTER
              </kbd>
              to select
            </span>
          </div>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            LearnGraph Universal Index
          </span>
        </div>
      </div>
    </div>
  );
}
