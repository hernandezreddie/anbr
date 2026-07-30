"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProfissionalConfig, Servico, Adicional, Frequencia } from "@/types";
import { estimar } from "@/lib/precos";
import { mensagemReserva, linkWhatsApp } from "@/lib/whatsapp";
import { Calendar, Clock, Check, ChevronRight, Sparkles, Star } from "lucide-react";

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
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-neutral-200 bg-white text-lg font-bold transition-colors hover:border-emerald-400 hover:text-emerald-600"
        >
          &minus;
        </motion.button>
        <span className="w-8 text-center text-xl font-semibold">{value}</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(value + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-neutral-200 bg-white text-lg font-bold transition-colors hover:border-emerald-400 hover:text-emerald-600"
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

  const [servicoId, setServicoId] = useState<string>(config.servicos[0]?.id || "");
  const [quartos, setQuartos] = useState(0);
  const [banheiros, setBanheiros] = useState(0);
  const [adicionaisSel, setAdicionaisSel] = useState<string[]>([]);
  const [freqId, setFreqId] = useState<string>("pontual");
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [endereco, setEndereco] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const servico = config.servicos.find((s) => s.id === servicoId);
  const frequencia = config.frequencias.find((f) => f.slug === freqId) || null;
  const isPrecoFixo = servico?.tipo_preco === "fixo";

  const horasBase = servico && !isPrecoFixo
    ? round05(servico.horas_base + quartos * 0.75 + banheiros * 0.75)
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
      })
    : null;

  const handleSubmit = async () => {
    if (!orcamento || !nome || !whatsapp || !data || !hora) return;
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
        }),
      });
      if (!res.ok) throw new Error("Falha ao salvar agendamento");
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

  const minDate = new Date().toISOString().split("T")[0];

  let passo = 2;
  if (isPrecoFixo) passo = 1;

  const step2Label = isPrecoFixo ? "2" : "3";
  const step3Label = isPrecoFixo ? "3" : "4";
  const step4Label = isPrecoFixo ? "4" : "5";
  const step5Label = isPrecoFixo ? "5" : "6";

  return (
    <div style={{ fontFamily: bodyFont }}>
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-6xl"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
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

              {/* Step 2: Rooms (only for por_hora) */}
              {servico && !isPrecoFixo && (
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
                        className="w-full rounded-2xl border-2 border-neutral-200 bg-white px-4 py-3.5 pl-12 text-sm outline-none transition-all focus:border-emerald-500 focus:shadow-md"
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
                        className="w-full rounded-2xl border-2 border-neutral-200 bg-white px-4 py-3.5 pl-12 text-sm outline-none transition-all focus:border-emerald-500 focus:shadow-md appearance-none"
                        style={{ borderColor: hora ? primary : undefined }}
                      >
                        <option value="">Selecione</option>
                        {horarios.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
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
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none transition-all focus:border-emerald-500 focus:shadow-md"
                    style={{ borderColor: nome ? primary : undefined }}
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp com DDD"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none transition-all focus:border-emerald-500 focus:shadow-md"
                    style={{ borderColor: whatsapp ? primary : undefined }}
                    maxLength={11}
                  />
                  <input
                    type="text"
                    placeholder="Seu endereço (opcional)"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="w-full rounded-2xl border-2 border-neutral-200 bg-white px-4 py-3.5 text-sm outline-none transition-all focus:border-emerald-500 focus:shadow-md"
                  />
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
                      {orcamento.desconto > 0 && (
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                          <span className="text-sm opacity-60">Desconto fidelidade</span>
                          <span className="text-sm font-medium text-emerald-600">
                            &minus;R$ {orcamento.desconto.toFixed(2).replace(".", ",")}
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
                        <span
                          className="text-2xl font-bold"
                          style={{ color: primary }}
                        >
                          R$ {orcamento.total.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={!nome || !whatsapp || !data || !hora || submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
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
                      </motion.button>
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
      </div>
    </div>
  );
}