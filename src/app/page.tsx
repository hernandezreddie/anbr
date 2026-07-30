"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Sparkles, CalendarCheck, Smartphone, Wallet, Palette, BarChart3,
  ChevronRight, Check, Star, ArrowRight, MonitorSmartphone, Clock,
  MessageCircle, ShieldCheck, Wrench, Scissors, Stethoscope,
  Dumbbell, Brush, ChefHat, Camera,
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
  { icone: <MonitorSmartphone size={28} />, nome: "Consultoria", exemplos: " Mentoria, coaching, aulas particulares" },
];

const passos = [
  { titulo: "Cadastre seus dados", desc: "Informe seus serviços, preços e horários em poucos minutos." },
  { titulo: "Personalize o visual", desc: "Escolha cores, logo, fonte e template que combinam com você." },
  { titulo: "Compartilhe e atenda", desc: "Receba agendamentos 24h por dia, no WhatsApp e com Pix integrado." },
];

const recursos = [
  { icone: <CalendarCheck size={24} />, titulo: "Agendamento online", desc: "Clientes marcam direto na sua página, sem precisar ligar." },
  { icone: <Smartphone size={24} />, titulo: "Página profissional", desc: "Landing page pronta com seu nome, logo e serviços." },
  { icone: <MessageCircle size={24} />, titulo: "WhatsApp integrado", desc: "Cliente agenda e já pode falar com você pelo WhatsApp." },
  { icone: <Wallet size={24} />, titulo: "Pix na hora", desc: "Cobrança facilitada com sua chave Pix direto na página." },
  { icone: <Palette size={24} />, titulo: "Personalização total", desc: "Cores, fontes, logo e fundo — sua cara, seu negócio." },
  { icone: <BarChart3 size={24} />, titulo: "Gestão completa", desc: "Painel com agenda, clientes, serviços e relatórios." },
];

