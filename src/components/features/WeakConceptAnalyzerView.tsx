import { useState } from "react";
import {
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Clock,
  ArrowRight,
  CheckCircle2,
  Copy,
  RotateCcw,
  BookOpen,
  HelpCircle,
  FileQuestion,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { orchestratorApi } from "@/api/orchestrator";
import type { WeakConceptDetectorResult } from "@/types/orchestrator";

interface WeakConceptAnalyzerViewProps {
  onBack?: () => void;
  onLaunchRemedialQuiz?: (concept: string) => void;
}

export function WeakConceptAnalyzerView({
  onBack,
  onLaunchRemedialQuiz,
}: WeakConceptAnalyzerViewProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<WeakConceptDetectorResult | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "json">("analysis");
  const [copied, setCopied] = useState(false);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const data = await orchestratorApi.analyzeWeakConcepts();
      setAnalysisResult(data);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/25">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Cognitive Gap Diagnosis
              </span>
              <Tag tone="red">Mistake & Pattern Detection</Tag>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Weak Concept & Error Pattern Detector
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="secondary" className="py-1 px-3 text-xs" onClick={onBack}>
              Back
            </Button>
          )}
          {analysisResult && (
            <div className="flex items-center rounded-xl bg-[var(--soft)] p-1 border border-[var(--line)]">
              <button
                onClick={() => setActiveTab("analysis")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  activeTab === "analysis" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"
                }`}
              >
                Diagnostic Report
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  activeTab === "json" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"
                }`}
              >
                Output JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Strip */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            Audit Learning History & Quiz Logs
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Analyzes test attempts, solving times, repeated wrong choices, and skipped curriculum topics.
          </p>
        </div>

        <Button
          variant="primary"
          className="py-2.5 px-4 text-xs shadow-md shadow-red-600/20 gap-2 shrink-0"
          onClick={handleRunAudit}
          disabled={isAuditing}
        >
          {isAuditing ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Auditing Error Trajectories...
            </>
          ) : (
            <>
              <Sparkles size={14} /> Run Weak Concept Analysis
            </>
          )}
        </Button>
      </div>

      {/* Main Results View */}
      {!analysisResult && !isAuditing && (
        <div className="h-64 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[var(--line)] text-center bg-[var(--surface)]/50">
          <ShieldAlert size={32} className="text-red-500 mb-2" />
          <h3 className="text-sm font-bold">No Audit Performed Yet</h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mt-1 mb-3">
            Click <strong>"Run Weak Concept Analysis"</strong> to inspect repeated error patterns, severity ratings, and customized remedial roadmaps.
          </p>
          <Button variant="secondary" className="py-1 px-3 text-xs" onClick={handleRunAudit}>
            Run Sample Mistake Audit
          </Button>
        </div>
      )}

      {analysisResult && !isAuditing && (
        <>
          {activeTab === "analysis" ? (
            <div className="space-y-6">
              {/* Executive Summary Banner */}
              <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-950 dark:text-red-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-red-700 dark:text-red-300">
                    <TrendingDown size={16} /> Audit Executive Summary
                  </span>
                  <Tag tone="red">
                    {analysisResult.totalQuizzesAudited} Assessments Audited
                  </Tag>
                </div>
                <p className="leading-relaxed">{analysisResult.globalImprovementPlan}</p>
                <div className="pt-2 border-t border-red-500/20 flex flex-wrap gap-2 text-xs">
                  <span className="font-semibold">Skipped Curriculum Topics:</span>
                  {analysisResult.skippedTopics.map((st) => (
                    <Tag key={st} tone="zinc">{st}</Tag>
                  ))}
                </div>
              </div>

              {/* Weak Concepts Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--muted)] uppercase">
                  Identified Knowledge Gaps ({analysisResult.weakConcepts.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysisResult.weakConcepts.map((item) => {
                    const isCrit = item.severity === "Critical";
                    const isHigh = item.severity === "High";

                    return (
                      <div
                        key={item.concept}
                        className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 shadow-xs ${
                          isCrit
                            ? "bg-red-500/5 border-red-500/30"
                            : isHigh
                            ? "bg-amber-500/5 border-amber-500/30"
                            : "bg-[var(--surface)] border-[var(--line)]"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <Tag tone={isCrit ? "red" : isHigh ? "amber" : "blue"}>
                              {item.severity} Severity
                            </Tag>
                            <span className="text-[10px] font-mono text-[var(--muted)]">
                              {(item.confidence * 100).toFixed(0)}% conf
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-[var(--foreground)]">
                            {item.concept}
                          </h4>

                          <p className="text-xs text-[var(--muted)] leading-relaxed">
                            <strong>Diagnostic Reason:</strong> {item.reason}
                          </p>

                          <div className="p-2.5 rounded-xl bg-[var(--soft)]/60 text-[11px] space-y-1">
                            <strong className="block text-[var(--foreground)]">
                              Remedial Roadmap:
                            </strong>
                            {item.suggestedLearningPath.map((step, sIdx) => (
                              <div key={sIdx} className="text-[var(--muted)]">
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-xs">
                          <span className="text-[var(--muted)] flex items-center gap-1">
                            <Clock size={12} /> {item.estimatedImprovementTime}
                          </span>
                          {onLaunchRemedialQuiz && (
                            <button
                              onClick={() => onLaunchRemedialQuiz(item.concept)}
                              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5"
                            >
                              Remediate <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Repeated Error Patterns Table */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
                  <FileQuestion size={15} className="text-red-500" />
                  Repeated Mistake Analysis ({analysisResult.repeatedErrorPatterns.length})
                </h4>

                <div className="space-y-2.5">
                  {analysisResult.repeatedErrorPatterns.map((err, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[var(--soft)]/50 border border-[var(--line)] text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-[var(--foreground)] font-semibold">
                          Quiz: {err.quizTitle}
                        </strong>
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-bold text-[10px]">
                          Repeated {err.frequency}x
                        </span>
                      </div>
                      <p className="text-[var(--muted)]">
                        <strong>Question:</strong> {err.questionText}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                        <div className="p-2 rounded bg-red-500/10 text-red-700 dark:text-red-300">
                          ✗ Student Choice: {err.userAnswer}
                        </div>
                        <div className="p-2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          ✓ Correct: {err.correctAnswer}
                        </div>
                      </div>
                      <p className="text-red-600 dark:text-red-400 font-medium pt-1 text-[11px]">
                        Cognitive Pattern: {err.errorPattern}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Output JSON */
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-red-600">
                  Weak Concept Detector Output JSON
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(analysisResult, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1 rounded-lg bg-[var(--soft)] hover:bg-[var(--line)] text-xs flex items-center gap-1.5"
                >
                  {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copied ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[var(--bg)] font-mono text-xs text-red-400 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(analysisResult, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
