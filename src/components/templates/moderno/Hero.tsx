"use client";

import { contrastante, accento } from "@/lib/cores";
import type { ProfissionalConfig } from "@/types";

export function Hero({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;
  const primary = configuracao.cor_primaria;
  const primaryInk = contrastante(primary);
  const accent = accento(primary);

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="container-x relative">
        <div className="mx-auto max-w-3xl text-center">
          {configuracao.logo_url && (
            <div className="mb-8 animate-fade-in">
              <img
                src={configuracao.logo_url}
                alt={profissional.nome}
                className="mx-auto h-20 w-20 rounded-2xl object-contain shadow-lg ring-2 ring-white"
              />
            </div>
          )}
          <div className="mb-6 animate-fade-in-up inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur-sm"
            style={{ borderColor: primary + "40", backgroundColor: primary + "15", color: accent }}>
            <span className="h-2 w-2 animate-pulse-dot rounded-full" style={{ backgroundColor: primary }} />
            {profissional.cidade}
          </div>
          <h1
            className="mb-6 animate-fade-in-up delay-100 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            style={{ fontFamily: configuracao.fonte_titulo }}
          >
            {profissional.slogan || `${profissional.primeiro_nome} — Profissional de confiança`}
          </h1>
          <p className="mb-10 animate-fade-in-up delay-200 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: "var(--color-ink-soft)" }}>
            Agende online com {profissional.primeiro_nome}. Orçamento em segundos, pagamento via Pix, sem complicação.
          </p>
          <div className="flex animate-fade-in-up delay-300 flex-wrap items-center justify-center gap-4">
            <a
              href={`/${profissional.slug}/reservar`}
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: primary, color: primaryInk }}
            >
              Quero agendar
              <span aria-hidden="true">→</span>
            </a>
            <a
              href={`https://wa.me/${profissional.whatsapp}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border px-8 py-4 text-lg font-semibold shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
              style={{ borderColor: primary + "40", backgroundColor: primary + "10", color: accent }}
            >
              Tirar dúvidas
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

