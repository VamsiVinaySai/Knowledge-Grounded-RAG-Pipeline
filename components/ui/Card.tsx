import * as React from "react";
import { cn } from "@/lib/utils/cn";

// =============================================================================
// Card
// =============================================================================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export function Card({ hover = false, glow = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-canvas-50 p-4",
        hover && "cursor-pointer transition-all duration-200 hover:border-[var(--border-hover)] hover:bg-canvas-100 hover:shadow-panel",
        glow && "hover:shadow-amber",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// =============================================================================
// Badge
// =============================================================================
type BadgeVariant = "default" | "success" | "warning" | "danger" | "amber" | "info";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-canvas-200 text-ink-muted border-[var(--border)]",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  amber: "bg-amber/10 text-amber border-amber/20",
  info: "bg-info/10 text-info border-info/20",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-ink-muted",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  amber: "bg-amber",
  info: "bg-info",
};

export function Badge({ variant = "default", dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-medium",
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

// Status badge convenience wrapper for documents
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    pending: { variant: "warning", label: "Pending" },
    processing: { variant: "info", label: "Processing" },
    ready: { variant: "success", label: "Ready" },
    error: { variant: "danger", label: "Error" },
  };

  const config = map[status] ?? { variant: "default" as BadgeVariant, label: status };
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

// =============================================================================
// Spinner
// =============================================================================
interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 16, className }: SpinnerProps) {
  return (
    <svg
      className={cn("animate-spin text-amber", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="31.4"
        strokeDashoffset="10"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// =============================================================================
// Divider
// =============================================================================
export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-[var(--border)]", className)} />;
}

// =============================================================================
// Empty state
// =============================================================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-16 text-center", className)}>
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-canvas-200 text-ink-muted">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        {description && <p className="mt-1 text-xs text-ink-muted">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
