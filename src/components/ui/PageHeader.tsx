import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={cn("page-header", className)}>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="header-action">{action}</div>}
    </div>
  );
}
