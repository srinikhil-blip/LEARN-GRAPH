import type { ReactNode } from "react";
import { Inbox, AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  title = "No items found",
  description = "There is currently no data to display here.",
  action,
  icon,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[220px]">
      <div className="w-12 h-12 rounded-full bg-[var(--soft)] flex items-center justify-center text-[var(--muted)] mb-3">
        {icon || <Inbox size={22} />}
      </div>
      <h3 className="font-semibold text-[var(--ink)] text-base">{title}</h3>
      <p className="text-sm text-[var(--muted)] max-w-sm mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Failed to load",
  description = "An error occurred while fetching information. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[220px]">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600 mb-3">
        <AlertTriangle size={22} />
      </div>
      <h3 className="font-semibold text-[var(--ink)] text-base">{title}</h3>
      <p className="text-sm text-[var(--muted)] max-w-sm mt-1 mb-4">{description}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
