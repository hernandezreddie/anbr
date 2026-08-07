"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SITE_DOMAIN } from "@/lib/site";
import {
  Check,
  X,
  Bot,
  Wallet,
  DollarSign,
  Calendar,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Play,
  MessageCircle,
  Copy,
  Send,
  MonitorSmartphone,
  LayoutDashboard,
  Palette,
  Image as ImageIcon,
} from "lucide-react";

const fmtR$ = (v: number) =>
  "R$ " + v.toFixed(2).replace(".", ",") + (Number.isInteger(v) ? ",00" : "");

type Status = "solicitado" | "confirmado" | "concluido";

type Item = {
  id: number;
  nome: string;
  servico: string;
  valor: number;
  hora: string;
  status: Status;
  origem: "web" | "whatsapp";
};

const AGENDA_INICIAL: Item[] = [
  { id: 1, nome: "Mariana Souza", servico: "Corte + Escova", valor: 125, hora: "09:30", status: "solicitado", origem: "web" },
  { id: 2, nome: "Juliana Lima", servico: "Coloração", valor: 180, hora: "11:00", status: "solicitado", origem: "whatsapp" },
  { id: 3, nome: "Camila Rocha", servico: "Manicure", valor: 60, hora: "14:00", status: "confirmado", origem: "web" },
  { id: 4, nome: "Fernanda Alves", servico: "Maquiagem", valor: 90, hora: "16:30", status: "confirmado", origem: "web" },
];

const STATUS_LABEL: Record<Status, string> = {
  solicitado: "Novo pedido",
  confirmado: "Confirmado",
  concluido: "Concluído",
};

const CHAT_SCRIPT: Record<string, string> = {
  "Quanto custa um corte?":
    "Corte Feminino: R$ 75 com a Ana. Posso agendar para você? ✨",
  "Tem horário amanhã?":
    "Amanhã temos 09:30, 11:00 e 15:00 livres. Qual você prefere? 😊",
  "Posso remarcar?":
    "Claro! Me diz o novo dia e horário que eu confirmo na hora com a Ana. 💛",
};

type Tab = "painel" | "cliente" | "agente" | "personalizar";

