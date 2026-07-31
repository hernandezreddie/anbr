import { Sparkles } from "lucide-react";

export function Dica({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-start gap-2.5 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3 text-xs leading-relaxed text-neutral-600 ${className}`}>
      <Sparkles size={14} className="mt-0.5 shrink-0 text-teal-600" />
      <span>{children}</span>
    </p>
  );
}
