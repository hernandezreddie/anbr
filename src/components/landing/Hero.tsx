"use client";

import type { ProfissionalConfig } from "@/types";

export function Hero({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;
  const primary = configuracao.cor_primaria;
  const headingFont = configuracao.fonte_titulo;

  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="container-x py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            className="mb-6 text-4xl leading-tight md:text-5xl lg:text-6xl"
            style={{ fontFamily: headingFont }}
          >
            {profissional.slogan || `Limpeza profissional em ${profissional.cidade}`}
          </h1>
          <p className="mb-8 text-lg text-ink-soft md:text-xl">
            Agende seu serviço com {profissional.primeiro_nome} — orçamento em segundos, pagamento via Pix, sem taxa de aplicativo.
          </p>
          <a
            href={`/${profissional.slug}/reservar`}
            className="btn-emerald inline-flex items-center gap-2 px-8 py-4 text-lg"
            style={{ backgroundColor: primary }}
          >
            Fazer orçamento
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
