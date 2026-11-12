import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Skeleton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-[var(--line)]/60 dark:bg-slate-700/50", className)}
      {...props}
    />
  );
}
