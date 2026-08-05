"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Erro inesperado na aplicação", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-ink">Algo deu errado</h1>
      <p className="mt-2 max-w-md text-sm text-ink-soft">Tente novamente ou volte para a página inicial.</p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={reset} className="btn-primary px-5 py-2.5 text-sm font-semibold">
          Tentar novamente
        </button>
        <Link href="/" className="btn-secondary px-5 py-2.5 text-sm font-semibold">
          Início
        </Link>
      </div>
    </div>
  );
}
