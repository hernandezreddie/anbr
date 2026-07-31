"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import {
  Sparkles, Palette, ChevronRight, Check, Star, ArrowRight,
  MonitorSmartphone, MessageCircle, Wrench, Scissors, Stethoscope,
  Dumbbell, Brush, ChefHat, Camera, Bell, Moon, Bot,
  Zap, LayoutDashboard, Menu, HelpCircle,
} from "lucide-react";

type CategoriaServico = {
  icone: React.ReactNode;
  nome: string;
  exemplos: string;
};

const categorias: CategoriaServico[] = [
  { icone: <Wrench size={28} />, nome: "Limpeza e Conservação", exemplos: "Diaristas, faxina, pós-obra" },
  { icone: <Scissors size={28} />, nome: "Beleza e Estética", exemplos: "Cabeleireiro, manicure, depilação" },
  { icone: <Stethoscope size={28} />, nome: "Saúde e Bem-estar", exemplos: "Massagem, acupuntura, nutrição" },
  { icone: <Dumbbell size={28} />, nome: "Personal & Esportes", exemplos: "Personal trainer, pilates, yoga" },
  { icone: <Brush size={28} />, nome: "Artes e Ofícios", exemplos: "Tatuagem, pintura, artesanato" },
  { icone: <ChefHat size={28} />, nome: "Gastronomia", exemplos: "Chef em casa, buffet, confeitaria" },
  { icone: <Camera size={28} />, nome: "Fotografia e Eventos", exemplos: "Ensaio, festa, casamento" },
  { icone: <MonitorSmartphone size={28} />, nome: "Consultoria", exemplos: "Mentoria, coaching, aulas particulares" },
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
    titulo: "Tudo em um lugar só",
    desc: "Agenda centralizada, cadastro de clientes, relatórios de faturamento e Pix integrado. Um painel completo sem precisar de planilha, caderninho ou maquininha.",
  },
  {
    icone: <Bot size={24} />,
    titulo: "IA que atende por você",
    desc: "O AI Agent do AN.BR responde dúvidas comuns, qualifica leads e até agenda serviços automaticamente. Seus clientes são atendidos na hora, mesmo sem você disponível.",
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
  { titulo: "Compartilhe e receba clientes", desc: "Cole o link no Instagram, WhatsApp ou Google. Seus clientes marcam horário sozinhos, 24h por dia, sem você precisar atender telefone." },
];

const precosPreview = [
  { nome: "Grátis", preco: "R$ 0", destaque: false, slug: "/precos#gratis", desc: "30 agendamentos/mês" },
  { nome: "Starter", preco: "R$ 29", destaque: false, slug: "/precos#starter", desc: "Agendamentos ilimitados" },
  { nome: "Profissional", preco: "R$ 69", destaque: true, slug: "/precos#profissional", desc: "Domínio próprio + AI Agent" },
  { nome: "IA Premium", preco: "R$ 129", destaque: false, slug: "/precos#ia-premium", desc: "AI Agent + WhatsApp API" },
];

const depoimentos = [
  {
    nome: "Ana Paula Mendes",
    role: "Salão de Beleza",
    cidade: "São Paulo, SP",
    texto: "Antes eu perdia clientes porque não tinha onde agendar. Hoje meu link está no Instagram e recebo agendamentos 24h por dia. Minha agenda encheu e as faltas diminuíram muito com os lembretes do WhatsApp.",
  },
  {
    nome: "Carlos Eduardo",
    role: "Personal Trainer",
    cidade: "Belo Horizonte, MG",
    texto: "O AI Agent é surreal. Responde meus clientes de madrugada perguntando horários e já deixa tudo agendado. Acordo com a agenda pronta. Parece que contratei uma secretária.",
  },
  {
    nome: "Fernanda Lima",
    role: "Clínica de Estética",
    cidade: "Curitiba, PR",
    texto: "Testei vários sistemas de agendamento online, mas o AN.BR foi o único que realmente ficou com a minha cara. Domínio próprio, suporte em português e sem aquela taxa absurda. Não troco mais.",
  },
];

