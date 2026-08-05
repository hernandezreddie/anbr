"use client";

export default function PainelError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-2xl font-semibold text-ink">Erro no painel</p>
      <p className="mt-2 text-sm text-ink-soft">Não foi possível carregar o painel.</p>
      <button type="button" onClick={reset} className="btn-primary mt-6 px-5 py-2.5 text-sm font-semibold">
        Tentar novamente
      </button>
    </div>
  );
}
