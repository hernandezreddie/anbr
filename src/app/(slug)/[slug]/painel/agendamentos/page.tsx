"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Filter, Search, Plus, Pencil, Trash2, List, Columns3 } from "lucide-react";
import { Dica } from "@/components/painel/Dica";
import { novoId, getMeuProfissionalId } from "@/lib/ids";

type Agendamento = {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string | null;
  cliente_endereco: string | null;
  servico_nome: string | null;
  data: string;
  hora: string;
  valor: number;
  horas: number | null;
  status: string;
  recorrencia: string | null;
  observacoes: string | null;
  endereco: string | null;
  origem: string;
  created_at: string;
};

type Servico = {
  id: string;
  nome: string;
};

type FormState = {
  id: string | null;
  cliente_nome: string;
  cliente_whatsapp: string;
  data: string;
  hora: string;
  servico_nome: string;
  valor: string;
  status: string;
  recorrencia: string;
  endereco: string;
  observacoes: string;
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

function fmtR$(n: number) {
  return `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
}

function fmtData(d: string) {
  if (!d) return "A combinar";
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR");
}

function nextStatus(status: string): string | null {
  if (status === "solicitado") return "confirmado";
  if (status === "confirmado") return "concluido";
  return null;
}

const isoHoje = () => new Date().toLocaleDateString("sv-SE");

export default function AgendamentosPage() {
  const supabase = createClient();
  const pathname = usePathname();
  const slug = pathname.split("/")[1];
  const [items, setItems] = useState<Agendamento[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [maxDia, setMaxDia] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [vista, setVista] = useState<"lista" | "quadro">("lista");
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [confirmarDel, setConfirmarDel] = useState<Agendamento | null>(null);
  const [busy, setBusy] = useState(false);
  const [aviso, setAviso] = useState("");
  const [lembretesOk, setLembretesOk] = useState(false);

  const flash = (m: string) => {
    setAviso(m);
    setTimeout(() => setAviso(""), 2500);
  };

  const carregar = useCallback(async () => {
    const [ag, sv, cfg] = await Promise.all([
      supabase.from("agendamentos").select("*").order("created_at", { ascending: false }),
      supabase.from("servicos").select("id, nome").eq("ativo", true).order("ordem"),
      supabase.from("configuracoes").select("max_agendamentos_dia").single(),
    ]);
    if (ag.data) setItems(ag.data as Agendamento[]);
    if (sv.data) setServicos(sv.data as Servico[]);
    if (cfg.data?.max_agendamentos_dia) setMaxDia(Number(cfg.data.max_agendamentos_dia) || 0);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    if (!slug || lembretesOk) return;
    fetch(`/api/agendamentos/lembretes`)
      .then((r) => r.json())
      .then((d) => {
        setLembretesOk(true);
        if (d.enviados > 0) flash(`${d.enviados} lembrete(s) enviado(s) para os clientes de hoje/amanhã ✔`);
        else if (d.total > 0 && d.falhas > 0) flash("Lembretes sem WhatsApp configurado.");
      })
      .catch(() => {});
  }, [slug, lembretesOk]);

  const alterarStatus = async (id: string, novoStatus: string) => {
    try {
      await fetch(`/api/agendamentos/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
    } catch {
      flash("Erro ao atualizar status.");
    }
    carregar();
  };

  const abrirNovo = () => {
    setForm({
      id: null,
      cliente_nome: "",
      cliente_whatsapp: "",
      data: isoHoje(),
      hora: "",
      servico_nome: servicos[0]?.nome ?? "",
      valor: "",
      status: "confirmado",
      recorrencia: "pontual",
      endereco: "",
      observacoes: "",
    });
  };

  const abrirEditar = (a: Agendamento) => {
    setForm({
      id: a.id,
      cliente_nome: a.cliente_nome,
      cliente_whatsapp: a.cliente_whatsapp ?? "",
      data: a.data ?? isoHoje(),
      hora: a.hora ? a.hora.slice(0, 5) : "",
      servico_nome: a.servico_nome ?? servicos[0]?.nome ?? "",
      valor: String(a.valor ?? ""),
      status: a.status,
      recorrencia: a.recorrencia ?? "pontual",
      endereco: a.endereco ?? "",
      observacoes: a.observacoes ?? "",
    });
  };

  async function salvar() {
    if (!form) return;
    if (!form.cliente_nome.trim()) {
      flash("Informe o nome do cliente.");
      return;
    }
    if (!form.valor || isNaN(Number(form.valor))) {
      flash("Informe o valor.");
      return;
    }
    if (maxDia > 0 && form.data) {
      const { count } = await supabase
        .from("agendamentos")
        .select("id", { count: "exact", head: true })
        .eq("data", form.data)
        .neq("status", "cancelado")
        .neq("id", form.id ?? "");
      if ((count || 0) >= maxDia) {
        flash(`Limite de ${maxDia} agendamentos por dia atingido. Escolha outra data.`);
        return;
      }
    }
    setBusy(true);

    const patch: Record<string, unknown> = {
      cliente_nome: form.cliente_nome.trim(),
      cliente_whatsapp: form.cliente_whatsapp.replace(/\D/g, "") || null,
      data: form.data || null,
      hora: form.hora || null,
      servico_nome: form.servico_nome || null,
      valor: Number(form.valor),
      status: form.status,
      recorrencia: form.recorrencia,
      endereco: form.endereco || null,
      observacoes: form.observacoes || null,
    };

    if (!form.id) {
      const profissional_id = await getMeuProfissionalId(supabase);
      if (!profissional_id) {
        setBusy(false);
        flash("Sessão expirada. Entre novamente no painel.");
        return;
      }
      patch.profissional_id = profissional_id;
      patch.token_avaliacao = novoId();
    }

    let res;
    try {
      res = form.id
        ? await supabase.from("agendamentos").update(patch).eq("id", form.id)
        : await supabase.from("agendamentos").insert({
            ...patch,
            origem: "manual",
          });
    } catch {
      setBusy(false);
      flash("Erro ao salvar. Tente de novo.");
      return;
    }
    setBusy(false);
    if (res.error) {
      flash("Erro ao salvar. Tente de novo.");
      return;
    }
    setForm(null);
    flash(form.id ? "Agendamento atualizado ✔" : "Agendamento criado ✔");
    await carregar();
  }

  async function excluir() {
    if (!confirmarDel) return;
    setBusy(true);
    const { error } = await supabase.from("agendamentos").delete().eq("id", confirmarDel.id);
    setBusy(false);
    setConfirmarDel(null);
    if (error) { flash("Erro ao excluir."); return; }
    flash("Agendamento excluído ✔");
    await carregar();
  }

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

  const inp = "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-teal-600";
  const lbl = "mb-1 block text-xs font-semibold text-neutral-500";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {aviso && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-4 z-[70] -translate-x-1/2"
          >
            <p className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white shadow-lg">{aviso}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Agendamentos</h1>
          <p className="mt-1 text-sm text-neutral-500">Gerencie todas as solicitações</p>
        </div>
        <button onClick={abrirNovo}
          className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700">
          <Plus size={16} /> Novo agendamento
        </button>
      </div>

      <Dica>
        Cada pedido novo do seu site cai aqui na hora. <strong>Toque em Confirmar</strong> para aceitar,
        ou <strong>Cancelar</strong> se não puder atender naquele horário. Atendeu por telefone?
        Toque em <strong>Novo agendamento</strong> para adicionar na mão.
        {maxDia > 0 && <> Limite diário configurado: <strong>{maxDia}</strong>.</>}
      </Dica>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome…"
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-500" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1">
            <button onClick={() => setVista("lista")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                vista === "lista" ? "bg-teal-600 text-white" : "text-neutral-500 hover:text-neutral-800"
              }`}>
              <List size={14} /> Lista
            </button>
            <button onClick={() => setVista("quadro")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                vista === "quadro" ? "bg-teal-600 text-white" : "text-neutral-500 hover:text-neutral-800"
              }`}>
              <Columns3 size={14} /> Quadro
            </button>
          </div>
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
      ) : vista === "quadro" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(["solicitado", "confirmado", "concluido", "cancelado"] as const).map((s) => {
            const cards = filtrados.filter((a) => a.status === s);
            return (
              <div key={s} className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${statusDot[s] || "bg-neutral-300"}`} />
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-600">{statusBadge[s]?.label || s}</p>
                  </div>
                  <span className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-neutral-500">{cards.length}</span>
                </div>
                <div className="space-y-2.5">
                  {cards.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-neutral-200 py-6 text-center text-xs text-neutral-400">
                      Sem agendamentos
                    </div>
                  ) : cards.map((a) => (
                    <div key={a.id} className="rounded-xl border border-neutral-100 bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-neutral-900">{a.cliente_nome}</p>
                        <span className="shrink-0 text-sm font-bold text-neutral-900">{fmtR$(a.valor)}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {a.servico_nome ?? "Serviço"}
                        {a.horas ? ` · ${a.horas}h` : ""}
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">{fmtData(a.data)}{a.hora ? ` · ${a.hora.slice(0, 5)}` : ""}</p>
                      <div className="mt-2.5 flex items-center gap-1.5">
                        {nextStatus(a.status) && (
                          <button onClick={() => alterarStatus(a.id, nextStatus(a.status)!)}
                            className="flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition-all hover:bg-teal-700">
                            <Check size={12} /> {nextStatus(a.status) === "confirmado" ? "Confirmar" : "Concluir"}
                          </button>
                        )}
                        {a.status !== "cancelado" && a.status !== "concluido" && (
                          <button onClick={() => alterarStatus(a.id, "cancelado")}
                            className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[11px] text-neutral-500 transition-all hover:bg-red-50 hover:text-red-600">
                            <X size={12} /> Cancelar
                          </button>
                        )}
                        <div className="ml-auto flex gap-1">
                          <button onClick={() => abrirEditar(a)} title="Editar"
                            className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-400 transition-all hover:text-neutral-700">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => setConfirmarDel(a)} title="Excluir"
                            className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-400 transition-all hover:text-red-600">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
                <div className="flex items-start justify-between gap-2 p-3 pb-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${statusDot[a.status] || "bg-neutral-300"}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-neutral-900">{a.cliente_nome}</p>
                        <span className="text-sm font-bold text-neutral-900">{fmtR$(a.valor)}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {a.servico_nome ?? "Serviço"}
                        {a.horas ? ` · ${a.horas}h` : ""}
                        {a.origem === "manual" ? " · ✍️ manual" : a.origem === "web" ? " · 🌐 site" : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge[a.status]?.cls}`}>
                    {statusBadge[a.status]?.label}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1 px-3 pb-2 text-xs">
                  <div className="flex gap-2">
                    <span className="w-16 shrink-0 text-neutral-400">Quando</span>
                    <span className="text-neutral-600">{fmtData(a.data)}{a.hora ? ` · ${a.hora.slice(0, 5)}` : ""}</span>
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
                      <span className="truncate text-neutral-600">{a.observacoes}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-1.5 border-t border-neutral-100 bg-neutral-50/50 px-3 py-2">
                  {nextStatus(a.status) && (
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => alterarStatus(a.id, nextStatus(a.status)!)}
                      className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal-700">
                      <Check size={14} />
                      {nextStatus(a.status) === "confirmado" ? "Confirmar" : "Concluir"}
                    </motion.button>
                  )}
                  {a.status !== "cancelado" && a.status !== "concluido" && (
                    <button onClick={() => alterarStatus(a.id, "cancelado")}
                      className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600 shadow-sm transition-all hover:bg-red-50 hover:text-red-600">
                      <X size={14} /> Cancelar
                    </button>
                  )}
                  <div className="ml-auto flex gap-1">
                    <button onClick={() => abrirEditar(a)}
                      className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600 shadow-sm transition-all hover:bg-neutral-100 hover:text-neutral-800">
                      <Pencil size={14} /> Editar
                    </button>
                    <button onClick={() => setConfirmarDel(a)}
                      className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-400 shadow-sm transition-all hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal formulário */}
      {form && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-neutral-900/40 px-4 py-8" onClick={() => !busy && setForm(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-neutral-900">{form.id ? "Editar agendamento" : "Novo agendamento"}</h3>
              <button onClick={() => setForm(null)} className="text-neutral-400 hover:text-neutral-700"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Nome do cliente</label>
                  <input value={form.cliente_nome} onChange={(e) => setForm({ ...form, cliente_nome: e.target.value })} className={inp} placeholder="Ex: Maria" />
                </div>
                <div>
                  <label className={lbl}>WhatsApp</label>
                  <input value={form.cliente_whatsapp} onChange={(e) => setForm({ ...form, cliente_whatsapp: e.target.value })} className={inp} placeholder="41 9..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Data</label>
                  <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Hora</label>
                  <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} className={inp} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Serviço</label>
                  <select value={form.servico_nome} onChange={(e) => setForm({ ...form, servico_nome: e.target.value })} className={inp}>
                    {servicos.map((s) => (
                      <option key={s.id} value={s.nome}>{s.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Frequência</label>
                  <select value={form.recorrencia} onChange={(e) => setForm({ ...form, recorrencia: e.target.value })} className={inp}>
                    <option value="pontual">Pontual</option>
                    <option value="semanal">Semanal</option>
                    <option value="quinzenal">Quinzenal</option>
                    <option value="mensal">Mensal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Valor (R$)</label>
                  <input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} className={inp} placeholder="0,00" />
                </div>
                <div>
                  <label className={lbl}>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inp}>
                    <option value="solicitado">Solicitado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={lbl}>Endereço</label>
                <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} className={inp} placeholder="Rua, nº, bairro" />
              </div>
              <div>
                <label className={lbl}>Observações</label>
                <input value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} className={inp} placeholder="Notas, preferências…" />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setForm(null)} disabled={busy} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-500 transition-all hover:bg-neutral-50 disabled:opacity-50">Cancelar</button>
              <button onClick={salvar} disabled={busy} className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 disabled:opacity-50">
                <Check size={15} /> {busy ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar exclusão */}
      {confirmarDel && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-neutral-900/40 px-5" onClick={() => !busy && setConfirmarDel(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-lg font-semibold text-neutral-900">Excluir este agendamento?</p>
            <p className="mt-2 text-sm text-neutral-500">{confirmarDel.cliente_nome} · {fmtR$(confirmarDel.valor)}. Não dá para desfazer.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmarDel(null)} disabled={busy} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-500 transition-all hover:bg-neutral-50 disabled:opacity-50">Cancelar</button>
              <button onClick={excluir} disabled={busy} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50">
                {busy ? "Excluindo…" : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