export function DemoClient() {
  const [tab, setTab] = useState<Tab>("painel");
  const [agenda, setAgenda] = useState<Item[]>(AGENDA_INICIAL);
  const [pix, setPix] = useState<Item | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourAberto, setTourAberto] = useState(true);
  const [msg, setMsg] = useState("Quanto custa um corte?");
  const [chatAtivo, setChatAtivo] = useState(false);
  const [mostrarChat, setMostrarChat] = useState(false);
  const [corEditada, setCorEditada] = useState("#059669");
  const [templateEditado, setTemplateEditado] = useState<1 | 2>(1);

  const refPedidos = useRef<HTMLDivElement>(null);
  const refStats = useRef<HTMLDivElement>(null);
  const refPix = useRef<HTMLDivElement>(null);

  const mudarStatus = (id: number, status: Status) =>
    setAgenda((xs) => xs.map((x) => (x.id === id ? { ...x, status } : x)));

  const TOUR = [
    {
      ref: refPedidos,
      titulo: "Chegou pedido novo — você decide",
      texto:
        "Cada agendamento do seu site e do WhatsApp aparece aqui na hora. Um toque confirma e o cliente já recebe o aviso.",
    },
    {
      ref: refPix,
      titulo: "Cobre sem sair do lugar",
      texto:
        "Gere o Pix do serviço em segundos. Sem planilha, sem aquele 'depois eu cobro' que nunca chega.",
    },
    {
      ref: refStats,
      titulo: "Seu dinheiro sempre na tela",
      texto:
        "Ganhos do mês, valores a receber e os próximos 7 dias — tudo visível sem abrir planilha nenhuma.",
    },
  ];

  const irProximo = () => {
    const t = TOUR[tourStep];
    t?.ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      setTourStep((s) => (s >= TOUR.length - 1 ? s : s + 1));
      if (tourStep >= TOUR.length - 1) setTourAberto(false);
    }, 600);
  };

  const abrirChat = () => {
    setMostrarChat(true);
    setChatAtivo(false);
    setTimeout(() => setChatAtivo(true), 900);
  };

  const responder = (q: string) => {
    setMsg(q);
    setChatAtivo(false);
    setTimeout(() => setChatAtivo(true), 1100);
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* ===== Header demo ===== */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-neutral-900">AN.BR</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-teal-600">
                Demonstração · dados fictícios
              </p>
            </div>
          </div>
          <Link
            href="/cadastro"
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-[0.98]"
          >
            Criar meu sistema grátis <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* ===== Tabs ===== */}
      <div className="sticky top-[57px] z-40 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {(
            [
              { id: "painel", label: "Painel", icon: LayoutDashboard },
              { id: "cliente", label: "Site do cliente", icon: MonitorSmartphone },
              { id: "agente", label: "AI Agent", icon: Bot },
              { id: "personalizar", label: "Personalizar", icon: Palette },
            ] as { id: Tab; label: string; icon: any }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
              }`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "painel" && (
              <div ref={refPedidos}>
                <PainelMock
                  agenda={agenda}
                  mudarStatus={mudarStatus}
                  onPix={(i) => setPix(i)}
                  statsRef={refStats}
                  pixRef={refPix}
                />
              </div>
            )}
            {tab === "cliente" && <ClienteMock />}
            {tab === "agente" && (
              <AgenteMock
                msg={msg}
                chatAtivo={chatAtivo}
                mostrarChat={mostrarChat}
                onAbrir={abrirChat}
                onResponder={responder}
              />
            )}
            {tab === "personalizar" && (
              <PersonalizacaoMock
                cor={corEditada}
                setCor={setCorEditada}
                template={templateEditado}
                setTemplate={setTemplateEditado}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ===== CTA final ===== */}
        <section className="relative mt-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary)] via-emerald-600 to-teal-600 p-8 text-center sm:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTAgTDQwIDEwIE0xMCAwIEwxMCA0MCBNMCAyMCBMNDAgMjAgTTIwIDAgTDIwIDQwIE0wIDMwIEw0MCAzMCBNMzAgMCBMMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] opacity-20" />
          <div className="relative">
            <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
              Gostou do que viu? O seu fica pronto em 5 minutos.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
              Seu painel, seu site e seu AI Agent — grátis para sempre com 30 agendamentos por mês. Sem cartão.
            </p>
            <Link
              href="/cadastro"
              className="group mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-[var(--color-primary)] shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Criar meu sistema grátis <ArrowRight size={20} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="mt-3 text-xs text-white/60">5 minutos · zero código · cancele quando quiser</p>
          </div>
        </section>
      </main>

      {/* ===== Modal Pix ===== */}
      <AnimatePresence>
        {pix && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onClick={() => setPix(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Cobrança Pix</h3>
                  <p className="text-sm text-neutral-500">{pix.nome} · {pix.servico}</p>
                </div>
                <button onClick={() => setPix(null)} className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100">
                  <X size={18} />
                </button>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="font-serif text-4xl font-bold text-neutral-900">{fmtR$(pix.valor)}</span>
                <span className="flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
                  <Wallet size={12} /> 0% de comissão
                </span>
              </div>
              <div className="mt-4 flex items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-4">
                <QrFake seed={pix.id} />
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5">
                <code className="flex-1 truncate font-mono text-xs text-neutral-500">
                  00020126580014BR.GOV.BCB.PIX0136{String(pix.id).padStart(4, "0")}…0026AN.BR DEMO
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText("copia-e-cola-demo-anbr").catch(() => {});
                    setCopiado(true);
                    setTimeout(() => setCopiado(false), 1800);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-teal-700"
                >
                  {copiado ? <Check size={12} /> : <Copy size={12} />} {copiado ? "Copiado!" : "Copiar"}
                </button>
              </div>
              <p className="mt-3 text-center text-xs text-neutral-400">
                No sistema real, o cliente paga e o status muda sozinho.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== Tour guiado ===== */}
      <AnimatePresence>
        {tourAberto && tab === "painel" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-md rounded-2xl border border-neutral-100 bg-white p-5 shadow-2xl shadow-black/10"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
                <Sparkles size={16} />
              </span>
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-600">
                  Tour · {tourStep + 1} de {TOUR.length}
                </p>
                <h3 className="mt-0.5 font-bold text-neutral-900">{TOUR[tourStep].titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">{TOUR[tourStep].texto}</p>
              </div>
              <button onClick={() => setTourAberto(false)} className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100">
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                {TOUR.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === tourStep ? "w-6 bg-teal-600" : "w-1.5 bg-neutral-200"}`}
                  />
                ))}
              </div>
              <button
                onClick={irProximo}
                className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-neutral-700"
              >
                {tourStep === TOUR.length - 1 ? "Entendi!" : "Próximo"} <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= Painel mock ================= */

