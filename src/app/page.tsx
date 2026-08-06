"use client";

import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import {
  Check, ArrowRight, CalendarCheck, MessageCircle, Bot,
  Palette, LayoutDashboard, Bell, Zap, Shield,
  Wrench, Scissors, Stethoscope, Dumbbell, Brush, ChefHat,
  Camera, MonitorSmartphone, HelpCircle, Hand, HeartPulse, Car, PawPrint, TrendingUp, Clock, Star, Sparkles, ChevronDown,
} from "lucide-react";

type CategoriaServico = {
  icone: React.ReactNode;
  nome: string;
  exemplos: string;
};

const categorias: CategoriaServico[] = [
  { icone: <Scissors size={22} />, nome: "Beleza e Estética", exemplos: "Cabeleireiro, manicure, depilação" },
  { icone: <Wrench size={22} />, nome: "Limpeza e Conservação", exemplos: "Diaristas, faxina, pós-obra" },
  { icone: <Stethoscope size={22} />, nome: "Saúde e Bem-estar", exemplos: "Massagem, acupuntura, nutrição" },
  { icone: <HeartPulse size={22} />, nome: "Clínica e Consultório", exemplos: "Médicos, dentistas, fisioterapia" },
  { icone: <Dumbbell size={22} />, nome: "Personal & Esportes", exemplos: "Personal trainer, pilates, yoga" },
  { icone: <Car size={22} />, nome: "Automotivo", exemplos: "Lava-jato, polimento, mecânica" },
  { icone: <PawPrint size={22} />, nome: "Pet Shop & Veterinária", exemplos: "Banho e tosa, consultas, vacinas" },
  { icone: <Hand size={22} />, nome: "Nail Designer", exemplos: "Alongamento em gel, fibra de vidro" },
  { icone: <Brush size={22} />, nome: "Artes e Ofícios", exemplos: "Tatuagem, pintura, artesanato" },
  { icone: <ChefHat size={22} />, nome: "Gastronomia", exemplos: "Chef em casa, buffet, confeitaria" },
  { icone: <Camera size={22} />, nome: "Fotografia e Eventos", exemplos: "Ensaio, festas, casamentos" },
  { icone: <MonitorSmartphone size={22} />, nome: "Consultoria e Aulas", exemplos: "Mentoria, coaching, reforço escolar" },
];

const problemas = [
  { antes: "Cliente pergunta preço no WhatsApp e você demora 3h para responder", depois: "AI Agent responde em segundos, 24h por dia, com preços e horários certos" },
  { antes: "Agenda no papel ou no celular: cliente desmarca em cima da hora e você perde o slot", depois: "Confirmação e lembrete automáticos no WhatsApp reduzem faltas em até 40%" },
  { antes: "Você passa o dia no telefone marcando horário em vez de trabalhar", depois: "Sua página de agendamento vende por você: cliente escolhe, agenda e paga sozinho" },
];

const beneficios = [
  { icone: <CalendarCheck size={22} />, titulo: "Agendamento 24h", desc: "O cliente escolhe serviço, horário e agenda sozinho. Você só aparece para atender.", destaque: "Pare de perder cliente por não responder WhatsApp a tempo." },
  { icone: <Bot size={22} />, titulo: "AI Agent nas redes", desc: "IA responde WhatsApp, Instagram e Facebook 24h. Qualifica leads e fecha agendamentos sem você.", destaque: "Incluso nos planos Profissional e IA Premium." },
  { icone: <LayoutDashboard size={22} />, titulo: "Painel inteligente", desc: "Agenda, clientes, Pix, relatórios de faturamento e métricas — tudo em um lugar só, com insights proativos.", destaque: "Chega de planilha, caderninho e maquininha separados." },
  { icone: <Bell size={22} />, titulo: "0 faltas", desc: "Lembretes automáticos no WhatsApp no dia anterior e no mesmo dia. Cliente confirma com um toque.", destaque: "Cada falta evitada é dinheiro que entra no seu bolso." },
  { icone: <Palette size={22} />, titulo: "100% sua marca", desc: "Suas cores, seu logo, seu domínio. A página é toda personalizada com sua identidade visual.", destaque: "Sem parecer 'mais um marketplace' — a página é sua." },
  { icone: <Shield size={22} />, titulo: "Zero comissão", desc: "Você é dono da sua base de clientes. Sem repasse por agendamento. Comece grátis, cancele quando quiser.", destaque: "Planos a partir de R$ 49/mês." },
];

