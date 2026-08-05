"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { BadgePercent, Plus, Pencil, Trash2, Check, X, Power, Lightbulb } from "lucide-react";
import { Dica } from "@/components/painel/Dica";
import { getPromocoesPadrao } from "@/lib/promocoes-padrao";
import { getCategoriaPadrao } from "@/lib/servicos-padrao";

type Promocao = {
  id: string;
  profissional_id: string;
  titulo: string;
  texto: string;
  tipo: "porcentagem" | "fixo";
  valor: number;
  servico_id: string | null;
  dias_semana: string[] | null;
  ativo: boolean;
  criado_em: string;
};

type Servico = {
  id: string;
  nome: string;
};

type FormState = {
  id: string | null;
  titulo: string;
  texto: string;
  tipo: "porcentagem" | "fixo";
  valor: string;
  servico_id: string;
  dias_semana: string[];
};

const DIAS = [
  { id: "0", nome: "Dom" },
  { id: "1", nome: "Seg" },
  { id: "2", nome: "Ter" },
  { id: "3", nome: "Qua" },
  { id: "4", nome: "Qui" },
  { id: "5", nome: "Sex" },
  { id: "6", nome: "Sáb" },
];

function fmtDesconto(p: Promocao) {
  return p.tipo === "porcentagem"
    ? `${Number(p.valor)}% OFF`
    : `R$ ${Number(p.valor).toFixed(2).replace(".", ",")} OFF`;
}

