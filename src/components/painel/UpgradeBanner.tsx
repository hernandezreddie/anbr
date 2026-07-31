"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export function UpgradeBanner({ slug }: { slug: string }) {
  const [estado, setEstado] = useState<{
    plano: string;
    ativo: boolean;
    dias_restantes: number | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/planos/me")
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setEstado({ plano: d.plano, ativo: d.ativo, dias_restantes: d.dias_restantes });
      })
      .catch(() => {});
  }, []);

  if (!estado || (estado.ativo && (estado.dias_restantes === null || estado.dias_restantes > 7))) {
    return null;
  }

  const expirando = estado.ativo && estado.dias_restantes !== null && estado.dias_restantes <= 7;

  return (
    <div className={`mb-5 flex flex-wrap items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm ${
      expirando
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-teal-200 bg-teal-50 text-teal-800"
    }`}>
      <Sparkles size={18} className={expirando ? "text-amber-500" : "text-teal-600"} />
      <span className="flex-1">
        {expirando
          ? `Seu plano ${estado.plano === "ia_premium" ? "IA Premium" : "Profissional"} expira em ${estado.dias_restantes} dia(s). Renove para não perder os recursos.`
          : "Seu plano grátis tem limites. Faça upgrade para agendamentos ilimitados, Google Calendar, Instagram DM e AI Agent."}
      </span>
      <Link
        href={`/${slug}/painel/plano`}
        className={`rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all ${
          expirando ? "bg-amber-600 hover:bg-amber-700" : "bg-teal-600 hover:bg-teal-700"
        }`}
      >
        {expirando ? "Renovar agora" : "Faça upgrade"}
      </Link>
    </div>
  );
}
