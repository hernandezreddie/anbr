"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Check } from "lucide-react";

type ChatMsg = { de: "cliente" | "agente"; texto: string; digitando?: boolean };

const RESPOSTAS: Record<string, string> = {
  "Quanto custa o corte?":
    "R$ 75. Temos amanhã às 10h ou 15h — qual prefere? 😊",
  "Tem horário amanhã?":
    "Sim! Amanhã temos 09:30, 11:00 e 15:00 livres. Qual horário fica melhor pra você?",
  "Posso remarcar?":
    "Claro! Me diz o novo dia e horário que eu já confirmo com a profissional. 💛",
};

const CHIPS = Object.keys(RESPOSTAS);

const INICIO: ChatMsg[] = [
  { de: "cliente", texto: "Oi! Quanto custa um corte?" },
  { de: "agente", texto: "R$ 75. Temos amanhã às 10h ou 15h — qual prefere? 😊" },
];

export function ChatDemo() {
  const [aberto, setAberto] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>(INICIO);
  const [digitando, setDigitando] = useState(false);

  const perguntar = (q: string) => {
    if (digitando) return;
    setMsgs((m) => [...m, { de: "cliente", texto: q }]);
    setDigitando(true);
    setTimeout(() => {
      setDigitando(false);
      setMsgs((m) => [...m, { de: "agente", texto: RESPOSTAS[q] }]);
    }, 1100);
  };

  const abrir = () => {
    setAberto(true);
  };

  return (
    <>
      {/* Card flutuante (gatilho) */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        onClick={abrir}
        className="absolute -bottom-8 left-0 z-10 hidden w-72 cursor-pointer lg:block lg:-left-4 xl:-left-10"
      >
        <div className="group rounded-2xl border border-[var(--color-line)] bg-white/95 p-4 text-left shadow-2xl shadow-[var(--color-primary)]/8 backdrop-blur-md transition-all hover:shadow-[var(--color-primary)]/15">
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
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary)]/8 py-2 text-[11px] font-semibold text-[var(--color-primary)] opacity-0 transition-opacity group-hover:opacity-100">
            <Send size={12} /> Experimente você mesmo
          </div>
        </div>
      </motion.div>

      {/* Painel de chat interativo */}
      <AnimatePresence>
        {aberto && (
          <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/30 p-4 sm:items-center" onClick={() => setAberto(false)}>
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 px-4 py-3.5">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
                  <Bot size={18} />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full border-2 border-emerald-600 bg-emerald-300" /></span>
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">AI Agent · AN.BR</p>
                  <p className="text-[11px] text-white/80">Simulação — seu agente atenderia assim</p>
                </div>
                <button onClick={() => setAberto(false)} className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/15">
                  <X size={16} />
                </button>
              </div>

              {/* Mensagens */}
              <div className="max-h-80 flex-1 space-y-2.5 overflow-y-auto bg-[#e5ddd5] p-4">
                {msgs.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                      m.de === "cliente"
                        ? "ml-auto rounded-br-md bg-[#dcf8c6] text-neutral-800"
                        : "rounded-bl-md bg-white text-neutral-800"
                    }`}
                  >
                    {m.texto}
                  </motion.div>
                ))}
                {digitando && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" style={{ animationDelay: "300ms" }} />
                  </motion.div>
                )}
              </div>

              {/* Chips */}
              <div className="space-y-2 border-t border-neutral-100 bg-white p-3">
                <p className="text-[11px] font-semibold text-neutral-400">Pergunte ao agente:</p>
                <div className="flex flex-wrap gap-1.5">
                  {CHIPS.map((q) => (
                    <button
                      key={q}
                      onClick={() => perguntar(q)}
                      disabled={digitando}
                      className="flex items-center gap-1 rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/5 px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)]/12 disabled:opacity-50"
                    >
                      {q} <Send size={10} />
                    </button>
                  ))}
                </div>
                <p className="flex items-center gap-1 pt-1 text-[10px] text-neutral-400">
                  <Check size={11} className="text-emerald-500" /> Responde 24h · agenda, cobra e confirma sozinho
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