export default function OfertasPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Promocao[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [confirmarDel, setConfirmarDel] = useState<Promocao | null>(null);
  const [busy, setBusy] = useState(false);
  const [aviso, setAviso] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [verIdeias, setVerIdeias] = useState(true);

  const flash = (m: string) => {
    setAviso(m);
    setTimeout(() => setAviso(""), 2500);
  };

  const carregar = useCallback(async () => {
    const [pr, sv, prof] = await Promise.all([
      supabase.from("promocoes").select("*").order("criado_em", { ascending: false }),
      supabase.from("servicos").select("id, nome").eq("ativo", true).order("ordem"),
      supabase.from("profissionais").select("categoria").single(),
    ]);
    if (pr.data) setItems(pr.data as Promocao[]);
    if (sv.data) setServicos(sv.data as Servico[]);
    setCategoria((prof.data as { categoria: string | null } | null)?.categoria ?? null);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { carregar(); }, [carregar]);

  const formVazio = (): FormState => ({
    id: null,
    titulo: "",
    texto: "",
    tipo: "porcentagem",
    valor: "",
    servico_id: "",
    dias_semana: [],
  });

  const abrirEditar = (p: Promocao) => {
    setForm({
      id: p.id,
      titulo: p.titulo,
      texto: p.texto ?? "",
      tipo: p.tipo,
      valor: String(p.valor ?? ""),
      servico_id: p.servico_id ?? "",
      dias_semana: p.dias_semana ?? [],
    });
  };

  async function salvar() {
    if (!form) return;
    if (!form.titulo.trim()) {
      flash("Informe um título para a oferta.");
      return;
    }
    if (!form.valor || isNaN(Number(form.valor)) || Number(form.valor) <= 0) {
      flash("Informe o valor do desconto.");
      return;
    }
    if (form.tipo === "porcentagem" && Number(form.valor) > 100) {
      flash("O percentual não pode passar de 100%.");
      return;
    }
    setBusy(true);

    const patch = {
      titulo: form.titulo.trim(),
      texto: form.texto.trim() || "",
      tipo: form.tipo,
      valor: Number(form.valor),
      servico_id: form.servico_id || null,
      dias_semana: form.dias_semana.length ? form.dias_semana : null,
    };

    const res = form.id
      ? await supabase.from("promocoes").update(patch).eq("id", form.id)
      : await supabase.from("promocoes").insert(patch);
    setBusy(false);
    if (res.error) {
      flash("Erro ao salvar. Tente de novo.");
      return;
    }
    setForm(null);
    flash(form.id ? "Oferta atualizada ✔" : "Oferta criada ✔");
    await carregar();
  }

  async function alternarAtivo(p: Promocao) {
    const { error } = await supabase
      .from("promocoes")
      .update({ ativo: !p.ativo })
      .eq("id", p.id);
    if (error) {
      flash("Erro ao atualizar.");
      return;
    }
    flash(!p.ativo ? "Oferta ativada — já aparece no site ✔" : "Oferta desativada.");
    await carregar();
  }

  async function excluir() {
    if (!confirmarDel) return;
    setBusy(true);
    const { error } = await supabase.from("promocoes").delete().eq("id", confirmarDel.id);
    setBusy(false);
    setConfirmarDel(null);
    if (error) { flash("Erro ao excluir."); return; }
    flash("Oferta excluída ✔");
    await carregar();
  }

  const nomeServico = (id: string | null) =>
    id ? servicos.find((s) => s.id === id)?.nome ?? "Serviço" : "Todos os serviços";

  const inp = "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-teal-600";
  const lbl = "mb-1 block text-xs font-semibold text-neutral-500";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
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
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Ofertas</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Promoções que aparecem na sua página e no orçamento
          </p>
        </div>
        <button
          onClick={() => setForm(formVazio())}
          className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700"
        >
          <Plus size={16} /> Nova oferta
        </button>
      </div>

      <Dica>
        Crie uma oferta e <strong>ative quando quiser</strong> — o cliente vê o preço com desconto na hora
        de reservar. Use para primeira visita, dias parados ou campanhas de mês.
      </Dica>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-neutral-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-teal-600" />
            <span className="text-sm">Carregando...</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 py-16">
          <BadgePercent size={32} className="text-neutral-300" />
          <p className="mt-3 text-sm text-neutral-400">
            Nenhuma oferta ainda. Toque em &quot;Nova oferta&quot; para criar a primeira.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((p) => {
            const ativa = p.ativo;
            return (
              <div key={p.id} className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${ativa ? "border-teal-200" : "border-neutral-200 opacity-70"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-neutral-900">{p.titulo}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${ativa ? "bg-teal-100 text-teal-700" : "bg-neutral-100 text-neutral-500"}`}>
                        {fmtDesconto(p)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      {nomeServico(p.servico_id)}
                      {p.dias_semana?.length ? ` · ${p.dias_semana.map((d) => DIAS.find((x) => x.id === d)?.nome).filter(Boolean).join(", ")}` : " · todos os dias"}
                    </p>
                    {p.texto && <p className="mt-1 text-xs text-neutral-400">{p.texto}</p>}
                  </div>
                  <button
                    onClick={() => alternarAtivo(p)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                      ativa
                        ? "bg-teal-600 text-white shadow-sm hover:bg-teal-700"
                        : "border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-100"
                    }`}
                  >
                    <Power size={13} />
                    {ativa ? "Ativa" : "Inativa"}
                  </button>
                </div>
                <div className="mt-4 flex gap-2 border-t border-neutral-100 pt-3">
                  <button onClick={() => abrirEditar(p)}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600 transition-all hover:bg-neutral-100 hover:text-neutral-800">
                    <Pencil size={13} /> Editar
                  </button>
                  <button onClick={() => setConfirmarDel(p)}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-400 transition-all hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={13} /> Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal formulário */}
      {form && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-neutral-900/40 px-4 py-8" onClick={() => !busy && setForm(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-neutral-900">{form.id ? "Editar oferta" : "Nova oferta"}</h3>
              <button onClick={() => setForm(null)} className="text-neutral-400 hover:text-neutral-700"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                <button
                  type="button"
                  onClick={() => setVerIdeias(!verIdeias)}
                  className="flex w-full items-center justify-between"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <Lightbulb size={15} />
                    Ideias prontas para {getCategoriaPadrao(categoria)?.nome ?? "seu nicho"}
                  </p>
                  <span className={`text-xs text-amber-700 transition-transform ${verIdeias ? "rotate-180" : ""}`}>▾</span>
                </button>
                {verIdeias && (
                  <>
                    <p className="mt-2 text-xs text-amber-700">
                      Toque em uma ideia para preencher o formulário — depois ajuste o valor se quiser.
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {getPromocoesPadrao(categoria).map((ideia) => (
                        <button
                          key={ideia.titulo}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              titulo: ideia.titulo,
                              texto: ideia.texto,
                              tipo: ideia.tipo,
                              valor: String(ideia.valor),
                              dias_semana: ideia.dias_semana
                                ? ideia.dias_semana.map((d) => String(d))
                                : form.dias_semana,
                            })
                          }
                          className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-left transition-all hover:border-amber-400 hover:shadow-sm"
                        >
                          <p className="text-xs font-semibold text-neutral-800">
                            {ideia.titulo}
                            <span className="ml-1.5 font-bold text-amber-700">
                              {ideia.tipo === "porcentagem" ? `${ideia.valor}% OFF` : `R$ ${ideia.valor.toFixed(2).replace(".", ",")} OFF`}
                            </span>
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-neutral-500">{ideia.texto}</p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className={lbl}>Título da oferta (aparece no site)</label>
                <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className={inp} placeholder="Ex: Primeira visita 20% OFF" />
              </div>
              <div>
                <label className={lbl}>Mensagem do banner</label>
                <input value={form.texto} onChange={(e) => setForm({ ...form, texto: e.target.value })}
                  className={inp} placeholder="Ex: Chame e aproveite essa condição especial" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Tipo de desconto</label>
                  <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as FormState["tipo"] })} className={inp}>
                    <option value="porcentagem">Porcentagem (%)</option>
                    <option value="fixo">Valor fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>{form.tipo === "porcentagem" ? "Percentual (%)" : "Valor (R$)"}</label>
                  <input type="number" min="0" step={form.tipo === "porcentagem" ? "1" : "0.01"}
                    value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })}
                    className={inp} placeholder={form.tipo === "porcentagem" ? "20" : "25,00"} />
                </div>
              </div>
              <div>
                <label className={lbl}>Aplica a qual serviço?</label>
                <select value={form.servico_id} onChange={(e) => setForm({ ...form, servico_id: e.target.value })} className={inp}>
                  <option value="">Todos os serviços</option>
                  {servicos.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Dias da semana (deixe todos marcados p/ todos os dias)</label>
                <div className="flex flex-wrap gap-2">
                  {DIAS.map((d) => {
                    const marcado = form.dias_semana.includes(d.id);
                    return (
                      <button key={d.id} type="button"
                        onClick={() => setForm({
                          ...form,
                          dias_semana: marcado
                            ? form.dias_semana.filter((x) => x !== d.id)
                            : [...form.dias_semana, d.id],
                        })}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                          marcado
                            ? "border-teal-600 bg-teal-600 text-white"
                            : "border-neutral-200 text-neutral-500 hover:border-neutral-400"
                        }`}>
                        {d.nome}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setForm(null)} disabled={busy}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-500 transition-all hover:bg-neutral-50 disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={salvar} disabled={busy}
                className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 disabled:opacity-50">
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
            <p className="text-lg font-semibold text-neutral-900">Excluir esta oferta?</p>
            <p className="mt-2 text-sm text-neutral-500">{confirmarDel.titulo} · {fmtDesconto(confirmarDel)}. Não dá para desfazer.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmarDel(null)} disabled={busy}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-500 transition-all hover:bg-neutral-50 disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={excluir} disabled={busy}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-50">
                {busy ? "Excluindo…" : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
