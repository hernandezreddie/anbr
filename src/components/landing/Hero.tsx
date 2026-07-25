"use client";

import type { ProfissionalConfig } from "@/types";

export function Hero({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;
  const primary = configuracao.cor_primaria;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-paper to-[var(--color-bg)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(5,150,105,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(5,150,105,0.05),transparent_50%)]" />
      <div className="container-x relative py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {configuracao.logo_url && (
            <div className="mb-8 animate-fade-in">
              <img
                src={configuracao.logo_url}
                alt={profissional.nome}
                className="mx-auto h-20 w-20 rounded-2xl object-contain shadow-lg"
              />
            </div>
          )}
          <div
            className="mb-6 inline-block animate-fade-in-up rounded-full px-4 py-1.5 text-sm font-medium"
            style={{ backgroundColor: primary + "15", color: primary }}
          >
            {profissional.cidade}
          </div>
          <h1
            className="mb-6 animate-fade-in-up delay-100 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            style={{ fontFamily: configuracao.fonte_titulo }}
          >
            {profissional.slogan || `${profissional.primeiro_nome} — Profissional de confiança`}
          </h1>
          <p className="mb-10 animate-fade-in-up delay-200 text-lg text-ink-soft md:text-xl leading-relaxed max-w-2xl mx-auto">
            Agende seu serviço com {profissional.primeiro_nome}. Orçamento em segundos, pagamento via Pix, sem taxa de aplicativo.
          </p>
          <div className="flex animate-fade-in-up delay-300 flex-wrap items-center justify-center gap-4">
            <a
              href={`/${profissional.slug}/reservar`}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: primary }}
            >
              Fazer orçamento
              <span aria-hidden="true">→</span>
            </a>
            <a
              href={`https://wa.me/${profissional.whatsapp}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-paper px-8 py-4 text-lg font-semibold text-ink transition-all hover:bg-gray-50 hover:border-ink/30"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
