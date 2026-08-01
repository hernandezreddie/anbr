"use client";

import { type ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  interactive?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  none: "",
};

export function Card({ children, className = "", hover = false, interactive = false, padding = "md", style, onMouseEnter, onMouseLeave }: CardProps) {
  return (
    <div
      style={style}
      className={`
        rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-paper)] shadow-[var(--shadow-md)]
        ${hover ? "transition-shadow duration-300 hover:shadow-[var(--shadow-lg)]" : ""}
        ${interactive ? "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]" : ""}
        ${paddingMap[padding]}
        ${className}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}