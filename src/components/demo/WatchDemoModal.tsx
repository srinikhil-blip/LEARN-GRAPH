import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  BookOpen,
  BrainCircuit,
  Bot,
  Target,
  Flame,
  Trophy,
  Activity,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

export interface WatchDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  keyFeatures: string[];
  icon: typeof Sparkles;
  accentTone: "indigo" | "emerald" | "cyan" | "amber" | "violet" | "rose";
  previewType:
    | "auth"
    | "curriculum"
    | "explanation"
    | "graph"
    | "pathway"
    | "tutor"
    | "streak"
    | "quiz"
    | "dashboard";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "auth",
    badge: "01 / 09 • Onboarding",
    title: "Instant Student Onboarding & Profiles",
    subtitle: "Zero-state architecture with persistent cryptographic identity",
    description:
      "Learners sign in to an authenticated workspace tailored to their academic level. Every student starts with a clean baseline and progresses through verified activity.",
    keyFeatures: [
      "Role-based authentication (Student, Educator, Administrator)",
      "Timezone-aware learning tracking (Asia/Kolkata default)",
      "Strict zero-state: no artificial metrics or fake statistics",
    ],
    icon: Sparkles,
    accentTone: "indigo",
    previewType: "auth",
  },
  {
    id: "curriculum",
    badge: "02 / 09 • Universal Library",
    title: "Universal Course Library",
    subtitle: "Complete authentic syllabus from School through Postgraduate",
    description:
      "Explore 213+ fully structured courses across School (CBSE, ICSE, State Boards), B.Tech Engineering, Sciences, Commerce, and Competitive Exams (JEE, NEET, UPSC, GATE).",
    keyFeatures: [
      "Exhaustive 60+ chapter curricula (e.g. Full DSA syllabus)",
      "No truncated placeholders; genuine topic and unit breakdowns",
      "Dynamic roadmaps with sequential topic navigation",
    ],
    icon: BookOpen,
    accentTone: "cyan",
    previewType: "curriculum",
  },
  {
    id: "explanation",
    badge: "03 / 09 • AI Explanations",
    title: "AI-Generated 20-Facet Explanations",
    subtitle: "Textbook-quality explanations calibrated to your cognitive level",
    description:
      "Each topic provides mathematical proofs, worked examples, intuitive real-world analogies, code implementations, common pitfalls, and memory tricks.",
    keyFeatures: [
      "Rich LaTeX mathematical rendering and KaTeX formulas",
      "Code sandboxes with step-by-step algorithmic analysis",
      "Competitive exam tips and interview question banks",
    ],
    icon: Layers,
    accentTone: "violet",
    previewType: "explanation",
  },
  {
    id: "graph",
    badge: "04 / 09 • Knowledge Graph",
    title: "Living Knowledge Graph",
    subtitle: "Interactive 2D & 3D semantic mapping of concepts and prerequisites",
    description:
      "Visualize your cognitive progress through an evolving graph. Mastered concepts glow green, improving links shift yellow, and prerequisites are clearly traced.",
    keyFeatures: [
      "Neo4j-powered semantic concept network with dependency edges",
      "Immediate visual detection of prerequisite knowledge gaps",
      "Multi-dimensional zoom and concept neighborhood exploration",
    ],
    icon: BrainCircuit,
    accentTone: "emerald",
    previewType: "graph",
  },
  {
    id: "pathway",
    badge: "05 / 09 • Adaptive Pathways",
    title: "Personalized Learning Pathways",
    subtitle: "Dynamic sequence optimization based on actual retention",
    description:
      "No linear lockstep. LearnGraph computes the shortest path to concept mastery by targeting foundational weaknesses before advanced topics are introduced.",
    keyFeatures: [
      "Dynamic study plan generated from diagnostic checkpoints",
      "Spaced-repetition scheduling for long-term retention",
      "Remedial lesson recommendations based on quiz gaps",
    ],
    icon: Target,
    accentTone: "indigo",
    previewType: "pathway",
  },
  {
    id: "tutor",
    badge: "06 / 09 • Socratic Tutor",
    title: "Context-Aware AI Tutor Studio",
    subtitle: "Multimodal 24/7 personal mentor grounded in your learning context",
    description:
      "Engage in deep Socratic dialogue. AI Tutor doesn't just hand out answers—it guides you through problem-solving steps, evaluates code, and creates targeted diagrams.",
    keyFeatures: [
      "Interactive code debugging and step-by-step math solver",
      "Audio speech synthesis and voice explanation capabilities",
      "PDF textbook assistant with citation retrieval",
    ],
    icon: Bot,
    accentTone: "cyan",
    previewType: "tutor",
  },
  {
    id: "streak",
    badge: "07 / 09 • Daily Learning Streak",
    title: "Persistent Daily Learning Streak",
    subtitle: "Activity-validated streak engine with timezone & midnight handling",
    description:
      "Streaks increment strictly from qualifying learning activity (completing a lesson or quiz), not passive page visits. Server-authoritative timestamps protect your hard-earned streak.",
    keyFeatures: [
      "1 qualifying day per calendar date with midnight boundary safety",
      "Permanent longest streak record preserved across logout/devices",
      "Milestone celebrations for 3, 7, 14, 30, 50, and 100 days",
    ],
    icon: Flame,
    accentTone: "amber",
    previewType: "streak",
  },
  {
    id: "quiz",
    badge: "08 / 09 • Quiz Lab & Mastery",
    title: "Quiz Lab & Adaptive Mastery Tracking",
    subtitle: "Real-time diagnostic assessment with Bloom's taxonomy leveling",
    description:
      "Assess understanding through adaptive quizzes. Instantly review detailed rationales for every option, see accuracy ratings, and monitor concept mastery score shifts.",
    keyFeatures: [
      "Timed adaptive questions spanning Foundation, Medium, and Olympiad",
      "Comprehensive breakdown of correct, incorrect, and skipped items",
      "Automatic feeding into Knowledge Graph mastery percentages",
    ],
    icon: Trophy,
    accentTone: "rose",
    previewType: "quiz",
  },
  {
    id: "dashboard",
    badge: "09 / 09 • Progress Dashboard",
    title: "Student Progress Dashboard",
    subtitle: "Unified command center for daily goals, focus time, and certs",
    description:
      "Track overall mastery percentage, weekly focus hours, mapped concepts, active course milestones, and verified completion certificates—all updated in real time.",
    keyFeatures: [
      "Live focus time logger and activity spark charts",
      "Course progress indicators with resume-lesson shortcuts",
      "Downloadable and verifiable graduation certificates",
    ],
    icon: Activity,
    accentTone: "emerald",
    previewType: "dashboard",
  },
];

