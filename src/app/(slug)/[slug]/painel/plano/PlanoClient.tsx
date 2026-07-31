"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, X, CheckCircle2, Lock } from "lucide-react";
import { PLANOS, PLANOS_ORDER, formatarBRL, type PlanoId } from "@/lib/planos";

type PedidoInfo = {
  pagamento_id: number;
  valor: number;
  valor_formatado: string;
  pix_copia_e_cola: string;
  plano_nome: string;
  frequencia: string;
  instrucoes: string;
};

const BENEFICIOS: Record<string, string[]> = {
  profissional: [
    "Agendamentos ilimitados",
    "Google Calendar sincronizado",
    "Instagram e Facebook DM com IA",
    "AI Agent (500 mensagens/mês)",
    "Domínio próprio sem marca AN.BR",
  ],
  ia_premium: [
    "Tudo do Profissional",
    "AI Agent (2.000 mensagens/mês)",
    "WhatsApp API (em breve)",
    "Calendário bidirecional",
    "Suporte prioritário",
  ],
};

export function PlanoClient({
  slug,
  profissionalId,
  plano,
  expiraEm,
}: {
  slug: string;
  profissionalId: string;
  plano: string;
  expiraEm: string | null;
}) {
  const [selecionado, setSelecionado] = useState<PlanoId>("profissional");
  const [frequencia, setFrequencia] = useState<"mensal" | "anual">("mensal");
  const [pedido, setPedido] = useState<PedidoInfo | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);

  const planoAtivo = PLANOS[(plano as PlanoId) in PLANOS ? (plano as PlanoId) : "gratis"];
  const expirado = expiraEm ? new Date(expiraEm).getTime() <= Date.now() : false;
  const ativo = plano !== "gratis" && !expirado;

  function precoAnual(mensal: number) {
    return Math.round(mensal * 12 * 0.8);
  }

  async function gerarPedido() {
    setErro("");
    setCarregando(true);
    try {
      const res = await fetch("/api/planos/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano: selecionado, frequencia }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Erro ao gerar o pedido");
        return;
      }
      setPedido(data);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  async function copiar() {
    if (!pedido) return;
    try {
      await navigator.clipboard.writeText(pedido.pix_copia_e_cola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {}
  }

  const precoExibido = (p: PlanoId) => {
    const mensal = PLANOS[p].precoMensal;
    if (mensal === 0) return "R$ 0";
    return frequencia === "anual"
      ? `${formatarBRL(Math.round(mensal * 0.8))}/mês`
      : `${formatarBRL(mensal)}/mês`;
  };

  return (
    <main className="min-w-0 flex-1 p-6 lg:p-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight">Meu Plano</h1>

        <div className={`mt-4 flex items-center justify-between rounded-2xl border p-5 ${
          ativo ? "border-teal-200 bg-teal-50" : "border-line bg-white"
        }`}>
          <div>
            <p className="text-sm text-ink-soft">Plano atual</p>
            <p className="mt-0.5 text-xl font-bold">
              {ativo ? planoAtivo.nome : "Grátis"}
            </p>
            {ativo && expiraEm && (
              <p className="mt-1 text-xs text-ink-soft">
                Válido até {new Date(expiraEm).toLocaleDateString("pt-BR")}
                {expirado ? " (expirado)" : ""}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            ativo ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500"
          }`}>
            {ativo ? <CheckCircle2 size={14} /> : <Lock size={14} />}
            {ativo ? "Ativo" : "Grátis"}
          </span>
        </div>

        {erro && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="mt-6 flex items-center gap-2">
          <span className="text-sm font-medium text-ink-soft">Frequência:</span>
          <div className="inline-flex rounded-xl border border-line bg-white p-1">
            {(["mensal", "anual"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFrequencia(f)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  frequencia === f ? "bg-teal-600 text-white" : "text-ink-soft hover:text-ink"
                }`}
              >
                {f === "mensal" ? "Mensal" : "Anual"}
                {f === "anual" && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    frequencia === f ? "bg-white/20 text-white" : "bg-teal-100 text-teal-700"
                  }`}>
                    -20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {PLANOS_ORDER.filter((p) => p !== "gratis").map((pid) => {
            const info = PLANOS[pid];
            const ehAtual = ativo && plano === pid;
            return (
              <button
                key={pid}
                onClick={() => setSelecionado(pid)}
                className={`relative rounded-2xl border-2 p-5 text-left transition-all ${
                  selecionado === pid
                    ? "border-teal-600 bg-teal-50/60 shadow-sm"
                    : "border-line bg-white hover:border-teal-200"
                }`}
              >
                {pid === "profissional" && (
                  <span className="absolute -top-2.5 left-4 rounded-full bg-teal-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Mais popular
                  </span>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{info.nome}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">{info.desc}</p>
                  </div>
                  {ehAtual && (
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                      Seu plano
                    </span>
                  )}
                </div>
                <p className="mt-3 text-2xl font-bold">
                  {precoExibido(pid)}
                  {info.precoMensal > 0 && <span className="text-sm font-normal text-ink-soft"> +</span>}
                </p>
                {info.precoMensal > 0 && frequencia === "anual" && (
                  <p className="mt-0.5 text-xs text-ink-soft">
                    ou {formatarBRL(precoAnual(info.precoMensal))} por ano
                  </p>
                )}
                <ul className="mt-3 space-y-1.5">
                  {BENEFICIOS[pid].map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-ink-soft">
                      <Check size={14} className="mt-0.5 shrink-0 text-teal-600" />
                      {b}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-line bg-white p-5">
          <div>
            <p className="text-sm text-ink-soft">
              {PLANOS[selecionado].nome} · {frequencia === "anual" ? "Anual" : "Mensal"}
            </p>
            <p className="mt-0.5 text-xl font-bold">
              {frequencia === "anual"
                ? formatarBRL(precoAnual(PLANOS[selecionado].precoMensal))
                : formatarBRL(PLANOS[selecionado].precoMensal)}
              <span className="text-sm font-normal text-ink-soft">
                {frequencia === "anual" ? "/ano" : "/mês"}
              </span>
            </p>
          </div>
          <button
            onClick={gerarPedido}
            disabled={carregando}
            className="btn-primary"
          >
            {carregando ? "Gerando..." : "Assinar com Pix"}
          </button>
        </div>

        <p className="mt-4 text-xs text-ink-mute">
          Pagamento via Pix manual: você paga e nossa equipe ativa o plano em até 1 dia útil.
          Suporte:{" "}
          <a
            href={`/${slug}/painel`}
            className="font-medium text-teal-600 hover:underline"
          >
            fale conosco pelo painel
          </a>
          .
        </p>
      </div>

      {pedido && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-6 text-center">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-ink">Pix {pedido.plano_nome}</h3>
              <button onClick={() => setPedido(null)} className="text-ink-mute hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <p className="mb-1 text-sm text-ink-soft">Valor</p>
            <p className="mb-4 font-serif text-3xl font-semibold text-ink">
              {pedido.valor_formatado}
              <span className="text-sm font-normal text-ink-soft">
                {pedido.frequencia === "anual" ? "/ano" : "/mês"}
              </span>
            </p>
            <div className="mx-auto w-fit rounded-2xl border border-line bg-white p-3">
              <QRCodeSVG value={pedido.pix_copia_e_cola} size={188} level="M" />
            </div>
            <p className="mt-4 break-all rounded-xl bg-ivory px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
              {pedido.pix_copia_e_cola}
            </p>
            <button
              onClick={copiar}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-700 ${copiado ? "!bg-teal-700" : ""}`}
            >
              {copiado ? <Check size={16} /> : <Copy size={16} />}
              {copiado ? "Copiado!" : "Copiar Pix Copia e Cola"}
            </button>
            <p className="mt-3 text-xs text-ink-mute">{pedido.instrucoes}</p>
          </div>
        </div>
      )}
    </main>
  );
}
