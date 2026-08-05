"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { TrendingDown, Bot, DollarSign, CalendarCheck, Activity, Share2 } from "lucide-react";

type Agendamento = {
  id: string;
  status: string;
  data: string | null;
  valor: number;
  origem: string;
};

type Pagamento = {
  valor: number;
  status: string;
  pago_em: string | null;
};

interface MonthlyData {
  mes: string;
  faturamento: number;
  agendamentos: number;
}

function fmtR$(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function buildMonthlyData(agendamentos: Agendamento[], pagamentos: Pagamento[]): MonthlyData[] {
  const hoje = new Date();
  const meses: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    meses.push({ key, label: MESES[d.getMonth()] });
  }

  const map = new Map<string, MonthlyData>();
  for (const m of meses) {
    map.set(m.key, { mes: m.label, faturamento: 0, agendamentos: 0 });
  }

  for (const p of pagamentos) {
    if (p.status === "pago" && p.pago_em) {
      const key = p.pago_em.slice(0, 7);
      const entry = map.get(key);
      if (entry) entry.faturamento += Number(p.valor);
    }
  }

  for (const a of agendamentos) {
    if (!a.data) continue;
    const key = a.data.slice(0, 7);
    const entry = map.get(key);
    if (entry) entry.agendamentos += 1;
  }

  return meses.map((m) => map.get(m.key)!);
}

interface MiniCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

function MiniCard({ label, value, sub, icon: Icon, color, bg }: MiniCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4 shadow-sm">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: bg }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-mute)]">
          {label}
        </p>
        <p className="mt-0.5 text-lg font-bold text-[var(--color-ink)]">{value}</p>
        <p className="mt-0.5 text-[11px] text-[var(--color-ink-soft)]">{sub}</p>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold text-[var(--color-ink-soft)]">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="mt-1 text-sm font-bold" style={{ color: entry.color }}>
          {entry.name === "faturamento" ? fmtR$(entry.value) : `${entry.value} ag.`}
        </p>
      ))}
    </div>
  );
}

export function DashboardCharts({
  agendamentos,
  pagamentos,
  slug,
}: {
  agendamentos: Agendamento[];
  pagamentos: Pagamento[];
  slug: string;
}) {
  const [conversasAgente, setConversasAgente] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("agent_conversations")
      .select("*", { count: "exact", head: true })
      .then(({ count }) => {
        setConversasAgente(count ?? 0);
      });
  }, [supabase, slug]);

  const dadosMensais = useMemo(
    () => buildMonthlyData(agendamentos, pagamentos),
    [agendamentos, pagamentos]
  );

  const metricas = useMemo(() => {
    const total = agendamentos.length;
    const cancelados = agendamentos.filter((a) => a.status === "cancelado").length;
    const pagos = pagamentos.filter((p) => p.status === "pago");
    const somaPagos = pagos.reduce((s, p) => s + Number(p.valor), 0);
    const ticketMedio = pagos.length > 0 ? somaPagos / pagos.length : 0;
    const faltasPct = total > 0 ? (cancelados / total) * 100 : 0;
    const leadsAgente = agendamentos.filter(
      (a) => a.origem === "whatsapp" || a.origem === "agente" || a.origem === "instagram"
    ).length;

    return { total, cancelados, faltasPct, ticketMedio, leadsAgente, pagosCount: pagos.length };
  }, [agendamentos, pagamentos]);

  const fatTotalMes = dadosMensais[dadosMensais.length - 1]?.faturamento ?? 0;
  const temDados = metricas.total > 0 || metricas.pagosCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Activity size={16} style={{ color: "var(--color-primary)" }} />
        <h2 className="text-base font-semibold text-[var(--color-ink)]">Relatórios</h2>
      </div>

      {!temDados && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[var(--color-line)] bg-[var(--color-paper)] px-6 py-12 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
            <Share2 size={26} style={{ color: "var(--color-primary)" }} />
          </div>
          <p className="mt-4 text-lg font-semibold text-[var(--color-ink)]">
            Nenhum agendamento ainda
          </p>
          <p className="mt-1 max-w-sm text-sm text-[var(--color-ink-soft)]">
            Compartilhe seu link de agendamento no WhatsApp, Instagram ou Facebook para começar a receber clientes.
          </p>
          <Link
            href={`/${slug}/painel/qr`}
            className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <Share2 size={15} />
            Compartilhar meu link
          </Link>
        </motion.div>
      )}

      {temDados && (
        <>
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4 shadow-sm sm:p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-mute)]">
              Faturamento e agendamentos
            </p>
            <p className="mb-5 text-2xl font-bold text-[var(--color-ink)]">
              {fmtR$(fatTotalMes)}
              <span className="ml-1 text-sm font-normal text-[var(--color-ink-soft)]">
                este mês
              </span>
            </p>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={dadosMensais}
                margin={{ top: 0, right: 0, bottom: 0, left: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 12, fill: "#a1a1aa" }}
                  axisLine={{ stroke: "#e4e4e7" }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: "#a1a1aa" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `R$${v}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: "#a1a1aa" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f4f4f5", radius: 8 }} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  iconType="rect"
                  iconSize={10}
                />
                <Bar
                  yAxisId="left"
                  dataKey="faturamento"
                  name="Faturamento"
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  yAxisId="right"
                  dataKey="agendamentos"
                  name="Agendamentos"
                  fill="#05966933"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MiniCard
              label="Ticket médio"
              value={fmtR$(metricas.ticketMedio)}
              sub={`${metricas.pagosCount} pagos`}
              icon={DollarSign}
              color="#059669"
              bg="#05966915"
            />
            <MiniCard
              label="Taxa de faltas"
              value={`${metricas.faltasPct.toFixed(1)}%`}
              sub={`${metricas.cancelados} de ${metricas.total}`}
              icon={TrendingDown}
              color={metricas.faltasPct > 20 ? "#dc2626" : "#d97706"}
              bg={metricas.faltasPct > 20 ? "#fef2f2" : "#fffbeb"}
            />
            <MiniCard
              label="Leads via IA"
              value={`${metricas.leadsAgente}`}
              sub={`${conversasAgente} conversas`}
              icon={Bot}
              color="#7c3aed"
              bg="#f5f3ff"
            />
            <MiniCard
              label="Ocupação"
              value={`${dadosMensais[dadosMensais.length - 1]?.agendamentos ?? 0} ag.`}
              sub="este mês"
              icon={CalendarCheck}
              color="#2563eb"
              bg="#eff6ff"
            />
          </div>
        </>
      )}
    </motion.div>
  );
}
