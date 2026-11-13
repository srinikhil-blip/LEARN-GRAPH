import { useState } from "react";
import {
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Award,
  Layers,
  Code2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { OptionCard } from "./OptionCard";
import type { QuizQuestion } from "@/types/quiz";

export interface QuestionCardProps {
  question: QuizQuestion;
  selectedAnswer: number | null;
  onSelectOption: (optionIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  isLastQuestion?: boolean;
  onSubmitQuiz?: () => void;
}

export function QuestionCard({
  question,
  selectedAnswer,
  onSelectOption,
  onPrevious,
  onNext,
  isLastQuestion,
  onSubmitQuiz,
}: QuestionCardProps) {
  const [typedAnswer, setTypedAnswer] = useState("");
  const isCorrect = selectedAnswer === question.correctAnswerIndex;
  const isPYQ = question.sourceType === "Previous-Year Question" || Boolean(question.examReference);

  const isTextQuestion =
    question.type === "Fill in the Blank" ||
    question.type === "Numerical" ||
    question.type === "Short Answer";

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedAnswer.trim()) return;
    // Check answer against correct text or option 0
    const cleanTyped = typedAnswer.trim().toLowerCase();
    const cleanCorrect = (question.correctAnswerText || question.options[question.correctAnswerIndex]?.text || "").toLowerCase();
    const match = cleanTyped === cleanCorrect || cleanCorrect.includes(cleanTyped);
    onSelectOption(match ? question.correctAnswerIndex : (question.correctAnswerIndex === 0 ? 1 : 0));
  };

  return (
    <main className="question-card space-y-4">
      {/* Top Metadata Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Official PYQ vs Original AI Practice Badge */}
          {isPYQ ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Award size={12} />
              {question.examReference
                ? `${question.examReference.examName} ${question.examReference.year || "Official PYQ"}`
                : "Official Previous-Year Question"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles size={12} />
              Original Practice Question
            </span>
          )}

          <Tag tone="indigo">{question.type || "Multiple Choice"}</Tag>

          <Tag
            tone={
              question.difficulty === "Easy"
                ? "emerald"
                : question.difficulty === "Medium"
                ? "amber"
                : "red"
            }
          >
            {question.difficulty}
          </Tag>
        </div>

        {/* Estimated Time */}
        <div className="flex items-center gap-1 text-slate-400 text-xs font-mono">
          <Clock3 size={13} />
          <span>{question.estimatedTimeSeconds ? `${question.estimatedTimeSeconds}s` : "60s"}</span>
        </div>
      </div>

      {/* Question Text */}
      <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
        {question.questionText}
      </h1>

      {/* Mathematical Expression Formulation */}
      {question.mathExpression && (
        <div className="math-expression font-mono text-sm bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 my-2 text-indigo-700 dark:text-indigo-300 overflow-x-auto">
          {question.mathExpression}
        </div>
      )}

      {/* Code Snippet / Sandbox Block */}
      {question.codeSnippet && (
        <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 my-2">
          <div className="bg-slate-900 px-3 py-1.5 text-[11px] font-mono text-slate-400 border-b border-slate-800 flex items-center gap-1.5">
            <Code2 size={13} className="text-indigo-400" />
            <span>{question.codeLanguage || "python"}</span>
          </div>
          <pre className="p-3 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
            <code>{question.codeSnippet}</code>
          </pre>
        </div>
      )}

      {/* Answer Inputs: Text for Fill-in/Numerical, or Option Cards */}
      {isTextQuestion ? (
        <form onSubmit={handleTextSubmit} className="space-y-3 py-2">
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              disabled={selectedAnswer !== null}
              placeholder="Type your numerical value or answer here..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500"
            />
            {selectedAnswer === null && (
              <Button type="submit" variant="primary" className="text-xs px-4">
                Verify
              </Button>
            )}
          </div>
        </form>
      ) : (
        <div className="answers grid gap-2.5 pt-1">
          {question.options.map((opt, i) => (
            <OptionCard
              key={opt.id}
              label={opt.label || String.fromCharCode(65 + i)}
              text={opt.text}
              isSelected={selectedAnswer === i}
              isCorrect={i === question.correctAnswerIndex}
              hasAnswered={selectedAnswer !== null}
              onClick={() => onSelectOption(i)}
            />
          ))}
        </div>
      )}

      {/* Immediate Pedagogical Explanation */}
      {selectedAnswer !== null && (
        <div
          className={`p-4 rounded-2xl border transition-all animate-fadeIn ${
            isCorrect
              ? "bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200"
              : "bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-900/60 text-indigo-950 dark:text-indigo-200"
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 shrink-0">
              {isCorrect ? (
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <div className="space-y-1.5 flex-1">
              <strong className="text-xs font-bold block">
                {isCorrect ? "Correct! Verified Principle:" : "Detailed Solution & Derivation:"}
              </strong>
              <p className="text-xs leading-relaxed opacity-90">{question.explanation}</p>

              {/* Related Concepts grounded in Knowledge Graph */}
              {(question.tags && question.tags.length > 0) && (
                <div className="pt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Connected Concepts:
                  </span>
                  {question.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="question-actions flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button variant="secondary" onClick={onPrevious} className="text-xs gap-1.5">
          <ChevronLeft size={15} /> Previous
        </Button>
        {isLastQuestion ? (
          <Button
            variant="primary"
            onClick={onSubmitQuiz}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
          >
            Submit Assessment <Check size={15} />
          </Button>
        ) : (
          <Button onClick={onNext} className="text-xs gap-1.5">
            Next question <ChevronRight size={15} />
          </Button>
        )}
      </div>
    </main>
  );
}