function PainelMock({
  agenda,
  mudarStatus,
  onPix,
  statsRef,
  pixRef,
}: {
  agenda: Item[];
  mudarStatus: (id: number, s: Status) => void;
  onPix: (i: Item) => void;
  statsRef: React.RefObject<HTMLDivElement | null>;
  pixRef: React.RefObject<HTMLDivElement | null>;
}) {
  const pendentes = agenda.filter((a) => a.status === "solicitado");
  const confirmados = agenda.filter((a) => a.status === "confirmado");
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-black/[0.04]">
      {/* Header gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[#047857] px-6 py-7">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10" />
        <p className="text-sm text-white/80">Boa tarde,</p>
        <h2 className="text-xl font-bold text-white">Ana Profissional 👋</h2>
        <p className="mt-0.5 text-sm capitalize text-white/70">{hoje}</p>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        {/* Stats */}
        <div ref={statsRef} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Ganho no mês", value: fmtR$(4320), sub: "26 pagos", icon: TrendingUp, color: "#059669" },
            { label: "A receber", value: fmtR$(305), sub: "3 pendentes", icon: DollarSign, color: "#d97706" },
            { label: "Próximos 7 dias", value: fmtR$(1890), sub: "14 serviços", icon: Calendar, color: "#059669" },
            { label: "Agendados hoje", value: "7", sub: "2 novos pedidos", icon: Check, color: "#2563eb" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-medium text-neutral-400">{s.label}</p>
              <p className="mt-1 truncate text-lg font-bold text-neutral-900 sm:text-xl">{s.value}</p>
              <p className="mt-1 text-[11px] text-neutral-500">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Alert card */}
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <MessageCircle size={15} />
          </span>
          <p className="text-sm text-emerald-800">
            <strong>2 clientes</strong> chamaram no WhatsApp — o AI Agent já respondeu por você.
          </p>
        </div>

        {/* Novos pedidos */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">Novos pedidos</h3>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--color-primary)] px-2 text-xs font-bold text-white shadow-sm">
              {pendentes.length}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {agenda.map((a) => (
              <div
                key={a.id}
                ref={a.status === "solicitado" ? pixRef : undefined}
                className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">
                      {a.nome.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                    </span>
                    <div>
                      <p className="font-semibold text-neutral-900">{a.nome}</p>
                      <p className="text-xs text-neutral-500">
                        {a.servico} · {a.hora}
                        {a.origem === "whatsapp" && " · 💬 WhatsApp"}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900">{fmtR$(a.valor)}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-neutral-100 pt-3">
                  {a.status === "solicitado" && (
                    <button
                      onClick={() => mudarStatus(a.id, "confirmado")}
                      className="flex items-center gap-1 rounded-xl bg-[var(--color-primary)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
                    >
                      <Check size={13} /> Confirmar
                    </button>
                  )}
                  {a.status === "confirmado" && (
                    <button
                      onClick={() => mudarStatus(a.id, "concluido")}
                      className="flex items-center gap-1 rounded-xl bg-[var(--color-primary)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
                    >
                      <Check size={13} /> Concluir
                    </button>
                  )}
                  {a.status === "concluido" && (
                    <span className="flex items-center gap-1 rounded-xl bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
                      <Check size={13} /> Concluído
                    </span>
                  )}
                  <button
                    onClick={() => onPix(a)}
                    className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600 transition-all hover:bg-neutral-50"
                  >
                    <Wallet size={13} /> Cobrar Pix
                  </button>
                  <span
                    className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      a.status === "solicitado"
                        ? "bg-amber-100 text-amber-700"
                        : a.status === "confirmado"
                          ? "bg-teal-100 text-teal-700"
                          : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {STATUS_LABEL[a.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-neutral-400">
            No sistema real: cada pedido confirma e o cliente recebe aviso no WhatsApp automaticamente.
          </p>
        </section>

        {/* AI Agent card */}
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-gradient-to-r from-neutral-50 to-white p-4">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-emerald-400 text-white">
            <Bot size={18} />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </span>
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-neutral-900">AI Agent</p>
            <p className="text-xs text-neutral-500">Atendendo no WhatsApp, Instagram e Facebook — 24h</p>
          </div>
          <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:block">
            Online · 34 conversas este mês
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================= Editor de personalização mock ================= */

const CORES = [
  { nome: "Verde AN.BR", hex: "#059669" },
  { nome: "Roxo", hex: "#7c3aed" },
  { nome: "Rosa", hex: "#db2777" },
  { nome: "Azul", hex: "#2563eb" },
  { nome: "Laranja", hex: "#ea580c" },
  { nome: "Escuro", hex: "#18181b" },
];

function PersonalizacaoMock({
  cor,
  setCor,
  template,
  setTemplate,
}: {
  cor: string;
  setCor: (c: string) => void;
  template: 1 | 2;
  setTemplate: (t: 1 | 2) => void;
}) {
  const claro = cor === "#18181b" || template === 2;

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* Controles */}
      <div className="space-y-4 lg:col-span-5">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl shadow-black/[0.04]">
          <h3 className="flex items-center gap-2 font-bold text-neutral-900">
            <Palette size={18} className="text-[var(--color-primary)]" /> Personalize no painel
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Sem saber programar: escolha a cor, o template e envie seu logo. A página muda na hora.
          </p>

          <div className="mt-5">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Cor principal
            </p>
            <div className="flex flex-wrap gap-2">
              {CORES.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setCor(c.hex)}
                  title={c.nome}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:scale-105 ${
                    cor === c.hex ? "ring-2 ring-offset-2" : ""
                  }`}
                  style={{ backgroundColor: c.hex, ["--tw-ring-color" as any]: c.hex }}
                >
                  {cor === c.hex && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Template
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 1, nome: "Clássico", desc: "Limpo e elegante", bg: "from-teal-50 to-white" },
                  { id: 2, nome: "Escuro", desc: "Moderno e ousado", bg: "from-neutral-800 to-neutral-900" },
                ] as { id: 1 | 2; nome: string; desc: string; bg: string }[]
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`overflow-hidden rounded-2xl border-2 text-left transition-all ${
                    template === t.id
                      ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                      : "border-neutral-200 hover:border-[var(--color-primary)]/40"
                  }`}
                >
                  <div className={`h-16 bg-gradient-to-br ${t.bg} p-3`}>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cor }} />
                      <span className="h-1.5 w-16 rounded-full bg-neutral-400/50" />
                    </div>
                    <div className="mt-2 h-1.5 w-20 rounded-full bg-neutral-400/40" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-neutral-900">{t.nome}</p>
                    <p className="text-[10px] text-neutral-400">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
              <ImageIcon size={13} /> Seu logo e sua foto
            </p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400">
              No painel você envia seu logo, escolhe uma foto de fundo e escreve seu slogan. Tudo com preview em tempo real.
            </p>
          </div>
        </div>

        <p className="flex items-center gap-1.5 rounded-2xl bg-[var(--color-primary)]/5 px-4 py-3 text-xs font-medium text-[var(--color-primary)]">
          <Sparkles size={13} /> Em 5 minutos sua página está no ar com o seu visual.
        </p>
      </div>

      {/* Preview ao vivo */}
      <div className="lg:col-span-7">
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-black/[0.04]">
          <div className="flex h-9 items-center gap-1.5 border-b border-neutral-100 bg-neutral-50 px-4">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1 text-left text-[10px] text-neutral-400">
              studio-ana.{SITE_DOMAIN}
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-600">
              Preview ao vivo
            </span>
          </div>

          <div className={`min-h-[430px] ${claro ? "bg-neutral-950" : "bg-white"}`}>
            {/* Nav */}
            <div className={`flex items-center justify-between border-b px-6 py-3.5 ${claro ? "border-white/10" : "border-neutral-100"}`}>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ backgroundColor: cor }}>
                  <Check size={15} />
                </span>
                <span className={`text-sm font-bold ${claro ? "text-white" : "text-neutral-900"}`}>Studio Ana</span>
              </div>
              <button
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: cor }}
              >
                Agendar horário
              </button>
            </div>

            {/* Hero */}
            <div className="px-6 pt-10 text-center">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold ${
                  claro ? "bg-white/10 text-white/80" : "bg-neutral-100 text-neutral-500"
                }`}
              >
                <Sparkles size={10} /> Profissional de confiança
              </span>
              <h3
                className={`mx-auto mt-3 max-w-md font-serif text-2xl font-bold leading-tight sm:text-3xl ${
                  claro ? "text-white" : "text-neutral-900"
                }`}
              >
                Agende seu horário em{" "}
                <span style={{ color: cor }}>segundos</span>
              </h3>
              <p className={`mt-2 text-sm ${claro ? "text-white/60" : "text-neutral-500"}`}>
                Sem fila, sem ligação. Escolha o serviço e confirme pelo WhatsApp.
              </p>
              <div className="mt-5 flex justify-center gap-2">
                {["Corte", "Escova", "Coloração"].map((s, i) => (
                  <span
                    key={s}
                    className={`rounded-xl px-4 py-2.5 text-xs font-medium ${
                      claro
                        ? i === 0 ? "text-white" : "bg-white/10 text-white/70"
                        : i === 0 ? "text-white" : "border border-neutral-200 text-neutral-600"
                    }`}
                    style={i === 0 ? { backgroundColor: cor } : undefined}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Botão grande */}
            <div className="px-6 pb-10 pt-6 text-center">
              <button
                className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90"
                style={{ backgroundColor: cor, boxShadow: `0 8px 24px ${cor}44` }}
              >
                Agendar agora <ArrowRight size={15} />
              </button>
              <p className={`mt-3 text-[10px] ${claro ? "text-white/40" : "text-neutral-400"}`}>
                Confirmação e lembrete automáticos no WhatsApp
              </p>
            </div>
          </div>
        </div>
        <p className="mt-2.5 text-center text-xs text-neutral-400">
          Troque a cor e o template → o preview atualiza na hora. No sistema real, os clientes veem assim.
        </p>
      </div>
    </div>
  );
}

/* ================= Página do cliente mock ================= */

function ClienteMock() {
  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-black/[0.04]">
      <div className="grid grid-cols-1 sm:grid-cols-12">
        <div className="sm:col-span-7 border-r border-neutral-100 p-6 sm:p-8">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Studio Ana · Salão
          </div>
          <h2 className="font-serif text-2xl font-bold text-neutral-900">Agende seu horário</h2>
          <p className="mt-1 text-sm text-neutral-500">Escolha o serviço e o melhor horário para você.</p>
          <div className="mt-5 space-y-3">
            {[
              { nome: "Corte Feminino", preco: "R$ 75", duracao: "45 min" },
              { nome: "Escova", preco: "R$ 50", duracao: "30 min" },
              { nome: "Coloração", preco: "R$ 120", duracao: "1h 30min" },
            ].map((s, i) => (
              <div
                key={s.nome}
                className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                  i === 0 ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm" : "border-neutral-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${i === 0 ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-neutral-300"}`}>
                    {i === 0 && <Check size={11} className="text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{s.nome}</p>
                    <p className="text-xs text-neutral-500">{s.duracao}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-neutral-900">{s.preco}</span>
              </div>
            ))}
          </div>
          <button className="mt-5 w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110">
            Agendar horário
          </button>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--color-primary)]/5 px-3 py-2 text-xs font-medium text-[var(--color-primary)]">
            <MessageCircle size={14} /> Confirmação e lembrete no WhatsApp
          </div>
        </div>
        <div className="sm:col-span-5 bg-neutral-50 p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-900">Agosto 2026</span>
            <span className="flex gap-1 text-neutral-400">
              <ChevronLeft /> <ChevronRight />
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
              <span key={i} className="py-1 text-neutral-400">{d}</span>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 2;
              const sel = day === 15;
              const avail = day >= 1 && day <= 31;
              return (
                <span
                  key={i}
                  className={`rounded-lg py-1.5 text-xs transition-all ${
                    sel
                      ? "bg-[var(--color-primary)] font-semibold text-white"
                      : avail
                        ? "cursor-pointer text-neutral-700 hover:bg-[var(--color-primary)]/10"
                        : "text-transparent"
                  }`}
                >
                  {avail ? day : ""}
                </span>
              );
            })}
          </div>
          <div className="mt-4 border-t border-neutral-200 pt-4">
            <p className="mb-2 text-xs font-semibold text-neutral-500">Horários disponíveis</p>
            <div className="space-y-1.5">
              {["09:00", "10:00", "11:00", "14:00", "15:00"].map((h) => (
                <div key={h} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                  <span className="font-medium text-neutral-800">{h}</span>
                  <span className="flex items-center gap-1 text-xs text-[var(--color-primary)]">
                    <Check size={12} /> Disponível
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= AI Agent mock ================= */

function AgenteMock({
  msg,
  chatAtivo,
  mostrarChat,
  onAbrir,
  onResponder,
}: {
  msg: string;
  chatAtivo: boolean;
  mostrarChat: boolean;
  onAbrir: () => void;
  onResponder: (q: string) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Simulação do WhatsApp */}
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl shadow-black/[0.04]">
        <div className="flex items-center gap-3 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-emerald-400 text-white">
            <Bot size={18} />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </span>
          </span>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Studio Ana · AI Agent</p>
            <p className="text-xs font-medium text-emerald-600">Online — responde em segundos</p>
          </div>
          <div className="ml-auto rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            WhatsApp
          </div>
        </div>
        <div className="space-y-2.5 bg-[#e5ddd5] p-4" style={{ minHeight: 380 }}>
          <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-[#dcf8c6] px-3.5 py-2.5 text-sm text-neutral-800 shadow-sm">
            Oi! Quero marcar um horário 🙋‍♀️
          </div>
          <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm text-neutral-800 shadow-sm">
            Oi, Mariana! 😊 Aqui é o Studio Ana. Posso te ajudar a agendar — quer cortar, escovar ou colorir?
          </div>
          {mostrarChat ? (
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm text-neutral-800 shadow-sm">
              {msg}
              {!chatAtivo && (
                <span className="ml-1.5 inline-flex gap-0.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "300ms" }} />
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={onAbrir}
              className="ml-auto flex items-center gap-1.5 rounded-2xl rounded-br-md bg-[#dcf8c6] px-3.5 py-2.5 text-sm font-medium text-neutral-800 shadow-sm transition-all hover:brightness-105"
            >
              Quanto custa um corte? <Send size={13} />
            </button>
          )}
          {chatAtivo && (
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm text-neutral-800 shadow-sm">
              {CHAT_SCRIPT[msg]}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 border-t border-neutral-100 bg-white px-4 py-3">
          <input
            readOnly
            placeholder="Digite uma mensagem…"
            className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-400 outline-none"
          />
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
            <Send size={15} />
          </span>
        </div>
      </div>

      {/* Painel lateral: o que o agente faz + perguntas de teste */}
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl shadow-black/[0.04]">
          <h3 className="flex items-center gap-2 font-bold text-neutral-900">
            <Bot size={18} className="text-[var(--color-primary)]" /> Teste o AI Agent
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Este é o agente do Studio Ana respondendo no WhatsApp real. Toque em uma pergunta:
          </p>
          <div className="mt-4 space-y-2">
            {Object.keys(CHAT_SCRIPT).map((q) => (
              <button
                key={q}
                onClick={() => onResponder(q)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-neutral-200 px-3.5 py-2.5 text-left text-sm text-neutral-700 transition-all hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5"
              >
                {q} <ArrowRight size={14} className="shrink-0 text-neutral-300" />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3 rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl shadow-black/[0.04]">
          {[
            { icon: Calendar, titulo: "Agenda sozinho", texto: "Consulta a sua disponibilidade real e marca sem você precisar responder." },
            { icon: MessageCircle, titulo: "Responde 24h", texto: "Fim de semana, feriado, madrugada — nenhum cliente fica sem resposta." },
            { icon: Wallet, titulo: "Cobra e confirma", texto: "Pergunta por Pix, envia o valor e confirma o pagamento antes do atendimento." },
          ].map((b) => (
            <div key={b.titulo} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
                <b.icon size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{b.titulo}</p>
                <p className="text-xs leading-relaxed text-neutral-500">{b.texto}</p>
              </div>
            </div>
          ))}
          <p className="flex items-center gap-1.5 rounded-xl bg-[var(--color-primary)]/5 px-3 py-2.5 text-xs font-medium text-[var(--color-primary)]">
            <Sparkles size={13} /> Seu agente aprende os seus serviços e horários.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= QR falso ================= */

function QrFake({ seed }: { seed: number }) {
  const cells: boolean[] = [];
  for (let i = 0; i < 21 * 21; i++) {
    cells.push(((i * 7 + seed * 13 + i % 3 * 5) % 4) < 1.6);
  }
  const finder = (r: number, c: number) => {
    const inSquare =
      r >= 1 && r <= 6 && c >= 1 && c <= 6;
    if (!inSquare) return false;
    const border = r === 1 || r === 6 || c === 1 || c === 6;
    const core = r >= 3 && r <= 4 && c >= 3 && c <= 4;
    return border || core;
  };
  const pos = (r: number, c: number) =>
    (r < 7 && c < 7) ? finder(r, c) : (r < 7 && c > 13) ? finder(r, c - 14) : (r > 13 && c < 7) ? finder(r - 14, c) : cells[r * 21 + c];
  return (
    <svg viewBox="0 0 21 21" className="h-40 w-40" aria-hidden="true">
      {Array.from({ length: 21 * 21 }, (_, i) => {
        const r = Math.floor(i / 21);
        const c = i % 21;
        return pos(r, c) ? <rect key={i} x={c} y={r} width="1" height="1" fill="#0f172a" /> : null;
      })}
    </svg>
  );
}

function ChevronLeft() {
  return <span aria-hidden="true">‹</span>;
}
function ChevronRight() {
  return <span aria-hidden="true">›</span>;
}
