import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <article className={cn("panel", className)} {...props}>
      {children}
    </article>
  );
}
