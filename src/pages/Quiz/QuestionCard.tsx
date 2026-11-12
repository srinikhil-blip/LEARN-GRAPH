import { Check, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
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
  const isCorrect = selectedAnswer === question.correctAnswerIndex;

  return (
    <main className="question-card">
      <div className="question-top">
        <span>{question.type}</span>
        <Tag tone={question.difficulty === "Easy" ? "emerald" : question.difficulty === "Medium" ? "amber" : "red"}>
          {question.difficulty}
        </Tag>
      </div>

      <h1>{question.questionText}</h1>

      {question.mathExpression && (
        <div className="math-expression font-mono text-sm bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 my-2 text-indigo-700 dark:text-indigo-300">
          {question.mathExpression}
        </div>
      )}

      <div className="answers">
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

      {selectedAnswer !== null && (
        <div className={`feedback ${isCorrect ? "success" : "error"}`}>
          <span>{isCorrect ? <Check /> : <Sparkles />}</span>
          <div>
            <strong>
              {isCorrect ? "Exactly right!" : "Not quite — let’s look at it together."}
            </strong>
            <p>{question.explanation}</p>
          </div>
        </div>
      )}

      <div className="question-actions flex items-center justify-between mt-6">
        <Button variant="secondary" onClick={onPrevious}>
          <ChevronLeft size={16} /> Previous
        </Button>
        {isLastQuestion ? (
          <Button variant="primary" onClick={onSubmitQuiz} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
            Submit Assessment <Check size={16} />
          </Button>
        ) : (
          <Button onClick={onNext} className="gap-1.5">
            Next question <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </main>
  );
}
