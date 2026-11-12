import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface StatCardProps {
  icon?: ReactNode;
  iconTone?: string;
  badge?: ReactNode;
  label: string;
  value: ReactNode;
  progressValue?: number;
  progressTone?: string;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function StatCard({
  icon,
  iconTone = "indigo",
  badge,
  label,
  value,
  progressValue,
  progressTone = "indigo",
  footer,
  children,
  className = "",
}: StatCardProps) {
  return (
    <article className={cn("stat-card", className)}>
      {(icon || badge) && (
        <div className="stat-top">
          {icon && <span className={cn("stat-icon", iconTone)}>{icon}</span>}
          {badge}
        </div>
      )}
      <small>{label}</small>
      <h3>{value}</h3>
      {progressValue !== undefined && (
        <div className="progress">
          <i className={progressTone} style={{ width: `${progressValue}%` }} />
        </div>
      )}
      {children}
      {footer && (typeof footer === "string" ? <p>{footer}</p> : footer)}
    </article>
  );
}
