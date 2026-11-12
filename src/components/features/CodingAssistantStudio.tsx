import { useState } from "react";
import {
  Code2,
  Terminal,
  ShieldCheck,
  Zap,
  Bug,
  Sparkles,
  Copy,
  CheckCircle2,
  HelpCircle,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { orchestratorApi } from "@/api/orchestrator";
import type {
  SupportedLanguage,
  CodingAssistantResponse,
} from "@/types/orchestrator";

const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  "Python",
  "Java",
  "C",
  "C++",
  "JavaScript",
  "TypeScript",
  "SQL",
];

interface CodingAssistantStudioProps {
  onBack?: () => void;
}

export function CodingAssistantStudio({ onBack }: CodingAssistantStudioProps) {
  const [language, setLanguage] = useState<SupportedLanguage>("Python");
  const [task, setTask] = useState<"explain_algorithm" | "debug_code" | "optimize_code" | "generate_examples">("explain_algorithm");
  const [userPrompt, setUserPrompt] = useState("Explain and implement Dijkstra's algorithm with a binary min-heap.");
  const [isProcessing, setIsProcessing] = useState(false);
  const [codeResponse, setCodeResponse] = useState<CodingAssistantResponse | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [revealedSolution, setRevealedSolution] = useState<Record<number, boolean>>({});

  const handleRunCodeAssistant = async () => {
    setIsProcessing(true);
    setRevealedSolution({});
    try {
      const data = await orchestratorApi.codeAssistant({
        language,
        task,
        prompt: userPrompt,
      });
      setCodeResponse(data);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!codeResponse) return;
    navigator.clipboard.writeText(codeResponse.codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
            <Terminal size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                ChatGPT-Style Engineering Assistant
              </span>
              <Tag tone="purple">Multi-Language Execution</Tag>
              <Tag tone="emerald">
                <ShieldCheck size={12} className="inline mr-1" /> Safe Code Only
              </Tag>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Algorithmic Code Studio & Debugger
            </h2>
          </div>
        </div>

        {onBack && (
          <Button variant="secondary" className="py-1 px-3 text-xs" onClick={onBack}>
            Back
          </Button>
        )}
      </div>

      {/* Language Selector & Task Tabs */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-4">
        {/* Language Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-[var(--muted)] mr-2">Language:</span>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  language === lang
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-[var(--soft)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Task Type Tabs */}
          <div className="flex items-center rounded-xl bg-[var(--soft)] p-1 border border-[var(--line)] text-xs font-semibold">
            <button
              onClick={() => setTask("explain_algorithm")}
              className={`px-3 py-1 rounded-lg ${task === "explain_algorithm" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"}`}
            >
              Algorithm Logic
            </button>
            <button
              onClick={() => setTask("debug_code")}
              className={`px-3 py-1 rounded-lg ${task === "debug_code" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"}`}
            >
              Debug & Fix
            </button>
            <button
              onClick={() => setTask("optimize_code")}
              className={`px-3 py-1 rounded-lg ${task === "optimize_code" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"}`}
            >
              Optimize
            </button>
          </div>
        </div>

        {/* Input Box */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Describe algorithm, paste code to debug, or ask for an asymptotic breakdown..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--foreground)]"
          />
          <Button
            variant="primary"
            className="py-2.5 px-5 text-xs shadow-md shadow-indigo-600/20 gap-2 shrink-0"
            onClick={handleRunCodeAssistant}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Analyzing Code...
              </>
            ) : (
              <>
                <Code2 size={15} /> Execute Assistant
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Results View */}
      {!codeResponse && !isProcessing && (
        <div className="h-64 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[var(--line)] text-center bg-[var(--surface)]/50">
          <Code2 size={32} className="text-indigo-600 mb-2" />
          <h3 className="text-sm font-bold">Ready to Analyze or Implement Code</h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mt-1 mb-3">
            Ask any programming question in Python, Java, C++, TypeScript, or SQL. Get clean algorithms, complexity derivations, and security assurances.
          </p>
          <Button variant="secondary" className="py-1 px-3 text-xs" onClick={handleRunCodeAssistant}>
            Run Demo Analysis
          </Button>
        </div>
      )}

      {codeResponse && !isProcessing && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Code Editor & Explanation */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm overflow-hidden flex flex-col">
              {/* Code Header Bar */}
              <div className="px-4 py-3 bg-[var(--soft)]/70 border-b border-[var(--line)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 ml-2">
                    {codeResponse.language} Solution Snippet
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--line)] text-xs flex items-center gap-1.5 transition-colors border border-[var(--line)]"
                >
                  {copiedCode ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              {/* Code Editor Body */}
              <div className="p-4 bg-[var(--bg)] font-mono text-xs text-emerald-400 overflow-x-auto max-h-[460px] whitespace-pre-wrap leading-relaxed select-text">
                {codeResponse.codeSnippet}
              </div>

              {/* Security Verification Notice */}
              <div className="p-3 bg-emerald-500/10 border-t border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <span>{codeResponse.securityNotice}</span>
              </div>
            </div>

            {/* Explanation Card */}
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-600" /> Engineering Walkthrough
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed whitespace-pre-wrap font-sans">
                {codeResponse.explanation}
              </p>
            </div>
          </div>

          {/* Right Column: Complexity, Optimization, Debugging, Practice */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Complexity Analysis Gauge */}
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                <Cpu size={14} className="text-purple-600" /> Asymptotic Complexity Breakdown
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-[var(--soft)]/60 border border-[var(--line)] space-y-1">
                  <span className="text-[10px] text-[var(--muted)] block">Time Complexity:</span>
                  <strong className="text-sm font-mono text-purple-600 dark:text-purple-400 block">
                    {codeResponse.complexity.timeComplexity}
                  </strong>
                  <p className="text-[11px] text-[var(--muted)] leading-tight">
                    {codeResponse.complexity.timeExplanation}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--soft)]/60 border border-[var(--line)] space-y-1">
                  <span className="text-[10px] text-[var(--muted)] block">Space Complexity:</span>
                  <strong className="text-sm font-mono text-indigo-600 dark:text-indigo-400 block">
                    {codeResponse.complexity.spaceComplexity}
                  </strong>
                  <p className="text-[11px] text-[var(--muted)] leading-tight">
                    {codeResponse.complexity.spaceExplanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Optimization & Debugging Advice */}
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500" /> Optimization & Debugging Advice
              </h4>

              <div className="space-y-1.5 text-xs">
                <strong className="text-[11px] text-amber-600 block">Optimization Techniques:</strong>
                <ul className="list-disc list-inside text-[11px] text-[var(--muted)] space-y-0.5">
                  {codeResponse.optimizationTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-[var(--line)] space-y-1.5 text-xs">
                <strong className="text-[11px] text-red-600 block flex items-center gap-1">
                  <Bug size={12} /> Debugging Traps to Avoid:
                </strong>
                <ul className="list-disc list-inside text-[11px] text-[var(--muted)] space-y-0.5">
                  {codeResponse.debuggingAdvice.map((dbg, idx) => (
                    <li key={idx}>{dbg}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Practice Questions */}
            {codeResponse.practiceQuestions.length > 0 && (
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-emerald-600" /> Practice Challenges
                </h4>

                {codeResponse.practiceQuestions.map((pq, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[var(--soft)]/50 border border-[var(--line)] space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <strong className="text-[var(--foreground)]">{pq.title}</strong>
                      <Tag tone="emerald">{pq.difficulty}</Tag>
                    </div>
                    <p className="text-[11px] text-[var(--muted)]">{pq.description}</p>
                    <div className="p-2 rounded bg-[var(--bg)] font-mono text-[10px] text-emerald-400">
                      <pre>{pq.starterSnippet}</pre>
                    </div>

                    {revealedSolution[idx] ? (
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 font-mono text-[11px] text-emerald-800 dark:text-emerald-200">
                        <pre>{pq.solutionSnippet}</pre>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRevealedSolution((prev) => ({ ...prev, [idx]: true }))}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Reveal Solution
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
