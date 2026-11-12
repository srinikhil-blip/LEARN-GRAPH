import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", className = "", isLoading = false, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn("button", variant, className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <span className="button-loader animate-spin mr-2">◌</span> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
