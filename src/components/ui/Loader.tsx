import { cn } from "@/utils/cn";

export function Loader({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={cn(
        "inline-block rounded-full border-solid border-indigo-500 border-t-transparent animate-spin",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full gap-3">
      <Loader size="lg" />
      <span className="text-sm font-medium text-[var(--muted)]">Loading content...</span>
    </div>
  );
}
