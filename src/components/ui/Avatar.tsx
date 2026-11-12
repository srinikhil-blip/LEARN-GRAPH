import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface AvatarProps {
  initials: string;
  variant?: "top" | "table" | "mini" | "profile";
  toneIndex?: number;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export function Avatar({
  initials,
  variant = "top",
  toneIndex = 0,
  className = "",
  children,
  onClick,
}: AvatarProps) {
  if (variant === "top") {
    return (
      <button className={cn("top-avatar", className)} onClick={onClick} aria-label="Open profile">
        {initials}
      </button>
    );
  }

  if (variant === "mini") {
    return <span className={cn("user-mini", className)}>{initials}</span>;
  }

  if (variant === "profile") {
    return (
      <div className={cn("profile-avatar", className)}>
        {initials}
        {children}
      </div>
    );
  }

  return (
    <span className={cn("table-avatar", `av${toneIndex % 4}`, className)}>
      {initials}
    </span>
  );
}

export function AvatarStack({ items }: { items: string[] }) {
  return (
    <div className="avatar-stack">
      {items.map((initials, i) => (
        <span key={i}>{initials}</span>
      ))}
    </div>
  );
}
