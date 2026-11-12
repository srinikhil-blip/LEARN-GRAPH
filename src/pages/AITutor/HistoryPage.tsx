import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Share2,
  FileDown,
  Sparkles,
  Bot,
  Calendar,
  Tag as TagIcon,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { ROUTES } from "@/constants/routes";

interface HistoryThread {
  id: string;
  title: string;
  subject: string;
  lastUpdated: string;
  messageCount: number;
  isPinned: boolean;
  tags: string[];
  summary: string;
}

interface StoredMessage {
  role: string;
  content: string;
  timestamp?: string;
}

interface StoredThread {
  id: string;
  title?: string;
  messages: StoredMessage[];
  isPinned?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

function getActiveUserId(): string {
  try {
    const raw = localStorage.getItem("learngraph_v2_auth_state");
    if (raw) {
      const parsed = JSON.parse(raw);
      const user = parsed?.state?.user;
      if (user?.id) return user.id;
      if (user?.email) return user.email;
    }
  } catch { /* ignore */ }
  return "guest_user";
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Unknown";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) {
    const h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `Today, ${h12}:${m} ${ampm}`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

const SUBJECT_KEYWORDS: { keywords: string[]; subject: string }[] = [
  { keywords: ["math", "calculus", "algebra", "geometry", "trigonometry", "equation", "integral", "derivative", "limit", "jee", "statistics"], subject: "Mathematics" },
  { keywords: ["physics", "mechanics", "thermodynamics", "optics", "electro", "quantum", "force", "energy", "motion", "wave"], subject: "Physics" },
  { keywords: ["chemistry", "organic", "inorganic", "reaction", "bond", "element", "molecule", "acid", "base"], subject: "Chemistry" },
  { keywords: ["algorithm", "data structure", "graph", "tree", "sort", "binary", "dynamic programming", "leetcode", "faang", "coding", "javascript", "python", "typescript", "react", "node"], subject: "Computer Science" },
  { keywords: ["system design", "distributed", "redis", "kafka", "microservice", "database", "sql", "nosql", "api", "backend", "architecture"], subject: "System Design" },
  { keywords: ["biology", "cell", "dna", "genetics", "evolution", "ecosystem", "anatomy"], subject: "Biology" },
  { keywords: ["history", "war", "civilization", "empire", "revolution", "century"], subject: "History" },
  { keywords: ["economics", "market", "supply", "demand", "gdp", "inflation", "finance"], subject: "Economics" },
];

function deriveSubject(firstMessageContent?: string): string {
  if (!firstMessageContent) return "AI Tutor";
  const lower = firstMessageContent.toLowerCase();
  for (const { keywords, subject } of SUBJECT_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return subject;
  }
  return "AI Tutor";
}

function loadThreadsFromStorage(userId: string): HistoryThread[] {
  try {
    const raw = localStorage.getItem(`learngraph_ai_threads_${userId}`);
    if (!raw) return [];
    const stored: StoredThread[] = JSON.parse(raw);
    if (!Array.isArray(stored)) return [];

    return stored.map((thread): HistoryThread => {
      const lastMsg = thread.messages[thread.messages.length - 1];
      const lastAssistantMsg = [...thread.messages].reverse().find((m) => m.role === "assistant");
      const firstMsg = thread.messages[0];

      const updatedAt = thread.updatedAt || lastMsg?.timestamp;
      const summary =
        (lastAssistantMsg?.content?.slice(0, 120)) ||
        (lastMsg?.content?.slice(0, 120)) ||
        "No messages yet";

      return {
        id: thread.id,
        title: thread.title || "New Conversation",
        subject: deriveSubject(firstMsg?.content),
        lastUpdated: formatRelativeTime(updatedAt),
        messageCount: thread.messages.length,
        isPinned: thread.isPinned ?? false,
        tags: thread.tags ?? [],
        summary,
      };
    });
  } catch {
    return [];
  }
}

function saveThreadsToStorage(userId: string, updatedThreads: HistoryThread[], currentRaw: StoredThread[]): void {
  try {
    // Apply HistoryThread changes (isPinned, deleted) back onto the raw stored threads
    const updatedIds = new Set(updatedThreads.map((t) => t.id));
    const updated = currentRaw
      .filter((t) => updatedIds.has(t.id))
      .map((t) => {
        const display = updatedThreads.find((d) => d.id === t.id);
        if (!display) return t;
        return { ...t, isPinned: display.isPinned };
      });
    localStorage.setItem(`learngraph_ai_threads_${userId}`, JSON.stringify(updated));
  } catch { /* ignore */ }
}

function getRawThreads(userId: string): StoredThread[] {
  try {
    const raw = localStorage.getItem(`learngraph_ai_threads_${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function HistoryPage() {
  const navigate = useNavigate();
  const userId = useMemo(() => getActiveUserId(), []);
  const [threads, setThreads] = useState<HistoryThread[]>(() => loadThreadsFromStorage(userId));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t));
      saveThreadsToStorage(userId, updated, getRawThreads(userId));
      return updated;
    });
    showToast("Updated pinned status");
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveThreadsToStorage(userId, updated, getRawThreads(userId));
      return updated;
    });
    showToast("Conversation deleted");
  };

  const handleExportMarkdown = (thread: HistoryThread, e: React.MouseEvent) => {
    e.stopPropagation();
    const mdContent = `# ${thread.title}\n**Subject:** ${thread.subject}\n**Updated:** ${thread.lastUpdated}\n\n## Summary\n${thread.summary}\n\n*Exported from LearnGraph AI Tutor.*`;
    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${thread.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported as Markdown");
  };

  const filteredThreads = threads.filter((t) => {
    const matchesQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === "All" || t.subject === selectedSubject;
    return matchesQuery && matchesSubject;
  });

  const subjects = ["All", ...Array.from(new Set(threads.map((t) => t.subject)))];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="TUTORING MEMORY & ARCHIVE"
        title="Conversation History"
        description="Search, export, bookmark, and review all previous interactive tutoring dialogues, proofs, and generated quizzes."
        action={
          <Button onClick={() => navigate(ROUTES.AI_TUTOR)}>
            <Bot size={16} /> Open AI Tutor
          </Button>
        }
      />

      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl animate-fadeIn">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Empty state for new users */}
      {threads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20">
            <Bot size={40} className="text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No conversations yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Start chatting with the AI Tutor and your conversation history will appear here.
          </p>
          <Button onClick={() => navigate(ROUTES.AI_TUTOR)}>
            <Sparkles size={16} /> Start your first AI conversation
          </Button>
        </div>
      )}

      {/* Filter and Search */}
      {threads.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    selectedSubject === sub
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations & tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="space-y-3">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => navigate(`${ROUTES.AI_TUTOR}?threadId=${thread.id}`)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {thread.isPinned && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                        <Pin size={10} /> Pinned
                      </span>
                    )}
                    <Tag tone="indigo">{thread.subject}</Tag>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar size={12} /> {thread.lastUpdated}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      · {thread.messageCount} messages
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    {thread.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {thread.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {thread.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={(e) => handleTogglePin(thread.id, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={thread.isPinned ? "Unpin chat" : "Pin chat"}
                  >
                    <Pin size={16} className={thread.isPinned ? "fill-amber-500 text-amber-500" : ""} />
                  </button>
                  <button
                    onClick={(e) => handleExportMarkdown(thread, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Export as Markdown"
                  >
                    <FileDown size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(thread.id, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Delete thread"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HistoryPage;
