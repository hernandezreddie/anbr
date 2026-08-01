"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import {
  Check, ArrowRight, CalendarCheck, MessageCircle, Bot,
  Palette, LayoutDashboard, Bell, Moon, Zap, Shield,
  Wrench, Scissors, Stethoscope, Dumbbell, Brush, ChefHat,
  Camera, MonitorSmartphone, HelpCircle, Globe, Hand, HeartPulse, Car, PawPrint,
} from "lucide-react";

type CategoriaServico = {
  icone: React.ReactNode;
  nome: string;
  exemplos: string;
};

const categorias: CategoriaServico[] = [
  { icone: <Wrench size={28} />, nome: "Limpeza e Conservação", exemplos: "Diaristas, faxina, pós-obra" },
  { icone: <Scissors size={28} />, nome: "Beleza e Estética", exemplos: "Cabeleireiro, manicure, depilação" },
  { icone: <Hand size={28} />, nome: "Manicure & Nail Designer", exemplos: "Alongamento em gel, fibra de vidro, nail art" },
  { icone: <Stethoscope size={28} />, nome: "Saúde e Bem-estar", exemplos: "Massagem, acupuntura, nutrição" },
  { icone: <HeartPulse size={28} />, nome: "Clínica e Consultório", exemplos: "Médicos, dentistas, fisioterapia" },
  { icone: <Dumbbell size={28} />, nome: "Personal & Esportes", exemplos: "Personal trainer, pilates, yoga" },
  { icone: <Car size={28} />, nome: "Automotivo", exemplos: "Lava-jato, polimento, mecânica" },
  { icone: <PawPrint size={28} />, nome: "Pet Shop & Veterinária", exemplos: "Veterinário, banho e tosa, vacinas" },
  { icone: <Brush size={28} />, nome: "Artes e Ofícios", exemplos: "Tatuagem, pintura, artesanato" },
  { icone: <ChefHat size={28} />, nome: "Gastronomia", exemplos: "Chef em casa, buffet, confeitaria" },
  { icone: <Camera size={28} />, nome: "Fotografia e Eventos", exemplos: "Ensaio, festa, casamento" },
  { icone: <MonitorSmartphone size={28} />, nome: "Consultoria e Aulas", exemplos: "Mentoria, coaching, aulas particulares" },
];

const pilares = [
  {
    icone: <Globe size={24} />,
    titulo: "Site profissional com a sua cara",
    desc: "Página completa com seus serviços, preços e horários — suas cores, seu logo, seu domínio próprio nos planos Profissional e IA Premium.",
  },
  {
    icone: <CalendarCheck size={24} />,
    titulo: "Agenda, Pix e lembretes no WhatsApp",
    desc: "O cliente marca sozinho, 24h por dia. Confirmação e lembrete automáticos no WhatsApp reduzem as faltas — e o pagamento via Pix chega direto pra você.",
  },
  {
    icone: <Bot size={24} />,
    titulo: "AI Agent nas suas redes sociais",
    desc: "Conecte WhatsApp, Instagram e Facebook: a IA responde dúvidas, qualifica clientes e agenda por você — de dia, de noite, sem folga.",
  },
];

const beneficios = [
  {
    icone: <Bell size={24} />,
    titulo: "Reduza faltas em até 40%",
    desc: "Lembretes automáticos pelo WhatsApp diminuem drasticamente os cancelamentos de última hora. Seu cliente recebe confirmação e lembrete sem você precisar ligar.",
  },
  {
    icone: <Moon size={24} />,
    titulo: "Atenda 24 horas por dia",
    desc: "Enquanto você dorme, sua página de agendamento continua funcionando. O cliente marca o horário direto, na hora que quiser — sem telefonemas, sem esperar.",
  },
  {
    icone: <Palette size={24} />,
    titulo: "Imagem profissional",
    desc: "Uma página com a cara do seu negócio: suas cores, seu logo, suas fotos. Domínio próprio nos planos Profissional e IA Premium. Causa uma impressão que vende.",
  },
  {
    icone: <LayoutDashboard size={24} />,
    titulo: "Tudo em um painel só",
    desc: "Agenda centralizada, cadastro de clientes, relatórios de faturamento e Pix integrado. Um painel completo sem planilha, caderninho ou maquininha.",
  },
  {
    icone: <Shield size={24} />,
    titulo: "Seus dados, seu negócio",
    desc: "Você é dono da sua página, do seu domínio e da sua base de clientes. Sem dependência de marketplace, sem comissão sobre cada atendimento.",
  },
  {
    icone: <Zap size={24} />,
    titulo: "Sem complicação",
    desc: "Crie seu sistema em menos de 5 minutos, sem programação, sem designer, sem burocracia. Suporte humanizado em português sempre que precisar.",
  },
];