const passos = [
  { titulo: "Cadastre seus serviços", tempo: "2 min", desc: "Informe o que você faz, seus preços e horários. Preencheu? Sua página já está no ar." },
  { titulo: "Personalize sua página", tempo: "3 min", desc: "Escolha cores, logo, fonte e template. Sua página fica pronta com a sua identidade visual." },
  { titulo: "Receba agendamentos", tempo: "Instantâneo", desc: "Conecte o AI Agent ao seu WhatsApp. Cole o link na bio do Instagram e comece a receber clientes." },
];

const precosPreview = [
  { nome: "Grátis", preco: "R$ 0", destaque: false, slug: "/precos#gratis", desc: "30 agendamentos/mês", extras: ["Página profissional", "Agendamento online 24h", "Confirmação no WhatsApp"] },
  { nome: "Profissional", preco: "R$ 49", destaque: true, slug: "/precos#profissional", desc: "+ AI Agent + Google Calendar + domínio próprio", extras: ["AI Agent nas redes sociais", "Google Calendar sincronizado", "Domínio próprio (seu-nome.com.br)", "Relatórios de faturamento"] },
  { nome: "IA Premium", preco: "R$ 99", destaque: false, slug: "/precos#ia-premium", desc: "+ WhatsApp API oficial + anúncios inteligentes", extras: ["WhatsApp API (Meta oficial)", "AI Ads — IA cria anúncios", "Atendimento prioritário"] },
];

const faq = [
  { q: "Preciso saber programação para criar meu sistema?", r: "Não. Você cadastra seus dados, escolhe um template e pronto — seu sistema está no ar em menos de 5 minutos. Tudo visual, sem uma linha de código." },
  { q: "É realmente grátis? Qual é a pegadinha?", r: "O plano Grátis é 100% gratuito para sempre, com 30 agendamentos por mês. Sem cartão de crédito. Se seu negócio crescer, você faz upgrade para um plano pago — mas só se quiser." },
  { q: "Como o AI Agent atende meus clientes?", r: "Você conecta seu WhatsApp, Instagram e Facebook ao agente. Ele responde dúvidas sobre serviços, preços e horários, qualifica o cliente e agenda no seu lugar. Tudo em português, 24h por dia. Você acompanha as conversas pelo painel." },
  { q: "Vale a pena pagar R$ 49 pelo plano Profissional?", r: "Se você tem mais de 30 agendamentos por mês, sim. O plano se paga com 1 ou 2 agendamentos a mais que você não perderia. Além disso, o AI Agent sozinho economiza horas de WhatsApp todo dia. Menos que R$ 1,65 por dia." },
  { q: "Posso usar meu próprio domínio?", r: "Sim! Nos planos Profissional e IA Premium você conecta seu domínio próprio. Ajudamos com a configuração do DNS — leva 5 minutos." },
  { q: "Como recebo os pagamentos?", r: "Seu cliente escolhe o serviço, agenda e paga com Pix direto para a sua chave. O valor cai na sua conta na hora. A plataforma não cobra taxa sobre cada agendamento." },
  { q: "Quais tipos de serviço funcionam?", r: "Qualquer serviço profissional: beleza, estética, saúde, limpeza, consultoria, aulas particulares, fotografia, eventos, personal trainer, tatuagem, petshop e muito mais. Se você cobra pelo seu tempo, funciona." },
  { q: "Tem suporte em português?", r: "Sim, suporte humanizado em português por WhatsApp e email. Nossa equipe está no Brasil e responde de segunda a sexta." },
];

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [started, setStarted] = useState(false);
  useEffect(() => { if (isInView && !started) setStarted(true); }, [isInView, started]);
  return <span ref={ref} className="tabular-nums">{started ? end : 0}{suffix}</span>;
}

function AnimatedGradientBg() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: ["-10%", "10%", "-10%"], y: ["-5%", "5%", "-5%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute -top-1/4 -left-1/4 h-[60vh] w-[60vh] rounded-full blur-[140px]"
        style={{ backgroundColor: "rgba(20,184,166,0.15)" }}
      />
      <motion.div
        animate={{ x: ["10%", "-10%", "10%"], y: ["5%", "-5%", "5%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-1/4 -right-1/4 h-[50vh] w-[50vh] rounded-full blur-[130px]"
        style={{ backgroundColor: "rgba(16,185,129,0.12)" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(250,248,245,1) 100%)" }}
      />
    </div>
  );
}

function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.015]"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
    />
  );
}

