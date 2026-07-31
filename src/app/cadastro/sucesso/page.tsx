"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ArrowRight, ExternalLink } from "lucide-react";

function SucessoContent() {
  const params = useSearchParams();
  const slug = params.get("slug");
  const [origin, setOrigin] = useState("");

  useEffect(() => { setOrigin(window.location.origin); }, []);

  const link = slug && origin ? `${origin}/${slug}` : "";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="mx-auto max-w-lg text-center">

        {/* Success check */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)] shadow-xl shadow-[var(--color-primary)]/20">
          <Check size={40} className="text-white" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Sistema criado!
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          Seu sistema de agendamento já está no ar. Acesse agora para personalizar e começar a receber clientes.
        </p>

        {link && (
          <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-ink-soft mb-2">Seu link:</p>
            <a href={link} target="_blank"
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)]/10 px-5 py-3 text-lg font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)]/20">
              {link}
              <ExternalLink size={18} />
            </a>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a href={link ? `${link}/painel` : "#"}
            className="btn-primary gap-2 px-8 py-4 text-base shadow-lg shadow-[var(--color-primary)]/20">
            Ir para o painel
            <ArrowRight size={20} />
          </a>
          <a href="/"
            className="text-sm text-ink-soft underline-offset-2 hover:text-ink hover:underline transition-colors">
            Voltar para página inicial
          </a>
        </div>

      </div>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <Suspense>
      <SucessoContent />
    </Suspense>
  );
}
