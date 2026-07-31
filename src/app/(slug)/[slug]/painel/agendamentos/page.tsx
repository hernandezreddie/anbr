"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Filter, Search } from "lucide-react";

type Agendamento = {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  cliente_endereco: string | null;
  servico_nome: string | null;
  data: string;
  hora: string;
  valor: number;
  horas: number | null;
  status: string;
  recorrencia: string | null;
  observacoes: string | null;
  created_at: string;
};

const statusBadge: Record<string, { label: string; cls: string }> = {
  solicitado: { label: "Solicitado", cls: "bg-amber-100 text-amber-800" },
  confirmado: { label: "Confirmado", cls: "bg-teal-100 text-teal-800" },
  concluido: { label: "Concluído", cls: "bg-neutral-100 text-neutral-500" },
  cancelado: { label: "Cancelado", cls: "bg-red-100 text-red-700" },
};

const statusDot: Record<string, string> = {
  solicitado: "bg-amber-500",
  confirmado: "bg-teal-500",
  concluido: "bg-neutral-400",
  cancelado: "bg-red-500",
};

const statusColors: Record<string, string> = {
  solicitado: "bg-amber-500",
  confirmado: "bg-teal-500",
  concluido: "bg-neutral-400",
  cancelado: "bg-red-500",
};

function fmtR$(n: number) {
  return `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
}

function fmtData(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR");
}

function nextStatus(status: string): string | null {
  if (status === "solicitado") return "confirmado";
  if (status === "confirmado") return "concluido";
  return null;
}

export default function AgendamentosPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from("agendamentos")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setItems(data as Agendamento[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { carregar(); }, [carregar]);

  const alterarStatus = async (id: string, novoStatus: string) => {
    const { error } = await supabase.from("agendamentos").update({ status: novoStatus }).eq("id", id);
    if (!error) carregar();
  };

  const stats = {
    solicitado: items.filter((a) => a.status === "solicitado").length,
    confirmado: items.filter((a) => a.status === "confirmado").length,
    concluido: items.filter((a) => a.status === "concluido").length,
    cancelado: items.filter((a) => a.status === "cancelado").length,
  };

  const filtrados = items
    .filter((a) => filtro === "todos" || a.status === filtro)
    .filter((a) =>
      busca
        ? a.cliente_nome.toLowerCase().includes(busca.toLowerCase()) ||
          a.cliente_whatsapp?.includes(busca)
        : true
    );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Agendamentos</h1>
        <p className="mt-1 text-sm text-neutral-500">Gerencie todas as solicitações</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome…"
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["todos", "solicitado", "confirmado", "concluido", "cancelado"] as const).map((s) => (
            <button key={s} onClick={() => setFiltro(s)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all border ${
                filtro === s
                  ? "border-teal-600 bg-teal-50 text-teal-700"
                  : "border-neutral-200 text-neutral-500 hover:border-neutral-400"
              }`}>
              {s === "todos" ? "Todos" : statusBadge[s]?.label || s}
              {s !== "todos" && <span className="text-xs">({stats[s]})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-neutral-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-teal-600" />
            <span className="text-sm">Carregando...</span>
          </div>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 py-16">
          <Filter size={32} className="text-neutral-300" />
          <p className="mt-3 text-sm text-neutral-400">
            {busca ? "Nenhum resultado para essa busca." : "Nenhum agendamento encontrado."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtrados.map((a, i) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.02 }}
                className="rounded-2xl border border-neutral-100 bg-white shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-4 pb-3">
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${statusDot[a.status] || "bg-neutral-300"}`} />
                    <div>
                      <p className="font-semibold text-neutral-900">{a.cliente_nome}</p>
                      <p className="mt-0.5 text-sm text-neutral-500">
                        {a.servico_nome ?? "Serviço"}
                        {a.horas ? ` · ${a.horas}h` : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge[a.status]?.cls}`}>
                    {statusBadge[a.status]?.label}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1.5 px-4 pb-3 text-sm">
                  <div className="flex gap-2">
                    <span className="w-16 shrink-0 text-neutral-400">Quando</span>
                    <span className="text-neutral-600">{fmtData(a.data)} · {a.hora?.slice(0, 5)}</span>
                  </div>
                  {a.cliente_whatsapp && (
                    <div className="flex gap-2">
                      <span className="w-16 shrink-0 text-neutral-400">Tel</span>
                      <span className="text-neutral-600">{a.cliente_whatsapp}</span>
                    </div>
                  )}
                  {a.recorrencia && a.recorrencia !== "pontual" && (
                    <div className="flex gap-2">
                      <span className="w-16 shrink-0 text-neutral-400">Freq</span>
                      <span className="text-neutral-600 capitalize">{a.recorrencia}</span>
                    </div>
                  )}
                  {a.observacoes && (
                    <div className="flex gap-2">
                      <span className="w-16 shrink-0 text-neutral-400">Obs</span>
                      <span className="text-neutral-600">{a.observacoes}</span>
                    </div>
                  )}
                </div>

                {/* Value */}
                <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
                  <span className="text-xs font-medium text-neutral-400">Valor</span>
                  <span className="text-lg font-bold text-neutral-900">{fmtR$(a.valor)}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 border-t border-neutral-100 bg-neutral-50/50 px-4 py-3">
                  {nextStatus(a.status) && (
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => alterarStatus(a.id, nextStatus(a.status)!)}
                      className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal-700">
                      <Check size={14} />
                      {nextStatus(a.status) === "confirmado" ? "Confirmar" : "Concluir"}
                    </motion.button>
                  )}
                  {a.status !== "cancelado" && a.status !== "concluido" && (
                    <button onClick={() => alterarStatus(a.id, "cancelado")}
                      className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600 shadow-sm transition-all hover:bg-red-50 hover:text-red-600">
                      <X size={14} /> Cancelar
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}