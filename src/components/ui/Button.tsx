"use client";

import { forwardRef, type ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline" | "danger" | "pill";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-ink)] shadow-md shadow-[var(--color-primary)]/20 transition-all duration-150 hover:brightness-110 hover:shadow-lg active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-[var(--color-ink-soft)] transition-all duration-150 hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary-accent)] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed",
  outline:
    "inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-line)] bg-transparent px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition-all duration-150 hover:border-[var(--color-primary)] hover:text-[var(--color-primary-accent)] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-red-700 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed",
  pill:
    "inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-primary-accent)] transition-all duration-150 hover:bg-[var(--color-primary)]/20 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 text-xs px-4 py-2",
  md: "h-11 text-sm px-5 py-2.5",
  lg: "h-13 text-base px-7 py-3.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, leftIcon, rightIcon, children, className = "", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {!loading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";