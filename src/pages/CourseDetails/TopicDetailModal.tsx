import { useState } from "react";
import {
  X,
  BookOpen,
  Clock3,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Award,
  ChevronLeft,
  ChevronRight,
  Code2,
  HelpCircle,
  Bookmark,
  Share2,
  Layers,
  GraduationCap,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import type { TopicCurriculumPayload } from "@/services/topicCurriculumEngine";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { userProgressService } from "@/services/userProgressService";

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

interface TopicDetailModalProps {
  topicData: TopicCurriculumPayload | null;
  onClose: () => void;
  onMarkCompleted?: (topicId: string) => void;
  isCompleted?: boolean;
  onNextTopic?: () => void;
  onPrevTopic?: () => void;
  hasNextTopic?: boolean;
  hasPrevTopic?: boolean;
}

export function TopicDetailModal({
  topicData,
  onClose,
  onMarkCompleted,
  isCompleted = false,
  onNextTopic,
  onPrevTopic,
  hasNextTopic = false,
  hasPrevTopic = false,
}: TopicDetailModalProps) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<
    "overview" | "theory" | "examples" | "visuals" | "exam_tips" | "references" | "videos" | "practice" | "ai_tutor"
  >("overview");

  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [aiGeneratingAction, setAiGeneratingAction] = useState<string | null>(null);
  const [aiResultText, setAiResultText] = useState<string | null>(null);

  if (!topicData) return null;

  const toggleHint = (qId: string) => {
    setRevealedHints((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const toggleSolution = (qId: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSelectAnswer = (qId: string, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleAiAction = (actionLabel: string, promptInstruction: string) => {
    setAiGeneratingAction(actionLabel);
    // Simulate real pedagogical generation or navigate to AI Tutor
    setTimeout(() => {
      setAiGeneratingAction(null);
      setAiResultText(
        `Generated ${actionLabel} for "${topicData.topicTitle}":\n\n` +
          `• Core Objective: Complete mastery of ${topicData.topicTitle} in ${topicData.chapterTitle}.\n` +
          `• Pedagogical Rule: ${topicData.theory.axiomsAndCoreLaws[0] || "Maintain invariant consistency."}\n` +
          `• High-Yield Insight: ${topicData.keyTakeaways[0] || "Prune sub-optimal states early."}\n\n` +
          `Would you like to open the full interactive AI Tutor chat? Click "Open in AI Tutor" below.`
      );
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-fadeIn">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{topicData.subject}</span>
              <span>·</span>
              <span className="truncate max-w-[200px]">{topicData.chapterTitle}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-600 shrink-0" />
              <span>{topicData.topicTitle}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {onMarkCompleted && (
              <Button
                variant={isCompleted ? "secondary" : "primary"}
                onClick={() => onMarkCompleted(topicData.topicId)}
                className="gap-1.5 text-xs py-1.5"
              >
                <CheckCircle2 size={14} className={isCompleted ? "text-emerald-500" : ""} />
                {isCompleted ? "Completed" : "Mark as Done"}
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Strip */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-semibold scrollbar-none bg-white dark:bg-slate-900">
          {[
            { id: "overview", label: "Overview & Objectives" },
            { id: "theory", label: "Theory & Derivations" },
            { id: "examples", label: "Worked Examples" },
            { id: "visuals", label: "Visual Diagrams" },
            { id: "exam_tips", label: "Exam & Interview Tips" },
            { id: "references", label: `References (${topicData.references.length})` },
            { id: "videos", label: `YouTube Lectures (${topicData.youtubeVideos.length})` },
            { id: "practice", label: `Practice & PYQs (${topicData.practiceQuestions.length})` },
            { id: "ai_tutor", label: "AI Tutor Studio" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
                activeSection === tab.id
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Section 1: Overview & Learning Objectives */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* Meta stats banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated Study Time</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Clock3 size={13} className="text-indigo-500" /> {topicData.estimatedStudyTimeMinutes} minutes
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Difficulty Rating</span>
                  <Tag tone={topicData.difficultyLevel === "Beginner" ? "emerald" : topicData.difficultyLevel === "Intermediate" ? "indigo" : "rose"}>
                    {topicData.difficultyLevel}
                  </Tag>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Subject Domain</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                    {topicData.subject}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Academic Tier</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                    {topicData.tier}
                  </span>
                </div>
              </div>

              {/* Topic Overview */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Lightbulb size={16} className="text-amber-500" /> Topic Overview
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {topicData.overview}
                </p>
              </div>

              {/* Learning Objectives */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Award size={16} className="text-indigo-600" /> Key Learning Objectives
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {topicData.learningObjectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prerequisites & Real-World Applications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-indigo-500" /> Prerequisites
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {topicData.prerequisites.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-emerald-500" /> Real-World Applications
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {topicData.realWorldApplications.map((app, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{app}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Detailed Theory & Progressive Explanation */}
          {activeSection === "theory" && (
            <div className="space-y-6">
              {/* Introduction & Motivation */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  1. Foundational Motivation & First Principles
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {topicData.theory.introduction}
                </p>
              </div>

              {/* Intuitive Analogy Box */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Lightbulb size={14} /> Intuitive Mental Model / Analogy
                </h4>
                <p className="text-xs text-amber-900/80 dark:text-amber-200/90 leading-relaxed italic">
                  "{topicData.theory.analogy}"
                </p>
              </div>

              {/* Axioms and Governing Laws */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  2. Governing Axioms, Laws & Invariant Constraints
                </h3>
                <div className="space-y-2">
                  {topicData.theory.axiomsAndCoreLaws.map((law, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">[{idx + 1}]</span>
                      <span>{law}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deep Dive & Derivations */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  3. Analytical Progression & Invariant Mechanics
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {topicData.theory.deepDiveText}
                </p>

                {topicData.theory.mathematicalDerivations && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Mathematical Formulations & Derivations
                    </span>
                    <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs space-y-1 overflow-x-auto">
                      {topicData.theory.mathematicalDerivations.map((eq, i) => (
                        <div key={i}>{eq}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Example if applicable */}
                {topicData.theory.codeExample && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Code2 size={13} /> Code Implementation ({topicData.theory.codeExample.language})
                    </span>
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                      <code>{topicData.theory.codeExample.code}</code>
                    </pre>
                    <p className="text-[11px] text-slate-500 italic">
                      {topicData.theory.codeExample.explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Complexity Metrics Strip */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Time Complexity / Convergence</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                    {topicData.theory.timeComplexity || "O(1) localized"}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Space Complexity / Overhead</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {topicData.theory.spaceComplexity || "O(1) localized"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Worked Examples */}
          {activeSection === "examples" && (
            <div className="space-y-6">
              {topicData.workedExamples.map((ex, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{ex.title}</h4>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
                      Exemplar #{idx + 1}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Problem Statement</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {ex.problem}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Given Parameters</span>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5">
                      {ex.given.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step-by-Step Derivation</span>
                    <div className="space-y-2">
                      {ex.steps.map((st) => (
                        <div key={st.stepNumber} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                              {st.stepNumber}
                            </span>
                            <span>{st.description}</span>
                          </div>
                          {st.formulaOrCode && (
                            <pre className="font-mono text-[11px] bg-slate-900 text-emerald-400 p-2 rounded-lg overflow-x-auto">
                              <code>{st.formulaOrCode}</code>
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Final Verified Solution</span>
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">{ex.solution}</p>
                    <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 italic pt-0.5">
                      💡 {ex.keyInsight}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 4: Visual Diagrams */}
          {activeSection === "visuals" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {topicData.visualDiagram.title}
                  </h4>
                  <Tag tone="indigo">{topicData.visualDiagram.diagramType}</Tag>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                  <pre>{topicData.visualDiagram.asciiOrSvg}</pre>
                </div>

                <p className="text-xs text-slate-500 italic text-center">
                  {topicData.visualDiagram.caption}
                </p>
              </div>

              {/* Dynamic Knowledge Graph Preview */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Concept Graph Relational Map
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  {topicData.knowledgeGraph.prerequisites.map((p, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-medium">
                      Prereq: {p}
                    </span>
                  ))}
                  <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs">
                    ★ {topicData.topicTitle}
                  </span>
                  {topicData.knowledgeGraph.connectedConcepts.map((c, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                      Related: {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Exam & Interview Tips */}
          {activeSection === "exam_tips" && (
            <div className="space-y-6">
              {/* Important Notes */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-500" /> High-Yield Important Notes
                </h4>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {topicData.importantNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Mistakes & Pitfalls */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Common Mistakes & Invariant Pitfalls
                </h4>
                <div className="space-y-2.5">
                  {topicData.commonMistakes.map((cm, i) => (
                    <div key={i} className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-xs space-y-2">
                      <div className="font-bold text-rose-700 dark:text-rose-300">
                        ⚠️ Mistake: {cm.mistake}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        <strong className="text-slate-700 dark:text-slate-300">Why it happens:</strong> {cm.whyItHappens}
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-300 font-medium">
                        ✓ Correct Approach: {cm.correctApproach}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Interview Questions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Technical Interview Questions & Model Answers
                </h4>
                <div className="space-y-3">
                  {topicData.interviewQuestions.map((iq, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100">Q{i + 1}: {iq.question}</span>
                        <Tag tone="indigo">{iq.companyOrBoard}</Tag>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg leading-relaxed">
                        <strong className="text-slate-800 dark:text-slate-200 block mb-1">Model Answer:</strong>
                        {iq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitive Exam Shortcuts & Memory Tricks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs space-y-2">
                  <h5 className="font-bold text-indigo-700 dark:text-indigo-300 uppercase">Competitive Exam Shortcuts</h5>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    {topicData.competitiveExamTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-500 font-bold">⚡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 text-xs space-y-2">
                  <h5 className="font-bold text-purple-700 dark:text-purple-300 uppercase">Memory Tricks & Mnemonics</h5>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    {topicData.memoryTricks.map((trick, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-purple-500 font-bold">🧠</span>
                        <span>{trick}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Curated References */}
          {activeSection === "references" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Authoritative reference textbooks, research papers, documentation specifications, and coding platforms curated for this syllabus.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topicData.references.map((ref, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Tag tone={ref.type === "book" ? "indigo" : ref.type === "documentation" ? "emerald" : "violet"}>
                          {ref.type.toUpperCase()}
                        </Tag>
                        {ref.isEssential && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">★ Essential</span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{ref.title}</h4>
                      <p className="text-[11px] text-slate-500">{ref.authorOrSource}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                        {ref.description}
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      onClick={() => window.open(ref.url, "_blank", "noopener,noreferrer")}
                      className="w-full text-xs gap-1.5 mt-2"
                    >
                      <ExternalLink size={13} /> Open Reference Resource
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 7: YouTube Video Section */}
          {activeSection === "videos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Verified educational video lectures from MIT OCW, Khan Academy, 3Blue1Brown, Gate Smashers, and NPTEL.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topicData.youtubeVideos.map((vid) => (
                  <div key={vid.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono">
                        {vid.duration}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{vid.title}</h4>
                      <p className="text-[11px] text-slate-500">{vid.channelName}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {vid.description}
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => window.open(vid.youtubeUrl, "_blank", "noopener,noreferrer")}
                      className="w-full text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white py-2"
                    >
                      <ExternalLink size={13} /> Watch on YouTube
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 8: Practice & Diagnostic Assessment */}
          {activeSection === "practice" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Topic Practice Questions & Previous Year Questions
                </span>
                <Button
                  variant="primary"
                  onClick={() => {
                    onClose();
                    navigate(`${ROUTES.QUIZ}?topic=${encodeURIComponent(topicData.topicTitle)}`);
                  }}
                  className="text-xs gap-1.5 py-1.5"
                >
                  <Play size={13} fill="currentColor" /> Launch Full Quiz Mode
                </Button>
              </div>

              <div className="space-y-4">
                {topicData.practiceQuestions.map((pq, idx) => {
                  const isHintRevealed = revealedHints[pq.id];
                  const isSolutionRevealed = revealedSolutions[pq.id];
                  const chosenAnswer = selectedAnswers[pq.id];

                  return (
                    <div key={pq.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <Tag tone={pq.type === "pyq" ? "amber" : "indigo"}>
                            {pq.examTag || pq.type.toUpperCase()}
                          </Tag>
                        </div>
                        <span className="text-[11px] text-slate-400">{pq.estimatedMinutes} min</span>
                      </div>

                      <p className="text-xs font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                        {pq.question}
                      </p>

                      {/* Options if MCQ / PYQ */}
                      {pq.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {pq.options.map((opt, oIdx) => {
                            const isSelected = chosenAnswer === opt;
                            const isCorrect = isSolutionRevealed && opt === pq.correctAnswer;
                            const isWrong = isSolutionRevealed && isSelected && opt !== pq.correctAnswer;

                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleSelectAnswer(pq.id, opt)}
                                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                                  isCorrect
                                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-semibold"
                                    : isWrong
                                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200"
                                    : isSelected
                                    ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-700 dark:text-indigo-300 font-medium"
                                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                <span className="font-mono text-slate-400 mr-2">({String.fromCharCode(65 + oIdx)})</span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Action buttons: Hint & Solution */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button
                          variant="secondary"
                          onClick={() => toggleHint(pq.id)}
                          className="text-xs py-1 px-2.5 gap-1 text-amber-600 dark:text-amber-400"
                        >
                          <Lightbulb size={13} /> {isHintRevealed ? "Hide Hint" : "Need a Hint?"}
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={() => toggleSolution(pq.id)}
                          className="text-xs py-1 px-2.5 gap-1 text-indigo-600 dark:text-indigo-400"
                        >
                          <HelpCircle size={13} /> {isSolutionRevealed ? "Hide Solution" : "View Explanation"}
                        </Button>
                      </div>

                      {/* Hint Reveal */}
                      {isHintRevealed && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 animate-fadeIn">
                          <strong>💡 Hint:</strong> {pq.hint}
                        </div>
                      )}

                      {/* Solution Reveal */}
                      {isSolutionRevealed && (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 animate-fadeIn">
                          <div className="font-bold text-emerald-600 dark:text-emerald-400">
                            ✓ Correct Answer: {pq.correctAnswer}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {pq.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 9: AI Tutor Studio */}
          {activeSection === "ai_tutor" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-600" />
                  Interactive AI Tutor Action Studio
                </h4>
                <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80">
                  Select any cognitive action below. The AI Tutor has loaded the full context for "{topicData.topicTitle}".
                </p>
              </div>

              {/* 14 Interactive AI Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {[
                  { label: "Explain Again", prompt: "Explain this topic from a fresh angle with alternative metaphors." },
                  { label: "Explain Simpler", prompt: "Explain this topic like I am a complete beginner with zero background knowledge." },
                  { label: "Explain with Examples", prompt: "Give 3 comprehensive step-by-step real world worked examples." },
                  { label: "Generate Notes", prompt: "Generate high-yield bulleted revision notes for this topic." },
                  { label: "Generate Flashcards", prompt: "Create 10 active recall flashcards with question and answer pairs." },
                  { label: "Generate Mind Map", prompt: "Create an ASCII text hierarchy mind map of this entire topic." },
                  { label: "Generate Quiz", prompt: "Generate a 5-question diagnostic checkpoint quiz on this topic." },
                  { label: "Generate Assignment", prompt: "Design a comprehensive academic synthesis problem set." },
                  { label: "Generate Coding Problem", prompt: "Create a practical programming challenge testing this concept." },
                  { label: "Generate Interview Qs", prompt: "List top 5 technical interview questions asked at top tech companies." },
                  { label: "Generate Revision Notes", prompt: "Summarize the highest yield formulas and theorems for fast exam revision." },
                  { label: "Generate Formula Sheet", prompt: "Compile every formula, constant, and derivation equation into a quick sheet." },
                  { label: "Generate Cheat Sheet", prompt: "Create a one-page condensed cheat sheet with edge-case traps." },
                  { label: "Ask Custom Question", prompt: "Teach me how this concept connects to the next advanced syllabus module." },
                ].map((act, idx) => (
                  <button
                    key={idx}
                    disabled={aiGeneratingAction !== null}
                    onClick={() => handleAiAction(act.label, act.prompt)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-left transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-2xs flex items-center justify-between"
                  >
                    <span>{act.label}</span>
                    <Sparkles size={12} className="text-indigo-500 opacity-60" />
                  </button>
                ))}
              </div>

              {/* Display Generated AI Result */}
              {aiGeneratingAction && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-3 animate-pulse">
                  <RotateCcw size={14} className="text-indigo-600 animate-spin" />
                  <span>AI Tutor is analyzing topic invariants and generating {aiGeneratingAction}...</span>
                </div>
              )}

              {aiResultText && !aiGeneratingAction && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} /> AI Tutor Output
                    </span>
                    <Button
                      variant="primary"
                      onClick={() =>
                        navigate(
                          `${ROUTES.AI_TUTOR}?prompt=${encodeURIComponent(
                            `Teach me "${topicData.topicTitle}" from ${topicData.chapterTitle} in depth.`
                          )}`
                        )
                      }
                      className="text-xs py-1 gap-1"
                    >
                      Open Full AI Tutor Chat <ChevronRight size={13} />
                    </Button>
                  </div>
                  <pre className="text-xs text-slate-700 dark:text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                    {aiResultText}
                  </pre>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {onPrevTopic && (
              <Button
                variant="secondary"
                disabled={!hasPrevTopic}
                onClick={onPrevTopic}
                className="text-xs py-1.5 gap-1"
              >
                <ChevronLeft size={14} /> Previous Topic
              </Button>
            )}
            {onNextTopic && (
              <Button
                variant="secondary"
                disabled={!hasNextTopic}
                onClick={onNextTopic}
                className="text-xs py-1.5 gap-1"
              >
                Next Topic <ChevronRight size={14} />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} className="text-xs py-1.5">
              Close Reader
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                navigate(`${ROUTES.QUIZ}?topic=${encodeURIComponent(topicData.topicTitle)}`);
              }}
              className="text-xs py-1.5 gap-1.5"
            >
              <Play size={13} fill="currentColor" /> Take Topic Quiz
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
