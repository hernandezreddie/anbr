"use client";

import { ArrowRight } from "lucide-react";
import type { ProfissionalConfig } from "@/types";

export function CtaFinal({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;
  const primary = configuracao.cor_primaria;

  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: primary + "08" }} />
      <div className="container-x text-center">
        <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-[2.6rem]">
          Vamos conversar?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-ink-soft">
          Faça seu orçamento agora. Leva 1 minutinho e sua reserva já chega com todos os detalhes.
        </p>
        <a
          href={`/${profissional.slug}/reservar`}
          className="mt-10 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          style={{ backgroundColor: primary }}
        >
          Fazer orçamento
          <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}