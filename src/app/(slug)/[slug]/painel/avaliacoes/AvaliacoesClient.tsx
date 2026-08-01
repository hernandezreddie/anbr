"use client";

import { useState } from "react";
import { Star, Send, RefreshCw, Check, X, MessageCircle } from "lucide-react";
import { Toast } from "@/components/ui/Toast";

type Avaliacao = {
  id: string;
  cliente_nome: string;
  nota: number;
  texto: string;
  aprovada: boolean;
  created_at: string | null;
};

type ConvitePendente = {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  data: string | null;
};

const fmtData = (d: string | null) => {
  if (!d) return "—";
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
};

export function AvaliacoesClient({
  slug,
  avaliacoes: iniciais,
  convitesPendentes: pendentesIniciais,
}: {
  slug: string;
  avaliacoes: Avaliacao[];
  convitesPendentes: ConvitePendente[];
}) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>(iniciais);
  const [pendentes, setPendentes] = useState<ConvitePendente[]>(pendentesIniciais);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const mostrar = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  async function moderar(id: string, aprovada: boolean) {
    setBusy(id);
    try {
      const res = await fetch("/api/avaliacoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, aprovada }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setAvaliacoes((prev) => prev.map((a) => (a.id === id ? { ...a, aprovada } : a)));
      mostrar(aprovada ? "Avaliação publicada" : "Avaliação ocultada");
    } catch {
      mostrar("Não foi possível atualizar");
    } finally {
      setBusy(null);
    }
  }

  async function enviarConvite(id: string) {
    setBusy("convite-" + id);
    try {
      const res = await fetch("/api/avaliacoes/convites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agendamento_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setPendentes((prev) => prev.filter((p) => p.id !== id));
      mostrar("Convite enviado");
    } catch {
      mostrar("Não foi possível enviar o convite");
    } finally {
      setBusy(null);
    }
  }

  const aprovadas = avaliacoes.filter((a) => a.aprovada).length;
  const pendentesModeracao = avaliacoes.filter((a) => !a.aprovada).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Avaliações</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            {aprovadas} publicada(s) · {pendentesModeracao} aguardando aprovação
          </p>
        </div>
        <a
          href={`/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 shadow-sm transition-all hover:border-teal-500 hover:text-teal-700"
        >
          <RefreshCw size={14} />
          Ver minha página
        </a>
      </div>

      {pendentes.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-amber-800">
            <Send size={15} />
            Convites de avaliação pendentes
          </h2>
          <p className="mt-1 text-xs text-amber-700">
            Estes clientes concluíram o serviço mas ainda não receberam o convite (a mensagem sai automaticamente quando o WhatsApp estiver conectado, ou envie agora):
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {pendentes.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-800">{p.cliente_nome}</p>
                  <p className="text-xs text-neutral-500">
                    Atendido em {fmtData(p.data)} · {p.cliente_whatsapp}
                  </p>
                </div>
                <button
                  onClick={() => enviarConvite(p.id)}
                  disabled={busy === "convite-" + p.id}
                  className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-teal-700 disabled:opacity-50"
                >
                  <MessageCircle size={14} />
                  {busy === "convite-" + p.id ? "Enviando..." : "Enviar convite"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {avaliacoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 py-16 text-center">
          <Star size={36} className="text-neutral-300" />
          <p className="mt-3 text-sm font-medium text-neutral-400">Nenhuma avaliação ainda</p>
          <p className="mt-1 max-w-sm text-xs text-neutral-400">
            Quando um cliente concluir um serviço, ele recebe um link de avaliação no WhatsApp. As avaliações aparecem aqui para você aprovar.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {avaliacoes.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${
                a.aprovada ? "border-neutral-100" : "border-amber-200 bg-amber-50/40"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-neutral-900">{a.cliente_nome}</p>
                    {!a.aprovada && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        Pendente
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={13} className={n <= a.nota ? "text-yellow-400" : "text-neutral-200"} fill="currentColor" />
                    ))}
                    <span className="ml-2 text-xs text-neutral-400">
                      {fmtData(a.created_at?.slice(0, 10) || null)}
                    </span>
                  </div>
                  {a.texto && <p className="mt-2 text-sm leading-relaxed text-neutral-600">&ldquo;{a.texto}&rdquo;</p>}
                </div>
                <button
                  onClick={() => moderar(a.id, !a.aprovada)}
                  disabled={busy === a.id}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 ${
                    a.aprovada
                      ? "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
                      : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
                >
                  {a.aprovada ? (
                    <>
                      <X size={13} /> Ocultar
                    </>
                  ) : (
                    <>
                      <Check size={13} /> Publicar
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}