const faq = [
  { q: "Preciso saber programação para criar meu sistema de agendamento?", r: "Não. Você cadastra seus dados, escolhe um template e pronto — seu sistema está no ar em menos de 5 minutos. Tudo visual, sem uma linha de código." },
  { q: "Quanto tempo leva para ficar pronto?", r: "Menos de 5 minutos. Depois de criado, você pode ajustar cores, fotos e serviços pelo painel a hora que quiser." },
  { q: "Posso usar meu próprio domínio?", r: "Sim! Nos planos Profissional e IA Premium você pode usar seu próprio domínio (ex: seu-nome.com.br). Ajudamos com a configuração do DNS." },
  { q: "O AI Agent realmente funciona em português?", r: "Funciona. O AI Agent entende português natural, responde perguntas comuns sobre serviços e horários, qualifica leads e agenda compromissos automaticamente. Tudo em tempo real." },
  { q: "Tem suporte em português?", r: "Sim, suporte humanizado em português. Nossa equipe está no Brasil e responde por WhatsApp e email de segunda a sexta." },
  { q: "Quais tipos de serviço funcionam no AN.BR?", r: "Qualquer serviço profissional: beleza, estética, saúde, limpeza, consultoria, aulas particulares, fotografia, eventos, personal trainer, tatuagem e muito mais. Se você cobra pelo seu tempo, o AN.BR funciona para você." },
  { q: "Tem algum custo? É realmente grátis?", r: "O plano Grátis é 100% gratuito, sem cartão de crédito, com 30 agendamentos por mês. Conforme seu negócio cresce, você pode migrar para um plano pago a partir de R$ 29/mês." },
  { q: "Como funciona o teste grátis de 7 dias?", r: "Ao assinar um plano pago, você tem 7 dias para testar todas as funcionalidades sem custo. Se não gostar, cancele antes de pagar. Sem compromisso." },
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
  const [mobileMenu, setMobileMenu] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  return (
    <div className="bg-[var(--color-bg)]">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-line)]/50 bg-[var(--color-bg)]/90 backdrop-blur-md">
        <div className="container-x flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Logo className="h-8 w-8" />
            <span className="font-serif text-xl">AN.BR</span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <button onClick={() => scrollTo("beneficios")} className="text-sm text-ink-soft transition-colors hover:text-ink">Serviços</button>
            <Link href="/precos" className="text-sm text-ink-soft transition-colors hover:text-ink">Preços</Link>
            <Link href="/blog" className="text-sm text-ink-soft transition-colors hover:text-ink">Blog</Link>
            <button onClick={() => scrollTo("faq")} className="text-sm text-ink-soft transition-colors hover:text-ink">FAQ</button>
            <Link href="/cadastro" className="btn-primary text-sm px-5 py-2.5">Criar meu sistema</Link>
          </nav>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="sm:hidden p-2 text-ink">
            <Menu size={24} />
          </button>
        </div>
        {mobileMenu && (
          <div className="border-t border-[var(--color-line)] bg-[var(--color-bg)] px-6 pb-6 pt-4 sm:hidden space-y-3">
            <button onClick={() => scrollTo("beneficios")} className="block w-full text-left text-sm text-ink-soft py-2">Serviços</button>
            <Link href="/precos" className="block w-full text-left text-sm text-ink-soft py-2">Preços</Link>
            <Link href="/blog" className="block w-full text-left text-sm text-ink-soft py-2">Blog</Link>
            <button onClick={() => scrollTo("faq")} className="block w-full text-left text-sm text-ink-soft py-2">FAQ</button>
            <Link href="/cadastro" className="btn-primary w-full justify-center text-sm py-3">Criar meu sistema</Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <Secao className="pt-28 sm:pt-36 overflow-hidden relative" id="hero">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--color-primary)]/5 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[var(--color-primary)]/5 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-primary)]">
              <Sparkles size={14} />
              Sistema de agendamento online
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Sistema de agendamento online<br />
              <span className="italic text-[var(--color-primary)]">que funciona de verdade</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl">
              Página profissional, agenda online e lembretes automáticos. <br className="hidden sm:block" />
              Menos faltas, mais clientes e zero programação.
            </p>

            {/* Social proof inline */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-soft">
              <span className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-bg)] bg-[var(--color-primary)]/20 text-[10px] font-bold text-[var(--color-primary)]">
                    {["A", "C", "R", "P"][i - 1]}
                  </span>
                ))}
              </span>
              <span><strong className="text-ink">+8.000 profissionais</strong> já usam o AN.BR</span>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/cadastro" className="btn-primary gap-2 px-8 py-4 text-lg shadow-lg shadow-[var(--color-primary)]/20">
                Criar gratuitamente
                <ArrowRight size={20} />
              </Link>
              <Link href="/precos" className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-white px-8 py-4 text-sm font-medium text-ink transition-all hover:bg-[var(--color-bg)]">
                <MonitorSmartphone size={18} />
                Ver planos
              </Link>
            </div>
          </motion.div>

          {/* Premium mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16"
          >
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-2xl shadow-[var(--color-primary)]/5">
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
                    <span className="text-sm font-semibold text-ink">Julho 2026</span>
                    <span className="flex gap-1 text-ink-soft">
                      <ChevronRight size={16} className="rotate-180" />
                      <ChevronRight size={16} />
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
          </motion.div>
        </div>
      </Secao>

      {/* Social Proof Marquee */}
      <section className="border-y border-[var(--color-line)]/50 bg-white py-8 overflow-hidden">
        <div className="container-x">
          <p className="mb-6 text-center text-sm font-medium text-ink-soft">Usado por profissionais em todo o Brasil</p>
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

      {/* Benefits */}
      <Secao id="beneficios">
        <TituloSecao subtitulo="Mais de 8.000 profissionais já escolheram o AN.BR para gerenciar seus agendamentos.">
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
      <Secao id="funciona" className="bg-white">
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
                    <ChevronRight size={24} />
                  </div>
                )}
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
                    <Sparkles size={10} />
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

      {/* Testimonials */}
      <Secao id="depoimentos" className="bg-white">
        <TituloSecao subtitulo="Profissionais reais, resultados reais.">
          Quem usa <span className="text-[var(--color-primary)]">recomenda</span>
        </TituloSecao>
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {depoimentos.map((d, i) => (
            <FadeIn key={d.nome} delay={i * 0.1}>
              <figure className="card flex h-full flex-col p-6 transition-all hover:shadow-md">
                <div className="mb-4 flex gap-0.5 text-yellow-500">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} size={15} fill="currentColor" />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm text-ink-soft leading-relaxed">
                  &ldquo;{d.texto}&rdquo;
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-[var(--color-line)] pt-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">
                    {d.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{d.nome}</p>
                    <p className="text-xs text-ink-soft">{d.role} · {d.cidade}</p>
                  </div>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </Secao>

      {/* Categorias */}
      <Secao id="categorias">
        <TituloSecao subtitulo="Beleza, limpeza, consultoria, aulas, eventos — qualquer serviço profissional.">
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

      {/* Numbers / Stats bar */}
      <section className="bg-[var(--color-primary)] text-white">
        <div className="container-x py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-10 text-center sm:grid-cols-4">
              {[
                { valor: "5 min", label: "Para criar seu sistema" },
                { valor: "+8.000", label: "Profissionais ativos" },
                { valor: "-40%", label: "Menos faltas em média" },
                { valor: "Grátis", label: "Para começar hoje" },
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
                    <ChevronRight size={18} className="text-ink-soft" />
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
                  <Sparkles size={14} />
                  Comece agora
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Mais de 8.000 profissionais já modernizaram<br />
                  seus agendamentos. <span className="italic">Comece você também.</span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                  Crie seu sistema de agendamento online grátis em 5 minutos. Sem cartão de crédito, sem compromisso.
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
              <p className="text-xs text-ink-soft">Sistema de agendamento online<br />Feito no Brasil</p>
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

