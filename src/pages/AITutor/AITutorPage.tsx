import { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowUp,
  ArrowRight,
  Bookmark,
  BookOpen,
  Bot,
  Brain,
  BrainCircuit,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit2,
  ExternalLink,
  FileDown,
  FileText,
  HelpCircle,
  History,
  Image as ImageIcon,
  Layers,
  LogOut,
  Maximize2,
  MessageSquare,
  Mic,
  Network,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
  Paperclip,
  Pin,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Share2,
  Sparkles,
  StopCircle,
  Terminal,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UploadCloud,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { orchestratorApi } from "@/api/orchestrator";
import { TOPIC_DIJKSTRA_ALGORITHM, TOPIC_LIMITS_CONTINUITY, TOPIC_RATE_LIMITER } from "@/data/curriculumData";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Progress } from "@/components/ui/Progress";
import { Modal } from "@/components/ui/Modal";
import { ROUTES } from "@/constants/routes";
import type { TopicContentPayload } from "@/types/curriculum";
import { generateOmniTeacherResponse, type OmniTeacherResult } from "@/utils/omniTeacherEngine";
import { OmniTeacherCard } from "@/components/omni/OmniTeacherCard";
import { MultiAgentOrchestrator } from "@/services/ai/multiAgentOrchestrator";
import { userProgressService } from "@/services/userProgressService";

export type AIModelTier = "omni" | "reasoning" | "claude" | "flash";

export type PedagogicalMode =
  | "socratic"
  | "practice"
  | "revision"
  | "exam"
  | "coding";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  timestamp: string;
  content: string;
  agentName?: string;
  agentTone?: "indigo" | "emerald" | "amber" | "purple" | "cyan" | "rose" | "blue";
  thoughtProcess?: string;
  thoughtDurationSeconds?: number;
  chips?: string[];
  attachedFile?: { name: string; size: string; type: string };
  attachedImage?: string;
  embeddedTopicPayload?: TopicContentPayload;
  teacherResult?: OmniTeacherResult;
  quizPayload?: {
    topic: string;
    questions: {
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }[];
  };
  bookmarked?: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  category: "Today" | "Yesterday" | "Last 7 Days" | "Last 30 Days" | "Older";
  timestamp: string;
  subject: string;
  isPinned: boolean;
  messages: ChatMessage[];
}

const INITIAL_THREADS: ChatThread[] = [
  {
    id: "thread-welcome",
    title: "New Conversation",
    category: "Today",
    timestamp: new Date().toISOString(),
    subject: "General",
    isPinned: false,
    messages: [],
  },
];

const OMNI_CAPABILITIES = [
  { icon: "📚", label: "School Subjects" },
  { icon: "🎓", label: "College Courses" },
  { icon: "💻", label: "Programming" },
  { icon: "🤖", label: "AI & Machine Learning" },
  { icon: "📐", label: "Mathematics" },
  { icon: "🧪", label: "Science" },
  { icon: "📖", label: "Competitive Exams" },
  { icon: "📝", label: "Quizzes" },
  { icon: "📄", label: "PDF Analysis" },
  { icon: "💼", label: "Career Guidance" },
];

const BASE_SUGGESTED_PROMPTS = [
  "Teach me Python",
  "Explain Quantum Physics",
  "Help me prepare for UPSC",
  "Solve this math problem",
  "Generate a quiz on DBMS",
  "Analyze my PDF",
  "Create a study plan",
];

