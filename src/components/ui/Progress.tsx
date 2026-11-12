import { cn } from "@/utils/cn";

export interface ProgressProps {
  value: number;
  tone?: "indigo" | "emerald" | "amber" | "red" | "cyan" | "violet" | "rose" | "blue" | string;
  className?: string;
}

export function Progress({ value, tone = "indigo", className = "" }: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  return (
    <div
      className={cn("progress", className)}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <i className={tone} style={{ width: `${clampedValue}%` }} />
    </div>
  );
}

export const ProgressBar = Progress;
