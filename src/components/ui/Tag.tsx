import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface TagProps {
  children: ReactNode;
  tone?: "indigo" | "emerald" | "amber" | "red" | "cyan" | "violet" | "rose" | "blue" | string;
  className?: string;
}

export function Tag({ children, tone = "indigo", className = "" }: TagProps) {
  return <span className={cn("tag", tone, className)}>{children}</span>;
}

export const Badge = Tag;