const faq = [
  { q: "Preciso saber programação?", r: "Não. Você cadastra seus dados, escolhe um template e pronto — seu sistema está no ar." },
  { q: "Quanto tempo leva para ficar pronto?", r: "Menos de 5 minutos. Depois de criado, você pode ajustar tudo pelo painel." },
  { q: "Posso usar no celular?", r: "Sim. A página do cliente e o painel de gestão são totalmente responsivos." },
  { q: "Quais tipos de serviço funcionam?", r: "Qualquer serviço profissional: limpeza, beleza, saúde, consultoria, aulas, fotografia, eventos e muito mais." },
  { q: "Tem algum custo?", r: "O plano gratuito inclui tudo que você precisa para começar. Planos premium com mais funcionalidades em breve." },
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
          <a href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white text-sm font-bold">L</span>
            <span className="font-serif text-xl">AN.BR</span>
          </a>
          <nav className="hidden items-center gap-6 sm:flex">
            <button onClick={() => scrollTo("categorias")} className="text-sm text-ink-soft transition-colors hover:text-ink">Serviços</button>
            <button onClick={() => scrollTo("funciona")} className="text-sm text-ink-soft transition-colors hover:text-ink">Como funciona</button>
            <button onClick={() => scrollTo("recursos")} className="text-sm text-ink-soft transition-colors hover:text-ink">Recursos</button>
            <button onClick={() => scrollTo("faq")} className="text-sm text-ink-soft transition-colors hover:text-ink">FAQ</button>
            <a href="/cadastro" className="btn-emerald text-sm px-5 py-2.5">Criar meu sistema</a>
          </nav>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="sm:hidden p-2 text-ink">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </div>
        {mobileMenu && (
          <div className="border-t border-[var(--color-line)] bg-[var(--color-bg)] px-6 pb-6 pt-4 sm:hidden space-y-3">
            <button onClick={() => scrollTo("categorias")} className="block w-full text-left text-sm text-ink-soft py-2">Serviços</button>
            <button onClick={() => scrollTo("funciona")} className="block w-full text-left text-sm text-ink-soft py-2">Como funciona</button>
            <button onClick={() => scrollTo("recursos")} className="block w-full text-left text-sm text-ink-soft py-2">Recursos</button>
            <button onClick={() => scrollTo("faq")} className="block w-full text-left text-sm text-ink-soft py-2">FAQ</button>
            <a href="/cadastro" className="btn-emerald w-full justify-center text-sm py-3">Criar meu sistema</a>
          </div>
        )}
      </header>

      {/* Hero */}
      <Secao className="pt-28 sm:pt-36 overflow-hidden relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--color-primary)]/5 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[var(--color-primary)]/5 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-primary)]">
              <Sparkles size={14} />
              Sistema de agendamento online
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Crie seu próprio sistema de<br />
              <span className="italic text-[var(--color-primary)]">agendamento profissional</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl">
              Landing page, agenda online, WhatsApp e Pix — tudo pronto em 5 minutos.
              Sem programação, sem mensalidade, sem complicação.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a href="/cadastro" className="btn-emerald gap-2 px-8 py-4 text-lg shadow-lg shadow-[var(--color-primary)]/20">
                Criar meu sistema agora
                <ArrowRight size={20} />
              </a>
              <button onClick={() => scrollTo("funciona")} className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-white px-8 py-4 text-sm font-medium text-ink transition-all hover:bg-[var(--color-bg)]">
                <MonitorSmartphone size={18} />
                Como funciona
              </button>
            </div>
          </motion.div>

          {/* Preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16"
          >
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-2xl shadow-[var(--color-primary)]/5">
              <div className="flex h-10 items-center gap-1.5 border-b border-[var(--color-line)] bg-[var(--color-bg)]/50 px-4">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <div className="ml-4 flex-1 rounded-md bg-[var(--color-line)]/50 px-3 py-1 text-left text-xs text-ink-soft">livreta.com.br/seu-negocio</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5">
                <div className="sm:col-span-3 p-6 sm:p-8 text-left">
                  <div className="mb-2 h-5 w-24 rounded bg-[var(--color-primary)]/10" />
                  <div className="mb-2 h-8 w-3/4 rounded bg-[var(--color-primary)]/10" />
                  <div className="mb-6 h-4 w-full rounded bg-[var(--color-line)]/50" />
                  <div className="flex gap-3">
                    <div className="h-10 w-32 rounded-lg bg-[var(--color-primary)]/80" />
                    <div className="h-10 w-32 rounded-lg border border-[var(--color-line)]" />
                  </div>
                </div>
                <div className="hidden sm:col-span-2 sm:block bg-[var(--color-primary)]/5 p-6">
                  <div className="mb-4 h-6 w-20 rounded bg-[var(--color-primary)]/10" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg bg-white p-3">
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                      <div className="h-3 flex-1 rounded bg-[var(--color-line)]" />
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-white p-3">
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                      <div className="h-3 flex-1 rounded bg-[var(--color-line)]" />
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-white p-3">
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                      <div className="h-3 flex-1 rounded bg-[var(--color-line)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Secao>

      {/* Categorias */}
      <Secao id="categorias" className="bg-white">
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

      {/* Como funciona */}
      <Secao id="funciona">
        <TituloSecao subtitulo="Você está a poucos passos de ter seu sistema profissional no ar.">
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

      {/* Recursos */}
      <Secao id="recursos" className="bg-white">
        <TituloSecao subtitulo="Tudo que você precisa para gerenciar seus agendamentos em um só lugar.">
          <span className="text-[var(--color-primary)]">Recursos</span> completos
        </TituloSecao>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recursos.map((r, i) => (
            <FadeIn key={r.titulo} delay={i * 0.08}>
              <div className="card p-6 transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  {r.icone}
                </div>
                <h3 className="font-semibold text-ink">{r.titulo}</h3>
                <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{r.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Secao>

      {/* Templates */}
      <Secao id="templates">
        <TituloSecao subtitulo="Dois estilos profissionais para sua página. Escolha o que combina com você.">
          Templates <span className="text-[var(--color-primary)]">visuais</span>
        </TituloSecao>
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2">
          <FadeIn>
            <div className="card overflow-hidden transition-all hover:shadow-lg">
              <div className="h-48 bg-gradient-to-br from-emerald-50 to-white p-6 flex flex-col justify-end">
                <div className="rounded-lg bg-white/80 p-4 backdrop-blur-sm shadow-sm">
                  <div className="mb-1 h-5 w-28 rounded bg-emerald-600" />
                  <div className="h-3 w-40 rounded bg-[var(--color-line)]" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-ink">Clássico</h3>
                <p className="mt-1 text-sm text-ink-soft">Verde elegante, serifado — ideal para serviços tradicionais e profissionais.</p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="card overflow-hidden transition-all hover:shadow-lg">
              <div className="h-48 bg-gradient-to-br from-neutral-50 to-white p-6 flex flex-col justify-end">
                <div className="rounded-lg bg-white/80 p-4 backdrop-blur-sm shadow-sm">
                  <div className="mb-1 h-5 w-28 rounded bg-ink" />
                  <div className="h-3 w-40 rounded bg-[var(--color-line)]" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-ink">Moderno</h3>
                <p className="mt-1 text-sm text-ink-soft">Minimalista, tipografia limpa — perfeito para serviços contemporâneos.</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </Secao>

      {/* Números */}
      <Secao className="bg-[var(--color-primary)] text-white">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 text-center sm:grid-cols-3">
            {[
              { valor: "5 min", label: "Para criar seu sistema" },
              { valor: "100%", label: "Online e responsivo" },
              { valor: "Grátis", label: "Para começar hoje" },
            ].map((n, i) => (
              <FadeIn key={n.label} delay={i * 0.1}>
                <p className="text-4xl font-bold sm:text-5xl">{n.valor}</p>
                <p className="mt-2 text-white/80">{n.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </Secao>

      {/* FAQ */}
      <Secao id="faq" className="bg-white">
        <TituloSecao subtitulo="Dúvidas comuns sobre o AN.BR.">
          Perguntas <span className="text-[var(--color-primary)]">frequentes</span>
        </TituloSecao>
        <div className="mx-auto max-w-3xl space-y-3">
          {faq.map((item, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="card overflow-hidden transition-all">
                <button
                  onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-ink">{item.q}</span>
                  <span className={`shrink-0 transition-transform duration-200 ${faqAberto === i ? "rotate-180" : ""}`}>
                    <ChevronRight size={18} className="text-ink-soft" />
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: faqAberto === i ? "auto" : 0, opacity: faqAberto === i ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-ink-soft leading-relaxed">{item.r}</p>
                </motion.div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Secao>

      {/* CTA Final */}
      <Secao>
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-primary)]">
              <Sparkles size={14} />
              Comece agora
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Pronto para ter seu sistema de <span className="text-[var(--color-primary)]">agendamento</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
              Crie sua página profissional em menos de 5 minutos. Gratuito.
            </p>
            <a href="/cadastro" className="btn-emerald mx-auto mt-8 inline-flex gap-2 px-8 py-4 text-lg shadow-lg shadow-[var(--color-primary)]/20">
              Criar meu sistema agora
              <ArrowRight size={20} />
            </a>
          </FadeIn>
        </div>
      </Secao>

      {/* Footer */}
      <footer className="border-t border-[var(--color-line)] py-12">
        <div className="container-x">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)] text-white text-xs font-bold">L</span>
              <span className="font-serif text-base font-semibold">AN.BR</span>
            </div>
            <p className="text-sm text-ink-soft">
              &copy; {new Date().getFullYear()} AN.BR. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}