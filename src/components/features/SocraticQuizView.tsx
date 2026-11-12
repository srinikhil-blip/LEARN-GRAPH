import { useState } from "react";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import type { SocraticQuizQuestion } from "@/types/conceptExtraction";

interface SocraticQuizViewProps {
  questions: SocraticQuizQuestion[];
  onBack?: () => void;
}

export function SocraticQuizView({ questions, onBack }: SocraticQuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showIntuition, setShowIntuition] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
    if (selectedOption === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setShowIntuition(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Completed all
      setCurrentIndex(questions.length);
    }
  };

  const isCompleted = currentIndex >= questions.length;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Socratic Diagnostic Quiz
          </span>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Concept Verification & Gap Detection
          </h2>
        </div>
        {onBack && (
          <Button variant="secondary" className="py-1 px-3 text-xs" onClick={onBack}>
            Back
          </Button>
        )}
      </div>

      {!isCompleted ? (
        <div className="w-full flex flex-col gap-4 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm">
          {/* Progress & Tag */}
          <div className="flex items-center justify-between">
            <Tag tone="purple">{currentQ.concept}</Tag>
            <span className="text-xs text-[var(--muted)] font-medium">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-lg font-bold text-[var(--foreground)] leading-snug">
            {currentQ.question}
          </h3>

          {/* Socratic Intuition Hint Toggle */}
          <div>
            {!showIntuition ? (
              <button
                onClick={() => setShowIntuition(true)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
              >
                <Lightbulb size={14} /> Need intuition hint before answering?
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <Lightbulb size={16} className="shrink-0 mt-0.5 text-amber-500" />
                <span>
                  <strong>Intuition Hint:</strong> {currentQ.intuition}
                </span>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2.5 mt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let btnStyle =
                "bg-[var(--soft)]/50 hover:bg-[var(--soft)] border-[var(--line)] text-[var(--foreground)]";

              if (submitted) {
                if (isCorrect) {
                  btnStyle =
                    "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold";
                } else if (isSelected && !isCorrect) {
                  btnStyle =
                    "bg-red-500/10 border-red-500 text-red-700 dark:text-red-300";
                }
              } else if (isSelected) {
                btnStyle =
                  "bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-300 font-semibold";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={submitted}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs md:text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {submitted && isCorrect && (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  )}
                  {submitted && isSelected && !isCorrect && (
                    <XCircle size={16} className="text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {submitted && (
            <div
              className={`p-4 rounded-xl text-xs leading-relaxed mt-2 border ${
                selectedOption === currentQ.correctIndex
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200"
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-800 dark:text-indigo-200"
              }`}
            >
              <strong>
                {selectedOption === currentQ.correctIndex
                  ? "Excellent reasoning! "
                  : "Helpful learning insight: "}
              </strong>
              {currentQ.explanation}
            </div>
          )}

          {/* Next / Submit Button */}
          <div className="flex justify-end pt-3 border-t border-[var(--line)]">
            {!submitted ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={selectedOption === null}
              >
                Submit Answer
              </Button>
            ) : (
              <Button variant="primary" onClick={handleNext} className="gap-1.5">
                Next Concept <ArrowRight size={15} />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center p-8 rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
            <Sparkles size={32} />
          </div>
          <h3 className="text-xl font-bold text-[var(--foreground)]">
            Diagnostic Verification Complete!
          </h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mt-1 mb-4">
            You scored {score} out of {questions.length}. Your answers have been logged into your knowledge graph to adapt future recommendations!
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setCurrentIndex(0);
              setSelectedOption(null);
              setSubmitted(false);
              setScore(0);
            }}
          >
            <RotateCcw size={14} className="mr-1.5" /> Re-take Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