export default function HomePage() {
  const [faqAberto, setFaqAberto] = useState<number | null>(null);
  const [activeCategoria, setActiveCategoria] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,var(--color-primary)_0.05,transparent_60%),radial-gradient(ellipse_50%_50%_at_80%_60%,#10b981_0.04,transparent_50%),radial-gradient(ellipse_50%_40%_at_20%_90%,var(--color-primary)_0.04,transparent_50%)]">
      <GrainOverlay />
      <SiteNav />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative pt-28 sm:pt-40 pb-16 sm:pb-24">
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-[var(--color-primary)]/10 to-transparent hidden lg:block" style={{ right: "50%" }} />

        <div className="container-x relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 px-4 py-1.5 text-sm font-medium text-[var(--color-primary)] backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                </span>
                Grátis · 5 minutos · Sem cartão
              </div>

              <h1 className="font-serif text-[2.5rem] font-bold leading-[1.06] tracking-tight text-ink sm:text-5xl lg:text-6xl">
                Seu negócio inteiro no digital:
                <br />
                <span className="bg-gradient-to-r from-[var(--color-primary)] via-emerald-500 to-teal-400 bg-clip-text text-transparent">
                  site, agenda, Pix e IA
                </span>
                {" "}atendendo por você
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl">
                Pare de perder clientes no WhatsApp. Crie sua página profissional, deixe o AI Agent atender 24h e receba agendamentos automáticos — sem precisar programar nada.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-ink-soft">
                <span className="flex items-center gap-1.5"><Check size={15} className="text-[var(--color-primary)]" /><strong className="text-ink font-semibold">30 agendamentos grátis</strong> por mês</span>
                <span className="flex items-center gap-1.5"><Check size={15} className="text-[var(--color-primary)]" /><strong className="text-ink font-semibold">Pronto em 5 minutos</strong> — zero código</span>
                <span className="flex items-center gap-1.5"><Check size={15} className="text-[var(--color-primary)]" /><strong className="text-ink font-semibold">Sem cartão de crédito</strong> para começar</span>
              </div>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/cadastro" className="group relative overflow-hidden rounded-2xl bg-[var(--color-primary)] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition-all hover:shadow-xl hover:shadow-[var(--color-primary)]/30 hover:-translate-y-0.5">
                  <span className="relative z-10 flex items-center gap-2">Criar meu sistema grátis <ArrowRight size={20} className="transition-transform group-hover:translate-x-0.5" /></span>
                  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Link>
                <Link href="/precos" className="flex items-center gap-2 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] px-8 py-4 text-sm font-medium text-ink transition-all hover:border-[var(--color-primary)]/30 hover:shadow-md">
                  <MonitorSmartphone size={18} /> Ver planos e preços
                </Link>
              </div>
              <p className="mt-4 text-xs text-ink-soft/60">Cancele quando quiser. Upgrade só se você precisar.</p>
            </motion.div>

            {/* Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto mt-16 max-w-5xl"
            >
              <div className="overflow-hidden rounded-3xl border border-[var(--color-line)] bg-white shadow-2xl shadow-black/[0.04] ring-1 ring-black/[0.02]">
                <div className="flex h-10 items-center gap-1.5 border-b border-[var(--color-line)] bg-[var(--color-bg)]/80 px-4">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                  <div className="ml-4 flex-1 rounded-md bg-[var(--color-line)]/50 px-3 py-1 text-left text-xs text-ink-soft">seu-negocio.an.br</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 text-left">
                  <div className="sm:col-span-7 border-r border-[var(--color-line)] p-6 sm:p-8">
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-ink-mute">Seu Nome · Profissional</div>
                    <h3 className="font-serif text-2xl font-bold text-ink">Agende seu horário</h3>
                    <p className="mt-1 text-sm text-ink-soft">Escolha o serviço e o melhor horário para você.</p>
                    <div className="mt-5 space-y-3">
                      {[{ nome: "Corte Feminino", preco: "R$ 75", duracao: "45 min" }, { nome: "Escova", preco: "R$ 50", duracao: "30 min" }, { nome: "Coloração", preco: "R$ 120", duracao: "1h 30min" }].map((s, i) => (
                        <div key={i} className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${i === 0 ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm" : "border-[var(--color-line)] hover:border-[var(--color-primary)]/30"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${i === 0 ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-line)]"}`}>
                              {i === 0 && <Check size={11} className="text-white" />}
                            </div>
                            <div><p className="font-semibold text-sm text-ink">{s.nome}</p><p className="text-xs text-ink-soft">{s.duracao}</p></div>
                          </div>
                          <span className="font-semibold text-sm text-ink">{s.preco}</span>
                        </div>
                      ))}
                    </div>
                    <button className="mt-5 w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110">Agendar horário</button>
                  </div>
                  <div className="sm:col-span-5 bg-[var(--color-bg)]/70 p-6 sm:p-8">
                    {(() => { const mesLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }); const cap = mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1); return (<><div className="mb-4 flex items-center justify-between"><span className="text-sm font-semibold text-ink">{cap}</span><span className="flex gap-1 text-ink-soft"><Chevron size={16} className="rotate-180" /><Chevron size={16} /></span></div><div className="mb-4 grid grid-cols-7 gap-1 text-center text-[11px] font-medium">{["D","S","T","Q","Q","S","S"].map((d,i) => (<span key={i} className="py-1 text-ink-soft">{d}</span>))}{Array.from({length:35},(_,i)=>{const day=i-2;const isSel=day===15;const isAvail=day>=1&&day<=31;return (<span key={i} className={`rounded-lg py-1.5 text-xs transition-all ${isSel?"bg-[var(--color-primary)] text-white font-semibold":isAvail?"text-ink hover:bg-[var(--color-primary)]/10 cursor-pointer":"text-transparent"}`}>{isAvail?day:""}</span>);})}</div><div className="border-t border-[var(--color-line)] pt-4"><p className="mb-2 text-xs font-semibold text-ink-soft">Horários disponíveis</p><div className="space-y-1.5">{["09:00","10:00","11:00","14:00","15:00"].map(h=>(<div key={h} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm border border-[var(--color-line)]/50"><span className="text-ink font-medium">{h}</span><span className="flex items-center gap-1 text-xs text-[var(--color-primary)]"><Check size={12}/>Disponível</span></div>))}</div></div></>); })()}
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--color-primary)]/5 px-3 py-2 text-xs text-[var(--color-primary)] font-medium"><MessageCircle size={14} />Confirmação e lembrete no WhatsApp</div>
                  </div>
                </div>
              </div>

              {/* Floating AI chat card */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -bottom-8 left-0 z-10 hidden w-72 lg:block lg:-left-4 xl:-left-10"
              >
                <div className="rounded-2xl border border-[var(--color-line)] bg-white/95 p-4 text-left shadow-2xl shadow-[var(--color-primary)]/8 backdrop-blur-md">
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-emerald-400 text-white shadow-md">
                      <Bot size={15} />
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" /></span>
                    </span>
                    <div><p className="text-xs font-semibold text-ink">AI Agent</p><p className="text-[10px] font-medium text-emerald-600">Online · responde em segundos</p></div>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[var(--color-primary)] px-3 py-2 text-white shadow-sm">Quanto custa o corte?</div>
                    <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-[var(--color-line)] bg-white px-3 py-2 text-ink shadow-sm">R$ 75. Temos amanhã às 10h ou 15h — qual prefere?</div>
                    <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-[var(--color-line)] bg-white px-3 py-2 text-ink shadow-sm">Agendado! Confirmado para amanhã às 15h. Você receberá a confirmação no WhatsApp.</div>
                    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-[var(--color-line)] bg-white px-3 py-3 shadow-sm"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft/40" style={{ animationDelay: "0ms" }} /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft/40" style={{ animationDelay: "150ms" }} /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft/40" style={{ animationDelay: "300ms" }} /></div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ SOCIAL PROOF ═══════════ */}
      <section className="border-y border-[var(--color-line)]/40 bg-white py-10 overflow-hidden">
        <div className="container-x">
          <p className="mb-6 text-center text-sm font-medium text-ink-soft">+12 categorias de profissionais já usam AN.BR</p>
          <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]">
            <motion.div className="flex shrink-0 gap-6" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }}>
              {[...Array(2)].map((_, idx) => (
                <div key={idx} className="flex shrink-0 items-center gap-6">
                  {["Salão de Beleza", "Clínica de Estética", "Barbearia", "Personal Trainer", "Diarista", "Fotógrafo", "Nutricionista", "Tatuador", "Confeiteiro", "Pet Shop"].map((cat) => (
                    <span key={cat} className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[var(--color-primary)]/5 px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10">
                      <Check size={14} /> {cat}
                    </span>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ ANTES vs DEPOIS ═══════════ */}
      <section id="antes-depois" className="py-20 sm:py-28 bg-white">
        <div className="container-x">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]/60">Antes vs Depois</p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Chega de mensagem sem resposta.<br />
              <span className="text-[var(--color-primary)]">Sua agenda no automático.</span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-ink-soft">Veja como sua rotina muda quando você para de marcar horário no telefone.</p>
          </div>
          <div className="mx-auto max-w-4xl space-y-4">
            {problemas.map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="group flex gap-3 rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/80 to-red-50/30 p-5 transition-all hover:shadow-md">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500 text-xs font-bold">×</div>
                    <div><p className="text-[10px] font-semibold uppercase tracking-widest text-red-400 mb-1">Antes</p><p className="text-sm text-ink/80 leading-relaxed">{item.antes}</p></div>
                  </div>
                  <div className="group flex gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 p-5 transition-all hover:shadow-md">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check size={14} /></div>
                    <div><p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500 mb-1">Com AN.BR</p><p className="text-sm text-ink/80 leading-relaxed">{item.depois}</p></div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ BENTO BENEFITS ═══════════ */}
      <section id="beneficios" className="relative py-20 sm:py-28">
        <div className="container-x relative z-10">
          <div className="mb-14">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]/60">Recursos</p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl max-w-xl">
              Tudo que seu negócio precisa,{" "}
              <span className="text-[var(--color-primary)]">em uma assinatura só</span>
            </h2>
            <p className="mt-3 max-w-xl text-lg text-ink-soft">Do agendamento ao pagamento: cada peça trabalha junta para você ganhar mais tempo e clientes.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {beneficios.map((b, i) => (
              <FadeIn key={b.titulo} delay={i * 0.06}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-6 transition-all duration-300 hover:border-[var(--color-primary)]/30 hover:shadow-lg hover:shadow-[var(--color-primary)]/3 hover:-translate-y-1">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--color-primary)]/[0.03] blur-2xl transition-all group-hover:bg-[var(--color-primary)]/[0.06]" />
                  <div className="relative z-10">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/8 text-[var(--color-primary)] transition-transform duration-300 group-hover:scale-110">
                      {b.icone}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-ink">{b.titulo}</h3>
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed flex-1">{b.desc}</p>
                    {b.destaque && (
                      <div className="mt-4 flex items-start gap-1.5 rounded-lg bg-[var(--color-primary)]/5 px-3 py-2 text-xs font-medium text-[var(--color-primary)]">
                        <Zap size={13} className="mt-0.5 shrink-0" /> {b.destaque}
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ STEPS ═══════════ */}
      <section id="funciona" className="py-20 sm:py-28 bg-white">
        <div className="container-x">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]/60">Como funciona</p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Do zero ao seu <span className="text-[var(--color-primary)]">primeiro agendamento</span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-ink-soft">Em menos de 5 minutos seu sistema está no ar. Sem código, sem designer, sem burocracia.</p>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="absolute top-12 left-[15%] right-[15%] hidden h-0.5 bg-gradient-to-r from-transparent via-[var(--color-primary)]/20 to-transparent sm:block" />
            <div className="grid gap-8 sm:grid-cols-3">
              {passos.map((passo, i) => (
                <FadeIn key={passo.titulo} delay={i * 0.12} className="flex flex-col items-center text-center relative">
                  <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-bold shadow-lg shadow-[var(--color-primary)]/10 ring-1 ring-[var(--color-primary)]/10">
                    <span className="bg-gradient-to-br from-[var(--color-primary)] to-emerald-500 bg-clip-text text-transparent">{i + 1}</span>
                  </div>
                  <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/8 px-3 py-0.5 text-[11px] font-semibold text-[var(--color-primary)]">
                    <Clock size={11} /> {passo.tempo}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-ink">{passo.titulo}</h3>
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed max-w-xs">{passo.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CATEGORIAS ═══════════ */}
      <section id="categorias" className="py-20 sm:py-28">
        <div className="container-x">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]/60">Categorias</p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Feito para todo tipo de{" "}
              <span className="text-[var(--color-primary)]">serviço profissional</span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-ink-soft">Beleza, saúde, limpeza, consultoria, eventos — sua categoria tem página e copy prontas para converter.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categorias.map((cat, i) => (
              <FadeIn key={cat.nome} delay={i * 0.04}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="flex items-start gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4 transition-all duration-200 hover:border-[var(--color-primary)]/30 hover:shadow-md cursor-pointer group"
                  onMouseEnter={() => setActiveCategoria(i)}
                  onMouseLeave={() => setActiveCategoria(null)}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/6 text-[var(--color-primary)] transition-all group-hover:bg-[var(--color-primary)]/12 group-hover:scale-110">
                    {cat.icone}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{cat.nome}</p>
                    <p className="mt-0.5 text-xs text-ink-soft leading-relaxed">{cat.exemplos}</p>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section id="precos" className="relative py-20 sm:py-28 bg-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-full max-w-4xl rounded-full bg-[var(--color-primary)]/[0.02] blur-[150px]" />
        </div>
        <div className="container-x">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]/60">Planos</p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Simples e <span className="text-[var(--color-primary)]">honestos</span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-ink-soft">Comece grátis. Quando seu negócio crescer, faça upgrade — sem pressa, sem armadilha.</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-3">
            {precosPreview.map((p, i) => {
              const isPopular = p.destaque;
              return (
                <FadeIn key={p.nome} delay={i * 0.08}>
                  <Link
                    href={p.slug}
                    className={`group relative flex flex-col rounded-2xl p-6 transition-all duration-300 h-full ${
                      isPopular
                        ? "border-2 border-[var(--color-primary)] bg-white shadow-xl shadow-[var(--color-primary)]/8 scale-[1.02] lg:scale-105 z-10"
                        : "border border-[var(--color-line)] bg-white shadow-sm hover:border-[var(--color-primary)]/30 hover:shadow-md"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-emerald-500 px-3.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-[var(--color-primary)]/20">
                        <Star size={10} fill="currentColor" /> MAIS POPULAR
                      </div>
                    )}
                    {isPopular && (
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                        style={{ background: `radial-gradient(600px circle at var(--mouse-x,50%) var(--mouse-y,50%), var(--color-primary)05, transparent 40%)` }}
                      />
                    )}
                    <h3 className="text-lg font-bold text-ink">{p.nome}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-serif text-4xl font-bold tracking-tight text-ink">{p.preco}</span>
                      <span className="text-sm text-ink-soft">/mês</span>
                    </div>
                    <p className="mt-2 text-sm text-ink-soft">{p.desc}</p>
                    <ul className="mt-5 space-y-2.5 flex-1">
                      {p.extras.map((e) => (
                        <li key={e} className="flex items-start gap-2.5 text-sm text-ink">
                          <Check size={14} className="mt-0.5 shrink-0 text-[var(--color-primary)]" /> {e}
                        </li>
                      ))}
                    </ul>
                    <div className={`mt-6 w-full rounded-xl py-3 text-sm font-semibold text-center transition-all ${
                      isPopular
                        ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20 group-hover:shadow-lg group-hover:brightness-110"
                        : "border-2 border-[var(--color-primary)]/20 text-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/5 group-hover:border-[var(--color-primary)]/40"
                    }`}>
                      {isPopular ? "Começar agora" : "Ver plano"}
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link href="/precos" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:text-emerald-600">
              Comparação completa dos planos <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[var(--color-primary)] via-emerald-600 to-teal-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
        <div className="container-x py-16 sm:py-20 relative z-10">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 text-center sm:grid-cols-4">
              {[{ valor: 5, suffix: " min", label: "Para criar seu sistema" }, { valor: 30, suffix: "/mês", label: "Agendamentos grátis" }, { valor: 40, suffix: "%", label: "Menos faltas em média" }, { valor: 24, suffix: "h", label: "AI Agent por você" }].map((n, i) => (
                <FadeIn key={n.label} delay={i * 0.08}>
                  <p className="font-serif text-4xl font-bold sm:text-5xl tabular-nums text-white">
                    <AnimatedCounter end={n.valor} suffix={n.suffix} />
                  </p>
                  <p className="mt-2 text-sm font-medium text-white/70">{n.label}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="py-20 sm:py-28 bg-white">
        <div className="container-x">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]/60">Dúvidas</p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Perguntas <span className="text-[var(--color-primary)]">frequentes</span>
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-ink-soft">Respostas diretas para as dúvidas mais comuns.</p>
          </div>
          <div className="mx-auto max-w-3xl space-y-3">
            {faq.map((item, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] transition-all hover:border-[var(--color-primary)]/15" itemScope itemType="https://schema.org/Question">
                  <button onClick={() => setFaqAberto(faqAberto === i ? null : i)} className="flex w-full items-center justify-between p-5 text-left">
                    <span className="flex items-center gap-3 font-medium text-ink pr-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
                        <HelpCircle size={14} />
                      </span>
                      <span itemProp="name">{item.q}</span>
                    </span>
                    <ChevronDown size={18} className={`shrink-0 text-ink-soft transition-transform duration-300 ${faqAberto === i ? "rotate-180" : ""}`} />
                  </button>
                  <motion.div initial={false} animate={{ height: faqAberto === i ? "auto" : 0, opacity: faqAberto === i ? 1 : 0 }} transition={{ duration: 0.25 }} className="overflow-hidden" itemScope itemType="https://schema.org/Answer">
                    <p className="px-5 pb-5 text-sm text-ink-soft leading-relaxed pl-[52px]" itemProp="text">{item.r}</p>
                  </motion.div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-20 sm:py-28">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary)] via-emerald-600 to-teal-700 px-8 py-16 sm:px-16 sm:py-24 shadow-2xl shadow-[var(--color-primary)]/20">
                <div className="absolute inset-0">
                  <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-white/[0.04] blur-[100px]" />
                  <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/[0.04] blur-[100px]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full bg-white/[0.03] blur-[60px]" />
                </div>
                <div className="relative z-10 text-center">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
                    <Sparkles size={14} /> Comece agora, grátis para sempre
                  </div>
                  <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Seu sistema completo no ar<br />
                    <span className="italic text-white/80">em menos de 5 minutos.</span>
                  </h2>
                  <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
                    Site profissional, agendamento 24h, lembretes no WhatsApp, pagamento via Pix e AI Agent — sem cartão de crédito, sem compromisso.
                  </p>
                  <Link href="/cadastro" className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-[var(--color-primary)] shadow-lg shadow-black/10 transition-all hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5">
                    Criar meu sistema grátis <ArrowRight size={20} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <p className="mt-5 text-sm text-white/50">Nenhum cartão de crédito · Cancele quando quiser · Sem multa</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-[var(--color-line)] py-12">
        <div className="container-x">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white text-xs font-bold shadow-sm shadow-[var(--color-primary)]/20">A</span>
                <span className="font-serif text-lg font-semibold tracking-tight">AN.BR</span>
              </Link>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">Sistema completo para profissionais.<br />Site, agenda, Pix e IA. Feito no Brasil.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft/60 mb-4">Produto</h4>
              <nav className="flex flex-col gap-2.5 text-sm text-ink-soft">
                <Link href="/precos" className="transition-colors hover:text-ink">Preços</Link>
                <Link href="/#funciona" className="transition-colors hover:text-ink">Como funciona</Link>
                <Link href="/#beneficios" className="transition-colors hover:text-ink">Recursos</Link>
                <Link href="/#categorias" className="transition-colors hover:text-ink">Categorias</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft/60 mb-4">Conteúdo</h4>
              <nav className="flex flex-col gap-2.5 text-sm text-ink-soft">
                <Link href="/blog" className="transition-colors hover:text-ink">Blog</Link>
                <Link href="/#faq" className="transition-colors hover:text-ink">FAQ</Link>
              </nav>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft/60 mb-4">Legal</h4>
              <nav className="flex flex-col gap-2.5 text-sm text-ink-soft">
                <Link href="/privacidade" className="transition-colors hover:text-ink">Privacidade</Link>
                <Link href="/termos" className="transition-colors hover:text-ink">Termos de Uso</Link>
              </nav>
            </div>
          </div>
          <div className="mt-10 border-t border-[var(--color-line)]/50 pt-8 text-center">
            <p className="text-sm text-ink-soft">&copy; {new Date().getFullYear()} AN.BR. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Chevron({ size, className }: { size: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>;
}
