import { Check, X } from "lucide-react";

export interface OptionCardProps {
  label: string; // "A", "B", etc.
  text: string;
  isSelected: boolean;
  isCorrect?: boolean;
  hasAnswered: boolean;
  onClick: () => void;
}

export function OptionCard({
  label,
  text,
  isSelected,
  isCorrect,
  hasAnswered,
  onClick,
}: OptionCardProps) {
  let statusClass = "";
  if (isSelected) {
    statusClass = isCorrect ? "correct" : "incorrect";
  }

  return (
    <button className={statusClass} onClick={onClick}>
      <span>{label}</span>
      <strong>{text}</strong>
      {isSelected && (isCorrect ? <Check /> : <X />)}
    </button>
  );
}
