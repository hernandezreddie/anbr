"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { linkWhatsApp } from "@/lib/whatsapp";
import { MODELOS_MENSAGEM, type MsgCtx } from "@/lib/mensagens";
import { QrPix } from "@/components/QrPix";
import {
  Check,
  X,
  Wallet,
  MapPin,
  Bus,
  Phone,
  Copy,
  Calendar,
  MessageCircle,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  ChevronRight,
  Star,
  Sparkles,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";

type Agendamento = {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string | null;
  cliente_endereco: string | null;
  data: string | null;
  hora: string | null;
  valor: number;
  horas: number | null;
  servico_nome: string | null;
  status: "solicitado" | "confirmado" | "concluido" | "cancelado";
  recorrencia: string | null;
  endereco: string | null;
  observacoes: string | null;
  origem: string;
  created_at: string | null;
};

type Profissional = {
  id: string;
  primeiro_nome: string;
  pix_chave: string;
  pix_nome: string;
  pix_cidade: string;
  nome: string;
  whatsapp: string;
};

type Pagamento = {
  valor: number;
  pago_em: string | null;
  status: string;
  agendamento_id: string | null;
};

const isoLocal = (d: Date) => d.toLocaleDateString("sv-SE");
const HOJE = () => isoLocal(new Date());
const AMANHA = () => isoLocal(new Date(Date.now() + 86400000));

const fmtR$ = (n: number) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
const fmtData = (d: string | null, h: string | null) => {
  if (!d) return "A combinar";
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}${h ? ` · ${h.slice(0, 5)}` : ""}`;
};

const resumoTexto = (a: Agendamento) =>
  [
    `Cliente: ${a.cliente_nome}`,
    a.cliente_whatsapp ? `WhatsApp: ${a.cliente_whatsapp}` : "",
    a.observacoes ? `Obs: ${a.observacoes}` : "",
    `Serviço: ${a.servico_nome ?? "Serviço"}${a.horas ? ` · ${a.horas}h` : ""}`,
    a.endereco ? `Endereço: ${a.endereco}` : "",
    `Quando: ${fmtData(a.data, a.hora)}`,
    `Frequência: ${a.recorrencia ?? "pontual"}`,
    `Valor: ${fmtR$(a.valor)}`,
  ]
    .filter(Boolean)
    .join("\n");

const enderecoCompleto = (a: Agendamento) =>
  a.cliente_endereco || a.endereco || "";

const mapsLink = (a: Agendamento) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(enderecoCompleto(a))}`;

const onibusLink = (a: Agendamento) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(enderecoCompleto(a))}&travelmode=transit`;

function googleCalLink(a: Agendamento, profissionalNome: string): string | null {
  if (!a.data) return null;
  const [y, m, d] = a.data.split("-").map(Number);
  const [hh, mi] = (a.hora ?? "09:00").slice(0, 5).split(":").map(Number);
  const inicio = new Date(y, m - 1, d, hh, mi);
  const fim = new Date(inicio.getTime() + Math.max(1, a.horas ?? 3) * 3600000);
  const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Serviço — ${a.cliente_nome}`,
    dates: `${fmt(inicio)}/${fmt(fim)}`,
    details: resumoTexto(a),
    location: enderecoCompleto(a),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function rotaLink(items: Agendamento[]): string | null {
  const doDia = items
    .filter((i) => i.status === "confirmado" && i.data === HOJE())
    .sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? ""));
  if (doDia.length === 0) return null;
  const pts = doDia.map(enderecoCompleto).filter(Boolean);
  if (pts.length === 0) return null;
  const destination = encodeURIComponent(pts[pts.length - 1]);
  const waypoints = pts.slice(0, -1).map(encodeURIComponent).join("|");
  let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=transit`;
  if (waypoints) url += `&waypoints=${waypoints}`;
  return url;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  solicitado: { label: "Solicitado", cls: "bg-amber-100 text-amber-800" },
  confirmado: { label: "Confirmado", cls: "bg-teal-100 text-teal-800" },
  concluido: { label: "Concluído", cls: "bg-neutral-100 text-neutral-500" },
  cancelado: { label: "Cancelado", cls: "bg-red-100 text-red-700" },
};

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    solicitado: "bg-amber-500",
    confirmado: "bg-teal-500",
    concluido: "bg-neutral-400",
    cancelado: "bg-red-500",
  };
  return <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${colors[status] || "bg-neutral-300"}`} />;
}

