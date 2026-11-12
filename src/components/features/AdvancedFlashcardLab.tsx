import { useState } from "react";
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  Tag as TagIcon,
  Copy,
  CheckCircle2,
  HelpCircle,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { aiFeaturesApi } from "@/api/aiFeatures";
import type { AdvancedFlashcardItem, FlashcardDeckPayload } from "@/types/aiFeatures";

interface AdvancedFlashcardLabProps {
  initialTopic?: string;
  onBack?: () => void;
}

export function AdvancedFlashcardLab({
  initialTopic = "Graph Algorithms & Dijkstra",
  onBack,
}: AdvancedFlashcardLabProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deckPayload, setDeckPayload] = useState<FlashcardDeckPayload | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<"card" | "json">("card");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    try {
      const payload = await aiFeaturesApi.generateAdvancedFlashcards({ topic, count: 6 });
      setDeckPayload(payload);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentCard: AdvancedFlashcardItem | undefined =
    deckPayload?.flashcards[currentIndex] || deckPayload?.flashcards[0];

  const handleNext = () => {
    if (!deckPayload) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deckPayload.flashcards.length);
  };

  const handlePrev = () => {
    if (!deckPayload) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deckPayload.flashcards.length) % deckPayload.flashcards.length);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto p-4 md:p-6">
      {/* Top Banner */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/25">
            <Brain size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Cognitive Encoding Engine
              </span>
              <Tag tone="amber">Memory Tips & Mnemonics</Tag>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Advanced Flashcard Lab
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="secondary" className="py-1 px-3 text-xs" onClick={onBack}>
              Back
            </Button>
          )}
          {deckPayload && (
            <div className="flex items-center rounded-xl bg-[var(--soft)] p-1 border border-[var(--line)]">
              <button
                onClick={() => setActiveTab("card")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  activeTab === "card" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"
                }`}
              >
                3D Cards
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  activeTab === "json" ? "bg-[var(--surface)] shadow-xs" : "text-[var(--muted)]"
                }`}
              >
                Deck JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generator Input Strip */}
      <div className="w-full p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic for flashcards (e.g. Graph Algorithms, Calculus Limits, Neural Networks)..."
          className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--foreground)]"
        />
        <Button
          variant="primary"
          className="py-2 px-4 text-xs shadow-sm gap-2"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? "Synthesizing..." : "Generate Flashcards"}
        </Button>
      </div>

      {!deckPayload && !isGenerating && (
        <div className="w-full h-64 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[var(--line)] text-center bg-[var(--surface)]/50">
          <Sparkles size={28} className="text-amber-500 mb-2" />
          <h3 className="text-sm font-bold">Ready to Generate Active Recall Deck</h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mt-1 mb-3">
            Each flashcard is synthesized with cognitive memory tips, mnemonics, difficulty ratings, and concept categories.
          </p>
          <Button variant="secondary" className="py-1 px-3 text-xs" onClick={handleGenerate}>
            Generate Sample Deck
          </Button>
        </div>
      )}

      {deckPayload && !isGenerating && currentCard && (
        <>
          {activeTab === "card" ? (
            <div className="w-full flex flex-col items-center gap-4">
              {/* Progress & Deck Stats */}
              <div className="w-full flex items-center justify-between text-xs text-[var(--muted)] px-2">
                <span>
                  Deck: <strong>{deckPayload.title}</strong>
                </span>
                <span>
                  Card {currentIndex + 1} of {deckPayload.flashcards.length}
                </span>
              </div>

              {/* 3D Flip Card */}
              <div
                className="w-full min-h-[340px] md:min-h-[380px] perspective-1000 cursor-pointer select-none"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div
                  className={`relative w-full h-full min-h-[340px] md:min-h-[380px] rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 shadow-xl border border-[var(--line)] ${
                    isFlipped
                      ? "bg-gradient-to-br from-amber-500/10 via-[var(--surface)] to-[var(--surface)] border-amber-500/50"
                      : "bg-[var(--surface)] hover:border-amber-500/30"
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Tag tone="amber">{currentCard.category}</Tag>
                      <Tag tone="zinc">{currentCard.difficulty}</Tag>
                    </div>
                    <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                      <Sparkles size={12} className="text-amber-500" />
                      {isFlipped ? "Answer & Memory Encoding" : "Click to flip"}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="my-auto py-4 text-center">
                    {!isFlipped ? (
                      <div className="space-y-3">
                        <HelpCircle size={28} className="mx-auto text-amber-500/70" />
                        <h3 className="text-xl md:text-2xl font-bold text-[var(--foreground)] leading-snug">
                          {currentCard.question}
                        </h3>
                        {/* Tags */}
                        <div className="flex flex-wrap items-center justify-center gap-1 pt-2">
                          {currentCard.tags.map((t) => (
                            <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--soft)] text-[var(--muted)]">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 text-left">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
                            Core Answer:
                          </span>
                          <p className="text-base text-[var(--foreground)] font-medium leading-relaxed whitespace-pre-wrap font-sans">
                            {currentCard.answer}
                          </p>
                        </div>

                        {/* Memory Tip Pill */}
                        {currentCard.memoryTip && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                            <Lightbulb size={15} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <strong>Memory Tip:</strong> {currentCard.memoryTip}
                            </div>
                          </div>
                        )}

                        {/* Mnemonic Badge */}
                        {currentCard.mnemonic && (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                            <Brain size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <strong>Mnemonic:</strong> {currentCard.mnemonic}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom */}
                  <div className="text-center text-xs text-[var(--muted)]">
                    {isFlipped ? "Flip back or navigate next" : "Tap card or press Space to reveal solution"}
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="w-full flex items-center justify-between gap-4 mt-2">
                <Button
                  variant="secondary"
                  className="py-1.5 px-3 text-xs"
                  onClick={handlePrev}
                >
                  <ChevronLeft size={16} /> Prev
                </Button>

                <Button
                  variant="secondary"
                  className="py-1 px-3 text-xs"
                  onClick={() => {
                    if (!deckPayload) return;
                    setDeckPayload({
                      ...deckPayload,
                      flashcards: [...deckPayload.flashcards].sort(() => Math.random() - 0.5),
                    });
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                >
                  <RotateCcw size={13} className="mr-1 inline" /> Shuffle Deck
                </Button>

                <Button
                  variant="secondary"
                  className="py-1.5 px-3 text-xs"
                  onClick={handleNext}
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          ) : (
            /* JSON View */
            <div className="w-full p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-600">
                  Flashcard Deck Payload JSON
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(deckPayload, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1 rounded-lg bg-[var(--soft)] hover:bg-[var(--line)] text-xs flex items-center gap-1.5"
                >
                  {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copied ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[var(--bg)] font-mono text-xs text-amber-400 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(deckPayload, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
