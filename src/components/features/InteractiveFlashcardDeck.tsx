import { useState } from "react";
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import type { FlashcardItem } from "@/types/conceptExtraction";

interface InteractiveFlashcardDeckProps {
  cards: FlashcardItem[];
  title?: string;
  onBack?: () => void;
}

export function InteractiveFlashcardDeck({
  cards,
  title = "Concept Flashcard Deck",
  onBack,
}: InteractiveFlashcardDeckProps) {
  const [deck, setDeck] = useState<FlashcardItem[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = deck[currentIndex] || deck[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };

  const handleMark = (status: "mastered" | "learning") => {
    setDeck((prev) =>
      prev.map((c, i) => (i === currentIndex ? { ...c, status } : c))
    );
    handleNext();
  };

  const masteredCount = deck.filter((c) => c.status === "mastered").length;
  const learningCount = deck.filter((c) => c.status === "learning").length;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto p-4 md:p-6">
      {/* Deck Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Active Recall Flashcards
          </span>
          <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="secondary" className="py-1 px-3 text-xs" onClick={onBack}>
              Back
            </Button>
          )}
          <Button
            variant="secondary"
            className="py-1 px-3 text-xs"
            onClick={() => {
              setDeck((prev) => [...prev].sort(() => Math.random() - 0.5));
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
          >
            <RotateCcw size={14} className="mr-1" /> Shuffle
          </Button>
        </div>
      </div>

      {/* Mastery Stats Bar */}
      <div className="w-full flex items-center justify-between text-xs font-medium px-2 py-1.5 rounded-xl bg-[var(--soft)] text-[var(--muted)]">
        <div className="flex items-center gap-3">
          <span className="text-emerald-600 font-semibold">
            ● {masteredCount} Mastered
          </span>
          <span className="text-amber-600 font-semibold">
            ● {learningCount} Learning
          </span>
          <span>● {deck.length - masteredCount - learningCount} Unreviewed</span>
        </div>
        <span>
          Card {currentIndex + 1} of {deck.length}
        </span>
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="w-full min-h-[300px] md:min-h-[360px] perspective-1000 cursor-pointer select-none"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full min-h-[300px] md:min-h-[360px] rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 shadow-xl border border-[var(--line)] ${
            isFlipped
              ? "bg-gradient-to-br from-indigo-900/20 via-[var(--surface)] to-[var(--surface)] border-indigo-500/50"
              : "bg-[var(--surface)] hover:border-indigo-500/30"
          }`}
        >
          {/* Card Top */}
          <div className="flex items-center justify-between">
            <Tag tone="purple">{currentCard.conceptName}</Tag>
            <span className="text-xs text-[var(--muted)] flex items-center gap-1">
              <Sparkles size={12} className="text-indigo-500" />
              {isFlipped ? "Answer / Explanation" : "Click to flip"}
            </span>
          </div>

          {/* Card Middle (Question or Answer) */}
          <div className="my-auto py-6 text-center">
            {!isFlipped ? (
              <div className="space-y-3">
                <HelpCircle size={28} className="mx-auto text-indigo-500/70" />
                <h3 className="text-xl md:text-2xl font-bold text-[var(--foreground)] leading-snug">
                  {currentCard.question}
                </h3>
                {currentCard.tip && (
                  <p className="text-xs text-[var(--muted)]">{currentCard.tip}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500">
                  Core Concept Mechanics
                </span>
                <p className="text-base md:text-lg text-[var(--foreground)] leading-relaxed font-medium">
                  {currentCard.answer}
                </p>
              </div>
            )}
          </div>

          {/* Card Bottom Hint */}
          <div className="text-center text-xs text-[var(--muted)]">
            {isFlipped ? "Self-grade your recall below" : "Tap card or press Space to reveal"}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="w-full flex items-center justify-between gap-4 mt-2">
        <Button
          variant="secondary"
          className="py-1.5 px-3 text-xs"
          onClick={handlePrev}
          disabled={deck.length <= 1}
        >
          <ChevronLeft size={16} /> Prev
        </Button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMark("learning")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5 transition-colors"
          >
            <AlertCircle size={14} /> Need Review
          </button>
          <button
            onClick={() => handleMark("mastered")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Check size={14} /> Got It!
          </button>
        </div>

        <Button
          variant="secondary"
          className="py-1.5 px-3 text-xs"
          onClick={handleNext}
          disabled={deck.length <= 1}
        >
          Next <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