function Card({
  a,
  busy,
  profissional,
  onStatus,
  onPago,
  onCancelar,
  onPix,
  onQuando,
}: {
  a: Agendamento;
  busy: boolean;
  profissional: Profissional;
  onStatus: (id: string, s: string) => void;
  onPago: (a: Agendamento) => void;
  onCancelar: (a: Agendamento) => void;
  onPix: (a: Agendamento) => void;
  onQuando: (id: string, data: string, hora: string) => void;
}) {
  const [copiado, setCopiado] = useState(false);
  const [edit, setEdit] = useState(false);
  const [d, setD] = useState(a.data ?? "");
  const [h, setH] = useState(a.hora ? a.hora.slice(0, 5) : "");
  const [msgAberto, setMsgAberto] = useState(false);
  const ativo = a.status === "solicitado" || a.status === "confirmado";

  const ctx: MsgCtx = {
    nome: a.cliente_nome,
    quando: fmtData(a.data, a.hora),
    valor: fmtR$(a.valor),
    servico: a.servico_nome ?? "Serviço",
  };

  const inp = "rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:shadow-sm w-full";

  async function copiar() {
    try {
      await navigator.clipboard.writeText(resumoTexto(a));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {}
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-neutral-100 bg-white shadow-sm shadow-neutral-100/50"
    >
      {/* Top row: name + status */}
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="flex items-start gap-3">
          <StatusDot status={a.status} />
          <div>
            <p className="font-semibold text-neutral-900">{a.cliente_nome}</p>
            <p className="mt-0.5 text-sm text-neutral-500">
              {a.servico_nome ?? "Serviço"}
              {a.horas ? ` · ${a.horas}h` : ""}
              {a.origem === "web" ? " · 🌐 site" : ""}
            </p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[a.status].cls}`}>
          {STATUS_BADGE[a.status].label}
        </span>
      </div>

      {/* Info rows */}
      <div className="space-y-2 px-4 pb-3">
        {a.observacoes && (
          <div className="flex gap-2 text-sm">
            <span className="w-16 shrink-0 text-neutral-400">Obs</span>
            <span className="text-neutral-600">{a.observacoes}</span>
          </div>
        )}
        {a.endereco && (
          <div className="flex gap-2 text-sm">
            <span className="w-16 shrink-0 text-neutral-400">Endereço</span>
            <span className="text-neutral-600">{a.endereco}</span>
          </div>
        )}
        {a.cliente_whatsapp && (
          <div className="flex gap-2 text-sm">
            <span className="w-16 shrink-0 text-neutral-400">Telefone</span>
            <span className="text-neutral-600">{a.cliente_whatsapp}</span>
          </div>
        )}
        <div className="flex gap-2 text-sm">
          <span className="w-16 shrink-0 text-neutral-400">Frequência</span>
          <span className="text-neutral-600">{a.recorrencia ?? "pontual"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-16 shrink-0 text-neutral-400">Quando</span>
          {!edit ? (
            <span className="text-neutral-600">
              {fmtData(a.data, a.hora)}
              {ativo && (
                <button onClick={() => setEdit(true)} className="btn-ghost btn-sm ml-2 text-teal-600">
                  editar
                </button>
              )}
            </span>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <input type="date" value={d} onChange={(e) => setD(e.target.value)} className={inp} />
              <input type="time" value={h} onChange={(e) => setH(e.target.value)} className={inp} />
              <button onClick={() => { onQuando(a.id, d, h); setEdit(false); }}
                className="btn-primary btn-sm">
                Salvar
              </button>
              <button onClick={() => setEdit(false)} className="btn-ghost btn-sm">cancelar</button>
            </div>
          )}
        </div>
      </div>

      {/* Value */}
      <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
        <span className="text-xs font-medium text-neutral-400">Valor</span>
        <span className="text-lg font-bold text-neutral-900">{fmtR$(a.valor)}</span>
      </div>

      {/* Quick nav links (active only) */}
      {ativo && (
        <div className="flex gap-1 border-t border-neutral-100 px-4 py-2">
          <a href={mapsLink(a)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-700">
            <MapPin size={13} /> Mapa
          </a>
          <a href={onibusLink(a)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-700">
            <Bus size={13} /> Ônibus
          </a>
          {a.cliente_whatsapp && (
            <a href={`tel:+${a.cliente_whatsapp.replace(/\D/g, "")}`}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-700">
              <Phone size={13} /> Ligar
            </a>
          )}
          {googleCalLink(a, profissional.primeiro_nome) && (
            <a href={googleCalLink(a, profissional.primeiro_nome)!} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-700">
              <Calendar size={13} /> Agenda
            </a>
          )}
          <button onClick={copiar}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-700">
            <Copy size={13} /> {copiado ? "Copiado!" : "Copiar"}
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 border-t border-neutral-100 bg-neutral-50/50 px-4 py-3">
        {a.status === "solicitado" && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onStatus(a.id, "confirmado")}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal-700 disabled:opacity-50"
          >
            <Check size={14} /> Confirmar
          </motion.button>
        )}
        {a.status === "confirmado" && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onStatus(a.id, "concluido")}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-800 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-neutral-900 disabled:opacity-50"
          >
            <Check size={14} /> Concluir
          </motion.button>
        )}
        {ativo && (
          <>
            <div className="relative">
              <button onClick={() => setMsgAberto((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600 shadow-sm transition-all hover:bg-neutral-100 hover:text-neutral-800">
                <MessageCircle size={14} /> Mensagens
              </button>
              {msgAberto && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMsgAberto(false)} />
                  <div className="absolute left-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-lg">
                    <p className="border-b border-neutral-100 px-3 py-2.5 text-xs font-semibold text-neutral-500">
                      Enviar para {a.cliente_nome.split(" ")[0]}
                    </p>
                    {MODELOS_MENSAGEM.map((m) => (
                      <a key={m.id}
                        href={linkWhatsApp(m.texto(ctx, {
                          primeiroNome: profissional.primeiro_nome,
                          pixChave: profissional.pix_chave,
                          pixNome: profissional.pix_nome,
                        }), a.cliente_whatsapp || "")}
                        target="_blank" rel="noopener noreferrer"
                        onClick={() => setMsgAberto(false)}
                        className="block border-b border-neutral-100 px-3 py-3 text-left text-sm text-neutral-600 transition-colors last:border-0 hover:bg-teal-50 hover:text-teal-700">
                        {m.titulo}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button onClick={() => onPix(a)}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600 shadow-sm transition-all hover:bg-neutral-100 hover:text-neutral-800">
              <Wallet size={14} /> Cobrar Pix
            </button>
            <button onClick={() => onPago(a)} disabled={busy}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600 shadow-sm transition-all hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-50">
              <DollarSign size={14} /> Marcar pago
            </button>
            <button onClick={() => onCancelar(a)} disabled={busy}
              className="ml-auto flex items-center gap-1 rounded-lg px-2 py-2 text-xs text-neutral-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
              <X size={14} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

function StatsCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: string;
  sub: string;
  icon: any;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-400">{label}</p>
          <p className="mt-1 text-xl font-bold text-neutral-900">{value}</p>
          <p className="mt-1 text-xs text-neutral-500">{sub}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
  }
  return content;
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 py-10">
      <Icon size={32} className="text-neutral-300" />
      <p className="mt-3 text-sm text-neutral-400">{text}</p>
    </div>
  );
}

function SectionCard({
  title,
  count,
  children,
  empty,
  color,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  empty: string;
  color: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        {count > 0 && (
          <span
            className="flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: color }}
          >
            {count}
          </span>
        )}
      </div>
      {count === 0 ? (
        <EmptyState text={empty} icon={Clock} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">{children}</div>
      )}
    </section>
  );
}

export default function PainelPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Agendamento[]>([]);
  const [profissional, setProfissional] = useState<Profissional | null>(null);
  const [ganho, setGanho] = useState(0);
  const [nPagos, setNPagos] = useState(0);
  const [ganhoAnterior, setGanhoAnterior] = useState(0);
  const [aReceber, setAReceber] = useState(0);
  const [nAReceber, setNAReceber] = useState(0);
  const [semanaValor, setSemanaValor] = useState(0);
  const [semanaN, setSemanaN] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [pix, setPix] = useState<{ valor: number; desc: string } | null>(null);
  const [aviso, setAviso] = useState("");
  const [confirmacao, setConfirmacao] = useState<{ tipo: "cancelar" | "pago"; a: Agendamento } | null>(null);
  const [primary, setPrimary] = useState("#059669");

  const load = useCallback(async () => {
    const [ag, pg, prof, config] = await Promise.all([
      supabase.from("agendamentos").select("*").order("created_at", { ascending: false }),
      supabase.from("pagamentos").select("valor, pago_em, status, agendamento_id"),
      supabase.from("profissionais").select("*").single(),
      supabase.from("configuracoes").select("cor_primaria").single(),
    ]);
    if (config.data?.cor_primaria) setPrimary(config.data.cor_primaria);
    const lista = (ag.data as Agendamento[]) ?? [];
    setItems(lista);
    setProfissional((prof.data as Profissional) ?? null);

    const pgs = (pg.data ?? []) as Pagamento[];
    const soma = (xs: { valor: number }[]) => xs.reduce((s, p) => s + Number(p.valor), 0);

    const mes = HOJE().slice(0, 7);
    const dAnt = new Date();
    dAnt.setDate(1);
    dAnt.setMonth(dAnt.getMonth() - 1);
    const mesAnt = isoLocal(dAnt).slice(0, 7);
    const pagos = pgs.filter((p) => p.status === "pago" && (p.pago_em ?? "").startsWith(mes));
    setGanho(soma(pagos));
    setNPagos(pagos.length);
    setGanhoAnterior(soma(pgs.filter((p) => p.status === "pago" && (p.pago_em ?? "").startsWith(mesAnt))));

    const idsPagos = new Set(pgs.filter((p) => p.status === "pago").map((p) => p.agendamento_id));
    const pendentes = lista.filter((a) => a.status === "concluido" && !idsPagos.has(a.id));
    setAReceber(soma(pendentes));
    setNAReceber(pendentes.length);

    const fim = isoLocal(new Date(Date.now() + 7 * 86400000));
    const semana = lista.filter(
      (a) => a.status === "confirmado" && a.data && a.data >= HOJE() && a.data <= fim
    );
    setSemanaValor(soma(semana));
    setSemanaN(semana.length);

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
    const canal = supabase
      .channel("painel-agendamentos")
      .on("postgres_changes", { event: "*", schema: "public", table: "agendamentos" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "pagamentos" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [load, supabase]);

  const flash = (m: string) => {
    setAviso(m);
    setTimeout(() => setAviso(""), 2500);
  };

  async function mudarStatus(id: string, status: string) {
    setBusy(id);
    await supabase.from("agendamentos").update({ status }).eq("id", id);
    await load();
    setBusy(null);
  }

  async function salvarQuando(id: string, data: string, hora: string) {
    setBusy(id);
    await supabase.from("agendamentos").update({ data: data || null, hora: hora || null }).eq("id", id);
    await load();
    setBusy(null);
    flash("Data/horário atualizado ✔");
  }

  async function marcarPago(a: Agendamento) {
    setBusy(a.id);
    await supabase.from("pagamentos").insert({
      agendamento_id: a.id,
      valor: a.valor,
      status: "pago",
      pago_em: new Date().toISOString(),
    });
    await load();
    setBusy(null);
    flash("Pagamento registrado ✔");
  }

  async function executarConfirmacao() {
    if (!confirmacao) return;
    const { tipo, a } = confirmacao;
    setConfirmacao(null);
    if (tipo === "pago") await marcarPago(a);
    else await mudarStatus(a.id, "cancelado");
  }

  const onPix = (x: Agendamento) => setPix({ valor: x.valor, desc: x.servico_nome ?? "Serviço" });

  const solicitacoes = items.filter((i) => i.status === "solicitado");
  const amanha = items.filter((i) => i.status === "confirmado" && i.data === AMANHA());
  const agendados = items.filter((i) => i.status === "confirmado" && i.data !== AMANHA());
  const outros = items.filter((i) => i.status === "concluido" || i.status === "cancelado").slice(0, 12);
  const rota = rotaLink(items);

  const nome = profissional?.primeiro_nome || "";
  const saudacao = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  const hojeStr = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const renderCard = (a: Agendamento) => profissional && (
    <Card
      key={a.id}
      a={a}
      busy={busy === a.id}
      profissional={profissional}
      onStatus={mudarStatus}
      onPago={(x) => setConfirmacao({ tipo: "pago", a: x })}
      onCancelar={(x) => setConfirmacao({ tipo: "cancelar", a: x })}
      onPix={onPix}
      onQuando={salvarQuando}
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Toast */}
      <AnimatePresence>
        {aviso && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-4 z-50 -translate-x-1/2"
          >
            <p className="rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg" style={{ backgroundColor: primary }}>{aviso}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div
        className="relative -mx-6 -mt-8 overflow-hidden px-6 pb-8 pt-8 lg:-mx-8 lg:px-8"
        style={{ background: `linear-gradient(135deg, ${primary}, ${primary}dd)` }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white" />
          <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-white" />
          <div className="absolute right-1/4 top-1/3 h-32 w-32 rounded-full bg-white" />
        </div>
        <div className="relative">
          <p className="text-sm font-medium text-white/70">{saudacao},</p>
          <h1 className="mt-0.5 text-2xl font-bold text-white">{nome}</h1>
          <p className="mt-1 text-sm text-white/60 capitalize">{hojeStr}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatsCard
          label="Ganho no mês"
          value={fmtR$(ganho)}
          sub={`${nPagos} pago(s)`}
          icon={TrendingUp}
          color={primary}
        />
        <StatsCard
          label="A receber"
          value={fmtR$(aReceber)}
          sub={nAReceber > 0 ? `${nAReceber} pendente(s)` : "Tudo em dia ✔"}
          icon={DollarSign}
          color={aReceber > 0 ? "#d97706" : primary}
        />
        <StatsCard
          label="Próximos 7 dias"
          value={fmtR$(semanaValor)}
          sub={`${semanaN} serviço(s)`}
          icon={Calendar}
          color={primary}
        />
        {rota ? (
          <StatsCard
            label="Rota de hoje"
            value="Ver rota"
            sub="Google Maps"
            icon={MapPin}
            color="#2563eb"
            href={rota}
          />
        ) : (
          <StatsCard
            label="Rota de hoje"
            value="—"
            sub="Sem rota hoje"
            icon={MapPin}
            color="#a1a1aa"
          />
        )}
      </div>

      {/* Sections */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-neutral-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-teal-600" />
            <span className="text-sm">Carregando...</span>
          </div>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
          className="space-y-8"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <SectionCard title="Novas solicitações" count={solicitacoes.length} empty="Nenhuma solicitação nova." color={primary}>
              {solicitacoes.map(renderCard)}
            </SectionCard>
          </motion.div>

          {amanha.length > 0 && (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <SectionCard title="Para amanhã" count={amanha.length} empty="" color="#d97706">
                {amanha.map(renderCard)}
              </SectionCard>
            </motion.div>
          )}

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <SectionCard title="Agendados" count={agendados.length} empty="Nada mais confirmado." color={primary}>
              {agendados.map(renderCard)}
            </SectionCard>
          </motion.div>

          {outros.length > 0 && (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <SectionCard title="Histórico" count={outros.length} empty="" color="#a1a1aa">
                {outros.map(renderCard)}
              </SectionCard>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Pix Modal */}
      {pix && profissional && (
        <QrPix
          valor={pix.valor}
          descricao={pix.desc}
          chave={profissional.pix_chave}
          nome={profissional.pix_nome}
          cidade={profissional.pix_cidade}
          onClose={() => setPix(null)}
        />
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmacao && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/30 px-4 pb-12 sm:items-center sm:pb-0"
            onClick={() => setConfirmacao(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
            >
              <div className="p-6">
                <div
                  className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                    confirmacao.tipo === "pago" ? "bg-teal-100" : "bg-red-100"
                  }`}
                >
                  {confirmacao.tipo === "pago" ? (
                    <DollarSign size={24} className="text-teal-600" />
                  ) : (
                    <AlertTriangle size={24} className="text-red-600" />
                  )}
                </div>
                <p className="text-center text-lg font-semibold text-neutral-900">
                  {confirmacao.tipo === "pago" ? "Marcar como pago?" : "Cancelar agendamento?"}
                </p>
                <p className="mt-2 text-center text-sm text-neutral-500">
                  {confirmacao.a.cliente_nome} · {fmtR$(confirmacao.a.valor)}
                </p>
              </div>
              <div className="flex border-t border-neutral-100">
                <button
                  onClick={() => setConfirmacao(null)}
                  className="flex-1 py-4 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Voltar
                </button>
                <button
                  onClick={executarConfirmacao}
                  className="flex-1 py-4 text-sm font-semibold text-white transition-colors"
                  style={{
                    backgroundColor: confirmacao.tipo === "pago" ? primary : "#dc2626",
                  }}
                  onMouseEnter={(e) => {
                    if (confirmacao.tipo === "pago") e.currentTarget.style.backgroundColor = `${primary}dd`;
                  }}
                  onMouseLeave={(e) => {
                    if (confirmacao.tipo === "pago") e.currentTarget.style.backgroundColor = primary;
                  }}
                >
                  {confirmacao.tipo === "pago" ? "Sim, pagar" : "Sim, cancelar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}