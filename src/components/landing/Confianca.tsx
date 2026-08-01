"use client";

import { Shield, Wallet, Heart } from "lucide-react";
import { getCopyPadrao, preencherCopy } from "@/lib/copys-padrao";
import { accento } from "@/lib/cores";
import type { ProfissionalConfig } from "@/types";

const ICONES = [Shield, Wallet, Heart];

export function Confianca({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;
  const primary = configuracao.cor_primaria;

  const copy = getCopyPadrao(profissional.categoria, (configuracao as any).copy_variante);
  const preencher = (texto: string) =>
    preencherCopy(texto, {
      nome: profissional.primeiro_nome,
      cidade: profissional.cidade,
    });

  return (
    <section className="relative py-20 sm:py-28">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4" style={{ color: accento(primary) }}>
            {preencher(copy.confianca_eyebrow)}
          </p>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-[2.6rem]">
            {preencher(copy.confianca_titulo)}
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
          {copy.confianca_hooks.map((h, i) => {
            const Icone = ICONES[i] ?? Shield;
            return (
              <div key={h.titulo} className="flex h-full flex-col bg-paper p-8">
                <span className="mb-6" style={{ color: accento(primary) }}>
                  <Icone size={24} />
                </span>
                <h3 className="font-serif text-xl font-semibold text-ink">{h.titulo}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{h.texto}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
