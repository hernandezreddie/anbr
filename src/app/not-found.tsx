import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
        <Logo className="h-9 w-9" />
      </span>
      <p className="mt-6 text-5xl font-bold tracking-tight text-ink">404</p>
      <h1 className="mt-2 text-xl font-semibold text-ink">Página não encontrada</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-soft">
        O endereço pode estar errado ou a página foi movida. Vamos te levar de volta.
      </p>
      <Link
        href="/"
        className="btn-primary mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold shadow-lg shadow-[var(--color-primary)]/20"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
