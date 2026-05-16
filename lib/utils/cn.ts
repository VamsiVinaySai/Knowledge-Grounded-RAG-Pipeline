import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely, resolving conflicts.
 * @example cn("px-4 py-2", isActive && "bg-amber-500", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