const SUBJECT_QUICK_CARDS = [
  { label: "Programming", icon: Terminal, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/50" },
  { label: "Mathematics", icon: Sparkles, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50" },
  { label: "Physics", icon: Zap, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50" },
  { label: "Chemistry", icon: Layers, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/50" },
  { label: "Biology", icon: HelpCircle, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50" },
  { label: "AI & ML", icon: BrainCircuit, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/50" },
  { label: "Data Science", icon: Network, color: "text-teal-500 bg-teal-50 dark:bg-teal-950/50" },
  { label: "Interview Prep", icon: BookOpen, color: "text-orange-500 bg-orange-50 dark:bg-orange-950/50" },
];

export function AITutorPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Layout Sidebars
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [rightActiveTab, setRightActiveTab] = useState<"graph" | "memory" | "resources" | "quiz">("graph");

  // Threads & Active Conversation with persistent localStorage
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem(`learngraph_ai_threads_${user?.id || "guest"}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_THREADS;
  });
  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`learngraph_ai_threads_${user?.id || "guest"}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      }
    } catch {
      // ignore
    }
    return "thread-welcome";
  });
  const [searchThreadQuery, setSearchThreadQuery] = useState("");
  const [isRenamingTitle, setIsRenamingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  // Persist threads to localStorage on updates
  useEffect(() => {
    try {
      localStorage.setItem(`learngraph_ai_threads_${user?.id || "guest"}`, JSON.stringify(threads));
    } catch {
      // ignore
    }
  }, [threads, user?.id]);

  // AI Configuration
  const [selectedModel, setSelectedModel] = useState<AIModelTier>("omni");
  const [pedagogicalMode, setPedagogicalMode] = useState<PedagogicalMode>("socratic");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);

  // Input & Streaming
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessageText, setStreamingMessageText] = useState("");
  const [graphContextActive, setGraphContextActive] = useState(true);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Audio Playback
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "up" | "down">>({});
  const [quizUserAnswers, setQuizUserAnswers] = useState<Record<string, number>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Share Modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // DOM Refs
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const dynamicSuggestedPrompts = useMemo(() => {
    const list = [...BASE_SUGGESTED_PROMPTS];
    if (user?.targetExam && user.targetExam !== "None") {
      list.unshift(`Help me prepare for ${user.targetExam}`);
    }
    if (user?.educationLevel) {
      list.unshift(`High-yield topics for ${user.educationLevel}`);
    }
    return list.slice(0, 8);
  }, [user?.targetExam, user?.educationLevel]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages, streamingMessageText]);

  // Handle URL query prompt if passed from another page
  useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt) {
      handleCreateNewChat(urlPrompt);
    }
  }, [searchParams]);

  const showToast = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(null), 2500);
  };

  // Create new conversation
  const handleCreateNewChat = (customFirstPrompt?: string) => {
    const newId = `thread-${Date.now()}`;
    const newThread: ChatThread = {
      id: newId,
      title: customFirstPrompt ? customFirstPrompt.slice(0, 32) + "..." : "New Chat",
      category: "Today",
      timestamp: "Just now",
      subject: "General",
      isPinned: false,
      messages: customFirstPrompt
        ? [
            {
              id: `msg-${Date.now()}-u`,
              sender: "user",
              timestamp: "Just now",
              content: customFirstPrompt,
            },
            {
              id: `msg-${Date.now()}-a`,
              sender: "assistant",
              timestamp: "Just now",
              thoughtProcess: "Detecting domain & customizing Socratic framework.",
              thoughtDurationSeconds: 1.8,
              content: `Let's explore **${customFirstPrompt}** together! What specific aspect would you like to master first?`,
              chips: ["Explain the fundamentals", "Give me a practical example", "Generate a quiz"],
            },
          ]
        : [],
    };

    setThreads([newThread, ...threads]);
    setActiveThreadId(newId);
    if (!customFirstPrompt) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent && !attachedFile && !attachedImage) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: messageContent,
      attachedFile: attachedFile || undefined,
      attachedImage: attachedImage || undefined,
    };

    // Auto-update thread title if it was "New Chat"
    const isFirstUserMessage = activeThread.messages.length === 0;
    const updatedTitle = isFirstUserMessage
      ? messageContent.slice(0, 34) + (messageContent.length > 34 ? "..." : "")
      : activeThread.title;

    const updatedThreadMessages = [...activeThread.messages, userMsg];

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? { ...t, title: updatedTitle, messages: updatedThreadMessages }
          : t
      )
    );

    // Update real user dashboard metrics with AI chat activity
    userProgressService.recordChat(updatedTitle || messageContent.slice(0, 30));

    setInputText("");
    setAttachedFile(null);
    setAttachedImage(null);
    setIsGenerating(true);

    // Intent detection & multi-agent response routing
    setTimeout(async () => {
      try {
        const agentResult = await MultiAgentOrchestrator.execute(
          messageContent,
          user,
          !!attachedFile,
          !!attachedImage
        );

        let topicPayload: TopicContentPayload | undefined = undefined;
        const lower = messageContent.toLowerCase();
        if (lower.includes("dijkstra") || lower.includes("shortest path")) {
          topicPayload = TOPIC_DIJKSTRA_ALGORITHM;
        } else if (lower.includes("calculus") || lower.includes("limit")) {
          topicPayload = TOPIC_LIMITS_CONTINUITY;
        } else if (lower.includes("rate limit") || lower.includes("redis")) {
          topicPayload = TOPIC_RATE_LIMITER;
        }

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-a`,
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          agentName: agentResult.agentName,
          agentTone: agentResult.agentTone,
          thoughtProcess: agentResult.thoughtProcess,
          thoughtDurationSeconds: agentResult.thoughtDurationSeconds,
          content: agentResult.content,
          teacherResult: agentResult.teacherResult,
          quizPayload: agentResult.quizPayload,
          chips: agentResult.chips,
          embeddedTopicPayload: topicPayload,
        };

        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThread.id
              ? { ...t, messages: [...t.messages, assistantMsg] }
              : t
          )
        );
      } catch (err) {
        console.error("Agent execution error:", err);
      } finally {
        setIsGenerating(false);
      }
    }, 700);
  };

  // Speech TTS
  const handleToggleSpeak = (msgId: string, content: string) => {
    if (speakingMsgId === msgId) {
      window.speechSynthesis?.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis?.cancel();
    if ("speechSynthesis" in window) {
      const cleanText = content.replace(/[*#$`]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Copy message
  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || "file",
      });
      showToast(`Attached ${file.name}`);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
        showToast("Image attached for visual reasoning");
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setAttachedImage(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setAttachedFile({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type,
        });
      }
      showToast(`Attached ${file.name}`);
    }
  };

  // Voice recording mock
  const handleToggleVoice = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      setInputText("Explain how Dijkstra's algorithm prioritizes vertices using a min-heap.");
    } else {
      setIsRecordingVoice(true);
      setTimeout(() => {
        setIsRecordingVoice(false);
        setInputText("Explain how Dijkstra's algorithm prioritizes vertices using a min-heap.");
      }, 3000);
    }
  };

  // Thread actions
  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned } : t))
    );
    showToast("Updated pinned conversation");
  };

  const handleDeleteThread = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (threads.length <= 1) {
      handleCreateNewChat();
      return;
    }
    const remaining = threads.filter((t) => t.id !== id);
    setThreads(remaining);
    setActiveThreadId(remaining[0].id);
    showToast("Conversation deleted");
  };

  const handleRenameThread = () => {
    if (tempTitle.trim()) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThread.id ? { ...t, title: tempTitle.trim() } : t
        )
      );
      setIsRenamingTitle(false);
      showToast("Conversation renamed");
    }
  };

  const handleExportMarkdown = () => {
    const md = `# ${activeThread.title}\n\n${activeThread.messages
      .map((m) => `### ${m.sender.toUpperCase()} (${m.timestamp})\n${m.content}\n`)
      .join("\n---\n\n")}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeThread.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported as Markdown");
  };

  // Filter threads
  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchThreadQuery.toLowerCase())
  );
  const pinnedThreads = filteredThreads.filter((t) => t.isPinned);
  const unpinnedThreads = filteredThreads.filter((t) => !t.isPinned);

  const categories = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "Older"] as const;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex h-[calc(100vh-65px)] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative"
    >
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl animate-fadeIn">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-indigo-600/20 backdrop-blur-xs border-4 border-dashed border-indigo-500 flex flex-col items-center justify-center pointer-events-none">
          <UploadCloud size={48} className="text-indigo-600 dark:text-indigo-400 animate-bounce" />
          <p className="text-base font-bold text-indigo-900 dark:text-indigo-100 mt-2">
            Drop textbook PDF, code file, or image here to inspect with AI Tutor
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. LEFT SIDEBAR: Conversations & Quick Navigation (280px)
      ───────────────────────────────────────────────────────────── */}
      <aside
        className={`${
          leftSidebarOpen ? "w-[280px]" : "w-0"
        } transition-all duration-300 ease-in-out shrink-0 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden relative z-20`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top: New Chat + Search */}
          <div className="p-3.5 space-y-2.5 border-b border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => handleCreateNewChat()}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors group"
            >
              <span className="flex items-center gap-2">
                <Plus size={16} /> New Chat
              </span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-mono">
                ⌘K
              </span>
            </button>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchThreadQuery}
                onChange={(e) => setSearchThreadQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Middle: Scrollable Conversations History */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs scrollbar-thin">
            {/* Pinned Chats */}
            {pinnedThreads.length > 0 && (
              <div className="space-y-1">
                <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Pin size={11} className="text-amber-500" /> Pinned
                </span>
                {pinnedThreads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-colors ${
                      activeThreadId === thread.id
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate">{thread.title}</span>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleTogglePin(thread.id, e)}
                        className="p-1 hover:text-amber-500"
                        title="Unpin"
                      >
                        <Pin size={11} className="fill-amber-500 text-amber-500" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteThread(thread.id, e)}
                        className="p-1 hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grouped by Date */}
            {categories.map((cat) => {
              const items = unpinnedThreads.filter((t) => t.category === cat);
              if (items.length === 0) return null;

              return (
                <div key={cat} className="space-y-1">
                  <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {cat}
                  </span>
                  {items.map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => setActiveThreadId(thread.id)}
                      className={`group flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-colors ${
                        activeThreadId === thread.id
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare size={13} className="shrink-0 text-slate-400" />
                        <span className="truncate">{thread.title}</span>
                      </div>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleTogglePin(thread.id, e)}
                          className="p-1 hover:text-amber-500"
                          title="Pin conversation"
                        >
                          <Pin size={11} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteThread(thread.id, e)}
                          className="p-1 hover:text-rose-500"
                          title="Delete conversation"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Quick Nav Modules Link Section */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800/80 space-y-0.5 text-xs">
            <button
              onClick={() => navigate(ROUTES.AI_HISTORY)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <History size={14} /> Full History Archive
            </button>
            <button
              onClick={() => navigate(ROUTES.AI_BOOKMARKS)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bookmark size={14} /> Saved Bookmarks
            </button>
            <button
              onClick={() => navigate(ROUTES.AI_UPLOADS)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <UploadCloud size={14} /> Uploaded Study Files
            </button>
          </div>

          {/* Bottom User Profile */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div
              onClick={() => navigate(ROUTES.PROFILE)}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "ST"}
              </div>
              <div className="truncate">
                <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || "Student"}
                </span>
                <span className="text-[10px] text-slate-400">
                  Level {user?.level || 1} · {user?.role || "Student"}
                </span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. CENTER CHAT AREA: Large Conversation Experience
      ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/60 dark:bg-slate-950 relative">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-200/80 dark:border-slate-800/80 px-4 flex items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={leftSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {leftSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
            </button>

            {/* Editable Title */}
            {isRenamingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRenameThread()}
                  autoFocus
                  className="px-2 py-1 text-xs font-bold rounded-lg border border-indigo-500 bg-white dark:bg-slate-800"
                />
                <button
                  onClick={handleRenameThread}
                  className="p-1 rounded bg-indigo-600 text-white"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={() => setIsRenamingTitle(false)}
                  className="p-1 rounded text-slate-400"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setTempTitle(activeThread.title);
                  setIsRenamingTitle(true);
                }}
                className="flex items-center gap-2 cursor-pointer group"
                title="Click to rename chat"
              >
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[220px] sm:max-w-md">
                  {activeThread.title}
                </h1>
                <Edit2 size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          {/* Model & Pedagogical Mode Selectors */}
          <div className="flex items-center gap-2">
            {/* AI Model Selector */}
            <div className="relative">
              <button
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:border-indigo-400 transition-all"
              >
                <Sparkles size={13} className="text-indigo-500" />
                <span className="hidden sm:inline">Model:</span>
                <span>
                  {selectedModel === "omni" && "GPT-4o Omni"}
                  {selectedModel === "reasoning" && "o3-mini Reasoner"}
                  {selectedModel === "claude" && "Claude 3.7 STEM"}
                  {selectedModel === "flash" && "Gemini Flash"}
                </span>
                <ChevronDown size={12} />
              </button>

              {modelDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 text-xs space-y-1">
                  <button
                    onClick={() => {
                      setSelectedModel("omni");
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition-colors ${
                      selectedModel === "omni" ? "bg-indigo-50 dark:bg-indigo-950/60 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="block text-slate-900 dark:text-slate-100">GPT-4o Omni (Default)</span>
                    <span className="text-[10px] text-slate-400">Adaptive multimodal tutoring & explanations</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModel("reasoning");
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition-colors ${
                      selectedModel === "reasoning" ? "bg-indigo-50 dark:bg-indigo-950/60 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="block text-slate-900 dark:text-slate-100">o3-mini Deep Reasoner</span>
                    <span className="text-[10px] text-slate-400">Step-by-step mathematical & algorithm proofs</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModel("claude");
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition-colors ${
                      selectedModel === "claude" ? "bg-indigo-50 dark:bg-indigo-950/60 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="block text-slate-900 dark:text-slate-100">Claude 3.7 STEM</span>
                    <span className="text-[10px] text-slate-400">Deep coding, compiler details, system design</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModel("flash");
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition-colors ${
                      selectedModel === "flash" ? "bg-indigo-50 dark:bg-indigo-950/60 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="block text-slate-900 dark:text-slate-100">Gemini 2.5 Flash</span>
                    <span className="text-[10px] text-slate-400">Ultra-fast summaries, flashcard generation</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pedagogical Mode Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:border-indigo-400 transition-all"
              >
                <Brain size={13} className="text-purple-500" />
                <span className="capitalize">{pedagogicalMode}</span>
                <ChevronDown size={12} />
              </button>

              {modeDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 text-xs space-y-1">
                  {(["socratic", "practice", "revision", "exam", "coding"] as PedagogicalMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setPedagogicalMode(mode);
                        setModeDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl capitalize transition-colors ${
                        pedagogicalMode === mode ? "bg-indigo-50 dark:bg-indigo-950/60 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {mode} Mode
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions: Share & Export */}
            <button
              onClick={() => setShareModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Share conversation"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={handleExportMarkdown}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Export as Markdown"
            >
              <FileDown size={16} />
            </button>

            {/* Toggle Context Panel (Right) */}
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className={`p-1.5 rounded-lg transition-colors ${
                rightSidebarOpen
                  ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={rightSidebarOpen ? "Hide Context Panel" : "Show Context Panel"}
            >
              {rightSidebarOpen ? <PanelRightClose size={18} /> : <PanelRight size={18} />}
            </button>
          </div>
        </header>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-12 lg:px-20 py-8 space-y-6">
          {activeThread.messages.length === 0 ? (
            /* ChatGPT-style Welcome Screen */
            <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-8 animate-fadeIn">
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
                  <Bot size={32} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
                  <span>👋</span> Hi, I'm LearnGraph Omni
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Your intelligent AI learning companion. Tell me what you'd like to explore, or select a topic below.
                </p>
              </div>

              {/* What I can help you with */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
                  I can help you with
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {OMNI_CAPABILITIES.map((cap) => (
                    <button
                      key={cap.label}
                      onClick={() => handleSendMessage(`I want to learn about ${cap.label}`)}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-2xs text-center transition-all group"
                    >
                      <span className="text-xl block mb-1">{cap.icon}</span>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {cap.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested Prompts */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
                  Suggested Prompts
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {dynamicSuggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-left transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        • {prompt}
                      </span>
                      <ArrowRight size={13} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Messages List */
            <div className="max-w-3xl mx-auto space-y-6">
              {activeThread.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  } space-y-2 animate-fadeIn`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 shadow-xs leading-relaxed text-xs sm:text-sm ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-xs"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs"
                    }`}
                  >
                    {/* Specialized Agent Badge */}
                    {msg.sender === "assistant" && msg.agentName && (
                      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                          <Bot size={11} /> {msg.agentName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          LearnGraph Omni
                        </span>
                      </div>
                    )}

                    {/* Assistant Reasoning Trace dropdown */}
                    {msg.sender === "assistant" && msg.thoughtProcess && (
                      <details className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
                        <summary className="cursor-pointer font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <Brain size={13} />
                          <span>Thought for {msg.thoughtDurationSeconds || 2.5}s</span>
                        </summary>
                        <pre className="mt-2 text-[11px] font-mono whitespace-pre-wrap text-slate-500 dark:text-slate-400 leading-relaxed">
                          {msg.thoughtProcess}
                        </pre>
                      </details>
                    )}

                    {/* Image Attachment Preview */}
                    {msg.attachedImage && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-white/20 max-w-sm">
                        <img src={msg.attachedImage} alt="User attachment" className="w-full h-auto" />
                      </div>
                    )}

                    {/* File Attachment Badge */}
                    {msg.attachedFile && (
                      <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/10 dark:bg-white/10 text-xs font-mono">
                        <FileText size={14} />
                        <span>{msg.attachedFile.name} ({msg.attachedFile.size})</span>
                      </div>
                    )}

                    {/* Content text */}
                    <div className="whitespace-pre-wrap space-y-3 font-sans">
                      {msg.content}
                    </div>

                    {/* Interactive Quiz Payload from Quiz Agent */}
                    {msg.quizPayload && (
                      <div className="mt-4 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60 dark:border-emerald-900/40">
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <Sparkles size={13} className="text-emerald-600" /> Diagnostic Quiz: {msg.quizPayload.topic}
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                            {msg.quizPayload.questions.length} Questions
                          </span>
                        </div>

                        <div className="space-y-4">
                          {msg.quizPayload.questions.map((q, qIndex) => {
                            const answerKey = `${msg.id}-${qIndex}`;
                            const selectedAnswer = quizUserAnswers[answerKey];
                            const isRevealed = selectedAnswer !== undefined;

                            return (
                              <div key={qIndex} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 space-y-2.5 text-xs">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                  {qIndex + 1}. {q.question}
                                </div>
                                <div className="space-y-1.5">
                                  {q.options.map((opt, optIndex) => {
                                    const isChosen = selectedAnswer === optIndex;
                                    const isCorrect = optIndex === q.correctIndex;

                                    let btnStyle = "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300";
                                    if (isRevealed) {
                                      if (isCorrect) {
                                        btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold";
                                      } else if (isChosen && !isCorrect) {
                                        btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300";
                                      }
                                    }

                                    return (
                                      <button
                                        key={optIndex}
                                        onClick={() => {
                                          if (!isRevealed) {
                                            setQuizUserAnswers((prev) => ({
                                              ...prev,
                                              [answerKey]: optIndex,
                                            }));
                                          }
                                        }}
                                        disabled={isRevealed}
                                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                                      >
                                        <span>{opt}</span>
                                        {isRevealed && isCorrect && <Check size={13} className="text-emerald-500 shrink-0 ml-1" />}
                                      </button>
                                    );
                                  })}
                                </div>
                                {isRevealed && (
                                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                                    <span className="font-bold">Explanation: </span>
                                    {q.explanation}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ══════════════════════════════════════════════════════
                        LearnGraph Omni — 13-Section Deep Pedagogical Renderer
                    ══════════════════════════════════════════════════════ */}
                    {msg.teacherResult && (
                      <OmniTeacherCard
                        result={msg.teacherResult}
                        onFollowUp={handleSendMessage}
                      />
                    )}

                    {/* Embedded 20-facet Topic Card */}
                    {msg.embeddedTopicPayload && (
                      <div className="mt-4 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <Tag tone="indigo">
                            {msg.embeddedTopicPayload.subjectTitle} · {msg.embeddedTopicPayload.topicTitle}
                          </Tag>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Target: {msg.embeddedTopicPayload.targetAudience}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {msg.embeddedTopicPayload.beginnerExplanation}
                        </p>

                        {/* ASCII Diagram */}
                        {msg.embeddedTopicPayload.visualExplanation && (
                          <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                            {msg.embeddedTopicPayload.visualExplanation.asciiOrSvgHint}
                          </pre>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-500">
                            Prerequisites: {msg.embeddedTopicPayload.prerequisites?.join(", ") || "None"}
                          </span>
                          <button
                            onClick={() =>
                              handleSendMessage(
                                `Generate a 5-question adaptive quiz for ${msg.embeddedTopicPayload?.topicTitle}`
                              )
                            }
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            Launch Full Topic Quiz →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Educational Action Bar for Assistant Messages */}
                    {msg.sender === "assistant" && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => handleSendMessage(`Generate a 5-question quiz based on the above explanation.`)}
                          className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                          <HelpCircle size={12} /> Quiz
                        </button>
                        <button
                          onClick={() => handleSendMessage(`Generate 4 mnemonic flashcards for the key concepts above.`)}
                          className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                          <Layers size={12} /> Flashcards
                        </button>
                        <button
                          onClick={() => handleSendMessage(`Summarize the above into 3 high-yield bullet points.`)}
                          className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                          <FileText size={12} /> Summary
                        </button>
                        <button
                          onClick={() => handleSendMessage(`Generate a challenging practice coding problem with test cases for this topic.`)}
                          className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                          <Terminal size={12} /> Practice
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message Bottom Action Bar */}
                  <div
                    className={`flex items-center gap-1 text-[11px] text-slate-400 px-1 ${
                      msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Copy response"
                    >
                      {copiedMsgId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                    {msg.sender === "assistant" && (
                      <>
                        <button
                          onClick={() => handleToggleSpeak(msg.id, msg.content)}
                          className="p-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          title={speakingMsgId === msg.id ? "Stop audio" : "Read aloud"}
                        >
                          {speakingMsgId === msg.id ? <VolumeX size={12} className="text-indigo-500" /> : <Volume2 size={12} />}
                        </button>
                        <button
                          onClick={() => setFeedbackGiven({ ...feedbackGiven, [msg.id]: "up" })}
                          className={`p-1 hover:text-emerald-500 transition-colors ${
                            feedbackGiven[msg.id] === "up" ? "text-emerald-500" : ""
                          }`}
                          title="Helpful"
                        >
                          <ThumbsUp size={12} />
                        </button>
                        <button
                          onClick={() => setFeedbackGiven({ ...feedbackGiven, [msg.id]: "down" })}
                          className={`p-1 hover:text-rose-500 transition-colors ${
                            feedbackGiven[msg.id] === "down" ? "text-rose-500" : ""
                          }`}
                          title="Not helpful"
                        >
                          <ThumbsDown size={12} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Follow-up Suggestion Chips */}
                  {msg.chips && msg.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.chips.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => handleSendMessage(chip)}
                          className="text-[11px] px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-700 dark:text-slate-300 transition-all shadow-2xs"
                        >
                          {chip} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming loading indicator */}
              {isGenerating && (
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 animate-pulse max-w-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                  <span>LearnGraph is reasoning step-by-step...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            Bottom Multimodal Input Bar
        ───────────────────────────────────────────────────────────── */}
        <div className="p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Attachment preview strip */}
            {(attachedFile || attachedImage) && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                {attachedImage ? (
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <ImageIcon size={14} className="text-indigo-500" /> Image Attached
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <FileText size={14} className="text-indigo-500" /> {attachedFile?.name} ({attachedFile?.size})
                  </span>
                )}
                <button
                  onClick={() => {
                    setAttachedFile(null);
                    setAttachedImage(null);
                  }}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ml-auto"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Input Container */}
            <div className="flex items-end gap-2 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
              {/* Left Action Buttons */}
              <div className="flex items-center gap-1 pb-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Attach file (PDF, DOCX)"
                >
                  <Paperclip size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Upload image"
                >
                  <ImageIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`p-2 rounded-xl transition-colors ${
                    isRecordingVoice
                      ? "text-rose-600 bg-rose-50 dark:bg-rose-950/50 animate-pulse"
                      : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title={isRecordingVoice ? "Stop recording" : "Voice input"}
                >
                  <Mic size={16} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                placeholder={
                  isRecordingVoice
                    ? "Listening... speak your math question or code problem..."
                    : "Ask anything about any subject (Shift+Enter for newline)..."
                }
                className="flex-1 max-h-36 py-2 px-1 text-xs sm:text-sm bg-transparent border-0 focus:outline-none resize-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />

              {/* Send / Stop Button */}
              <div className="pb-1">
                {isGenerating ? (
                  <button
                    type="button"
                    onClick={() => setIsGenerating(false)}
                    className="p-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-900 shadow-xs"
                    title="Stop generation"
                  >
                    <StopCircle size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() && !attachedFile && !attachedImage}
                    className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
                    title="Send message (Enter)"
                  >
                    <ArrowUp size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Sub-bar tags */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGraphContextActive(!graphContextActive)}
                  className={`flex items-center gap-1 hover:underline ${
                    graphContextActive ? "text-indigo-600 dark:text-indigo-400 font-semibold" : ""
                  }`}
                >
                  <Network size={12} /> Graph Grounding: {graphContextActive ? "ON" : "OFF"}
                </button>
              </div>
              <span>Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline</span>
            </div>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. RIGHT SIDEBAR: Educational Context Panel (320px)
      ───────────────────────────────────────────────────────────── */}
      <aside
        className={`${
          rightSidebarOpen ? "w-[320px]" : "w-0"
        } transition-all duration-300 ease-in-out shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between overflow-hidden relative z-20`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header & Tabs */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Educational Context
              </span>
              <button
                onClick={() => setRightSidebarOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            </div>

            {/* 4 Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
              <button
                onClick={() => setRightActiveTab("graph")}
                className={`py-1 rounded-lg transition-all ${
                  rightActiveTab === "graph"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                    : "text-slate-500"
                }`}
              >
                Graph
              </button>
              <button
                onClick={() => setRightActiveTab("memory")}
                className={`py-1 rounded-lg transition-all ${
                  rightActiveTab === "memory"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                    : "text-slate-500"
                }`}
              >
                Memory
              </button>
              <button
                onClick={() => setRightActiveTab("resources")}
                className={`py-1 rounded-lg transition-all ${
                  rightActiveTab === "resources"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                    : "text-slate-500"
                }`}
              >
                Books
              </button>
              <button
                onClick={() => setRightActiveTab("quiz")}
                className={`py-1 rounded-lg transition-all ${
                  rightActiveTab === "quiz"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                    : "text-slate-500"
                }`}
              >
                Quiz
              </button>
            </div>
          </div>

          {/* Scrollable Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs scrollbar-thin">
            {rightActiveTab === "graph" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Current Active Concept
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Dijkstra's Shortest Path Algorithm
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tier: Undergraduate / Placement Prep · Bloom: Analyze
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                    Prerequisites Chain
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Breadth-First Search</span>
                      <span className="text-emerald-500 font-bold">86%</span>
                    </div>
                    <Progress value={86} />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-600 dark:text-slate-300">Min-Heap Priority Queue</span>
                      <span className="text-indigo-500 font-bold">74%</span>
                    </div>
                    <Progress value={74} />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-rose-500 font-bold">Edge Relaxation Invariant</span>
                      <span className="text-rose-500 font-bold">34% (Weak)</span>
                    </div>
                    <Progress value={34} />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                    Related Concepts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Bellman-Ford", "Floyd-Warshall", "A* Search", "Prim's MST"].map((c) => (
                      <button
                        key={c}
                        onClick={() => handleSendMessage(`Explain how ${c} relates to Dijkstra's algorithm.`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[11px] transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => navigate(ROUTES.KNOWLEDGE_GRAPH)}
                  className="w-full text-xs gap-1.5"
                >
                  <Network size={13} /> Open Interactive Graph
                </Button>
              </div>
            )}

            {rightActiveTab === "memory" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Learner Profile & Goals
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {user?.name || "Alex Morgan"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target Exam: <strong>{user?.targetExam || "GATE CS/AI"}</strong>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                    Active Cognitive Memory
                  </span>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>Learns best with <strong>geometric analogies</strong> & step proofs.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>Struggles with negative edge weights & DP base cases.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>Preferred programming language: <strong>Python 3.12</strong>.</span>
                    </li>
                  </ul>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => navigate(ROUTES.PROFILE)}
                  className="w-full text-xs gap-1.5"
                >
                  <Settings size={13} /> Update Profile Goals
                </Button>
              </div>
            )}

            {rightActiveTab === "resources" && (
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Curated Textbooks & Video Lectures
                </span>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      Introduction to Algorithms (CLRS)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Chapter 24: Single-Source Shortest Paths (pp. 643-683).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      MIT 6.006 Lecture 16
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Dijkstra with Fibonacci Heaps by Prof. Erik Demaine.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {rightActiveTab === "quiz" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Quick Diagnostic Drill
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">
                    Why does Dijkstra fail on negative edge weights?
                  </h4>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => showToast("Incorrect. Min-heap works fine with negative values.")}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-300"
                  >
                    A. Priority queue cannot store negative numbers
                  </button>
                  <button
                    onClick={() => showToast("Correct! Settled vertices cannot be relaxed again.")}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-300"
                  >
                    B. Greedy choice assumes settled nodes never get shorter
                  </button>
                  <button
                    onClick={() => showToast("Incorrect. That is only for negative cycles.")}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-300"
                  >
                    C. It enters an infinite loop unconditionally
                  </button>
                </div>
                <Button
                  variant="primary"
                  onClick={() => navigate(ROUTES.QUIZ)}
                  className="w-full text-xs gap-1.5"
                >
                  <Play size={13} /> Launch Full Quiz Lab
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Share Conversation Modal */}
      {shareModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setShareModalOpen(false)}
          title="Share Conversation"
          className="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Anyone with this link will be able to view this tutoring session, code snippets, and generated flashcards.
            </p>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
              <span className="truncate flex-1">
                https://learngraph.ai/share/{activeThread.id}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://learngraph.ai/share/${activeThread.id}`);
                  showToast("Copied public link to clipboard!");
                  setShareModalOpen(false);
                }}
                className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-semibold"
              >
                Copy Link
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AITutorPage;
