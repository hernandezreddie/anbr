"use client";

import { type ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

const typeStyles = {
  success: "bg-[var(--color-primary)] text-[var(--color-primary-ink)]",
  error: "bg-red-600 text-white",
  info: "bg-[var(--color-ink)] text-white",
};

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`fixed left-1/2 top-4 z-[70] -translate-x-1/2 rounded-2xl px-6 py-3.5 text-sm font-medium shadow-lg shadow-black/10 ${typeStyles[type]}`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}