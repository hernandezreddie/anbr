"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { CopysAnuncio } from "@/lib/ai/ads";
import {
  Megaphone,
  Users,
  TrendingUp,
  Gift,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Target,
  DollarSign,
  MapPin,
  BrainCircuit,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";

const objetivos = [
  { id: "agendamentos" as const, label: "Mais agendamentos", icone: <TrendingUp size={18} />, desc: "Campanha de conversão: cliente agenda direto" },
  { id: "seguidores" as const, label: "Mais seguidores", icone: <Users size={18} />, desc: "Campanha de tráfego: crescer Instagram/Facebook" },
  { id: "promocao" as const, label: "Promoção relâmpago", icone: <Gift size={18} />, desc: "Oferta com desconto por tempo limitado" },
  { id: "recuperacao" as const, label: "Recuperar clientes", icone: <RotateCcw size={18} />, desc: "Retargeting: trazer clientes inativos de volta" },
];

export function AdsClient() {
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profissionalId, setProfissionalId] = useState("");
  const [servicos, setServicos] = useState<{ id: string; nome: string }[]>([]);
  const [servicoSel, setServicoSel] = useState("");
  const [objetivoSel, setObjetivoSel] = useState<"agendamentos" | "seguidores" | "promocao" | "recuperacao">("agendamentos");
  const [copys, setCopys] = useState<CopysAnuncio | null>(null);
  const [origem, setOrigem] = useState<"ia" | "template" | null>(null);
  const [modelUsado, setModelUsado] = useState("");
  const [plano, setPlano] = useState<{ nome: string; limiteMensalGratis: number | null } | null>(null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      const [prof, serv, planoRes] = await Promise.all([
        supabase.from("profissionais").select("id").single(),
        supabase.from("servicos").select("id, nome").order("ordem"),
        null,
      ]);
      let planStatus: { nome: string; limiteMensalGratis: number | null } | null = null;
      if (prof.data?.id) {
        try {
          const r = await fetch(`/api/ads/gerar?profissional_id=${prof.data.id}`);
          const j = await r.json();
          planStatus = j?.nome ? { nome: j.nome, limiteMensalGratis: j.limiteMensalGratis || null } : null;
        } catch {}
      }
      if (prof.data) setProfissionalId(prof.data.id);
      if (serv.data?.length) {
        setServicos(serv.data as typeof servicos);
        setServicoSel(serv.data[0].nome);
      }
      setPlano(planStatus);
      setLoading(false);
    }
    carregar();
  }, [supabase]);

  const gerar = async () => {
    setGerando(true);
    setErro("");
    const servico = servicos.find((s) => s.nome === servicoSel);
    try {
      const res = await fetch("/api/ads/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profissional_id: profissionalId,
          servico_id: servico?.id,
          objetivo: objetivoSel,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Erro ao gerar campanha");
      setCopys(j.copys);
      setOrigem(j.origem);
      setModelUsado(j.model || "");
      setPlano(j.nome ? { nome: j.nome, limiteMensalGratis: j.limiteMensalGratis || null } : plano);
    } catch (e: any) {
      setErro(e.message || "Erro ao gerar campanha");
    } finally {
      setGerando(false);
    }
  };

  const copiar = async (texto: string, id: string) => {
    await navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-teal-600" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">AI Ads</h1>
        <p className="mt-1 text-sm text-neutral-500">
          A IA gera copys prontos para você publicar no Facebook, Instagram e Google Ads. Copie e cole — sem precisar pensar no texto.
        </p>
      </div>

      {/* Plano */}
      {plano && (
        <div className={`rounded-2xl border p-4 text-sm shadow-sm ${plano.limiteMensalGratis ? "border-amber-200 bg-amber-50/60 text-amber-800" : "border-teal-100 bg-teal-50/60 text-teal-800"}`}>
          {plano.limiteMensalGratis ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                Plano Grátis: até {plano.limiteMensalGratis} agendamentos/mês. Campanhas de anúncio geram tráfego — o limite pode esgotar rápido.
              </p>
              <a
                href={`/${slug}/painel/plano`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-amber-700"
              >
                Fazer upgrade
                <ArrowUpRight size={14} />
              </a>
            </div>
          ) : (
            <p className="flex items-center gap-2">
              <Sparkles size={16} className="shrink-0" />
              Recurso incluído no seu plano <strong>{plano.nome}</strong> — copys gerados conforme os recursos do seu plano.
            </p>
          )}
        </div>
      )}

      {/* Configuração */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
          <Megaphone size={18} className="text-teal-600" />
          Configurar campanha
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {/* Serviço */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-500">Serviço principal do anúncio</label>
            <select
              value={servicoSel}
              onChange={(e) => setServicoSel(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900"
            >
              {servicos.map((s) => (
                <option key={s.nome} value={s.nome}>{s.nome}</option>
              ))}
            </select>
          </div>

          {/* Objetivo */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-500">Objetivo da campanha</label>
            <div className="grid grid-cols-2 gap-2">
              {objetivos.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setObjetivoSel(obj.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all ${
                    objetivoSel === obj.id
                      ? "border-teal-400 bg-teal-50 text-teal-700"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  {obj.icone}
                  <span className="text-xs font-semibold">{obj.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={gerar}
          disabled={gerando}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 disabled:opacity-50"
        >
          {gerando ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Gerando copys...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Gerar campanha com IA
            </>
          )}
        </button>

        {erro && (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle size={15} className="shrink-0" />
            {erro}
          </p>
        )}
      </div>

      {/* Resultados */}
      {copys && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-neutral-900">Sua campanha</h2>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                origem === "ia"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {origem === "ia" ? (
                <>
                  <BrainCircuit size={13} />
                  Gerado com IA · {modelUsado}
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  Modelo local · configure sua chave de IA em /painel/agente para gerar com IA
                </>
              )}
            </span>
          </div>
          {/* Headlines */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <Target size={16} className="text-teal-600" />
              Headlines (Meta Ads · máx 40 caracteres)
            </h3>
            <div className="space-y-2">
              {copys.headlines.map((h, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{h}</p>
                    <p className="text-xs text-neutral-400">{h.length} caracteres</p>
                  </div>
                  <button
                    onClick={() => copiar(h, `h-${i}`)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-all hover:bg-teal-50 hover:text-teal-600"
                  >
                    {copiado === `h-${i}` ? <Check size={15} className="text-teal-600" /> : <Copy size={15} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Text */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <Megaphone size={16} className="text-teal-600" />
              Texto principal (Meta Ads · primário)
            </h3>
            <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
              <p className="text-sm text-neutral-900 leading-relaxed">{copys.primaryText}</p>
              <p className="mt-2 text-xs text-neutral-400">{copys.primaryText.length} caracteres</p>
            </div>
            <button
              onClick={() => copiar(copys.primaryText, "primary")}
              className="mt-3 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-teal-50 hover:border-teal-200"
            >
              {copiado === "primary" ? <Check size={15} className="text-teal-600" /> : <Copy size={15} />}
              {copiado === "primary" ? "Copiado!" : "Copiar texto"}
            </button>
          </div>

          {/* Segmentação */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <Users size={16} className="text-teal-600" />
              Segmentação sugerida
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="text-xs font-semibold text-neutral-500">Idade</p>
                <p className="text-sm font-medium text-neutral-900">{copys.segmentacao.idade} anos</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="text-xs font-semibold text-neutral-500">Gênero</p>
                <p className="text-sm font-medium text-neutral-900 capitalize">{copys.segmentacao.genero}</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="text-xs font-semibold text-neutral-500">Raio de alcance</p>
                <p className="text-sm font-medium text-neutral-900 flex items-center gap-1.5">
                  <MapPin size={14} />
                  {copys.segmentacao.raioKm} km
                </p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 sm:col-span-1">
                <p className="text-xs font-semibold text-neutral-500">Interesses</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {copys.segmentacao.interesses.map((int) => (
                    <span key={int} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                      {int}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Orçamento */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <DollarSign size={16} className="text-teal-600" />
              Orçamento estimado
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="text-xs font-semibold text-neutral-500">Diário</p>
                <p className="text-sm font-bold text-neutral-900">{copys.orcamento.diario}</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="text-xs font-semibold text-neutral-500">Total 30 dias</p>
                <p className="text-sm font-bold text-neutral-900">{copys.orcamento.totalEstimado}</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <p className="text-xs font-semibold text-neutral-500">CPC médio</p>
                <p className="text-sm font-bold text-neutral-900">{copys.orcamento.cpcMedio}</p>
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-teal-800">
              <Sparkles size={16} />
              Dicas para melhor resultado
            </h3>
            <ul className="space-y-2">
              {copys.dicas.map((dica, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-teal-700">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-200 text-teal-700 text-[10px] font-bold">
                    {i + 1}
                  </span>
                  {dica}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
