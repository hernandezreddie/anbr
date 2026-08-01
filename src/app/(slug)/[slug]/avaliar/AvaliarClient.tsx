"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, CheckCircle2, ArrowLeft } from "lucide-react";

const NOTAS = [
  { valor: 1, label: "Péssimo" },
  { valor: 2, label: "Ruim" },
  { valor: 3, label: "Bom" },
  { valor: 4, label: "Ótimo" },
  { valor: 5, label: "Excelente" },
];

export function AvaliarClient({
  slug,
  token,
  nome,
  profissional,
  jaAvaliou,
}: {
  slug: string;
  token: string;
  nome: string;
  profissional: string;
  jaAvaliou: boolean;
}) {
  const [nota, setNota] = useState(0);
  const [hover, setHover] = useState(0);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function enviar() {
    if (nota < 1) {
      setErro("Escolha uma nota de 1 a 5 estrelas.");
      return;
    }
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nota, texto }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Não foi possível enviar. Tente de novo.");
        return;
      }
      setSucesso(true);
    } catch {
      setErro("Não foi possível enviar. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  if (sucesso || jaAvaliou) {
    return (
      <div className="w-full max-w-md rounded-3xl border border-line bg-paper p-8 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={28} />
        </span>
        <h1 className="mt-4 font-serif text-2xl font-semibold text-ink">
          {sucesso ? "Obrigado pela avaliação!" : "Você já avaliou"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {sucesso
            ? "Sua avaliação foi enviada e aparece na página de " + profissional + " assim que for aprovada."
            : "Este link já foi utilizado. Se quiser, pode deixar outro comentário pelo WhatsApp."}
        </p>
        <a
          href={`/${slug}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold text-ink transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary-accent)]"
        >
          <ArrowLeft size={16} />
          Voltar para a página
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-line bg-paper p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Avaliação</p>
        <span className="text-xs text-ink-mute">Sem cadastro necessário</span>
      </div>
      <h1 className="mt-2 font-serif text-2xl font-semibold text-ink">
        Como foi o serviço de {profissional}?
      </h1>
      <p className="mt-1 text-sm text-ink-soft">Obrigado por avaliar, {nome.split(" ")[0]}! Leva menos de 1 minuto.</p>

      <div className="mt-6">
        <div className="flex items-center justify-center gap-1.5">
          {NOTAS.map((n) => (
            <button
              key={n.valor}
              type="button"
              onMouseEnter={() => setHover(n.valor)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setNota(n.valor)}
              className="transition-transform hover:scale-110 active:scale-95"
              aria-label={`${n.valor} estrela(s)`}
            >
              <Star
                size={38}
                className={n.valor <= (hover || nota) ? "text-yellow-400" : "text-neutral-200"}
                fill="currentColor"
              />
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-sm font-medium text-ink-soft">
          {nota > 0 ? NOTAS[nota - 1].label : "Toque nas estrelas"}
        </p>
      </div>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={4}
        maxLength={500}
        placeholder="Conte como foi sua experiência (opcional)..."
        className="mt-6 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
      />

      {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={enviar}
        disabled={enviando}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 disabled:opacity-50"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {enviando ? "Enviando..." : "Enviar avaliação"}
      </motion.button>
      <a
        href={`/${slug}`}
        className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-ink-mute transition-colors hover:text-ink"
      >
        <ArrowLeft size={13} />
        Voltar para a página de {profissional}
      </a>
    </div>
  );
}
