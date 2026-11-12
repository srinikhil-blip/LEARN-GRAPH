import { type InputHTMLAttributes, forwardRef } from "react";
import { Search, Command } from "lucide-react";
import { cn } from "@/utils/cn";

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "global" | "graph" | "standard" | "small";
  shortcut?: string;
  className?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ variant = "standard", shortcut, className = "", placeholder = "Search...", ...props }, ref) => {
    if (variant === "global") {
      return (
        <div className={cn("global-search", className)}>
          <Search />
          <input ref={ref} placeholder={placeholder} {...props} />
          <kbd>
            <Command size={11} /> {shortcut || "K"}
          </kbd>
        </div>
      );
    }

    if (variant === "graph") {
      return (
        <div className={cn("graph-search", className)}>
          <Search size={17} />
          <input ref={ref} placeholder={placeholder} {...props} />
          <kbd>{shortcut || "⌘ F"}</kbd>
        </div>
      );
    }

    return (
      <div className={cn("search-input", variant === "small" && "small", className)}>
        <Search size={16} />
        <input ref={ref} placeholder={placeholder} {...props} />
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
