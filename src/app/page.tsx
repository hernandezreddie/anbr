"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import {
  Check, ArrowRight, CalendarCheck, MessageCircle, Bot,
  Palette, LayoutDashboard, Bell, Moon, Zap, Shield,
  Wrench, Scissors, Stethoscope, Dumbbell, Brush, ChefHat,
  Camera, MonitorSmartphone, HelpCircle, Globe, Hand, HeartPulse, Car, PawPrint, TrendingUp, Clock, X,
} from "lucide-react";

type CategoriaServico = {
  icone: React.ReactNode;
  nome: string;
  exemplos: string;
};

const categorias: CategoriaServico[] = [
  { icone: <Scissors size={28} />, nome: "Beleza e Estética", exemplos: "Cabeleireiro, manicure, depilação" },
  { icone: <Wrench size={28} />, nome: "Limpeza e Conservação", exemplos: "Diaristas, faxina, pós-obra" },
  { icone: <Stethoscope size={28} />, nome: "Saúde e Bem-estar", exemplos: "Massagem, acupuntura, nutrição" },
  { icone: <HeartPulse size={28} />, nome: "Clínica e Consultório", exemplos: "Médicos, dentistas, fisioterapia" },
  { icone: <Dumbbell size={28} />, nome: "Personal & Esportes", exemplos: "Personal trainer, pilates, yoga" },
  { icone: <Car size={28} />, nome: "Automotivo", exemplos: "Lava-jato, polimento, mecânica" },
  { icone: <PawPrint size={28} />, nome: "Pet Shop & Veterinária", exemplos: "Banho e tosa, consultas, vacinas" },
  { icone: <Hand size={28} />, nome: "Nail Designer", exemplos: "Alongamento em gel, fibra de vidro" },
  { icone: <Brush size={28} />, nome: "Artes e Ofícios", exemplos: "Tatuagem, pintura, artesanato" },
  { icone: <ChefHat size={28} />, nome: "Gastronomia", exemplos: "Chef em casa, buffet, confeitaria" },
  { icone: <Camera size={28} />, nome: "Fotografia e Eventos", exemplos: "Ensaio, festas, casamentos" },
  { icone: <MonitorSmartphone size={28} />, nome: "Consultoria e Aulas", exemplos: "Mentoria, coaching, reforço escolar" },
];

const problemas = [
  { antes: "Cliente pergunta preço no WhatsApp e você demora 3h para responder", depois: "AI Agent responde em segundos, 24h por dia, com preços e horários certos" },
  { antes: "Agenda no papel ou no celular: cliente desmarca em cima da hora e você perde o slot", depois: "Confirmação e lembrete automáticos no WhatsApp reduzem faltas em até 40%" },
  { antes: "Você passa o dia no telefone marcando horário em vez de trabalhar", depois: "Sua página de agendamento vende por você: cliente escolhe, agenda e paga sozinho" },
];

const beneficios = [
  {
    icone: <CalendarCheck size={24} />,
    titulo: "Sua página de agendamento 24h",
    desc: "O cliente entra, escolhe o serviço, vê seus horários livres e agenda sozinho — de dia ou de noite. Você só aparece para atender.",
    destaque: "Pare de perder cliente por não responder WhatsApp a tempo.",
  },
  {
    icone: <Bot size={24} />,
    titulo: "AI Agent atende por você no WhatsApp, Instagram e Facebook",
    desc: "A IA responde dúvidas sobre preços e horários, qualifica leads e fecha agendamentos automaticamente. Você acompanha tudo pelo painel.",
    destaque: "Incluso nos planos Profissional e IA Premium.",
  },
  {
    icone: <LayoutDashboard size={24} />,
    titulo: "Painel completo: agenda, clientes, Pix e relatórios",
    desc: "Agenda centralizada, cadastro de clientes com histórico, pagamentos via Pix, lembretes automáticos e relatórios de faturamento — tudo em um lugar só.",
    destaque: "Chega de planilha, caderninho e maquininha separados.",
  },
  {
    icone: <Bell size={24} />,
    titulo: "Lembretes automáticos que reduzem faltas em até 40%",
    desc: "Confirmação e lembrete no WhatsApp no dia anterior e no mesmo dia. O cliente confirma com um toque — e se cancelar, o horário libera automaticamente.",
    destaque: "Cada falta evitada é dinheiro que entra no seu bolso.",
  },
  {
    icone: <Palette size={24} />,
    titulo: "Com a sua cara: suas cores, seu logo, seu domínio",
    desc: "Personalize tudo visualmente. Nos planos Profissional e IA Premium, use seu próprio domínio (ex: seu-nome.com.br) e passe a imagem que seu negócio merece.",
    destaque: "Sem parecer 'mais um marketplace' — a página é 100% sua.",
  },
  {
    icone: <Shield size={24} />,
    titulo: "Seus dados, sua base de clientes, zero comissão",
    desc: "Você é dono da sua página, do seu domínio e da sua lista de clientes. Sem repasse de comissão por agendamento. Comece grátis, cancele quando quiser.",
    destaque: "Planos a partir de R$ 49/mês — menos que uma pizza por mês.",
  },
];

