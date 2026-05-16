"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, leftIcon, rightIcon, wrapperClassName, className, id, ...props },
    ref,
  ) => {
    const inputId = id ?? React.useId();

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-ink-muted"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-9 w-full rounded-lg bg-canvas-100 px-3 text-sm text-ink placeholder:text-ink-faint",
              "border border-[var(--border)] transition-all duration-150",
              "hover:border-[var(--border-hover)]",
              "focus:border-amber/50 focus:bg-canvas-50 focus:outline-none focus:ring-2 focus:ring-amber/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-danger/50 focus:border-danger/70 focus:ring-danger/20",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-faint">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
