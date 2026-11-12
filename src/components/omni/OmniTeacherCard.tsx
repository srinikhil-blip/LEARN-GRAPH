/**
 * OmniTeacherCard.tsx
 * Full 13-section deep pedagogical response card for LearnGraph Omni.
 * Renders the structured output of generateOmniTeacherResponse().
 */

import { useState } from "react";
import {
  BookOpen,
  Brain,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  Map,
  Rocket,
  Star,
  Target,
  Triangle,
  AlertTriangle,
  Zap,
  BookMarked,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { OmniTeacherResult } from "@/utils/omniTeacherEngine";

/* ─────────────────────────────────────────────────────────────────────────────
   Props
───────────────────────────────────────────────────────────────────────────── */
interface OmniTeacherCardProps {
  result: OmniTeacherResult;
  onFollowUp: (prompt: string) => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Small reusable sub-components
───────────────────────────────────────────────────────────────────────────── */

/** Collapsible section wrapper */
function Section({
  id,
  icon,
  label,
  tone = "slate",
  defaultOpen = false,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  tone?: "indigo" | "emerald" | "amber" | "rose" | "blue" | "purple" | "slate";
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const toneClasses: Record<string, string> = {
    indigo: "text-indigo-600 dark:text-indigo-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    slate: "text-slate-700 dark:text-slate-300",
  };
  const borderClasses: Record<string, string> = {
    indigo: "border-indigo-200 dark:border-indigo-900/60",
    emerald: "border-emerald-200 dark:border-emerald-900/60",
    amber: "border-amber-200 dark:border-amber-900/60",
    rose: "border-rose-200 dark:border-rose-900/60",
    blue: "border-blue-200 dark:border-blue-900/60",
    purple: "border-purple-200 dark:border-purple-900/60",
    slate: "border-slate-200 dark:border-slate-800",
  };

  return (
    <div
      className={`rounded-2xl border ${borderClasses[tone]} bg-white/70 dark:bg-slate-900/60 overflow-hidden`}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-xs ${toneClasses[tone]} hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}
      >
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-xs text-slate-700 dark:text-slate-300 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

/** Code block with copy button */
function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800">
        <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-3 text-[11px] font-mono bg-slate-900 text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

/** Interactive mini quiz option */
function QuizOption({
  text,
  index,
  selected,
  correctIndex,
  revealed,
  onSelect,
}: {
  text: string;
  index: number;
  selected: number | null;
  correctIndex: number;
  revealed: boolean;
  onSelect: (i: number) => void;
}) {
  const labels = ["A", "B", "C", "D"];
  const isSelected = selected === index;
  const isCorrect = index === correctIndex;

  let cls = "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
  if (revealed) {
    if (isCorrect) cls = "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold";
    else if (isSelected) cls = "border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200";
  } else if (isSelected) {
    cls = "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 font-semibold";
  }

  return (
    <button
      onClick={() => onSelect(index)}
      disabled={revealed}
      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs transition-all ${cls}`}
    >
      <span className="shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-[10px]">
        {labels[index]}
      </span>
      <span className="flex-1">{text}</span>
      {revealed && isCorrect && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
      {revealed && isSelected && !isCorrect && <XCircle size={14} className="text-rose-500 shrink-0" />}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main OmniTeacherCard
───────────────────────────────────────────────────────────────────────────── */
export function OmniTeacherCard({ result, onFollowUp }: OmniTeacherCardProps) {
  const { studentContextGreeting, subjectDomain, sections: s } = result;

  // Mini quiz state
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizRevealed, setQuizRevealed] = useState(false);

  // Practice Q reveal state (index → revealed)
  const [revealedPractice, setRevealedPractice] = useState<Record<number, boolean>>({});

  const togglePractice = (i: number) =>
    setRevealedPractice((prev) => ({ ...prev, [i]: !prev[i] }));

  const handleQuizSelect = (i: number) => {
    setQuizSelected(i);
    setQuizRevealed(true);
  };

  const resourceTypeIcon: Record<string, string> = {
    Book: "📗",
    Paper: "📄",
    Documentation: "🔗",
    Lecture: "🎓",
  };

  return (
    <div className="mt-5 space-y-3">
      {/* ── Context Greeting Banner ── */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-900/60">
        <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
          <Brain size={18} className="text-white" />
        </div>
        <div className="space-y-0.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
            LearnGraph Omni · {subjectDomain}
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug whitespace-pre-wrap">
            {studentContextGreeting}
          </p>
        </div>
      </div>

      {/* ── Roadmap Widget (optional) ── */}
      {s.roadmap && (
        <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-white/80 dark:bg-slate-900/60 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-2">
            <Map size={16} className="text-white" />
            <span className="text-xs font-bold text-white">{s.roadmap.title}</span>
            <span className="ml-auto text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">
              {s.roadmap.estimatedDuration}
            </span>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              🎯 Target Outcome: <span className="text-slate-700 dark:text-slate-300 font-medium">{s.roadmap.targetOutcome}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {s.roadmap.phases.map((phase, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                      Phase {i + 1} · {phase.phase}
                    </span>
                    <span className="text-[9px] text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                      {phase.duration}
                    </span>
                  </div>
                  <ul className="space-y-0.5">
                    {phase.topics.map((t) => (
                      <li key={t} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  {phase.milestones.length > 0 && (
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium flex items-start gap-1">
                      <Star size={10} className="mt-0.5 shrink-0" />
                      {phase.milestones[0]}
                    </div>
                  )}
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 flex items-start gap-1">
                    <Code2 size={10} className="mt-0.5 shrink-0" />
                    <span className="font-medium">Exercise:</span>&nbsp;{phase.handsOnExercise}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900/60">
              <Rocket size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                Capstone Project: {s.roadmap.capstoneProject}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 1. Simple Explanation ── */}
      <Section id="simple" icon={<Lightbulb size={14} />} label="💡 Simple Explanation" tone="indigo" defaultOpen>
        <p className="leading-relaxed">{s.simpleExplanation}</p>
      </Section>

      {/* ── 2. Detailed Explanation ── */}
      <Section id="detail" icon={<BookOpen size={14} />} label="📖 Detailed Explanation" tone="blue">
        <p className="leading-relaxed">{s.detailedExplanation}</p>
      </Section>

      {/* ── 3. Intuition ── */}
      <Section id="intuition" icon={<Brain size={14} />} label="🧠 Intuition & Mental Model" tone="purple">
        <p className="leading-relaxed italic">{s.intuition}</p>
      </Section>

      {/* ── 4. Real-world Example ── */}
      <Section id="realworld" icon={<Target size={14} />} label="🌍 Real-World Example" tone="emerald">
        <p className="leading-relaxed">{s.realWorldExample}</p>
      </Section>

      {/* ── 5. Diagram ── */}
      <Section id="diagram" icon={<Map size={14} />} label="📐 Visual Diagram" tone="slate">
        <div className="relative">
          <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed whitespace-pre">
            {s.diagram}
          </pre>
        </div>
      </Section>

      {/* ── 6. Formula (conditional) ── */}
      {s.formula && (
        <Section id="formula" icon={<Triangle size={14} />} label="🔢 Mathematical Formula" tone="amber">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 font-mono text-[12px] text-amber-900 dark:text-amber-300 whitespace-pre-wrap">
            {s.formula}
          </div>
        </Section>
      )}

      {/* ── 7. Code Example (conditional) ── */}
      {s.codeExample && (
        <Section id="code" icon={<Code2 size={14} />} label="💻 Code Example" tone="slate">
          <CodeBlock language={s.codeExample.language} code={s.codeExample.code} />
          <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-400">
            {s.codeExample.explanation}
          </p>
        </Section>
      )}

      {/* ── 8. Common Mistakes ── */}
      <Section id="mistakes" icon={<AlertTriangle size={14} />} label="⚠️ Common Mistakes" tone="rose">
        <div className="space-y-2">
          {s.commonMistakes.map((m, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50"
            >
              <XCircle size={13} className="text-rose-500 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{m}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 9. Practice Questions ── */}
      <Section id="practice" icon={<HelpCircle size={14} />} label="✍️ Practice Questions" tone="blue">
        <div className="space-y-3">
          {s.practiceQuestions.map((pq, i) => (
            <div key={i} className="rounded-xl border border-blue-200 dark:border-blue-900/50 overflow-hidden">
              <div className="px-3 py-2.5 bg-blue-50 dark:bg-blue-950/30 flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="font-medium leading-relaxed">{pq.question}</span>
              </div>
              <div className="px-3 py-2 space-y-2">
                <details className="text-slate-500 dark:text-slate-400">
                  <summary className="cursor-pointer text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <Lightbulb size={12} /> Reveal Hint
                  </summary>
                  <p className="mt-1.5 text-[11px] leading-relaxed pl-4 border-l-2 border-blue-300">{pq.hint}</p>
                </details>
                <button
                  onClick={() => togglePractice(i)}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <CheckCircle2 size={12} />
                  {revealedPractice[i] ? "Hide Solution" : "Reveal Full Solution"}
                </button>
                {revealedPractice[i] && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed whitespace-pre-wrap">
                    {pq.solution}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 10. Mini Quiz ── */}
      <Section id="quiz" icon={<Zap size={14} />} label="🎯 Interactive Mini Quiz" tone="indigo">
        <div className="space-y-3">
          <p className="font-medium leading-relaxed">{s.miniQuiz.question}</p>
          <div className="space-y-2">
            {s.miniQuiz.options.map((opt, i) => (
              <QuizOption
                key={i}
                text={opt}
                index={i}
                selected={quizSelected}
                correctIndex={s.miniQuiz.correctIndex}
                revealed={quizRevealed}
                onSelect={handleQuizSelect}
              />
            ))}
          </div>
          {!quizRevealed && (
            <p className="text-[10px] text-slate-400">Select an answer to check your understanding.</p>
          )}
          {quizRevealed && (
            <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
              quizSelected === s.miniQuiz.correctIndex
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300"
            }`}>
              <span className="font-bold">
                {quizSelected === s.miniQuiz.correctIndex ? "✅ Correct! " : "❌ Incorrect. "}
              </span>
              {s.miniQuiz.explanation}
            </div>
          )}
        </div>
      </Section>

      {/* ── 11. Related Topics ── */}
      <Section id="related" icon={<BookMarked size={14} />} label="🔗 Related Topics" tone="purple">
        <div className="flex flex-wrap gap-2">
          {s.relatedTopics.map((t) => (
            <button
              key={t}
              onClick={() => onFollowUp(`Explain ${t} in detail with examples`)}
              className="px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
            >
              {t} →
            </button>
          ))}
        </div>
      </Section>

      {/* ── 12. Next Topic Recommendation ── */}
      <Section id="next" icon={<Rocket size={14} />} label="🚀 Next Recommended Topic" tone="emerald">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
          <div className="shrink-0 w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
            <Rocket size={15} className="text-white" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-emerald-800 dark:text-emerald-300">
              {s.nextTopicRecommendation.topic}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {s.nextTopicRecommendation.reason}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500">
                ⏱ {s.nextTopicRecommendation.estimatedTime}
              </span>
              <button
                onClick={() => onFollowUp(`Teach me ${s.nextTopicRecommendation.topic} in detail`)}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Start learning →
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 13. Learning Resources ── */}
      <Section id="resources" icon={<BookOpen size={14} />} label="📚 Learning Resources" tone="amber">
        <div className="space-y-2">
          {s.learningResources.map((r, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50"
            >
              <span className="text-base">{resourceTypeIcon[r.type] || "📄"}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-amber-900 dark:text-amber-300 truncate">{r.title}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{r.citation}</div>
              </div>
              <span className="shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400">
                {r.type}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-amber-100 dark:border-amber-900/40">
          <button
            onClick={() => onFollowUp(`Give me more learning resources and YouTube playlists for ${result.subjectDomain}`)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline"
          >
            <ExternalLink size={12} /> Get more resources →
          </button>
        </div>
      </Section>
    </div>
  );
}

export default OmniTeacherCard;
