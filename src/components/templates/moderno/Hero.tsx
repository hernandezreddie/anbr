"use client";

import type { ProfissionalConfig } from "@/types";

export default function Hero({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;
  const primary = configuracao.cor_primaria;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-violet-50 to-white">
      <div className="absolute -left-32 -top-32 h-96 w-96 animate-float rounded-full bg-violet-200/20 blur-3xl" style={{ animationDelay: "0s" }} />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-float rounded-full bg-purple-200/20 blur-3xl" style={{ animationDelay: "1.5s" }} />
      <div className="container-x relative py-24 md:py-32">
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
          <div className="mb-6 animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/60 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-violet-500" />
            {profissional.cidade}
          </div>
          <h1
            className="mb-6 animate-fade-in-up delay-100 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            style={{ fontFamily: configuracao.fonte_titulo }}
          >
            {profissional.slogan || `${profissional.primeiro_nome} — Profissional de confiança`}
          </h1>
          <p className="mb-10 animate-fade-in-up delay-200 text-lg text-gray-500 md:text-xl leading-relaxed max-w-2xl mx-auto">
            Agende online com {profissional.primeiro_nome}. Orçamento em segundos, pagamento via Pix, sem complicação.
          </p>
          <div className="flex animate-fade-in-up delay-300 flex-wrap items-center justify-center gap-4">
            <a
              href={`/${profissional.slug}/reservar`}
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: primary }}
            >
              Quero agendar
              <span aria-hidden="true">→</span>
            </a>
            <a
              href={`https://wa.me/${profissional.whatsapp}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-8 py-4 text-lg font-semibold text-gray-800 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
            >
              Tirar dúvidas
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
