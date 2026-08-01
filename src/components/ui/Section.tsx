"use client";

import { type ReactNode } from "react";

export interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizePadding = {
  sm: "py-12 sm:py-16",
  md: "py-16 sm:py-20",
  lg: "py-20 sm:py-28",
  xl: "py-24 sm:py-32",
};

export function Section({ children, className = "", id, size = "lg" }: SectionProps) {
  return (
    <section id={id} className={`relative ${sizePadding[size]} ${className}`}>
      <div className="container-x">{children}</div>
    </section>
  );
}