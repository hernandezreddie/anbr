"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProfissionalConfig, Servico, Adicional, Frequencia } from "@/types";
import { estimar } from "@/lib/precos";
import { mensagemReserva, linkWhatsApp } from "@/lib/whatsapp";
import { contrastante, accento } from "@/lib/cores";
import { Calendar, Clock, Check, ChevronRight, Sparkles, Star, ArrowLeft, CheckCircle2, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const round05 = (n: number) => Math.round(n * 2) / 2;

function SectionTitle({ number, title, color }: { number: string; title: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {number}
      </span>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}

function ServiceCard({
  s,
  selected,
  onClick,
  color,
}: {
  s: Servico;
  selected: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <motion.button
      layout
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all ${
        selected
          ? "shadow-lg"
          : "border-transparent bg-white/50 shadow-sm hover:shadow-md hover:-translate-y-0.5"
      }`}
      style={{
        borderColor: selected ? color : undefined,
        background: selected
          ? `linear-gradient(135deg, ${color}08, ${color}04)`
          : undefined,
      }}
      whileTap={{ scale: 0.98 }}
    >
      {selected && (
        <div
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: color }}
        >
          <Check className="h-4 w-4 text-white" />
        </div>
      )}
      <div
        className="mb-2 text-lg font-semibold"
        style={{ color: selected ? color : undefined }}
      >
        {s.nome}
      </div>
      <div className="text-sm leading-relaxed opacity-70">
        {s.descricao_curta || s.descricao}
      </div>
    </motion.button>
  );
}

function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium opacity-60">{label}</label>
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-neutral-200 bg-white text-lg font-bold transition-colors hover:border-teal-400 hover:text-teal-600"
        >
          &minus;
        </motion.button>
        <span className="w-8 text-center text-xl font-semibold">{value}</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(value + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-neutral-200 bg-white text-lg font-bold transition-colors hover:border-teal-400 hover:text-teal-600"
        >
          +
        </motion.button>
      </div>
    </div>
  );
}

function ChipButton<T extends string>({
  label,
  suffix,
  selected,
  onClick,
  color,
}: {
  label: string;
  suffix?: string;
  selected: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`rounded-full border-2 px-5 py-2.5 text-sm font-medium transition-all ${
        selected
          ? "text-white shadow-md"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:shadow-sm"
      }`}
      style={{
        backgroundColor: selected ? color : undefined,
        borderColor: selected ? color : undefined,
      }}
    >
      {label}
      {suffix && <span className="ml-1.5 opacity-80">{suffix}</span>}
    </motion.button>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function ReservarClient({ config }: { config: ProfissionalConfig }) {
  const primary = config.configuracao?.cor_primaria || "#059669";
  const secondary = config.configuracao?.cor_secundaria || "#1c1917";
  const headingFont = config.configuracao?.fonte_titulo || "Fraunces";
  const bodyFont = config.configuracao?.fonte_corpo || "Inter";
  const categoria = config.profissional.categoria || "outro";
  const usaComodos = categoria === "limpeza";

  const [servicoId, setServicoId] = useState<string>(config.servicos[0]?.id || "");
  const [quartos, setQuartos] = useState(0);
  const [banheiros, setBanheiros] = useState(0);
  const [adicionaisSel, setAdicionaisSel] = useState<string[]>([]);
  const [freqId, setFreqId] = useState<string>("pontual");
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [endereco, setEndereco] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erroMsg, setErroMsg] = useState("");
  const [ocupados, setOcupados] = useState<{ inicio: string; minutos: number }[]>([]);
  const [limiteDia, setLimiteDia] = useState(0);
  const [totalDia, setTotalDia] = useState(0);

  const servico = config.servicos.find((s) => s.id === servicoId);
  const frequencia = config.frequencias.find((f) => f.slug === freqId) || null;
  const isPrecoFixo = servico?.tipo_preco === "fixo";

  const promoAtiva = (config.promocoes ?? []).find(
    (p) =>
      p.ativo &&
      (!p.servico_id || p.servico_id === servicoId) &&
      (!data ||
        !p.dias_semana?.length ||
        p.dias_semana.includes(String(new Date(data + "T12:00:00").getDay())))
  );

  const horasBase = servico && !isPrecoFixo
    ? round05(servico.horas_base + (usaComodos ? quartos * 0.75 + banheiros * 0.75 : 0))
    : 0;

  const adicionaisFiltrados = config.adicionais.filter(
    (a) => a.servico_id === servicoId || !a.servico_id,
  );

  const orcamento = servico
    ? estimar({
        servico,
        horas_base: horasBase,
        adicionais: config.adicionais,
        adicionaisSelecionados: adicionaisSel,
        frequencia,
        promocao: promoAtiva ? { tipo: promoAtiva.tipo, valor: promoAtiva.valor } : null,
      })
    : null;

  const horaParaMin = (h: string) => {
    const [hh, mm] = h.split(":").map(Number);
    return hh * 60 + mm;
  };

  const WORK_INICIO = 8 * 60;
  const WORK_FIM = 20 * 60;

  const duracaoMin = servico
    ? isPrecoFixo
      ? servico.duracao_minutos || 60
      : Math.max(30, Math.round((orcamento?.horas || 1) * 60))
    : 60;

  const minDate = new Date().toISOString().split("T")[0];

  const indisponivel = (h: string): boolean => {
    const inicio = horaParaMin(h);
    if (inicio < WORK_INICIO || inicio + duracaoMin > WORK_FIM) return true;
    if (data === minDate) {
      const agora = new Date().getHours() * 60 + new Date().getMinutes();
      if (inicio <= agora) return true;
    }
    return ocupados.some((o) => {
      const oIni = horaParaMin(o.inicio);
      const oFim = oIni + o.minutos;
      return inicio < oFim && inicio + duracaoMin > oIni;
    });
  };

  useEffect(() => {
    if (!data) {
      setOcupados([]);
      return;
    }
    let ativo = true;
    fetch(`/api/agendamentos?slug=${config.profissional.slug}&data=${data}`)
      .then((r) => r.json())
      .then((j) => {
        if (!ativo) return;
        setOcupados(Array.isArray(j?.ocupados) ? j.ocupados : []);
        setLimiteDia(Number(j?.max_agendamentos_dia) || 0);
        setTotalDia(Number(j?.total_dia) || 0);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [data, config.profissional.slug]);

  useEffect(() => {
    if (hora && indisponivel(hora)) setHora("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicoId, data, ocupados, duracaoMin]);

  const handleSubmit = async () => {
    if (!orcamento || !nome || !whatsapp || !data || !hora) return;
    if (!consentimento) {
      setErroMsg("Para confirmar, aceite os Termos de Uso e a Política de Privacidade.");
      return;
    }
    setSubmitting(true);

    const extras = isPrecoFixo && orcamento.duracao_minutos
      ? ` (${orcamento.duracao_minutos}min)`
      : ` (${orcamento.horas}h)`;

    const adicionaisNomes = adicionaisSel
      .map((id) => config.adicionais.find((a) => a.id === id)?.nome)
      .filter(Boolean) as string[];

    try {
      const res = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: config.profissional.slug,
          servico_id: servicoId,
          adicionais: adicionaisNomes,
          frequencia,
          horas: orcamento.horas,
          valor: orcamento.total,
          data,
          hora,
          cliente_nome: nome,
          cliente_whatsapp: whatsapp,
          cliente_endereco: endereco,
          consentimento: true,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        if (res.status === 409 && j?.limite) {
          setErroMsg(j.error || "Limite de agendamentos atingido nesse dia.");
          setSubmitting(false);
          return;
        }
        if (res.status === 409 && j?.conflito) {
          setErroMsg(j.error || "Esse horário acabou de ser reservado. Escolha outro.");
          setSubmitting(false);
          return;
        }
        throw new Error("Falha ao salvar agendamento");
      }
      setEnviado(true);
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }

    const msg = mensagemReserva(config.profissional.primeiro_nome, {
      nome,
      servico: orcamento.servico_nome + extras,
      adicionais: adicionaisNomes,
      horas: orcamento.horas,
      endereco,
      frequencia: frequencia?.nome || "Pontual",
      total: orcamento.total,
    });

    window.open(linkWhatsApp(msg, config.profissional.whatsapp), "_blank");
    setSubmitting(false);
  };

  const horarios = useMemo(() => {
    const slots: string[] = [];
    for (let h = 8; h <= 18; h++) {
      slots.push(`${h.toString().padStart(2, "0")}:00`);
      if (h < 18) slots.push(`${h.toString().padStart(2, "0")}:30`);
    }
    return slots;
  }, []);

  let passo = 2;
  if (isPrecoFixo) passo = 1;

  const step2Label = isPrecoFixo ? "2" : "3";
  const step3Label = isPrecoFixo ? "3" : "4";
  const step4Label = isPrecoFixo ? "4" : "5";
  const step5Label = isPrecoFixo ? "5" : "6";

  return (
    <div data-niche={categoria} style={{ fontFamily: bodyFont }}>
      {/* Header */}
      <div
        className="relative overflow-hidden pb-16 pt-12"
        style={{
          background: `linear-gradient(135deg, ${primary}, ${primary}dd)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white" />
        </div>
        <div className="container-x relative">
          <motion.a
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            href={`/${config.profissional.slug}`}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-all hover:bg-white/25"
          >
            <ArrowLeft size={15} />
            Voltar para o site
          </motion.a>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: headingFont }}
          >
            {config.profissional.primeiro_nome}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-white/80"
          >
            {config.configuracao?.slogan || config.profissional.slogan}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 flex items-center gap-2 text-sm text-white/70"
          >
            <Sparkles className="h-4 w-4" />
            Preencha os dados e receba seu orçamento via WhatsApp
          </motion.div>
        </div>
      </div>

      <div className="container-x -mt-8 pb-16">
        {/* Step Progress Indicator */}
        {!enviado && (
          <div className="mb-8 flex items-center justify-center gap-2 overflow-x-auto py-3">
            {[
              { label: "Serviço", key: "servico" },
              ...(!isPrecoFixo && usaComodos ? [{ label: "Cômodos", key: "comodos" }] : []),
              ...(adicionaisFiltrados.length > 0 ? [{ label: "Extras", key: "extras" }] : []),
              { label: "Frequência", key: "frequencia" },
              { label: "Data/Hora", key: "datetime" },
              { label: "Dados", key: "dados" },
            ].map((step, i, arr) => {
              const stepKeys = ["servico", "comodos", "extras", "frequencia", "datetime", "dados"];
              const currentIdx = stepKeys.indexOf(step.key);
              const isActive = currentIdx >= 0;
              const isCompleted = currentIdx > 0;
              return (
                <Fragment key={step.key}>
                  {i > 0 && (
                    <div className={`h-px w-6 sm:w-10 ${isCompleted ? "" : "bg-neutral-200"}`} style={{ backgroundColor: isCompleted ? primary : undefined }} />
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        isActive ? "text-white" : "bg-neutral-100 text-neutral-400"
                      }`}
                      style={isActive ? { backgroundColor: isCompleted ? primary : undefined } : {}}
                    >
                      {isCompleted ? <Check size={12} /> : i + 1}
                    </div>
                    <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? "text-ink" : "text-neutral-400"}`}>
                      {step.label}
                    </span>
                  </div>
                </Fragment>
              );
            })}
          </div>
        )}
        {enviado ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg"
          >
            <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-neutral-200/50">
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.15 }}
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${primary}15` }}
                >
                  <CheckCircle2 size={34} style={{ color: primary }} />
                </motion.div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: headingFont }}>
                  Solicitação enviada!
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  Abrimos o WhatsApp para você confirmar o pedido com{" "}
                  <b className="text-neutral-800">{config.profissional.primeiro_nome}</b>.
                  Se o WhatsApp não abriu, toque no botão abaixo.
                </p>
                <a
                  href={linkWhatsApp(`Olá ${config.profissional.primeiro_nome}! Confirmando meu agendamento que enviei pelo site.`, config.profissional.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold transition-transform hover:scale-[1.01]"
                  style={{ backgroundColor: primary, color: contrastante(primary) }}
                >
                  Abrir WhatsApp
                </a>
                <a
                  href={`/${config.profissional.slug}`}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-neutral-200 px-6 py-3.5 text-sm font-medium text-neutral-600 transition-all hover:border-neutral-300 hover:bg-neutral-50"
                >
                  <ArrowLeft size={15} />
                  Voltar para o site
                </a>
              </div>
            </div>
          </motion.div>
        ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-6xl"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {erroMsg && (
              <div className="lg:col-span-2">
                <div className="flex items-start justify-between gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-800">
                  <p className="leading-relaxed">{erroMsg}</p>
                  <button onClick={() => setErroMsg("")} className="shrink-0 text-amber-500 hover:text-amber-700" aria-label="Fechar">
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
            {/* Left Column - Form */}
            <div className="space-y-10">
              {/* Step 1: Service */}
              <motion.section variants={itemVariants}>
                <SectionTitle number="1" title="Tipo de serviço" color={primary} />
                <div className="grid gap-3 sm:grid-cols-2">
                  {config.servicos.map((s) => (
                    <ServiceCard
                      key={s.id}
                      s={s}
                      selected={servicoId === s.id}
                      onClick={() => setServicoId(s.id)}
                      color={primary}
                    />
                  ))}
                </div>
              </motion.section>

              {/* Step 2: Rooms (only for limpeza por_hora) */}
              {servico && !isPrecoFixo && usaComodos && (
                <motion.section
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <SectionTitle number="2" title="Cômodos" color={primary} />
                  <div className="flex flex-wrap gap-8">
                    <Counter label="Quartos" value={quartos} onChange={setQuartos} />
                    <Counter label="Banheiros" value={banheiros} onChange={setBanheiros} />
                  </div>
                </motion.section>
              )}

              {/* Step 3 / 2: Add-ons */}
              {adicionaisFiltrados.length > 0 && (
                <motion.section variants={itemVariants}>
                  <SectionTitle
                    number={step2Label}
                    title="Adicionais"
                    color={primary}
                  />
                  <div className="flex flex-wrap gap-2">
                    {adicionaisFiltrados.map((a) => (
                      <ChipButton
                        key={a.id}
                        label={a.nome}
                        suffix={a.preco > 0 ? `+R$ ${a.preco.toFixed(2).replace(".", ",")}` : undefined}
                        selected={adicionaisSel.includes(a.id)}
                        onClick={() =>
                          setAdicionaisSel((prev) =>
                            prev.includes(a.id)
                              ? prev.filter((id) => id !== a.id)
                              : [...prev, a.id],
                          )
                        }
                        color={primary}
                      />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Step 4 / 3: Frequency */}
              <motion.section variants={itemVariants}>
                <SectionTitle number={step3Label} title="Frequência" color={primary} />
                <div className="flex flex-wrap gap-2">
                  {config.frequencias.map((f) => (
                    <ChipButton
                      key={f.id}
                      label={f.nome}
                      suffix={f.desconto > 0 ? `-${f.desconto}%` : undefined}
                      selected={freqId === f.slug}
                      onClick={() => setFreqId(f.slug)}
                      color={primary}
                    />
                  ))}
                </div>
              </motion.section>

              {/* Step 5 / 4: Date & Time */}
              <motion.section variants={itemVariants}>
                <SectionTitle number={step4Label} title="Data e horário" color={primary} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium opacity-60">Data</label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-40" />
                      <input
                        type="date"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        min={minDate}
                        className="w-full rounded-2xl border-2 border-neutral-200 bg-white px-4 py-3.5 pl-12 text-sm outline-none transition-all focus:border-teal-500 focus:shadow-md"
                        style={{ borderColor: data ? primary : undefined }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium opacity-60">Horário</label>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-40" />
                      <select
                        value={hora}
                        onChange={(e) => setHora(e.target.value)}
                        className="w-full rounded-2xl border-2 border-neutral-200 bg-white px-4 py-3.5 pl-12 text-sm outline-none transition-all focus:border-teal-500 focus:shadow-md appearance-none"
                        style={{ borderColor: hora ? primary : undefined }}
                      >
                        <option value="">Selecione</option>
                        {horarios.map((h) => {
                          const ocupado = indisponivel(h);
                          return (
                            <option key={h} value={h} disabled={ocupado}>
                              {h}{ocupado ? " — indisponível" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    {data && horarios.every((h) => indisponivel(h)) && (
                      <p className="mt-2 text-xs font-medium" style={{ color: "#d97706" }}>
                        Sem horários livres neste dia — escolha outra data.
                      </p>
                    )}
                    {data && limiteDia > 0 && totalDia >= limiteDia && (
                      <p className="mt-2 text-xs font-medium" style={{ color: "#d97706" }}>
                        Este dia já atingiu o limite de {limiteDia} agendamento(s).
                      </p>
                    )}
                  </div>
                </div>
              </motion.section>

              {/* Step 6 / 5: User Data */}
              <motion.section variants={itemVariants}>
                <SectionTitle number={step5Label} title="Seus dados" color={primary} />
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none transition-all focus:border-teal-500 focus:shadow-md"
                    style={{ borderColor: nome ? primary : undefined }}
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp com DDD"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none transition-all focus:border-teal-500 focus:shadow-md"
                    style={{ borderColor: whatsapp ? primary : undefined }}
                    maxLength={11}
                  />
                  <input
                    type="text"
                    placeholder="Seu endereço (opcional)"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none transition-all focus:border-teal-500 focus:shadow-md"
                  />
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-neutral-200 bg-white p-4 transition-all">
                    <input
                      type="checkbox"
                      checked={consentimento}
                      onChange={(e) => setConsentimento(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-teal-500"
                    />
                    <span className="text-sm leading-relaxed text-neutral-600">
                      Li e aceito os{" "}
                      <a href="/termos" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2" style={{ color: primary }}>
                        Termos de Uso
                      </a>{" "}
                      e a{" "}
                      <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2" style={{ color: primary }}>
                        Política de Privacidade
                      </a>{" "}
                      e autorizo o tratamento dos meus dados conforme a LGPD (Lei 13.709/2018).
                    </span>
                  </label>
                </div>
              </motion.section>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <motion.div
                variants={itemVariants}
                className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-neutral-200/50"
              >
                {/* Summary header */}
                <div className="p-6 pb-0">
                  <h3
                    className="flex items-center gap-2 text-lg font-semibold"
                    style={{ fontFamily: headingFont }}
                  >
                    <Star className="h-5 w-5" style={{ color: primary }} />
                    Resumo do pedido
                  </h3>
                </div>

                {orcamento ? (
                  <>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <span className="text-sm opacity-60">Serviço</span>
                        <span className="text-sm font-medium">{orcamento.servico_nome}</span>
                      </div>
                      {isPrecoFixo && orcamento.duracao_minutos ? (
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                          <span className="text-sm opacity-60">Duração</span>
                          <span className="text-sm font-medium">{orcamento.duracao_minutos}min</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                          <span className="text-sm opacity-60">Duração</span>
                          <span className="text-sm font-medium">{orcamento.horas}h</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <span className="text-sm opacity-60">Valor</span>
                        <span className="text-sm font-medium">
                          R$ {orcamento.bruto.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                      {orcamento.descontoFrequencia > 0 && (
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                          <span className="text-sm opacity-60">Desconto fidelidade</span>
                          <span className="text-sm font-medium text-teal-600">
                            &minus;R$ {orcamento.descontoFrequencia.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      )}
                      {orcamento.descontoPromo > 0 && (
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                          <span className="flex items-center gap-1.5 text-sm opacity-60">
                            <Tag className="h-3.5 w-3.5" style={{ color: primary }} />
                            Oferta: {promoAtiva?.titulo ?? "Promoção"}
                          </span>
                          <span className="text-sm font-medium text-teal-600">
                            &minus;R$ {orcamento.descontoPromo.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      )}
                      {data && (
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                          <span className="text-sm opacity-60">Data</span>
                          <span className="text-sm font-medium">
                            {new Date(data + "T00:00:00").toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      )}
                      {hora && (
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                          <span className="text-sm opacity-60">Horário</span>
                          <span className="text-sm font-medium">{hora}</span>
                        </div>
                      )}
                    </div>

                    {/* Total + CTA */}
                    <div
                      className="p-6"
                      style={{ backgroundColor: `${primary}08` }}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-base font-semibold">Total</span>
                        <div className="flex items-baseline gap-2">
                          {orcamento.descontoPromo > 0 && (
                            <span className="text-sm text-neutral-400 line-through">
                              R$ {(orcamento.bruto - orcamento.descontoFrequencia)
                                .toFixed(2).replace(".", ",")}
                            </span>
                          )}
                          <span
                            className="text-2xl font-bold"
                            style={{ color: accento(primary) }}
                          >
                            R$ {orcamento.total.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={!nome || !whatsapp || !data || !hora || submitting}
                        style={{ backgroundColor: primary }}
                      >
                        {submitting ? (
                          "Salvando..."
                        ) : (
                          <>
                            Enviar orçamento
                            <ChevronRight className="h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center text-sm opacity-40">
                    Selecione um serviço para ver o valor
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
        )}
      </div>
    </div>
  );
}