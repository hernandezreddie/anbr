export default function PainelLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]" aria-label="Carregando" />
        <p className="text-sm text-[var(--color-ink-soft)]">Carregando...</p>
      </div>
    </div>
  );
}
