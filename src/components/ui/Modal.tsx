"use client";

import { type ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-[var(--color-ink)]/40 px-4 py-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${sizeMap[size]} rounded-[var(--radius-2xl)] border border-[var(--color-line)] bg-[var(--color-paper)] shadow-[var(--shadow-2xl)]`}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-4">
                <h3 className="text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-[var(--color-ink-soft)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)] transition-colors"
                  aria-label="Cerrar"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}
            <div className={title ? "p-6" : "p-6"}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}