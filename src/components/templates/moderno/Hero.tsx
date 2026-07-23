"use client";

import type { ProfissionalConfig } from "@/types";

export default function Hero({ config }: { config: ProfissionalConfig }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white to-violet-50">
      <div className="container-x py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-block rounded-full bg-violet-100 px-4 py-1 text-sm font-medium text-violet-700">
            {config.profissional.cidade}
          </div>
          <h1
            className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            style={{ fontFamily: config.configuracao.fonte_titulo }}
          >
            {config.profissional.slogan}
          </h1>
          <p className="mb-8 text-lg text-gray-500 md:text-xl">
            Agende online com {config.profissional.primeiro_nome}. Orçamento em segundos, pagamento via Pix.
          </p>
          <a
            href={`/${config.profissional.slug}/reservar`}
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-violet-700 hover:shadow-xl"
          >
            Quero agendar
          </a>
        </div>
      </div>
    </section>
  );
}
