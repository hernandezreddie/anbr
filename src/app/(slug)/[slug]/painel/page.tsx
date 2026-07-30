"use client";

import { useCallback, useEffect, useState } from "react";
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

const STATUS: Record<string, { label: string; cls: string }> = {
  solicitado: { label: "Solicitado", cls: "bg-amber-100 text-amber-800" },
  confirmado: { label: "Confirmado", cls: "bg-emerald-100 text-emerald-800" },
  concluido: { label: "Concluído", cls: "bg-ink/10 text-ink-soft" },
  cancelado: { label: "Cancelado", cls: "bg-red-100 text-red-700" },
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

  const linhas: [string, string][] = [];
  if (a.observacoes) linhas.push(["Obs", a.observacoes]);
  if (a.endereco) linhas.push(["Endereço", a.endereco]);
  linhas.push(["Frequência", a.recorrencia ?? "pontual"]);
  if (a.cliente_whatsapp) linhas.push(["Telefone", a.cliente_whatsapp]);

  const inp = "rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-emerald-600";
  const act = "px-4 py-2 text-xs";
  const nav = "rounded-xl px-3 py-2 text-xs text-ink-soft hover:bg-gray-100 hover:text-ink";

  async function copiar() {
    try {
      await navigator.clipboard.writeText(resumoTexto(a));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {}
  }

  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-lg font-semibold text-ink">{a.cliente_nome}</p>
          <p className="text-sm text-ink-mute">
            {a.servico_nome ?? "Serviço"}
            {a.horas ? ` · ${a.horas}h` : ""}
            {a.origem === "web" ? " · pelo site" : ""}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[a.status].cls}`}>
          {STATUS[a.status].label}
        </span>
      </div>

      <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
        {linhas.map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-mute">{k}</dt>
            <dd className="flex-1 text-ink-soft">{v}</dd>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <dt className="w-20 shrink-0 text-ink-mute">Quando</dt>
          <dd className="flex-1">
            {!edit ? (
              <span className="text-ink-soft">
                {fmtData(a.data, a.hora)}
                {ativo && (
                  <button onClick={() => setEdit(true)} className="ml-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                    editar
                  </button>
                )}
              </span>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <input type="date" value={d} onChange={(e) => setD(e.target.value)} className={inp} />
                <input type="time" value={h} onChange={(e) => setH(e.target.value)} className={inp} />
                <button onClick={() => { onQuando(a.id, d, h); setEdit(false); }}
                  className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-emerald-700">
                  Salvar
                </button>
                <button onClick={() => setEdit(false)} className="text-xs text-ink-mute">cancelar</button>
              </div>
            )}
          </dd>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <dt className="w-20 shrink-0 text-ink-mute">Valor</dt>
          <dd className="font-serif text-xl font-semibold text-ink">{fmtR$(a.valor)}</dd>
        </div>
      </dl>

      {ativo && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
          <a href={mapsLink(a)} target="_blank" rel="noopener noreferrer" className={nav}>
            <MapPin size={15} /> Mapa
          </a>
          <a href={onibusLink(a)} target="_blank" rel="noopener noreferrer" className={nav}>
            <Bus size={15} /> Ônibus
          </a>
          {a.cliente_whatsapp && (
            <a href={`tel:+${a.cliente_whatsapp.replace(/\D/g, "")}`} className={nav}>
              <Phone size={15} /> Ligar
            </a>
          )}
          {googleCalLink(a, profissional.primeiro_nome) && (
            <a href={googleCalLink(a, profissional.primeiro_nome)!} target="_blank" rel="noopener noreferrer" className={nav}>
              <Calendar size={15} /> Meu calendário
            </a>
          )}
          <button onClick={copiar} className={nav}>
            <Copy size={15} /> {copiado ? "Copiado!" : "Copiar dados"}
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {a.status === "solicitado" && (
          <button onClick={() => onStatus(a.id, "confirmado")} disabled={busy}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50">
            <Check size={14} /> Confirmar
          </button>
        )}
        {a.status === "confirmado" && (
          <button onClick={() => onStatus(a.id, "concluido")} disabled={busy}
            className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-ink/90 disabled:opacity-50">
            <Check size={14} /> Concluir
          </button>
        )}
        {ativo && (
          <>
            <div className="relative">
              <button onClick={() => setMsgAberto((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs text-ink-soft transition-all hover:bg-gray-50 hover:text-ink">
                <MessageCircle size={14} /> Mensagens
              </button>
              {msgAberto && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMsgAberto(false)} />
                  <div className="absolute left-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-line bg-paper shadow-lg">
                    <p className="border-b border-line px-3 py-2 text-xs font-semibold text-ink-mute">
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
                        className="block border-b border-line px-3 py-2.5 text-left text-sm text-ink-soft transition-colors last:border-0 hover:bg-emerald-50 hover:text-ink">
                        {m.titulo}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button onClick={() => onPix(a)}
              className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs text-ink-soft transition-all hover:bg-gray-50 hover:text-ink">
              <Wallet size={14} /> Cobrar Pix
            </button>
            <button onClick={() => onPago(a)} disabled={busy}
              className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs text-ink-soft transition-all hover:bg-gray-50 hover:text-ink disabled:opacity-50">
              Marcar pago
            </button>
            <button onClick={() => onCancelar(a)} disabled={busy}
              className="px-3 py-2 text-xs text-ink-mute hover:text-red-600 disabled:opacity-50">
              <X size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Secao({ titulo, n, vazio, destaque, children }: { titulo: string; n: number; vazio: string; destaque?: boolean; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-serif text-2xl font-semibold text-ink">{titulo}</h2>
        {n > 0 && (
          <span className={`grid h-6 min-w-6 place-items-center rounded-full px-2 text-xs font-semibold text-white ${destaque ? "bg-amber-500" : "bg-emerald-600"}`}>{n}</span>
        )}
      </div>
      {n === 0 ? vazio && <p className="text-sm text-ink-mute">{vazio}</p> : <div className="grid gap-4 sm:grid-cols-2">{children}</div>}
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

  const load = useCallback(async () => {
    const [ag, pg, prof] = await Promise.all([
      supabase.from("agendamentos").select("*").order("created_at", { ascending: false }),
      supabase.from("pagamentos").select("valor, pago_em, status, agendamento_id"),
      supabase.from("profissionais").select("*").single(),
    ]);
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

  const render = (a: Agendamento) => profissional && (
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
    <>
      {aviso && (
        <div className="mb-4">
          <p className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white">{aviso}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-paper px-5 py-3">
          <span className="text-xs text-ink-mute">Ganhei este mês</span>
          <p className="font-serif text-2xl font-semibold text-ink">{fmtR$(ganho)}</p>
          <p className="text-xs text-ink-mute">
            {nPagos} pago(s)
            {ganhoAnterior > 0 && (
              <span className={ganho >= ganhoAnterior ? "text-emerald-600" : "text-amber-600"}>
                {" "}· {ganho >= ganhoAnterior ? "▲" : "▼"} vs {fmtR$(ganhoAnterior)} mês passado
              </span>
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-paper px-5 py-3">
          <span className="text-xs text-ink-mute">A receber</span>
          <p className={`font-serif text-2xl font-semibold ${aReceber > 0 ? "text-amber-600" : "text-ink"}`}>
            {fmtR$(aReceber)}
          </p>
          <p className="text-xs text-ink-mute">
            {nAReceber > 0 ? `${nAReceber} serviço(s) concluído(s) sem pagamento` : "Tudo em dia ✔"}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-paper px-5 py-3">
          <span className="text-xs text-ink-mute">Próximos 7 dias</span>
          <p className="font-serif text-2xl font-semibold text-ink">{fmtR$(semanaValor)}</p>
          <p className="text-xs text-ink-mute">{semanaN} serviço(s) confirmado(s)</p>
        </div>
        {rota ? (
          <a href={rota} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-ink/90">
            <MapPin size={17} /> Rota de hoje
          </a>
        ) : (
          <div className="grid place-items-center rounded-2xl border border-line bg-paper px-5 py-3 text-sm text-ink-mute">
            Sem rota hoje
          </div>
        )}
      </div>

      <div className="mt-8 space-y-10">
        {loading ? (
          <p className="text-sm text-ink-mute">Carregando agenda…</p>
        ) : (
          <>
            <Secao titulo="Novas solicitações" n={solicitacoes.length} vazio="Nenhuma solicitação nova.">
              {solicitacoes.map(render)}
            </Secao>
            <Secao titulo="Para amanhã — lembrar" n={amanha.length} vazio="" destaque>
              {amanha.map(render)}
            </Secao>
            <Secao titulo="Agendados" n={agendados.length} vazio="Nada mais confirmado.">
              {agendados.map(render)}
            </Secao>
            {outros.length > 0 && (
              <Secao titulo="Histórico" n={outros.length} vazio="">
                {outros.map(render)}
              </Secao>
            )}
          </>
        )}
      </div>

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

      {confirmacao && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-5" onClick={() => setConfirmacao(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-6" onClick={(e) => e.stopPropagation()}>
            <p className="font-serif text-lg font-semibold text-ink">
              {confirmacao.tipo === "pago" ? "Marcar como pago?" : "Cancelar este agendamento?"}
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              {confirmacao.a.cliente_nome} · {fmtR$(confirmacao.a.valor)}
              {confirmacao.tipo === "pago"
                ? " — registra o pagamento na sua conta do mês."
                : " — ele sai da agenda."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmacao(null)}
                className="rounded-xl px-4 py-2 text-sm text-ink-soft transition-all hover:bg-gray-100 hover:text-ink">Voltar</button>
              <button onClick={executarConfirmacao}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all ${
                  confirmacao.tipo === "pago" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                }`}>
                {confirmacao.tipo === "pago" ? "Sim, marcar pago" : "Sim, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}