const passos = [
  { titulo: "Cadastre seus serviços", tempo: "2 min", desc: "Informe o que você faz, seus preços, horários e dias de atendimento. Preencheu? Sua página já está no ar." },
  { titulo: "Personalize sua página", tempo: "3 min", desc: "Escolha cores, logo, fonte e template. Sua página de agendamento fica pronta com a sua identidade visual." },
  { titulo: "Conecte o AI Agent e receba clientes", tempo: "Instantâneo", desc: "Conecte o agente ao seu WhatsApp e redes sociais. Cole o link no Instagram e comece a receber agendamentos." },
];

const precosPreview = [
  { nome: "Grátis", preco: "R$ 0", destaque: false, slug: "/precos#gratis", desc: "30 agendamentos/mês", extras: ["Página profissional", "Agendamento online 24h", "Confirmação no WhatsApp"] },
  { nome: "Profissional", preco: "R$ 49", destaque: true, slug: "/precos#profissional", desc: "Tudo do Grátis + AI Agent + Google Calendar + domínio próprio", extras: ["AI Agent nas redes sociais", "Google Calendar sincronizado", "Domínio próprio (seu-nome.com.br)", "Relatórios de faturamento"] },
  { nome: "IA Premium", preco: "R$ 99", destaque: false, slug: "/precos#ia-premium", desc: "Tudo do Profissional + WhatsApp API + anúncios inteligentes", extras: ["WhatsApp API (Meta oficial)", "AI Ads — IA cria anúncios para você", "Atendimento prioritário"] },
];

const faq = [
  { q: "Preciso saber programação para criar meu sistema?", r: "Não. Você cadastra seus dados, escolhe um template e pronto — seu sistema está no ar em menos de 5 minutos. Tudo visual, sem uma linha de código." },
  { q: "É realmente grátis? Qual é a pegadinha?", r: "O plano Grátis é 100% gratuito para sempre, com 30 agendamentos por mês. Sem cartão de crédito. Se seu negócio crescer, você faz upgrade para um plano pago — mas só se quiser." },
  { q: "Como o AI Agent atende meus clientes?", r: "Você conecta seu WhatsApp, Instagram e Facebook ao agente. Ele responde dúvidas sobre serviços, preços e horários, qualifica o cliente e agenda no seu lugar. Tudo em português, 24h por dia. Você acompanha as conversas pelo painel." },
  { q: "Vale a pena pagar R$ 49 pelo plano Profissional?", r: "Se você tem mais de 30 agendamentos por mês, sim. O plano se paga com 1 ou 2 agendamentos a mais que você não perderia. Além disso, o AI Agent sozinho economiza horas de WhatsApp todo dia. Menos que R$ 1,65 por dia." },
  { q: "Posso usar meu próprio domínio (meu-nome.com.br)?", r: "Sim! Nos planos Profissional e IA Premium você conecta seu domínio próprio. Ajudamos com a configuração do DNS — leva 5 minutos." },
  { q: "Como recebo os pagamentos?", r: "Seu cliente escolhe o serviço, agenda e paga com Pix direto para a sua chave. O valor cai na sua conta na hora. A plataforma não cobra taxa sobre cada agendamento." },
  { q: "Quais tipos de serviço funcionam no AN.BR?", r: "Qualquer serviço profissional: beleza, estética, saúde, limpeza, consultoria, aulas particulares, fotografia, eventos, personal trainer, tatuagem, petshop e muito mais. Se você cobra pelo seu tempo, funciona." },
  { q: "Tem suporte em português?", r: "Sim, suporte humanizado em português por WhatsApp e email. Nossa equipe está no Brasil e responde de segunda a sexta." },
];

