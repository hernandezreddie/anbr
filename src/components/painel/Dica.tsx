import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function Dica({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-teal-100 bg-teal-50/60 px-4 py-3 ${className}`}>
      <div className="flex items-start gap-2.5">
        <Sparkles size={14} className="mt-0.5 shrink-0 text-teal-600" />
        <span className="text-xs leading-relaxed text-neutral-600">{children}</span>
      </div>
      <Badge variant="primary" size="sm" className="mt-2">
        Dica
      </Badge>
    </div>
  );
}