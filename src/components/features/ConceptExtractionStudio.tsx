import { useState } from "react";
import {
  FileText,
  Sparkles,
  Upload,
  Layers,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Copy,
  Clock,
  Gauge,
  Code2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import {
  conceptExtractionApi,
  SAMPLE_DOCUMENTS,
} from "@/api/conceptExtraction";
import type { ConceptExtractionResult } from "@/types/conceptExtraction";

interface ConceptExtractionStudioProps {
  onBuildGraph?: (extracted: ConceptExtractionResult) => void;
  onGenerateFlashcards?: (extracted: ConceptExtractionResult) => void;
  onStartQuiz?: (extracted: ConceptExtractionResult) => void;
}

export function ConceptExtractionStudio({
  onBuildGraph,
  onGenerateFlashcards,
  onStartQuiz,
}: ConceptExtractionStudioProps) {
  const [inputText, setInputText] = useState(SAMPLE_DOCUMENTS.dijkstra.rawText);
  const [titleHint, setTitleHint] = useState(SAMPLE_DOCUMENTS.dijkstra.title);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] =
    useState<ConceptExtractionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showJsonRaw, setShowJsonRaw] = useState(false);
  const [selectedSample, setSelectedSample] = useState<"dijkstra" | "calculus" | "neural_networks">("dijkstra");

  const handleSelectSample = (key: "dijkstra" | "calculus" | "neural_networks") => {
    setSelectedSample(key);
    setInputText(SAMPLE_DOCUMENTS[key].rawText);
    setTitleHint(SAMPLE_DOCUMENTS[key].title);
  };

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    setIsExtracting(true);
    try {
      const result = await conceptExtractionApi.extractConcepts(inputText, titleHint);
      setExtractedData(result);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopyJson = () => {
    if (!extractedData) return;
    navigator.clipboard.writeText(JSON.stringify(extractedData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
              <Sparkles size={18} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              AI Concept Extraction Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Turn Any Material into Structured Knowledge
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-2xl">
            Input lecture notes, transcripts, or textbooks. The engine extracts core concepts, definitions, formulas, algorithms, dependencies, and learning objectives without duplicates.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[var(--muted)]">Try Sample:</span>
          <button
            onClick={() => handleSelectSample("dijkstra")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSample === "dijkstra"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-[var(--soft)] hover:bg-[var(--line)] text-[var(--foreground)]"
            }`}
          >
            Graph Traversal
          </button>
          <button
            onClick={() => handleSelectSample("calculus")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSample === "calculus"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-[var(--soft)] hover:bg-[var(--line)] text-[var(--foreground)]"
            }`}
          >
            Calculus Limits
          </button>
          <button
            onClick={() => handleSelectSample("neural_networks")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSample === "neural_networks"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-[var(--soft)] hover:bg-[var(--line)] text-[var(--foreground)]"
            }`}
          >
            Deep Learning
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-[var(--foreground)]">
                <FileText size={16} className="text-indigo-600" />
                Input Document / Lecture Notes
              </label>
              <div className="flex items-center gap-2">
                <label className="text-xs cursor-pointer px-2.5 py-1 rounded-md bg-[var(--soft)] hover:bg-[var(--line)] text-[var(--foreground)] flex items-center gap-1.5 transition-colors">
                  <Upload size={13} />
                  <span>Attach PDF / Slides</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.pptx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setTitleHint(file.name.replace(/\.[^/.]+$/, ""));
                        setInputText(
                          `[Extracted from uploaded file: ${file.name}]\n` +
                            SAMPLE_DOCUMENTS.dijkstra.rawText
                        );
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <input
              type="text"
              placeholder="Document or Topic Title (optional)"
              value={titleHint}
              onChange={(e) => setTitleHint(e.target.value)}
              className="w-full mb-3 px-3.5 py-2 text-sm rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <textarea
              rows={11}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw lecture text, book chapters, YouTube video transcript, or exam syllabus..."
              className="w-full p-3.5 text-sm font-mono leading-relaxed rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-[var(--muted)]">
                {inputText.length} characters · ~{Math.round(inputText.split(/\s+/).length)} words
              </span>
              <Button
                variant="primary"
                onClick={handleExtract}
                disabled={isExtracting || !inputText.trim()}
                className="gap-2 shadow-md shadow-indigo-600/25"
              >
                {isExtracting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Extracting Knowledge...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Extract Concepts (JSON)
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {!extractedData && !isExtracting && (
            <div className="h-full min-h-[380px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[var(--line)] text-center bg-[var(--surface)]/50">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-4">
                <Layers size={28} />
              </div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                Ready for Extraction
              </h3>
              <p className="text-xs text-[var(--muted)] max-w-sm mt-1 mb-5">
                Click <strong>"Extract Concepts (JSON)"</strong> to decompose the content into atomic concepts, formulas, algorithms, and graph relationships.
              </p>
              <Button variant="secondary" onClick={handleExtract}>
                Run Demo Extraction
              </Button>
            </div>
          )}

          {isExtracting && (
            <div className="h-full min-h-[380px] flex flex-col items-center justify-center p-8 rounded-2xl border border-[var(--line)] text-center bg-[var(--surface)]">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-600/20 border-t-indigo-600 animate-spin" />
                <Sparkles size={22} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
              </div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                Deconstructing Educational Concepts
              </h3>
              <div className="flex flex-col gap-1.5 mt-3 text-xs text-[var(--muted)] text-left">
                <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={14} /> Normalizing terminology & definitions
                </span>
                <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 animate-pulse">
                  <Sparkles size={14} /> Extracting algorithmic mechanics & formulas
                </span>
                <span className="flex items-center gap-2 text-[var(--muted)]">
                  <Clock size={14} /> Resolving prerequisite dependencies
                </span>
              </div>
            </div>
          )}

          {extractedData && !isExtracting && (
            <div className="flex flex-col gap-4">
              {/* Summary Card */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag tone="purple">{extractedData.subject}</Tag>
                      <Tag tone="blue">
                        <Gauge size={12} className="mr-1 inline" />
                        {extractedData.difficulty}
                      </Tag>
                      <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                        <Clock size={12} />
                        {extractedData.estimated_learning_time}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--foreground)]">
                      {extractedData.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyJson}
                      title="Copy Raw JSON"
                      className="p-2 rounded-lg bg-[var(--soft)] hover:bg-[var(--line)] text-[var(--foreground)] transition-colors text-xs flex items-center gap-1"
                    >
                      {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span>{copied ? "Copied" : "JSON"}</span>
                    </button>
                    <button
                      onClick={() => setShowJsonRaw(!showJsonRaw)}
                      title="Toggle JSON preview"
                      className="p-2 rounded-lg bg-[var(--soft)] hover:bg-[var(--line)] text-[var(--foreground)] transition-colors"
                    >
                      <Code2 size={15} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                  {extractedData.summary}
                </p>

                {/* Next Steps CTA Strip */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--line)]">
                  <Button
                    variant="primary"
                    onClick={() => onBuildGraph?.(extractedData)}
                    className="gap-1.5 text-xs py-1.5 px-3 shadow-sm"
                  >
                    <Layers size={14} />
                    Build Knowledge Graph
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onGenerateFlashcards?.(extractedData)}
                    className="gap-1.5 text-xs py-1.5 px-3"
                  >
                    <BookOpen size={14} />
                    Flashcards ({extractedData.concepts.length})
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onStartQuiz?.(extractedData)}
                    className="gap-1.5 text-xs py-1.5 px-3"
                  >
                    <ArrowRight size={14} />
                    Diagnostic Quiz
                  </Button>
                </div>
              </div>

              {/* Raw JSON Collapsible */}
              {showJsonRaw && (
                <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] max-h-72 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold text-indigo-500">
                      Standardized Output JSON
                    </span>
                    <button
                      onClick={() => setShowJsonRaw(false)}
                      className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-0.5"
                    >
                      Close <ChevronUp size={13} />
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(extractedData, null, 2)}
                  </pre>
                </div>
              )}

              {/* Extracted Concepts Cards */}
              <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted)] px-1">
                  <span>EXTRACTED CONCEPTS ({extractedData.concepts.length})</span>
                  <span>PREVENTED DUPLICATES: ACTIVE</span>
                </div>

                {extractedData.concepts.map((concept, idx) => (
                  <div
                    key={concept.name}
                    className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] hover:border-indigo-500/40 transition-all flex flex-col gap-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-[var(--foreground)]">
                          {concept.name}
                        </h4>
                      </div>
                      {concept.category && (
                        <Tag tone="zinc">{concept.category}</Tag>
                      )}
                    </div>

                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                      {concept.definition}
                    </p>

                    {(concept.formula || concept.time_complexity) && (
                      <div className="flex flex-wrap items-center gap-2 mt-1 pt-2 border-t border-[var(--line)]/60 text-xs font-mono">
                        {concept.formula && (
                          <span className="px-2 py-0.5 rounded bg-[var(--soft)] text-indigo-600 dark:text-indigo-400">
                            f(x): {concept.formula}
                          </span>
                        )}
                        {concept.time_complexity && (
                          <span className="px-2 py-0.5 rounded bg-[var(--soft)] text-amber-600 dark:text-amber-400">
                            Time: {concept.time_complexity}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Prerequisites & Objectives */}
                <div className="p-3.5 rounded-xl bg-[var(--soft)]/60 border border-[var(--line)] text-xs flex flex-col gap-2">
                  <div>
                    <strong className="text-[var(--foreground)] block mb-1">
                      Identified Prerequisites:
                    </strong>
                    <div className="flex flex-wrap gap-1.5">
                      {extractedData.prerequisites.map((p) => (
                        <Tag key={p} tone="amber">
                          {p}
                        </Tag>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong className="text-[var(--foreground)] block mt-1 mb-1">
                      Learning Objectives:
                    </strong>
                    <ul className="list-disc list-inside space-y-0.5 text-[var(--muted)]">
                      {extractedData.learning_objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