function Secao({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-20 sm:py-28 ${className}`}>
      <div className="container-x">{children}</div>
    </section>
  );
}

function TituloSecao({ children, subtitulo }: { children: React.ReactNode; subtitulo?: string }) {
  return (
    <div className="mb-14 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{children}</h2>
      {subtitulo && <p className="mt-3 max-w-2xl mx-auto text-lg text-ink-soft">{subtitulo}</p>}
    </div>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!isInView || started) return;
    setStarted(true);
  }, [isInView, started]);

  return (
    <span ref={ref} className="tabular-nums">
      {started ? end : 0}{suffix}
    </span>
  );
}

export default function HomePage() {
  const [faqAberto, setFaqAberto] = useState<number | null>(null);
  const mesAtual = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const mesLabel = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1);

  return (
    <div className="bg-[var(--color-bg)]">

      <SiteNav />

      {/* Hero */}
      <Secao className="pt-28 sm:pt-36 relative" id="hero">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--color-primary)]/5 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[var(--color-primary)]/5 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-primary)]">
              <Check size={14} />
              Grátis · 5 minutos · Sem cartão de crédito
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Seu negócio inteiro no digital:<br />
              <span className="italic text-[var(--color-primary)]">site, agenda, Pix e IA atendendo por você</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl">
              Pare de perder clientes no WhatsApp. Crie sua página profissional, deixe o AI Agent atender 24h e receba agendamentos automáticos — sem precisar programar nada.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-ink-soft">
              <span className="flex items-center gap-1.5">
                <Check size={15} className="text-[var(--color-primary)]" />
                <strong className="text-ink">30 agendamentos grátis</strong> por mês
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={15} className="text-[var(--color-primary)]" />
                <strong className="text-ink">Pronto em 5 minutos</strong> — zero código
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={15} className="text-[var(--color-primary)]" />
                <strong className="text-ink">Sem cartão de crédito</strong> para começar
              </span>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/cadastro" className="btn-primary gap-2 px-8 py-4 text-lg shadow-lg shadow-[var(--color-primary)]/20">
                Criar meu sistema grátis
                <ArrowRight size={20} />
              </Link>
              <Link href="/precos" className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-white px-8 py-4 text-sm font-medium text-ink transition-all hover:bg-[var(--color-bg)]">
                <MonitorSmartphone size={18} />
                Ver planos e preços
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink-soft/60">Cancele quando quiser. Upgrade só se você precisar.</p>
          </motion.div>

          {/* Premium mockup + AI chat card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative mx-auto mt-16 max-w-5xl"
          >
            <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-2xl shadow-[var(--color-primary)]/5">
              <div className="flex h-10 items-center gap-1.5 border-b border-[var(--color-line)] bg-[var(--color-bg)]/50 px-4">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-teal-400" />
                <div className="ml-4 flex-1 rounded-md bg-[var(--color-line)]/50 px-3 py-1 text-left text-xs text-ink-soft">seu-negocio.an.br</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 text-left">
                {/* Left: Service selection */}
                <div className="sm:col-span-7 border-r border-[var(--color-line)] p-6 sm:p-8">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-soft">Seu Nome · Profissional</div>
                  <h3 className="font-serif text-2xl font-bold text-ink">Agende seu horário</h3>
                  <p className="mt-1 text-sm text-ink-soft">Escolha o serviço e o melhor horário para você.</p>
                  <div className="mt-5 space-y-3">
                    {[
                      { nome: "Corte Feminino", preco: "R$ 75", duracao: "45 min" },
                      { nome: "Escova", preco: "R$ 50", duracao: "30 min" },
                      { nome: "Coloração", preco: "R$ 120", duracao: "1h 30min" },
                    ].map((s, i) => (
                      <div key={i} className={`flex items-center justify-between rounded-xl border p-4 transition-all ${i === 0 ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm" : "border-[var(--color-line)]"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${i === 0 ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-line)]"}`}>
                            {i === 0 && <Check size={12} className="text-white" />}
                          </div>
                          <div>
                            <p className="font-medium text-ink">{s.nome}</p>
                            <p className="text-xs text-ink-soft">{s.duracao}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-ink">{s.preco}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-5 w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110">
                    Agendar horário
                  </button>
                </div>

                {/* Right: Calendar & slots */}
                <div className="sm:col-span-5 bg-[var(--color-bg)]/50 p-6 sm:p-8">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">{mesLabel}</span>
                    <span className="flex gap-1 text-ink-soft">
                      <Chevron size={16} className="rotate-180" />
                      <Chevron size={16} />
                    </span>
                  </div>
                  <div className="mb-4 grid grid-cols-7 gap-1 text-center text-xs">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                      <span key={i} className="py-1 font-medium text-ink-soft">{d}</span>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i - 2;
                      const isSelected = day === 15;
                      const isAvail = day >= 1 && day <= 31;
                      return (
                        <span key={i} className={`rounded-lg py-1.5 text-xs transition-all ${
                          isSelected
                            ? "bg-[var(--color-primary)] text-white font-semibold"
                            : isAvail
                            ? "text-ink hover:bg-[var(--color-primary)]/10 cursor-pointer"
                            : "text-ink-soft/20"
                        }`}>
                          {isAvail ? day : ""}
                        </span>
                      );
                    })}
                  </div>
                  <div className="border-t border-[var(--color-line)] pt-4">
                    <p className="mb-2 text-xs font-semibold text-ink">Horários disponíveis</p>
                    <div className="space-y-2">
                      {["09:00", "10:00", "11:00", "14:00", "15:00"].map((h) => (
                        <div key={h} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                          <span className="text-ink">{h}</span>
                          <span className="flex items-center gap-1 text-xs text-teal-600">
                            <Check size={12} />
                            Disponível
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-xs text-teal-700">
                    <MessageCircle size={14} />
                    Confirmação e lembrete enviados pelo WhatsApp
                  </div>
                </div>
              </div>
            </div>

            {/* AI Agent chat card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -bottom-10 left-0 z-10 hidden w-80 lg:block lg:-left-2 xl:-left-10"
            >
              <div className="rounded-2xl border border-[var(--color-line)] bg-white/95 p-5 text-left shadow-2xl shadow-[var(--color-primary)]/15 backdrop-blur">
                <div className="mb-3 flex items-center gap-3">
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-emerald-400 text-white shadow-md shadow-[var(--color-primary)]/30">
                    <Bot size={17} />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    </span>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">AI Agent</p>
                    <p className="text-[11px] font-medium text-emerald-600">Online · responde em segundos</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-[var(--color-primary)] px-3.5 py-2.5 text-white shadow-sm">
                    Quanto custa o corte feminino?
                  </div>
                  <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-ink shadow-sm">
                    R$ 75, dura 45 minutos. Temos horário amanhã às 10h ou 15h — qual prefere? Posso agendar aqui mesmo.
                  </div>
                  <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-ink shadow-sm">
                    Pronto! Corte Feminino agendado para amanhã às 15h. Você receberá a confirmação no WhatsApp.
                  </div>
                  <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-[var(--color-line)] bg-white px-3.5 py-3 shadow-sm">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft/50" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft/50" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft/50" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 border-t border-[var(--color-line)] pt-3">
                  <div className="flex -space-x-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-2 ring-white">
                      <WhatsAppIcon size={12} />
                    </span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-50 text-pink-600 ring-2 ring-white">
                      <InstagramIcon size={12} />
                    </span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-2 ring-white">
                      <FacebookIcon size={12} />
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug text-ink-soft">
                    Conectado ao WhatsApp, Instagram e Facebook
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Secao>

      {/* Social Proof Marquee */}
      <section className="border-y border-[var(--color-line)]/50 bg-white py-8 overflow-hidden">
        <div className="container-x">
          <p className="mb-6 text-center text-sm font-medium text-ink-soft">Mais de 12 categorias de profissionais já usam AN.BR</p>
          <div className="flex overflow-hidden">
            <motion.div
              className="flex shrink-0 gap-8"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="flex shrink-0 items-center gap-8">
                  {["Salão de Beleza", "Clínica de Estética", "Barbearia", "Personal Trainer", "Diarista", "Fotógrafo", "Massoterapeuta", "Nutricionista", "Tatuador", "Confeiteiro"].map((cat) => (
                    <span key={cat} className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[var(--color-primary)]/5 px-4 py-2 text-sm font-medium text-[var(--color-primary)]">
                      <Check size={14} />
                      {cat}
                    </span>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Antes vs Depois */}
      <Secao id="antes-depois" className="bg-white">
        <TituloSecao subtitulo="Veja como sua rotina muda quando você para de marcar horário no telefone e deixa o sistema trabalhar por você.">
          Chega de mensagem sem resposta.<br />
          <span className="text-[var(--color-primary)]">Sua agenda no automático.</span>
        </TituloSecao>
        <div className="mx-auto max-w-4xl space-y-6">
          {problemas.map((item, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-5">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                    <X size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-500/70 mb-1">Antes</p>
                    <p className="text-sm text-ink leading-relaxed">{item.antes}</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70 mb-1">Com AN.BR</p>
                    <p className="text-sm text-ink leading-relaxed">{item.depois}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Secao>

      {/* Unified Benefits */}
      <Secao id="beneficios">
        <TituloSecao subtitulo="Do agendamento ao pagamento: cada peça do sistema trabalha junta para você ganhar mais tempo e mais clientes.">
          Tudo que seu negócio precisa,<br />
          <span className="text-[var(--color-primary)]">em uma assinatura só</span>
        </TituloSecao>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {beneficios.map((b, i) => (
            <FadeIn key={b.titulo} delay={i * 0.08}>
              <article className="card group flex flex-col h-full p-6 transition-all hover:shadow-lg hover:border-[var(--color-primary)]/20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-transform group-hover:scale-110">
                  {b.icone}
                </div>
                <h3 className="text-lg font-semibold text-ink">{b.titulo}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed flex-1">{b.desc}</p>
                {b.destaque && (
                  <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-[var(--color-primary)]/5 px-3 py-2 text-xs font-medium text-[var(--color-primary)]">
                    <Zap size={13} className="mt-0.5 shrink-0" />
                    {b.destaque}
                  </div>
                )}
              </article>
            </FadeIn>
          ))}
        </div>
      </Secao>

      {/* How it works */}
      <Secao id="funciona" className="bg-white">
        <TituloSecao subtitulo="Em menos de 5 minutos seu sistema está no ar. Sem código, sem designer, sem burocracia.">
          Do zero ao seu <span className="text-[var(--color-primary)]">primeiro agendamento</span>
        </TituloSecao>
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          {passos.map((passo, i) => (
            <FadeIn key={passo.titulo} delay={i * 0.15}>
              <div className="relative text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-lg font-bold text-white shadow-lg shadow-[var(--color-primary)]/20">
                  {i + 1}
                </div>
                <span className="inline-block mb-2 rounded-full bg-[var(--color-primary)]/10 px-3 py-0.5 text-xs font-semibold text-[var(--color-primary)]">{passo.tempo}</span>
                <h3 className="text-lg font-semibold text-ink">{passo.titulo}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{passo.desc}</p>
                {i < passos.length - 1 && (
                  <div className="hidden sm:block absolute -right-4 top-7 text-[var(--color-primary)]/30">
                    <Chevron size={24} />
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </Secao>

      {/* Categorias */}
      <Secao id="categorias">
        <TituloSecao subtitulo="Beleza, saúde, limpeza, consultoria, eventos — sua categoria tem página e copy prontas para converter.">
          Feito para todo tipo de{" "}
          <span className="text-[var(--color-primary)]">serviço profissional</span>
        </TituloSecao>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categorias.map((cat, i) => (
            <FadeIn key={cat.nome} delay={i * 0.05}>
              <div className="card flex items-start gap-4 p-5 transition-all hover:shadow-md hover:border-[var(--color-primary)]/20 group cursor-pointer">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                  {cat.icone}
                </div>
                <div>
                  <p className="font-semibold text-ink">{cat.nome}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{cat.exemplos}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Secao>

      {/* Pricing Preview */}
      <Secao id="precos" className="bg-white relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-full max-w-3xl rounded-full bg-[var(--color-primary)]/[0.03] blur-[120px]" />
        </div>
        <TituloSecao subtitulo="Comece grátis. Quando seu negócio crescer, faça upgrade — sem pressa, sem armadilha.">
          Planos <span className="text-[var(--color-primary)]">simples e honestos</span>
        </TituloSecao>
        <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-3">
          {precosPreview.map((p, i) => (
            <FadeIn key={p.nome} delay={i * 0.08}>
              <Link
                href={p.slug}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all hover:shadow-lg h-full ${
                  p.destaque
                    ? "border-[var(--color-primary)] bg-white shadow-xl shadow-[var(--color-primary)]/10 scale-[1.02] lg:scale-105 z-10 ring-1 ring-[var(--color-primary)]/30"
                    : "border-[var(--color-line)] bg-white shadow-sm hover:border-[var(--color-primary)]/30"
                }`}
              >
                {p.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white shadow-md">
                    <Check size={11} />
                    MAIS POPULAR
                  </div>
                )}
                <h3 className="text-lg font-bold text-ink">{p.nome}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-ink">{p.preco}</span>
                  <span className="text-sm text-ink-soft">/mês</span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">{p.desc}</p>
                <ul className="mt-4 space-y-2 flex-1">
                  {p.extras.map((e) => (
                    <li key={e} className="flex items-start gap-2 text-sm text-ink">
                      <Check size={15} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                      {e}
                    </li>
                  ))}
                </ul>
                <div className={`mt-5 w-full rounded-xl py-2.5 text-sm font-semibold text-center transition-all ${
                  p.destaque
                    ? "bg-[var(--color-primary)] text-white shadow-sm hover:brightness-110"
                    : "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                }`}>
                  {p.destaque ? "Começar agora" : "Ver plano"}
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/precos" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:underline">
            Comparação completa dos planos
            <ArrowRight size={16} />
          </Link>
        </div>
      </Secao>

      {/* Numbers / Stats bar */}
      <section className="bg-[var(--color-primary)] text-white">
        <div className="container-x py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-10 text-center sm:grid-cols-4">
              {[
                { valor: 5, suffix: " min", label: "Para criar seu sistema" },
                { valor: 30, suffix: "/mês", label: "Agendamentos grátis" },
                { valor: 40, suffix: "%", label: "Menos faltas em média" },
                { valor: 24, suffix: "h", label: "AI Agent atendendo por você" },
              ].map((n, i) => (
                <FadeIn key={n.label} delay={i * 0.1}>
                  <p className="text-3xl font-bold sm:text-4xl tabular-nums">
                    <AnimatedCounter end={n.valor} suffix={n.suffix} />
                  </p>
                  <p className="mt-2 text-white/80 text-sm">{n.label}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Secao id="faq" className="bg-white">
        <TituloSecao subtitulo="Respostas diretas para as dúvidas mais comuns.">
          Perguntas <span className="text-[var(--color-primary)]">frequentes</span>
        </TituloSecao>
        <div className="mx-auto max-w-3xl space-y-3">
          {faq.map((item, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div className="card overflow-hidden transition-all" itemScope itemType="https://schema.org/Question">
                <button
                  onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="flex items-center gap-3 font-medium text-ink">
                    <HelpCircle size={16} className="shrink-0 text-ink-soft/40" />
                    <span itemProp="name">{item.q}</span>
                  </span>
                  <span className={`shrink-0 transition-transform duration-200 ${faqAberto === i ? "rotate-180" : ""}`}>
                    <Chevron size={18} className="text-ink-soft" />
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: faqAberto === i ? "auto" : 0, opacity: faqAberto === i ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                  itemScope itemType="https://schema.org/Answer"
                >
                  <p className="px-5 pb-5 text-sm text-ink-soft leading-relaxed pl-12" itemProp="text">{item.r}</p>
                </motion.div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Secao>

      {/* Final CTA */}
      <Secao>
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl bg-[var(--color-primary)] px-8 py-16 sm:px-16 sm:py-20 shadow-xl shadow-[var(--color-primary)]/20">
              <div className="absolute inset-0 -z-0">
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5 blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/5 blur-[80px]" />
              </div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white">
                  <Check size={14} />
                  Comece agora, grátis para sempre
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Seu sistema completo no ar<br />
                  <span className="italic">em menos de 5 minutos.</span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                  Site profissional, agendamento 24h, lembretes no WhatsApp, pagamento via Pix e AI Agent — sem cartão de crédito, sem compromisso.
                </p>
                <Link href="/cadastro" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[var(--color-primary)] shadow-lg transition-all hover:brightness-105">
                  Criar meu sistema grátis
                  <ArrowRight size={20} />
                </Link>
                <p className="mt-4 text-sm text-white/60">Nenhum cartão de crédito · Cancele quando quiser · Sem multa</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </Secao>

      {/* Footer */}
      <footer className="border-t border-[var(--color-line)] py-12">
        <div className="container-x">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)] text-white text-xs font-bold">A</span>
                <span className="font-serif text-base font-semibold">AN.BR</span>
              </Link>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                Sistema completo para profissionais.<br />
                Site, agenda, Pix e IA. Feito no Brasil.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink mb-3">Produto</h4>
              <nav className="flex flex-col gap-2 text-sm text-ink-soft">
                <Link href="/precos" className="transition-colors hover:text-ink">Preços</Link>
                <Link href="/#funciona" className="transition-colors hover:text-ink">Como funciona</Link>
                <Link href="/#beneficios" className="transition-colors hover:text-ink">Recursos</Link>
                <Link href="/#categorias" className="transition-colors hover:text-ink">Categorias</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink mb-3">Conteúdo</h4>
              <nav className="flex flex-col gap-2 text-sm text-ink-soft">
                <Link href="/blog" className="transition-colors hover:text-ink">Blog</Link>
                <Link href="/#faq" className="transition-colors hover:text-ink">FAQ</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink mb-3">Legal</h4>
              <nav className="flex flex-col gap-2 text-sm text-ink-soft">
                <Link href="/privacidade" className="transition-colors hover:text-ink">Privacidade</Link>
                <Link href="/termos" className="transition-colors hover:text-ink">Termos de Uso</Link>
              </nav>
            </div>
          </div>
          <div className="mt-10 border-t border-[var(--color-line)]/50 pt-8 text-center">
            <p className="text-sm text-ink-soft">
              &copy; {new Date().getFullYear()} AN.BR. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

function Chevron({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.73.44 3.42 1.28 4.92L2 22l5.32-1.4a9.9 9.9 0 0 0 4.72 1.2h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.02A9.85 9.85 0 0 0 12.04 2zm4.93 14.48c-.21.58-1.04.98-1.47.75a9.2 9.2 0 0 1-4.1-3.1c-.63-.84-.82-1.81-.1-2.38.26-.2.66-.52.86-.52.2 0 .43.08.56.37.16.34.78 1.9.85 2.04.07.14.02.32-.12.47-.14.17-.28.35-.43.5-.14.14-.23.3-.07.5s1.18 1.35 2.53 1.86c.48.18.72.09.88-.1.16-.17.67-.85.84-1.14.17-.29.33-.24.55-.15.22.1 1.39.66 1.63.78.24.12.4.18.46.27.06.1.06.53-.14.9z" />
    </svg>
  );
}

function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.22-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 5.87 3.9 4.35 7.15 4.2c1.27-.06 1.64-.07 4.85-.07zm0 5.84a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm6.41-4.14a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
    </svg>
  );
}

function FacebookIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.45 18.63 0 12 0S0 5.45 0 12.07C0 18.1 4.39 23.1 10.12 24v-8.44H7.08v-3.46h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.88v2.25h3.33l-.53 3.46h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}