export function WatchDemoModal({ isOpen, onClose }: WatchDemoModalProps) {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState(7);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Stop playback and reset on close
  const handleClose = useCallback(() => {
    setIsPlaying(false);
    onClose();
  }, [onClose]);

  // Keyboard navigation & accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight") {
        setCurrentStepIndex((prev) => Math.min(TOUR_STEPS.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  // Auto-play timer for interactive product tour
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setAutoAdvanceSeconds((prev) => {
        if (prev <= 1) {
          setCurrentStepIndex((idx) => {
            if (idx >= TOUR_STEPS.length - 1) {
              setIsPlaying(false);
              return idx;
            }
            return idx + 1;
          });
          return 7;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  // Reset auto-advance countdown when step manually changes
  useEffect(() => {
    setAutoAdvanceSeconds(7);
  }, [currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Reached the end
      navigate(ROUTES.REGISTER);
      handleClose();
    }
  };

  const handlePrevious = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const handleGetStarted = () => {
    handleClose();
    navigate(ROUTES.REGISTER);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={handleClose} aria-hidden="true" />

      {/* Main Responsive Modal Card */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[var(--surface,#131622)] text-[var(--ink,#f8fafc)] shadow-2xl border border-[var(--line,#2a2f42)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--line,#2a2f42)] bg-[var(--surface-raised,#171b2c)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <Play size={14} fill="currentColor" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Interactive Product Demo
                </span>
                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[var(--muted,#64748b)]" />
                <span className="hidden sm:inline-block text-xs text-[var(--muted,#94a3b8)]">
                  LearnGraph Platform Walkthrough
                </span>
              </div>
              <p id="demo-modal-title" className="text-sm font-medium text-[var(--ink,#f8fafc)]">
                Step {currentStepIndex + 1} of {TOUR_STEPS.length}: {currentStep.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Auto-Play Toggle */}
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                isPlaying
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-[var(--soft,#1e2337)] text-[var(--muted,#94a3b8)] hover:text-[var(--ink,#f8fafc)] border-[var(--line,#2a2f42)]"
              )}
              title={isPlaying ? "Pause auto-tour" : "Play auto-tour"}
              aria-label={isPlaying ? "Pause auto-tour" : "Play auto-tour"}
            >
              {isPlaying ? (
                <>
                  <Pause size={13} fill="currentColor" />
                  <span className="hidden xs:inline">Pause ({autoAdvanceSeconds}s)</span>
                </>
              ) : (
                <>
                  <Play size={13} fill="currentColor" />
                  <span className="hidden xs:inline">Auto Play</span>
                </>
              )}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="p-1.5 rounded-lg text-[var(--muted,#94a3b8)] hover:text-[var(--ink,#f8fafc)] hover:bg-[var(--soft,#1e2337)] transition-colors border border-[var(--line,#2a2f42)]"
              title={isMuted ? "Unmute narration" : "Mute narration"}
              aria-label={isMuted ? "Unmute narration" : "Mute narration"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* Restart Button */}
            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg text-[var(--muted,#94a3b8)] hover:text-[var(--ink,#f8fafc)] hover:bg-[var(--soft,#1e2337)] transition-colors border border-[var(--line,#2a2f42)]"
              title="Restart demo from beginning"
              aria-label="Restart demo"
            >
              <RotateCcw size={15} />
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-[var(--muted,#94a3b8)] hover:text-[var(--ink,#f8fafc)] hover:bg-[var(--soft,#1e2337)] transition-colors ml-1"
              title="Close demo (Esc)"
              aria-label="Close demo"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 9-Step Progress Rail */}
        <div className="w-full bg-[var(--soft,#1a1e30)] h-1 flex">
          {TOUR_STEPS.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => setCurrentStepIndex(idx)}
              className={cn(
                "flex-1 h-full cursor-pointer transition-all duration-300",
                idx === currentStepIndex
                  ? "bg-indigo-500"
                  : idx < currentStepIndex
                  ? "bg-indigo-400/50"
                  : "bg-transparent hover:bg-white/10"
              )}
              title={`Jump to ${step.title}`}
            />
          ))}
        </div>

        {/* Modal Body: Split Presentation (Interactive Visual on Left/Top, Explanation on Right/Bottom) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Interactive Feature Visual Stage (Left / Top: 7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-center">
            <div className="relative rounded-2xl bg-[var(--surface-raised,#171b2d)] border border-[var(--line,#2a2f43)] p-4 sm:p-5 shadow-inner overflow-hidden min-h-[260px] sm:min-h-[300px] flex flex-col justify-between">
              {/* Subtle Ambient Background Glow */}
              <div
                className={cn(
                  "absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl opacity-25 pointer-events-none transition-colors duration-500",
                  currentStep.accentTone === "indigo" && "bg-indigo-500",
                  currentStep.accentTone === "emerald" && "bg-emerald-500",
                  currentStep.accentTone === "cyan" && "bg-cyan-500",
                  currentStep.accentTone === "amber" && "bg-amber-500",
                  currentStep.accentTone === "violet" && "bg-violet-500",
                  currentStep.accentTone === "rose" && "bg-rose-500"
                )}
              />

              {/* Dynamic Feature Visual by Tour Step */}
              <TourVisualRenderer previewType={currentStep.previewType} />

              {/* Bottom Visual Indicator Footer */}
              <div className="mt-4 pt-3 border-t border-[var(--line,#2a2f43)]/60 flex items-center justify-between text-xs text-[var(--muted,#94a3b8)]">
                <span className="flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE SYSTEM INTERACTIVE SIMULATION
                </span>
                <span>{currentStep.badge}</span>
              </div>
            </div>
          </div>

          {/* Explanation & Deep-Dive Information (Right / Bottom: 5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <Tag tone={currentStep.accentTone}>
                <currentStep.icon size={13} /> {currentStep.badge}
              </Tag>

              <h2 className="text-xl sm:text-2xl font-bold mt-2 text-[var(--ink,#f8fafc)] leading-snug">
                {currentStep.title}
              </h2>

              <p className="text-xs sm:text-sm font-medium text-indigo-400 mt-1">
                {currentStep.subtitle}
              </p>

              <p className="text-xs sm:text-sm text-[var(--muted,#94a3b8)] mt-2.5 leading-relaxed">
                {currentStep.description}
              </p>

              <div className="mt-4 space-y-2">
                <p className="text-xs uppercase tracking-wider font-semibold text-[var(--muted,#64748b)]">
                  Key Capabilities
                </p>
                {currentStep.keyFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[var(--ink,#f1f5f9)]">
                    <span className="mt-0.5 flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400">
                      <Check size={11} />
                    </span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Pill Navigation */}
            <div className="pt-2 flex items-center gap-1.5 flex-wrap">
              {TOUR_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all",
                    idx === currentStepIndex
                      ? "bg-indigo-500 text-white border-indigo-400"
                      : "bg-[var(--soft,#1b1f33)] text-[var(--muted,#94a3b8)] border-[var(--line,#2a2f42)] hover:text-white"
                  )}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-5 py-4 border-t border-[var(--line,#2a2f42)] bg-[var(--surface-raised,#171b2c)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="text-xs sm:text-sm"
            >
              <ArrowLeft size={15} /> Previous
            </Button>
            <Button
              onClick={handleNext}
              className="text-xs sm:text-sm"
            >
              {currentStepIndex < TOUR_STEPS.length - 1 ? (
                <>
                  Next <ArrowRight size={15} />
                </>
              ) : (
                <>
                  Complete Tour <Check size={15} />
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted,#94a3b8)] hidden sm:inline">
              Ready to experience LearnGraph?
            </span>
            <Button
              onClick={handleGetStarted}
              className="bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 text-xs sm:text-sm shadow-md"
            >
              Get Started Free <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Mock Visual Stage for each product feature
// ─────────────────────────────────────────────────────────────────────────────
function TourVisualRenderer({ previewType }: { previewType: TourStep["previewType"] }) {
  switch (previewType) {
    case "auth":
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--line,#2a2f43)]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-xs font-semibold">Student Workspace Authentication</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
              VERIFIED 256-BIT JWT
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[var(--soft,#1b2035)] border border-[var(--line,#2a2f43)]">
              <span className="text-[10px] text-[var(--muted,#94a3b8)]">ACTIVE STUDENT</span>
              <p className="font-semibold text-[var(--ink,#f8fafc)] mt-0.5">Alex Chen</p>
              <small className="text-[10px] text-indigo-400">B.Tech Computer Science</small>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--soft,#1b2035)] border border-[var(--line,#2a2f43)]">
              <span className="text-[10px] text-[var(--muted,#94a3b8)]">TIMEZONE RECKONING</span>
              <p className="font-semibold text-emerald-400 mt-0.5">Asia/Kolkata (UTC+5:30)</p>
              <small className="text-[10px] text-[var(--muted,#94a3b8)]">Midnight: Safe boundary</small>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[var(--soft,#1b2035)] border border-indigo-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--ink,#f8fafc)]">Baseline Zero-State Policy</p>
              <p className="text-[10px] text-[var(--muted,#94a3b8)]">New accounts start at 0 days streak, 0% mastery</p>
            </div>
            <span className="text-xs font-bold text-indigo-400 font-mono">0 DAYS</span>
          </div>
        </div>
      );

    case "curriculum":
      return (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--line,#2a2f43)]">
            <span className="text-xs font-semibold">Universal Curriculum Hierarchy</span>
            <span className="text-[10px] text-cyan-400 font-mono">213+ COURSES LOADED</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="p-2 rounded-lg bg-[var(--soft,#1b2035)] border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="font-medium">Data Structures & Algorithms</span>
              </div>
              <span className="text-[10px] text-[var(--muted,#94a3b8)]">61 Chapters • Complete</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--soft,#1b2035)] border border-[var(--line,#2a2f43)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span className="font-medium">Class 10 CBSE Science & Math</span>
              </div>
              <span className="text-[10px] text-[var(--muted,#94a3b8)]">NCERT Aligned</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--soft,#1b2035)] border border-[var(--line,#2a2f43)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="font-medium">UPSC / JEE / GATE Competitive</span>
              </div>
              <span className="text-[10px] text-[var(--muted,#94a3b8)]">PYQ Integrated</span>
            </div>
          </div>
        </div>
      );

    case "explanation":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold border-b border-[var(--line,#2a2f43)] pb-1.5">
            <span>20-Facet Socratic Textbook Reader</span>
            <span className="text-[10px] text-violet-400 font-mono">MATHEMATICAL LATEX</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--soft,#1b2035)] border border-[var(--line,#2a2f43)] text-xs space-y-1.5">
            <div className="font-mono text-indigo-300 text-[11px] p-1.5 rounded bg-black/40 border border-white/5">
              {"f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}"}
            </div>
            <p className="text-[11px] text-[var(--muted,#94a3b8)]">
              <strong>Worked Example:</strong> Instantaneous rate of change derived from first principles with boundary proofs.
            </p>
          </div>
          <div className="flex gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Intuitive Analogy
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Exam Pitfalls
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Memory Tricks
            </span>
          </div>
        </div>
      );

    case "graph":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold border-b border-[var(--line,#2a2f43)] pb-1.5">
            <span>Living Semantic Knowledge Graph</span>
            <span className="text-[10px] text-emerald-400 font-mono">NEO4J CONNECTED</span>
          </div>
          <div className="h-36 relative flex items-center justify-center rounded-xl bg-black/30 border border-white/5">
            {/* SVG Mini Concept Cluster */}
            <svg viewBox="0 0 300 130" className="w-full h-full">
              <line x1="80" y1="40" x2="150" y2="65" stroke="#334155" strokeWidth="2" />
              <line x1="150" y1="65" x2="220" y2="35" stroke="#10b981" strokeWidth="2" />
              <line x1="150" y1="65" x2="160" y2="105" stroke="#10b981" strokeWidth="2" />
              <line x1="80" y1="40" x2="160" y2="105" stroke="#334155" strokeWidth="1" strokeDasharray="3" />

              <circle cx="80" cy="40" r="18" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
              <text x="80" y="44" fill="#94a3b8" fontSize="8" textAnchor="middle">Calculus</text>

              <circle cx="150" cy="65" r="22" fill="#10b981" stroke="#34d399" strokeWidth="2" />
              <text x="150" y="69" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">Chain Rule</text>

              <circle cx="220" cy="35" r="16" fill="#059669" stroke="#10b981" strokeWidth="2" />
              <text x="220" y="38" fill="#ffffff" fontSize="7" textAnchor="middle">Gradient</text>

              <circle cx="160" cy="105" r="17" fill="#047857" stroke="#10b981" strokeWidth="2" />
              <text x="160" y="108" fill="#ffffff" fontSize="7" textAnchor="middle">Backprop</text>
            </svg>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--muted,#94a3b8)]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Mastered (88%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> In Progress</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" /> Locked Prereq</span>
          </div>
        </div>
      );

    case "pathway":
      return (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold border-b border-[var(--line,#2a2f43)] pb-1.5">
            <span>Adaptive Pathway Optimization</span>
            <span className="text-[10px] text-indigo-400 font-mono">DIAGNOSTIC GUIDED</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase">Immediate Next Milestone</span>
                <p className="font-semibold text-[var(--ink,#f8fafc)]">Master Binary Search Trees</p>
              </div>
              <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-semibold">Priority 1</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--soft,#1b2035)] border border-[var(--line,#2a2f43)] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[var(--muted,#94a3b8)] uppercase">Prerequisite Completed</span>
                <p className="font-medium text-[var(--muted,#94a3b8)]">Pointers & Memory Layout</p>
              </div>
              <Check size={14} className="text-emerald-400" />
            </div>
          </div>
        </div>
      );

    case "tutor":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold border-b border-[var(--line,#2a2f43)] pb-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Bot size={14} /> AI Tutor Socratic Studio
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">ONLINE • 24/7</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-200">
              <p className="font-medium text-[11px]">AI Tutor:</p>
              <p className="text-[11px] mt-0.5">
                "What happens to the search boundary when `arr[mid] &lt; target`? Which half can you discard?"
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--soft,#1b2035)] border border-[var(--line,#2a2f43)] text-[var(--ink,#f8fafc)]">
              <p className="text-[10px] text-[var(--muted,#94a3b8)] font-semibold">Student:</p>
              <p className="text-[11px] mt-0.5">
                "We discard the left half by setting `low = mid + 1`, since all previous elements are smaller!"
              </p>
            </div>
          </div>
        </div>
      );

    case "streak":
      return (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold border-b border-[var(--line,#2a2f43)] pb-1.5">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Flame size={14} /> Real Learning Streak Tracking
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">QUALIFIED ACTIVITY</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-[10px] text-amber-300 font-semibold uppercase">Current Streak</span>
              <p className="text-2xl font-black text-amber-400 mt-1">7 <span className="text-xs font-normal">days</span></p>
              <small className="text-[9px] text-[var(--muted,#94a3b8)]">Active today</small>
            </div>
            <div className="p-3 rounded-xl bg-[var(--soft,#1b2035)] border border-[var(--line,#2a2f43)]">
              <span className="text-[10px] text-[var(--muted,#94a3b8)] font-semibold uppercase">Longest Streak</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">14 <span className="text-xs font-normal">days</span></p>
              <small className="text-[9px] text-[var(--muted,#94a3b8)]">Permanent record</small>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5 text-[10px]">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span
                key={i}
                className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center font-bold",
                  i <= 5 ? "bg-amber-500 text-black" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                )}
              >
                {i <= 5 ? "✓" : d}
              </span>
            ))}
          </div>
        </div>
      );

    case "quiz":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold border-b border-[var(--line,#2a2f43)] pb-1.5">
            <span>Adaptive Quiz Evaluation</span>
            <span className="text-[10px] text-rose-400 font-mono">DIAGNOSTIC RESULTS</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400">Score</span>
              <p className="text-base font-bold text-emerald-300">90%</p>
            </div>
            <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30">
              <span className="text-[10px] text-cyan-400">Mastery</span>
              <p className="text-base font-bold text-cyan-300">+12%</p>
            </div>
            <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/30">
              <span className="text-[10px] text-violet-400">Accuracy</span>
              <p className="text-base font-bold text-violet-300">Proficient</p>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--soft,#1b2035)] border border-[var(--line,#2a2f43)] text-[11px] text-[var(--muted,#94a3b8)]">
            <span className="font-semibold text-[var(--ink,#f8fafc)]">Targeted Feedback:</span> "Exceptional retention on recursive calls; review base cases for negative offsets."
          </div>
        </div>
      );

    case "dashboard":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold border-b border-[var(--line,#2a2f43)] pb-1.5">
            <span>Student Command Center</span>
            <span className="text-[10px] text-emerald-400 font-mono">AUTHENTIC ANALYTICS</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-[var(--soft,#1b2035)] border border-[var(--line,#2a2f43)]">
              <span className="text-[10px] text-[var(--muted,#94a3b8)]">MASTERY</span>
              <p className="text-lg font-bold text-indigo-400">76%</p>
            </div>
            <div className="p-2 rounded-xl bg-[var(--soft,#1b2035)] border border-[var(--line,#2a2f43)]">
              <span className="text-[10px] text-[var(--muted,#94a3b8)]">FOCUS TIME</span>
              <p className="text-lg font-bold text-cyan-400">14.5h</p>
            </div>
            <div className="p-2 rounded-xl bg-[var(--soft,#1b2035)] border border-[var(--line,#2a2f43)]">
              <span className="text-[10px] text-[var(--muted,#94a3b8)]">CONCEPTS</span>
              <p className="text-lg font-bold text-emerald-400">52 / 84</p>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--ink,#f8fafc)]">Certification Ready</p>
              <p className="text-[10px] text-[var(--muted,#94a3b8)]">Complete 2 remaining topics to unlock verified badge</p>
            </div>
            <Trophy size={18} className="text-amber-400" />
          </div>
        </div>
      );
  }
}
