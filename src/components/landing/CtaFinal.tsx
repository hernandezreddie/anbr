"use client";

import { ArrowRight } from "lucide-react";
import { getCopyPadrao, preencherCopy } from "@/lib/copys-padrao";
import type { ProfissionalConfig } from "@/types";

export function CtaFinal({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;
  const primary = configuracao.cor_primaria;

  const copy = getCopyPadrao(profissional.categoria);
  const preencher = (texto: string) =>
    preencherCopy(texto, {
      nome: profissional.primeiro_nome,
      cidade: profissional.cidade,
    });

  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: primary + "08" }} />
      <div className="container-x text-center">
        <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-[2.6rem]">
          {copy.cta_titulo}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-ink-soft">
          {preencher(copy.cta_sub)}
        </p>
        <a
          href={`/${profissional.slug}/reservar`}
          className="mt-10 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          style={{ backgroundColor: primary }}
        >
          {copy.cta_btn}
          <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}
