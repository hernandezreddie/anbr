"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import { Logo } from "@/components/Logo";
import { SITE_DOMAIN } from "@/lib/site";
import {
  Check, X, Sparkles, HelpCircle, ArrowRight, ChevronRight, Bell, Globe, Palette,
  Calendar, BarChart3, MessageCircle, Bot, Shield, Zap,
} from "lucide-react";
import Link from "next/link";

type Frequencia = "mensal" | "anual";

type Plano = {
  nome: string;
  slug: string;
  precoMensal: number;
  desc: string;
  idealPara: string;
  destaque?: boolean;
  cor: string;
  icone: React.ReactNode;
  features: { nome: string; incluido: boolean; detalhe?: string }[];
};

const planos: Plano[] = [
  {
    nome: "Grátis",
    slug: "gratis",
    precoMensal: 0,
    desc: "Teste a plataforma sem compromisso.",
    idealPara: "Começar",
    cor: "text-gray-500",
    icone: <Zap size={20} />,
    features: [
      { nome: "30 agendamentos por mês", incluido: true },
      { nome: "Página pública de agendamento", incluido: true },
      { nome: `Link: ${SITE_DOMAIN}/seu-slug`, incluido: true },
      { nome: "Receba pagamento via Pix", incluido: true },
      { nome: "Marca AN.BR visível", incluido: true },
      { nome: "Notificação push de novo agendamento", incluido: true, detalhe: "no navegador" },
      { nome: "Cores e logo personalizados", incluido: false },
      { nome: "Google Calendar sincronizado", incluido: false },
      { nome: "Lembrete automático 12h antes", incluido: false },
      { nome: "Resumo diário matinal", incluido: false },
      { nome: "Domínio próprio", incluido: false },
      { nome: "Instagram DM + Facebook Messenger", incluido: false },
      { nome: "AI Agent", incluido: false },
    ],
  },
  {
    nome: "Profissional",
    slug: "profissional",
    precoMensal: 49,
    desc: "Presença completa: conecte seu domínio próprio, Google Calendar, redes sociais e IA.",
    idealPara: "Profissionais estabelecidos",
    cor: "text-teal-600",
    icone: <Globe size={20} />,
    features: [
      { nome: "Agendamentos ilimitados", incluido: true },
      { nome: "Página pública de agendamento", incluido: true },
      { nome: `Link: ${SITE_DOMAIN}/seu-slug`, incluido: true },
      { nome: "Conecte seu próprio domínio", incluido: true, detalhe: "ex: suaempresa.com.br — nós configuramos o DNS para você" },
      { nome: "Receba pagamento via Pix", incluido: true },
      { nome: "Sem marca AN.BR", incluido: true },
      { nome: "Cores e logo personalizados", incluido: true },
      { nome: "Google Calendar sincronizado", incluido: true },
      { nome: "Notificações push completas", incluido: true, detalhe: "novo + lembrete + diário" },
      { nome: "Instagram DM + Facebook Messenger", incluido: true },
      { nome: "AI Agent incluso — 500 mensagens/mês", incluido: true },
      { nome: "Relatórios completos", incluido: true },
      { nome: "Tokens excedentes de IA", incluido: false, detalhe: "R$ 0,005/msg" },
      { nome: "Google Calendar bidirecional", incluido: false },
      { nome: "WhatsApp API", incluido: false },
      { nome: "Suporte prioritário", incluido: false },
    ],
  },
  {
    nome: "IA Premium",
    slug: "ia-premium",
    precoMensal: 99,
    desc: "Automação total: o AI Agent atende seus clientes sozinho, dia e noite.",
    idealPara: "Automação com IA",
    destaque: true,
    cor: "text-purple-600",
    icone: <Bot size={20} />,
    features: [
      { nome: "Agendamentos ilimitados", incluido: true },
      { nome: "Página pública de agendamento", incluido: true },
      { nome: "Conecte seu próprio domínio", incluido: true, detalhe: "ex: suaempresa.com.br — nós configuramos o DNS para você" },
      { nome: "Receba pagamento via Pix", incluido: true },
      { nome: "Sem marca AN.BR", incluido: true },
      { nome: "Cores e logo personalizados", incluido: true },
      { nome: "Google Calendar bidirecional", incluido: true, detalhe: "cria eventos automaticamente" },
      { nome: "Notificações push completas", incluido: true },
      { nome: "Instagram DM + Facebook Messenger", incluido: true },
      { nome: "AI Agent — 2.000 mensagens/mês inclusas", incluido: true },
      { nome: "WhatsApp API (quando disponível)", incluido: true },
      { nome: "Relatórios avançados com custos de IA", incluido: true },
      { nome: "Suporte prioritário", incluido: true },
      { nome: "Tokens excedentes de IA", incluido: true, detalhe: "R$ 0,005/msg adicional" },
    ],
  },
];

