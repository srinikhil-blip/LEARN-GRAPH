import type { ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  type = "info",
  title,
  children,
  onClose,
  className = "",
}: AlertProps) {
  const icons = {
    info: <Info size={18} className="text-blue-500 shrink-0" />,
    success: <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />,
    warning: <AlertCircle size={18} className="text-amber-500 shrink-0" />,
    error: <AlertCircle size={18} className="text-red-500 shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border p-4 flex gap-3 text-sm",
        type === "info" && "bg-blue-50/50 border-blue-200 text-blue-900 dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-200",
        type === "success" && "bg-emerald-50/50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-200",
        type === "warning" && "bg-amber-50/50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-200",
        type === "error" && "bg-red-50/50 border-red-200 text-red-900 dark:bg-red-950/20 dark:border-red-900 dark:text-red-200",
        className
      )}
    >
      {icons[type]}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-1">{title}</h5>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-0.5 rounded hover:bg-black/5" aria-label="Close alert">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function Toast({
  message,
  type = "success",
  onClose,
}: {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--surface)] text-[var(--ink)] shadow-xl border border-[var(--line)]">
      {type === "success" && <CheckCircle2 size={16} className="text-emerald-500" />}
      {type === "error" && <AlertCircle size={16} className="text-red-500" />}
      {type === "info" && <Info size={16} className="text-indigo-500" />}
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--ink)] ml-2">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
