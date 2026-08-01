"use client";

import { type ReactNode } from "react";

type Variant = "default" | "primary" | "success" | "warning" | "error" | "promo";

export interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  default: "bg-neutral-100 text-neutral-600",
  primary: "bg-[var(--color-primary)]/15 text-[var(--color-primary)]",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  promo: "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
};

const sizeStyles = {
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3.5 py-1 text-sm",
};

export function Badge({ children, variant = "default", size = "md", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}