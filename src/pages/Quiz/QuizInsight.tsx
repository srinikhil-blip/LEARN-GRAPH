import { BrainCircuit, Sparkles } from "lucide-react";
import { Tag } from "@/components/ui/Tag";
import type { QuizQuestion } from "@/types/quiz";

export function QuizInsight({
  insight,
  onAskHint,
}: {
  insight?: QuizQuestion["weakConceptInsight"];
  onAskHint?: () => void;
}) {
  const title = insight?.title || "Exam Pattern Analysis";
  const desc =
    insight?.description ||
    "This question evaluates high-yield concepts frequently tested in previous examination papers.";
  const fromConcept = insight?.fromConcept || "Foundations";
  const fromMastery = insight?.fromMastery ?? 85;
  const toConcept = insight?.toConcept || "Target Problem";
  const toMastery = insight?.toMastery ?? 55;

  return (
    <aside className="quiz-insight">
      <span className="stat-icon indigo">
        <BrainCircuit />
      </span>
      <Tag>GRAPH INSIGHT</Tag>
      <h3>{title}</h3>
      <p>{desc}</p>
      <div className="mini-path">
        <span>
          {fromConcept} <small>{fromMastery}%</small>
        </span>
        <i />
        <span>
          {toConcept} <small>{toMastery}%</small>
        </span>
      </div>
      <button onClick={onAskHint}>
        <Sparkles size={15} /> Ask AI for a hint
      </button>
    </aside>
  );
}
