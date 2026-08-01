"use client";

import { ArrowRight } from "lucide-react";
import { getCopyPadrao, preencherCopy } from "@/lib/copys-padrao";
import { Button } from "@/components/ui/Button";
import type { ProfissionalConfig } from "@/types";

export function CtaFinal({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;
  const primary = configuracao.cor_primaria;

  const copy = getCopyPadrao(profissional.categoria, (configuracao as any).copy_variante);
  const preencher = (texto: string) =>
    preencherCopy(texto, {
      nome: profissional.primeiro_nome,
      cidade: profissional.cidade,
    });

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-ink via-ink/95 to-ink/80" />
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-[80px]" style={{ backgroundColor: primary + "30" }} />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-[80px]" style={{ backgroundColor: primary + "20" }} />
      <div className="container-x text-center">
        <h2 className="font-serif text-3xl font-semibold leading-tight text-white sm:text-[2.6rem]">
          {copy.cta_titulo}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-white/70">
          {preencher(copy.cta_sub)}
        </p>
        <div className="mt-10">
          <Button variant="primary" size="lg" className="cta-glow touch-manipulation" style={{ backgroundColor: primary }}>
            {copy.cta_btn}
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
}