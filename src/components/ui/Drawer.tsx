import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: "left" | "right";
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  position = "right",
  title,
  children,
  className = "",
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "fixed inset-y-0 flex max-w-full",
          position === "left" ? "left-0" : "right-0"
        )}
      >
        <div
          className={cn(
            "w-screen max-w-md bg-[var(--surface)] text-[var(--ink)] shadow-2xl p-6 flex flex-col border-[var(--line)]",
            position === "left" ? "border-r" : "border-l",
            className
          )}
        >
          <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[var(--soft)] text-[var(--muted)]"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
