import { useState } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  Layers,
  Copy,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  GitFork,
  HelpCircle,
  Network,
  Sigma,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { aiFeaturesApi } from "@/api/aiFeatures";
import type { DeepPdfAnalysisResult } from "@/types/aiFeatures";

interface DeepPdfAnalyzerProps {
  onBack?: () => void;
}

export function DeepPdfAnalyzer({ onBack }: DeepPdfAnalyzerProps) {
  const [filename, setFilename] = useState("Dijkstra_Shortest_Path_Analysis.pdf");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DeepPdfAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "mindmap" | "notes" | "pitfalls" | "formulas" | "json"
  >("overview");
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (customFilename?: string) => {
    setIsAnalyzing(true);
    const target = customFilename || filename;
    try {
      const data = await aiFeaturesApi.analyzePdfDeep({ filename: target });
      setResult(data);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilename(file.name);
      handleAnalyze(file.name);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
            <FileText size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Deep Document Intelligence
              </span>
              <Tag tone="blue">PDF · DOCX · PPTX</Tag>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Comprehensive PDF & Note Analyzer
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="secondary" className="py-1 px-3 text-xs" onClick={onBack}>
              Back
            </Button>
          )}
          {result && (
            <div className="flex items-center rounded-xl bg-[var(--soft)] p-1 border border-[var(--line)] overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1 rounded-lg ${activeTab === "overview" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("mindmap")}
                className={`px-3 py-1 rounded-lg ${activeTab === "mindmap" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"}`}
              >
                Mind Map
              </button>
              <button
                onClick={() => setActiveTab("formulas")}
                className={`px-3 py-1 rounded-lg ${activeTab === "formulas" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"}`}
              >
                Formulas
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-3 py-1 rounded-lg ${activeTab === "notes" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"}`}
              >
                Study Notes
              </button>
              <button
                onClick={() => setActiveTab("pitfalls")}
                className={`px-3 py-1 rounded-lg ${activeTab === "pitfalls" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"}`}
              >
                Weak Concepts
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`px-3 py-1 rounded-lg ${activeTab === "json" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"}`}
              >
                JSON Packet
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload & Run Strip */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[var(--soft)] hover:bg-[var(--line)] text-xs font-semibold flex items-center gap-2 border border-[var(--line)] transition-colors">
            <Upload size={15} />
            <span>Upload Document</span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx,.pptx,.txt"
              onChange={handleFileUpload}
            />
          </label>
          <span className="text-xs text-[var(--muted)] truncate max-w-xs font-mono">
            {filename}
          </span>
        </div>

        <Button
          variant="primary"
          className="w-full sm:w-auto py-2.5 px-4 text-xs shadow-md shadow-blue-600/20 gap-2"
          onClick={() => handleAnalyze()}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Deconstructing Document Packet...
            </>
          ) : (
            <>
              <Sparkles size={14} /> Analyze & Generate Study Packet
            </>
          )}
        </Button>
      </div>

      {/* Results View */}
      {!result && !isAnalyzing && (
        <div className="h-64 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[var(--line)] text-center bg-[var(--surface)]/50">
          <FileText size={32} className="text-blue-600 mb-2" />
          <h3 className="text-sm font-bold">No Document Analyzed Yet</h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mt-1 mb-3">
            Upload notes or click below to analyze sample academic slides into mind maps, formulas, flashcards, and weak concept audits.
          </p>
          <Button variant="secondary" className="py-1 px-3 text-xs" onClick={() => handleAnalyze()}>
            Analyze Sample Document
          </Button>
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Executive Summary */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                  Document Executive Summary
                </span>
                <h3 className="text-lg font-bold text-[var(--foreground)]">
                  {result.documentTitle}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{result.summary}</p>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--line)] text-xs">
                  <span className="font-semibold text-[var(--foreground)]">Prerequisites:</span>
                  {result.prerequisites.map((p) => (
                    <Tag key={p} tone="amber">{p}</Tag>
                  ))}
                </div>
              </div>

              {/* Core Concepts Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[var(--muted)] uppercase">
                  Important Concepts Extracted ({result.important_concepts.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.important_concepts.map((c, i) => (
                    <div
                      key={c.name}
                      className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-[var(--foreground)]">{c.name}</strong>
                        <span className="text-[10px] font-mono text-blue-600">
                          Imp: {(c.importanceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted)] leading-relaxed">{c.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MIND MAP */}
          {activeTab === "mindmap" && (
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <GitFork size={18} className="text-purple-600" />
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  Hierarchical Mind Map: {result.mind_map.rootTopic}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.mind_map.branches.map((b) => (
                  <div
                    key={b.name}
                    className="p-4 rounded-xl bg-[var(--soft)]/50 border border-[var(--line)] space-y-2"
                  >
                    <h4 className="text-xs font-bold text-purple-600">{b.name}</h4>
                    <ul className="space-y-1 text-xs text-[var(--muted)]">
                      {b.subtopics.map((st) => (
                        <li key={st} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FORMULAS */}
          {activeTab === "formulas" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[var(--muted)] uppercase">
                Mathematical Formulas & Invariants ({result.important_formulas.length})
              </h4>
              {result.important_formulas.map((f) => (
                <div
                  key={f.name}
                  className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-bold text-[var(--foreground)]">{f.name}</strong>
                    <Tag tone="purple">Formula</Tag>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--bg)] font-mono text-xs text-indigo-400 border border-[var(--line)]">
                    {f.formula}
                  </div>
                  <p className="text-xs text-[var(--muted)]">{f.explanation}</p>
                  <div className="pt-2 border-t border-[var(--line)] space-y-1">
                    <span className="text-[11px] font-semibold text-[var(--muted)] block">Variables Defined:</span>
                    {Object.entries(f.variables).map(([k, v]) => (
                      <div key={k} className="text-xs font-mono flex gap-2">
                        <span className="text-indigo-500 font-bold">{k}:</span>
                        <span className="text-[var(--muted)]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: STUDY NOTES */}
          {activeTab === "notes" && (
            <div className="space-y-3">
              {result.study_notes.map((n) => (
                <div
                  key={n.heading}
                  className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-2"
                >
                  <h4 className="text-sm font-bold text-[var(--foreground)]">{n.heading}</h4>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{n.content}</p>
                  <div className="pt-2 border-t border-[var(--line)] space-y-1">
                    <strong className="text-[11px] text-blue-600 block">Key Takeaways:</strong>
                    <ul className="list-disc list-inside text-xs text-[var(--muted)] space-y-0.5">
                      {n.keyTakeaways.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: WEAK CONCEPTS / PITFALLS */}
          {activeTab === "pitfalls" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-red-600 uppercase flex items-center gap-1.5">
                <AlertTriangle size={14} /> Potential Conceptual Pitfalls & Weak Concepts
              </h4>
              {result.weak_concepts.map((w) => (
                <div
                  key={w.concept}
                  className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-bold text-red-700 dark:text-red-300">
                      {w.concept}
                    </strong>
                    <Tag tone="red">Common Fallacy</Tag>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    <strong>Pitfall:</strong> {w.pitfallExplanation}
                  </p>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-200">
                    <strong>Remediation Advice:</strong> {w.remediationAdvice}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: JSON PACKET */}
          {activeTab === "json" && (
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-600">
                  Full Analyzed Document Packet JSON
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1 rounded-lg bg-[var(--soft)] hover:bg-[var(--line)] text-xs flex items-center gap-1.5"
                >
                  {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copied ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[var(--bg)] font-mono text-xs text-blue-400 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
