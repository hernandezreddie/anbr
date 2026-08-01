"use client";

import { useEffect, useState } from "react";
import { Cookie, ShieldCheck } from "lucide-react";
import Link from "next/link";

type ConsentOpt = "todos" | "essenciais";

const STORAGE_KEY = "anbr_consent";

function lerConsentimento(): ConsentOpt | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.opcao === "todos" || parsed.opcao === "essenciais" ? parsed.opcao : null;
  } catch {
    return null;
  }
}

export function ConsentBanner() {
  const [opcao, setOpcao] = useState<ConsentOpt | null>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const atual = lerConsentimento();
    if (!atual) {
      setVisivel(true);
    } else {
      setOpcao(atual);
    }
  }, []);

  const escolher = (nova: ConsentOpt) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ opcao: nova, data: new Date().toISOString() })
      );
    } catch {
      /* armazenamento indisponível */
    }
    setOpcao(nova);
    setVisivel(false);
  };

  if (!visivel) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de consentimento de dados"
      className="fixed inset-x-0 bottom-0 z-[70] p-4 sm:p-5"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-[var(--color-line)] bg-white/95 p-5 shadow-2xl shadow-black/10 backdrop-blur sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Cookie size={20} />
          </span>
          <div>
            <p className="font-semibold text-ink">Seus dados, sua escolha</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Usamos cookies e dados essenciais para o funcionamento da plataforma,
              de acordo com a LGPD (Lei 13.709/2018). Você pode aceitar todos ou
              apenas os essenciais. Consulte nossa{" "}
              <Link href="/privacidade" className="font-medium text-[var(--color-primary)] underline underline-offset-2">
                Política de Privacidade
              </Link>{" "}
              e os{" "}
              <Link href="/termos" className="font-medium text-[var(--color-primary)] underline underline-offset-2">
                Termos de Uso
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            onClick={() => escolher("essenciais")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-line)] px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-[var(--color-bg)]"
          >
            Somente essenciais
          </button>
          <button
            onClick={() => escolher("todos")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary-ink)] shadow-md transition-all hover:brightness-110"
          >
            <ShieldCheck size={16} />
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  );
}
