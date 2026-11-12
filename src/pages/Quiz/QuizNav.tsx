import { Activity, Check } from "lucide-react";

export interface QuizNavProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, number>;
  flaggedQuestions: number[];
  onSelectQuestion: (index: number) => void;
  onToggleFlag: () => void;
}

export function QuizNav({
  totalQuestions,
  currentIndex,
  answers,
  flaggedQuestions,
  onSelectQuestion,
  onToggleFlag,
}: QuizNavProps) {
  const isFlagged = flaggedQuestions.includes(currentIndex);

  return (
    <aside className="question-nav">
      <h3>Questions</h3>
      <div className="question-grid">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const hasAnswered = answers[i] !== undefined;
          const isCurrent = i === currentIndex;
          let className = "";
          if (hasAnswered && !isCurrent) className = "done";
          if (isCurrent) className = "active";

          return (
            <button
              key={i}
              className={className}
              onClick={() => onSelectQuestion(i)}
              aria-label={`Question ${i + 1}`}
            >
              {hasAnswered && !isCurrent ? <Check size={14} /> : i + 1}
            </button>
          );
        })}
      </div>
      <div className="quiz-key">
        <span>
          <i className="done" />
          Answered
        </span>
        <span>
          <i className="current" />
          Current
        </span>
        <span>
          <i />
          Remaining
        </span>
      </div>
      <button className={`flag ${isFlagged ? "active text-amber-500" : ""}`} onClick={onToggleFlag}>
        <Activity size={15} /> Flag for review
      </button>
    </aside>
  );
}
