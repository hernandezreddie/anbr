"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Agendamento = {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  data: string;
  hora: string;
  valor: number;
  status: string;
  created_at: string;
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR");
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    solicitado: "bg-amber-100 text-amber-800",
    confirmado: "bg-blue-100 text-blue-800",
    concluido: "bg-emerald-100 text-emerald-800",
    cancelado: "bg-gray-100 text-gray-500",
  };
  return styles[status] || styles.cancelado;
}

function nextStatus(status: string): string | null {
  if (status === "solicitado") return "confirmado";
  if (status === "confirmado") return "concluido";
  return null;
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");

  const carregar = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("agendamentos")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAgendamentos(data as Agendamento[]);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const alterarStatus = async (id: string, novoStatus: string) => {
    const res = await fetch(`/api/agendamentos/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });
    if (res.ok) carregar();
  };

  const filtrados = filtro === "todos"
    ? agendamentos
    : agendamentos.filter((a) => a.status === filtro);

  const stats = {
    solicitado: agendamentos.filter((a) => a.status === "solicitado").length,
    confirmado: agendamentos.filter((a) => a.status === "confirmado").length,
    concluido: agendamentos.filter((a) => a.status === "concluido").length,
    cancelado: agendamentos.filter((a) => a.status === "cancelado").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agendamentos</h1>
          <p className="mt-1 text-ink-soft">Gerencie todas as solicitações</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["todos", "solicitado", "confirmado", "concluido", "cancelado"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFiltro(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all border ${
              filtro === s
                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                : "border-line text-ink-soft hover:border-ink"
            }`}
          >
            {s === "todos" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "todos" && (
              <span className="ml-1.5 text-xs">({stats[s]})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-12 text-center text-ink-soft">Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div className="card p-12 text-center text-ink-soft">
          <div className="mb-2 text-3xl">📅</div>
          <p>Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line bg-gray-50 text-left text-sm font-medium text-ink-soft">
                <th className="px-5 py-4">Cliente</th>
                <th className="px-5 py-4">Data</th>
                <th className="px-5 py-4">Valor</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-4">
                    <div className="font-medium">{a.cliente_nome}</div>
                    {a.cliente_whatsapp && (
                      <div className="text-sm text-ink-soft">{a.cliente_whatsapp}</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <div>{formatDate(a.data)}</div>
                    <div className="text-ink-soft">{a.hora.slice(0, 5)}</div>
                  </td>
                  <td className="px-5 py-4 font-medium">
                    R$ {a.valor.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadge(a.status)}`}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {nextStatus(a.status) && (
                        <button
                          onClick={() => alterarStatus(a.id, nextStatus(a.status)!)}
                          className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-all hover:bg-emerald-100"
                        >
                          {nextStatus(a.status) === "confirmado" ? "Confirmar" : "Concluir"}
                        </button>
                      )}
                      {a.status !== "cancelado" && a.status !== "concluido" && (
                        <button
                          onClick={() => alterarStatus(a.id, "cancelado")}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-100"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
