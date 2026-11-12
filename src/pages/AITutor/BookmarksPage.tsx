import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Trash2,
  ArrowRight,
  Bookmark,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { ROUTES } from "@/constants/routes";

interface SavedBookmark {
  id: string;
  title: string;
  category: "Explanation" | "Quiz" | "Code Solution" | "Flashcard";
  subject: string;
  excerpt: string;
  savedDate: string;
}

// Load bookmarks from localStorage (persisted per-user)
function getStorageKey(): string {
  try {
    const raw = localStorage.getItem("learngraph_v2_auth_state");
    if (raw) {
      const parsed = JSON.parse(raw);
      const user = parsed?.state?.user;
      if (user?.id) return `learngraph_bookmarks_${user.id}`;
      if (user?.email) return `learngraph_bookmarks_${user.email}`;
    }
  } catch { /* ignore */ }
  return "learngraph_bookmarks_guest";
}

function loadBookmarks(): SavedBookmark[] {
  try {
    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved) as SavedBookmark[];
  } catch { /* ignore */ }
  return [];
}

function saveBookmarks(bms: SavedBookmark[]): void {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(bms));
  } catch { /* ignore */ }
}

export function BookmarksPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>(() => loadBookmarks());

  const handleDelete = (id: string) => {
    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      saveBookmarks(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="SAVED REVISION CARDS & EXCERPTS"
        title="Saved Bookmarks"
        description="Quick access to bookmarked concept explanations, mathematical proofs, algorithm solutions, and flashcard notes."
        action={
          <Button onClick={() => navigate(ROUTES.AI_TUTOR)}>
            <Bot size={16} /> Open AI Tutor
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bookmarks.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4">
            <span className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Bookmark size={32} />
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No bookmarks yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                Save key explanations, proofs, and code solutions from the AI Tutor to revisit them here.
              </p>
            </div>
            <Button onClick={() => navigate(ROUTES.AI_TUTOR)}>
              <Bot size={15} /> Open AI Tutor
            </Button>
          </div>
        ) : (
          bookmarks.map((bm) => (
          <div
            key={bm.id}
            className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Tag tone="indigo">{bm.category}</Tag>
                <span className="text-[11px] text-slate-400">{bm.savedDate}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {bm.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                {bm.excerpt}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => navigate(`${ROUTES.AI_TUTOR}?prompt=${encodeURIComponent(`Explain: ${bm.title}`)}`)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Discuss in Tutor <ArrowRight size={12} />
              </button>
              <button
                onClick={() => handleDelete(bm.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Remove bookmark"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
}

export default BookmarksPage;