const faqPrecos = [
  {
    q: "O que são notificações push?",
    r: "São avisos que chegam no celular ou computador mesmo com o site fechado, igual notificação de WhatsApp. Funciona via navegador (Chrome, Edge) — não precisa instalar nada. O profissional recebe quando tem novo agendamento, lembrete 12h antes e resumo diário.",
  },
  {
    q: "Posso cancelar quando quiser?",
    r: "Sim. Sem multa, sem fidelidade. Você cancela pelo painel e o acesso continua até o fim do período já pago.",
  },
  {
    q: "O plano Grátis é realmente grátis?",
    r: "Sim, 100% gratuito, sem cartão de crédito. Você tem 30 agendamentos por mês e notificação de novo agendamento.",
  },
  {
    q: "Como funciona o AI Agent?",
    r: "O AI Agent usa inteligência artificial (GPT-4o) para atender clientes automaticamente. Ele responde dúvidas, consulta sua agenda, verifica disponibilidade no Google Calendar e cria eventos. Cada mensagem consumida pelo chat é contada. O plano Profissional inclui 500 mensagens/mês e o IA Premium 2.000.",
  },
  {
    q: "O que são tokens excedentes de IA?",
    r: "Se você usar mais mensagens de IA do que seu plano inclui, cada mensagem adicional custa R$ 0,005 (meio centavo). Isso cobre o custo da API da OpenAI. Você pode acompanhar seu consumo no painel.",
  },
  {
    q: "O que significa 'sem marca AN.BR'?",
    r: "Sua página não exibe nenhuma referência à AN.BR. O link e a página são totalmente seus, com sua marca.",
  },
  {
    q: "O que significa 'conectar meu domínio'?",
    r: "Nós não vendemos domínios — você conecta um domínio que já é seu, ou registra em qualquer empresa de registro (ex: Registro.br, custo típico R$ 40/ano). Nós configuramos o DNS para você e o certificado SSL (cadeado) é grátis. Seu site passa a aparecer como suaempresa.com.br, sem nenhuma marca da AN.BR.",
  },
  {
    q: "Precisa de servidor para WhatsApp?",
    r: "As notificações push substituem o WhatsApp no plano básico. O WhatsApp Business API (Evolution API) exige um servidor VPS próprio e está disponível apenas no IA Premium quando configurado.",
  },
];

function precoAnual(mensal: number): number {
  if (mensal === 0) return 0;
  return Math.round(mensal * 12 * 0.8);
}

function formatoBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

