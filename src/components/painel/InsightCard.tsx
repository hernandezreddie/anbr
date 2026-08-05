"use client";

import Link from "next/link";
import { AlertTriangle, TrendingUp, Link2, Zap, ArrowRight } from "lucide-react";

type Insight = {
  tipo: "warning" | "info" | "success" | "tip";
  titulo: string;
  mensagem: string;
  acao?: { label: string; href: string };
};

function getInsights(nFaltas: number, nAgendamentos: number, cotaUsada: number, cotaMax: number, temLink: boolean, slug: string): Insight[] {
  const insights: Insight[] = [];

  if (nFaltas >= 2) {
    insights.push({
      tipo: "warning",
      titulo: `${nFaltas} falta(s) essa semana`,
      mensagem: "Ative os lembretes automáticos no WhatsApp para reduzir faltas em até 40%.",
      acao: { label: "Configurar lembretes", href: `/${slug}/painel/perfil` },
    });
  }

  if (!temLink) {
    insights.push({
      tipo: "tip",
      titulo: "Divulgue seu link de agendamento",
      mensagem: "Copie o link e cole na bio do Instagram, status do WhatsApp e Facebook para receber mais clientes.",
      acao: { label: "Copiar link", href: `/${slug}/painel/qr` },
    });
  }

  if (cotaMax > 0 && cotaUsada >= cotaMax - 5) {
    insights.push({
      tipo: "warning",
      titulo: `${cotaUsada}/${cotaMax} agendamentos usados`,
      mensagem: `Seu plano atual está quase no limite. Faça upgrade para não perder novos clientes.`,
      acao: { label: "Ver planos", href: `/${slug}/painel/plano` },
    });
  }

  if (nAgendamentos >= 20) {
    insights.push({
      tipo: "success",
      titulo: `${nAgendamentos} agendamentos esse mês`,
      mensagem: "Seu negócio está crescendo! Considere ativar o AI Agent para atender ainda mais clientes 24h.",
      acao: { label: "Ver agente", href: `/${slug}/painel/agente` },
    });
  }

  return insights;
}

export function InsightCard({
  nFaltas = 0,
  nAgendamentos = 0,
  cotaUsada = 0,
  cotaMax = 0,
  temLink = false,
  slug = "",
}: {
  nFaltas?: number;
  nAgendamentos?: number;
  cotaUsada?: number;
  cotaMax?: number;
  temLink?: boolean;
  slug?: string;
}) {
  const insights = getInsights(nFaltas, nAgendamentos, cotaUsada, cotaMax, temLink, slug);

  if (insights.length === 0) return null;

  const colorMap = {
    warning: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-500", text: "text-amber-800" },
    info: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-500", text: "text-blue-800" },
    success: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-500", text: "text-emerald-800" },
    tip: { bg: "bg-violet-50", border: "border-violet-200", icon: "text-violet-500", text: "text-violet-800" },
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft/60">Sugestões para você</p>
      {insights.map((insight, i) => {
        const c = colorMap[insight.tipo];
        return (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-xl border p-4 ${c.bg} ${c.border}`}
          >
            <div className={`mt-0.5 ${c.icon}`}>
              {insight.tipo === "warning" ? <AlertTriangle size={18} /> :
               insight.tipo === "success" ? <TrendingUp size={18} /> :
               insight.tipo === "tip" ? <Link2 size={18} /> :
               <Zap size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${c.text}`}>{insight.titulo}</p>
              <p className={`mt-0.5 text-xs ${c.text}/70`}>{insight.mensagem}</p>
              {insight.acao && (
                <Link
                  href={insight.acao.href}
                  className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold ${c.text} hover:underline`}
                >
                  {insight.acao.label}
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