const passos = [
  { titulo: "Cadastre seus serviços", desc: "Informe o que você faz, seus preços, horários e dias de atendimento. Leva 2 minutos — e não precisa de experiência nenhuma." },
  { titulo: "Personalize sua página", desc: "Escolha cores, logo, fonte e template. Sua página de agendamento fica pronta com a sua cara, do seu jeito." },
  { titulo: "Conecte o AI Agent e receba clientes", desc: "Conecte o agente ao seu WhatsApp e às suas redes sociais, cole o link no Instagram e comece a receber clientes 24h por dia." },
];

const precosPreview = [
  { nome: "Grátis", preco: "R$ 0", destaque: false, slug: "/precos#gratis", desc: "30 agendamentos/mês" },
  { nome: "Profissional", preco: "R$ 49", destaque: true, slug: "/precos#profissional", desc: "Domínio próprio + Google Calendar + AI Agent" },
  { nome: "IA Premium", preco: "R$ 99", destaque: false, slug: "/precos#ia-premium", desc: "AI Agent + WhatsApp API" },
];

const faq = [
  { q: "Preciso saber programação para criar meu sistema?", r: "Não. Você cadastra seus dados, escolhe um template e pronto — seu sistema está no ar em menos de 5 minutos. Tudo visual, sem uma linha de código." },
  { q: "O que está incluído no sistema?", r: "Tudo o que seu negócio precisa: página profissional com seus serviços e preços, agendamento online 24h, confirmação e lembretes no WhatsApp, pagamento via Pix, painel completo de gestão e o AI Agent que atende no WhatsApp, Instagram e Facebook." },
  { q: "Como funciona o AI Agent?", r: "Você conecta suas redes sociais ao agente e ele passa a atender no seu lugar: responde dúvidas sobre serviços e horários, qualifica clientes e agenda compromissos automaticamente, em português e em tempo real. Você acompanha tudo pelo painel." },
  { q: "Posso usar meu próprio domínio?", r: "Sim! Nos planos Profissional e IA Premium você pode usar seu próprio domínio (ex: seu-nome.com.br). Ajudamos com a configuração do DNS." },
  { q: "Como recebo os pagamentos?", r: "Seu cliente escolhe o serviço, agenda e paga com Pix direto para a sua chave. O valor cai na sua conta na hora, sem taxa da plataforma em cima." },
  { q: "Tem algum custo? É realmente grátis?", r: "O plano Grátis é 100% gratuito, sem cartão de crédito, com 30 agendamentos por mês. Conforme seu negócio cresce, você pode migrar para um plano pago a partir de R$ 49/mês." },
  { q: "Quais tipos de serviço funcionam no AN.BR?", r: "Qualquer serviço profissional: beleza, estética, saúde, limpeza, consultoria, aulas particulares, fotografia, eventos, personal trainer, tatuagem e muito mais. Se você cobra pelo seu tempo, o AN.BR funciona para você." },
  { q: "Tem suporte em português?", r: "Sim, suporte humanizado em português. Nossa equipe está no Brasil e responde por WhatsApp e email de segunda a sexta." },
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
              Site + agenda + pagamentos + IA — tudo conectado
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Seu negócio inteiro online:<br />
              <span className="italic text-[var(--color-primary)]">site, agenda e IA atendendo por você</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl">
              Página profissional, agendamento 24h, Pix e lembretes no WhatsApp. <br className="hidden sm:block" />
              Conecte o AI Agent às suas redes sociais e ele atende por você — de dia e de noite.
            </p>

            {/* Honest facts */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-ink-soft">
              <span className="flex items-center gap-1.5">
                <Check size={15} className="text-[var(--color-primary)]" />
                <strong className="text-ink">30 agendamentos grátis</strong> por mês
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={15} className="text-[var(--color-primary)]" />
                <strong className="text-ink">Pronto em 5 minutos</strong> sem programação
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
                Ver planos
              </Link>
            </div>
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
                <div className="ml-4 flex-1 rounded-md bg-[var(--color-line)]/50 px-3 py-1 text-left text-xs text-ink-soft">an.br/seu-negocio</div>
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
                    Você receberá a confirmação no WhatsApp
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
                {/* header */}
                <div className="mb-3 flex items-center gap-3">
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-accent)] text-white shadow-md shadow-[var(--color-primary)]/30">
                    <Bot size={17} />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    </span>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">AI Agent</p>
                    <p className="text-[11px] font-medium text-emerald-600">Online · atende 24h</p>
                  </div>
                </div>

                {/* chat */}
                <div className="space-y-2 text-xs">
                  <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-[var(--color-primary)] px-3.5 py-2.5 text-white shadow-sm">
                    Oi! Tem horário livre amanhã?
                  </div>
                  <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-ink shadow-sm">
                    Tenho sim! Corte às 10h ou 15h — qual prefere? Posso confirmar aqui mesmo.
                  </div>
                  <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-ink shadow-sm">
                    Pronto: Corte Feminino, amanhã 15h. Confirmação e lembrete enviados no WhatsApp.
                  </div>
                  <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-[var(--color-line)] bg-white px-3.5 py-3 shadow-sm">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft/50" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft/50" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft/50" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>

                {/* footer */}
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
                    WhatsApp, Instagram e Facebook conectados ao seu agente
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
          <p className="mb-6 text-center text-sm font-medium text-ink-soft">Feito para quem vive de hora marcada</p>
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

      {/* Complete package pillars */}
      <Secao id="pacote">
        <TituloSecao subtitulo="Enquanto os outros vendem uma peça do quebra-cabeça, o AN.BR entrega tudo conectado em uma assinatura.">
          Um sistema, <span className="text-[var(--color-primary)]">tudo conectado</span>
        </TituloSecao>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pilares.map((p, i) => (
            <FadeIn key={p.titulo} delay={i * 0.08}>
              <article className="card group h-full p-6 transition-all hover:shadow-lg hover:border-[var(--color-primary)]/20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-transform group-hover:scale-110">
                  {p.icone}
                </div>
                <h3 className="text-lg font-semibold text-ink">{p.titulo}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{p.desc}</p>
              </article>
            </FadeIn>
          ))}
        </div>
      </Secao>

      {/* Benefits */}
      <Secao id="beneficios" className="bg-white">
        <TituloSecao subtitulo="Cada peça trabalha junto: a página atrai, a agenda organiza, o Pix cobra e o AI Agent atende.">
          Por que profissionais escolhem o <span className="text-[var(--color-primary)]">AN.BR</span>
        </TituloSecao>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {beneficios.map((b, i) => (
            <FadeIn key={b.titulo} delay={i * 0.08}>
              <article className="card group p-6 transition-all hover:shadow-lg hover:border-[var(--color-primary)]/20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-transform group-hover:scale-110">
                  {b.icone}
                </div>
                <h3 className="text-lg font-semibold text-ink">{b.titulo}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{b.desc}</p>
              </article>
            </FadeIn>
          ))}
        </div>
      </Secao>

      {/* How it works */}
      <Secao id="funciona">
        <TituloSecao subtitulo="Você está a poucos passos de nunca mais precisar atender telefone para marcar horário.">
          Como <span className="text-[var(--color-primary)]">funciona</span>
        </TituloSecao>
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          {passos.map((passo, i) => (
            <FadeIn key={passo.titulo} delay={i * 0.15}>
              <div className="relative text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-lg font-bold text-white shadow-lg shadow-[var(--color-primary)]/20">
                  {i + 1}
                </div>
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
      <Secao id="categorias" className="bg-white">
        <TituloSecao subtitulo="Beleza, limpeza, consultoria, aulas, eventos — qualquer serviço profissional, com página e copy prontas para o seu nicho.">
          Para todo tipo de <span className="text-[var(--color-primary)]">serviço</span>
        </TituloSecao>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categorias.map((cat, i) => (
            <FadeIn key={cat.nome} delay={i * 0.05}>
              <div className="card flex items-start gap-4 p-5 transition-all hover:shadow-md hover:border-[var(--color-primary)]/20 group">
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
      <Secao id="precos" className="relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-full max-w-3xl rounded-full bg-[var(--color-primary)]/[0.03] blur-[120px]" />
        </div>
        <TituloSecao subtitulo="Do gratuito ao completo — escolha o plano que encaixa no seu momento.">
          Planos <span className="text-[var(--color-primary)]">transparentes</span>
        </TituloSecao>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {precosPreview.map((p, i) => (
            <FadeIn key={p.nome} delay={i * 0.08}>
              <Link
                href={p.slug}
                className={`relative flex flex-col rounded-2xl border p-5 text-center transition-all hover:shadow-lg ${
                  p.destaque
                    ? "border-[var(--color-primary)] bg-white shadow-md shadow-[var(--color-primary)]/10 scale-[1.02] sm:scale-105 z-10"
                    : "border-[var(--color-line)] bg-white shadow-sm hover:border-[var(--color-primary)]/30"
                }`}
              >
                {p.destaque && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-3 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                    <Check size={10} />
                    POPULAR
                  </div>
                )}
                <h3 className="text-sm font-semibold text-ink">{p.nome}</h3>
                <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{p.preco}</p>
                <p className="mt-0.5 text-[11px] text-ink-soft">{p.desc}</p>
              </Link>
            </FadeIn>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/precos" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:underline">
            Ver comparação completa dos planos
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
                { valor: "5 min", label: "Para criar seu sistema" },
                { valor: "30/mês", label: "Agendamentos grátis" },
                { valor: "-40%", label: "Menos faltas em média" },
                { valor: "24h", label: "AI Agent atendendo por você" },
              ].map((n, i) => (
                <FadeIn key={n.label} delay={i * 0.1}>
                  <p className="text-3xl font-bold sm:text-4xl">{n.valor}</p>
                  <p className="mt-2 text-white/80 text-sm">{n.label}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Secao id="faq" className="bg-white">
        <TituloSecao subtitulo="Dúvidas comuns sobre o AN.BR.">
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
                  Comece agora, grátis
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Seu negócio completo online,<br />
                  <span className="italic">em minutos.</span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                  Site, agenda, pagamentos e AI Agent — sem cartão de crédito, sem compromisso.
                </p>
                <Link href="/cadastro" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-[var(--color-primary)] shadow-lg transition-all hover:brightness-105">
                  Criar meu sistema grátis
                  <ArrowRight size={20} />
                </Link>
                <p className="mt-4 text-sm text-white/60">Nenhum cartão de crédito necessário · Cancele quando quiser</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </Secao>

      {/* Footer */}
      <footer className="border-t border-[var(--color-line)] py-12">
        <div className="container-x">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)] text-white text-xs font-bold">A</span>
                <span className="font-serif text-base font-semibold">AN.BR</span>
              </Link>
              <p className="text-xs text-ink-soft">Sistema completo online<br />Feito no Brasil</p>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-ink-soft">
              <Link href="/" className="transition-colors hover:text-ink">Início</Link>
              <Link href="/precos" className="transition-colors hover:text-ink">Preços</Link>
              <Link href="/blog" className="transition-colors hover:text-ink">Blog</Link>
              <Link href="/privacidade" className="transition-colors hover:text-ink">Privacidade</Link>
              <Link href="/termos" className="transition-colors hover:text-ink">Termos</Link>
            </nav>
          </div>
          <div className="mt-8 border-t border-[var(--color-line)]/50 pt-8 text-center">
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
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function FacebookIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
