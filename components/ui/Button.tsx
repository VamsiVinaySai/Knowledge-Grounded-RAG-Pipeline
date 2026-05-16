"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "amber";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-canvas hover:bg-ink/90 active:bg-ink/80 font-medium shadow-sm",
  secondary:
    "bg-canvas-200 text-ink hover:bg-canvas-300 active:bg-canvas-200 border border-[var(--border)] hover:border-[var(--border-hover)]",
  ghost: "text-ink-muted hover:text-ink hover:bg-canvas-100 active:bg-canvas-200",
  danger:
    "bg-danger/10 text-danger hover:bg-danger/20 active:bg-danger/15 border border-danger/20",
  amber:
    "bg-amber text-canvas font-medium hover:bg-amber-light active:bg-amber-dark shadow-amber-sm",
};

const sizes: Record<ButtonSize, string> = {
  xs: "h-6 px-2 text-xs rounded-md gap-1",
  sm: "h-7 px-3 text-xs rounded-lg gap-1.5",
  md: "h-8 px-4 text-sm rounded-lg gap-2",
  lg: "h-10 px-5 text-sm rounded-xl gap-2",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-body transition-all duration-150 focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size={size} />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

function LoadingSpinner({ size }: { size: ButtonSize }) {
  const spinnerSize = { xs: 10, sm: 12, md: 14, lg: 16 }[size];
  return (
    <svg
      className="animate-spin"
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="31.4"
        strokeDashoffset="10"
        strokeLinecap="round"
      />
    </svg>
  );
}