function CardPlano({ plano, frequencia, indice }: { plano: Plano; frequencia: Frequencia; indice: number }) {
  const precoExibido = frequencia === "anual" && plano.precoMensal > 0
    ? Math.round(plano.precoMensal * 0.8)
    : plano.precoMensal;
  const totalAnual = precoAnual(plano.precoMensal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: indice * 0.1, ease: "easeOut" }}
      className={`relative flex flex-col rounded-2xl border bg-white p-6 sm:p-8 transition-all duration-200 hover:shadow-xl ${
        plano.destaque
          ? "border-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/10 scale-[1.02] sm:scale-105 z-10"
          : "border-[var(--color-line)] shadow-sm hover:border-[var(--color-primary)]/30"
      }`}
    >
      {plano.destaque && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-4 py-1 text-xs font-semibold text-white shadow-lg whitespace-nowrap">
          <Sparkles size={12} />
          MAIS POPULAR
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className={plano.cor}>{plano.icone}</span>
          <h3 className="text-xl font-bold text-ink">{plano.nome}</h3>
        </div>
        <p className="mt-1 text-sm text-ink-soft leading-relaxed">{plano.desc}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-ink">
            {plano.precoMensal === 0 ? "Grátis" : formatoBRL(precoExibido)}
          </span>
          {plano.precoMensal > 0 && (
            <span className="text-sm text-ink-soft">/mês</span>
          )}
        </div>
        {frequencia === "anual" && plano.precoMensal > 0 && (
          <div className="mt-1 space-y-0.5">
            <p className="text-xs text-ink-soft">
              Cobrado anualmente: {formatoBRL(totalAnual)}/ano
            </p>
            <p className="text-xs font-medium text-teal-600">
              Economia de {formatoBRL(plano.precoMensal * 12 - totalAnual)}/ano
            </p>
          </div>
        )}
        {frequencia === "mensal" && plano.precoMensal > 0 && (
          <p className="mt-1 text-xs text-ink-soft">
            {formatoBRL(plano.precoMensal * 12)}/ano se pago mensalmente
          </p>
        )}
      </div>

      <Link
        href="/cadastro"
        className={`mb-6 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
          plano.destaque
            ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20 hover:brightness-110"
            : "border border-[var(--color-line)] text-ink hover:bg-[var(--color-bg)] hover:border-[var(--color-primary)]/30"
        }`}
      >
        {plano.precoMensal === 0 ? "Criar grátis" : "Teste grátis por 7 dias"}
        <ArrowRight size={16} />
      </Link>

      <p className="mb-4 text-xs text-ink-soft border-t border-[var(--color-line)] pt-4">
        <span className="font-medium text-ink">Ideal para:</span> {plano.idealPara}
      </p>

      <ul className="space-y-3 flex-1">
        {plano.features.map((f) => (
          <li key={f.nome} className="flex items-start gap-3 text-sm">
            {f.incluido ? (
              <Check size={16} className="mt-0.5 shrink-0 text-teal-500" />
            ) : (
              <X size={16} className="mt-0.5 shrink-0 text-ink-soft/40" />
            )}
            <span className={f.incluido ? "text-ink" : "text-ink-soft/50"}>
              {f.nome}
              {f.detalhe && <span className="block text-[11px] text-ink-soft/60 mt-0.5">{f.detalhe}</span>}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function ToggleFrequencia({ frequencia, onChange }: { frequencia: Frequencia; onChange: (v: Frequencia) => void }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <button
        onClick={() => onChange("mensal")}
        className={`text-sm font-medium transition-colors ${frequencia === "mensal" ? "text-ink" : "text-ink-soft"}`}
      >
        Mensal
      </button>
      <button
        onClick={() => onChange(frequencia === "mensal" ? "anual" : "mensal")}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors ${frequencia === "anual" ? "bg-[var(--color-primary)]" : "bg-[var(--color-line)]"}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${frequencia === "anual" ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
      <button
        onClick={() => onChange("anual")}
        className={`text-sm font-medium transition-colors ${frequencia === "anual" ? "text-ink" : "text-ink-soft"}`}
      >
        Anual
        <span className="ml-1.5 inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
          -20%
        </span>
      </button>
    </div>
  );
}

function ComparacaoTable({ frequencia }: { frequencia: Frequencia }) {
  const linhas: { label: string; valores: (string | boolean)[] }[] = [
    { label: "Agendamentos", valores: ["30/mês", "Ilimitados", "Ilimitados"] },
    { label: "Marca AN.BR", valores: [true, false, false] },
    { label: "Cores e logo", valores: [false, true, true] },
    { label: "Google Calendar", valores: [false, "Sincronizado", "Bidirecional"] },
    { label: "Notificação novo agendamento", valores: [true, true, true] },
    { label: "Lembrete 12h antes", valores: [false, true, true] },
    { label: "Resumo matinal diário", valores: [false, true, true] },
    { label: "Instagram DM + Facebook", valores: [false, true, true] },
    { label: "Domínio próprio conectado", valores: [false, true, true] },
    { label: "AI Agent mensagens/mês", valores: [false, "500", "2.000"] },
    { label: "Tokens excedentes IA", valores: [false, false, "R$ 0,005/msg"] },
    { label: "WhatsApp API", valores: [false, false, true] },
    { label: "Suporte prioritário", valores: [false, false, true] },
  ];

  const precoExibido = (i: number) => {
    const p = planos[i];
    if (p.precoMensal === 0) return "Grátis";
    const val = frequencia === "anual" ? Math.round(p.precoMensal * 0.8) : p.precoMensal;
    return `${formatoBRL(val)}/mês`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-line)]">
            <th className="py-4 pr-4 text-left font-semibold text-ink">Funcionalidade</th>
            {planos.map((p, i) => (
              <th key={p.slug} className={`py-4 px-3 text-center font-semibold ${p.destaque ? "text-[var(--color-primary)]" : "text-ink"}`}>
                <div>{p.nome}</div>
                <div className={`mt-1 text-xs font-normal ${p.destaque ? "text-[var(--color-primary)]" : "text-ink-soft"}`}>
                  {precoExibido(i)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.label} className="border-b border-[var(--color-line)]/50 last:border-0">
              <td className="py-3.5 pr-4 text-ink whitespace-nowrap text-xs sm:text-sm">{linha.label}</td>
              {linha.valores.map((v, i) => (
                <td key={i} className="py-3.5 px-3 text-center">
                  {typeof v === "boolean" ? (
                    v ? (
                      <Check size={16} className="mx-auto text-teal-500" />
                    ) : (
                      <X size={16} className="mx-auto text-ink-soft/30" />
                    )
                  ) : (
                    <span className="text-ink-soft text-xs">{v}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrecosPage() {
  const [frequencia, setFrequencia] = useState<Frequencia>("mensal");
  const [faqAberto, setFaqAberto] = useState<number | null>(null);


  return (
    <div className="bg-[var(--color-bg)]">
      <SiteNav />

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
              Preços transparentes
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Planos que cabem no<br />
              <span className="italic text-[var(--color-primary)]">seu bolso</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl">
              Do teste gratuito ao AI Agent inteligente. Escolha o plano ideal.<br />
              Sem surpresas, sem fidelidade. Cancele quando quiser.
            </p>
          </motion.div>
        </div>
      </Secao>

      {/* Toggle + Cards */}
      <Secao className="pt-0 sm:pt-0">
        <ToggleFrequencia frequencia={frequencia} onChange={setFrequencia} />
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3 items-start">
          {planos.map((plano, i) => (
            <CardPlano key={plano.slug} plano={plano} frequencia={frequencia} indice={i} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-sm text-ink-soft">
            Todos os planos pagos incluem <strong className="text-ink">7 dias de teste grátis</strong>. Sem cartão de crédito.
          </p>
        </div>
      </Secao>

      {/* Comparação completa */}
      <Secao id="comparacao" className="bg-white">
        <TituloSecao subtitulo="Compare todos os recursos lado a lado.">
          Comparação <span className="text-[var(--color-primary)]">completa</span>
        </TituloSecao>
        <div className="mx-auto max-w-5xl rounded-2xl border border-[var(--color-line)] bg-white p-4 sm:p-8 shadow-sm">
          <ComparacaoTable frequencia={frequencia} />
        </div>
      </Secao>

      {/* CTA */}
      <Secao className="py-16">
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--color-primary)]">
              <Sparkles size={14} />
              Comece agora
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Teste grátis por <span className="text-[var(--color-primary)]">7 dias</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
              Sem cartão de crédito. Sem compromisso. Cancele quando quiser.
            </p>
            <Link href="/cadastro" className="btn-primary mx-auto mt-8 inline-flex gap-2 px-8 py-4 text-lg shadow-lg shadow-[var(--color-primary)]/20">
              Criar meu sistema grátis
              <ArrowRight size={20} />
            </Link>
          </FadeIn>
        </div>
      </Secao>

      {/* FAQ */}
      <Secao id="faq-precos" className="bg-white">
        <TituloSecao subtitulo="Dúvidas comuns sobre nossos planos e preços.">
          Perguntas <span className="text-[var(--color-primary)]">frequentes</span>
        </TituloSecao>
        <div className="mx-auto max-w-3xl space-y-3">
          {faqPrecos.map((item, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div className="card overflow-hidden transition-all">
                <button
                  onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="flex items-center gap-3 font-medium text-ink">
                    <HelpCircle size={16} className="shrink-0 text-ink-soft/50" />
                    {item.q}
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
                >
                  <p className="px-5 pb-5 text-sm text-ink-soft leading-relaxed pl-12">{item.r}</p>
                </motion.div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Secao>

      {/* Footer */}
      <footer className="border-t border-[var(--color-line)] py-12">
        <div className="container-x">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-md"><Logo className="h-7 w-7" /></span>
              <span className="font-serif text-base font-semibold">AN.BR</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/blog" className="text-sm text-ink-soft transition-colors hover:text-ink">Blog</Link>
              <Link href="/privacidade" className="text-sm text-ink-soft transition-colors hover:text-ink">Privacidade</Link>
              <Link href="/termos" className="text-sm text-ink-soft transition-colors hover:text-ink">Termos</Link>
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

