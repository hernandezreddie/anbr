"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  gerarBriefBasico,
  gerarCopysAnuncio,
  type CampanhaBrief,
  type CopysAnuncio,
} from "@/lib/ai/ads";
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
  Clock,
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
  const [servicos, setServicos] = useState<{ nome: string; preco_fixo: number; valor_hora: number; tipo_preco: string; duracao_minutos: number }[]>([]);
  const [profissional, setProfissional] = useState<{ nome: string; cidade: string; categoria: string | null } | null>(null);
  const [servicoSel, setServicoSel] = useState("");
  const [objetivoSel, setObjetivoSel] = useState<CampanhaBrief["objetivo"]>("agendamentos");
  const [copys, setCopys] = useState<CopysAnuncio | null>(null);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      const [prof, serv] = await Promise.all([
        supabase.from("profissionais").select("nome, cidade, categoria").single(),
        supabase.from("servicos").select("nome, preco_fixo, valor_hora, tipo_preco, duracao_minutos").order("ordem"),
      ]);
      if (prof.data) setProfissional(prof.data as typeof profissional);
      if (serv.data?.length) {
        setServicos(serv.data as typeof servicos);
        setServicoSel(serv.data[0].nome);
      }
      setLoading(false);
    }
    carregar();
  }, [supabase]);

  const gerar = async () => {
    setGerando(true);
    const servico = servicos.find((s) => s.nome === servicoSel);
    const preco = servico
      ? servico.tipo_preco === "fixo"
        ? `R$ ${servico.preco_fixo.toFixed(0)}`
        : `R$ ${servico.valor_hora}/h`
      : "sob consulta";

    const duracao = servico ? `${servico.duracao_minutos}min` : "a combinar";
    const categoria = profissional?.categoria || "Serviços";
    const cidade = profissional?.cidade || "sua cidade";
    const diferencial = profissional?.nome
      ? `${profissional.nome} — ${categoria} profissional`
      : "Atendimento de qualidade";

    const brief = gerarBriefBasico(servicoSel, preco, duracao, categoria, cidade, diferencial, objetivoSel);
    const resultado = gerarCopysAnuncio(brief);

    await new Promise((r) => setTimeout(r, 600));
    setCopys(resultado);
    setGerando(false);
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
      </div>

      {/* Resultados */}
      {copys && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
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
