"use client";

import { Star } from "lucide-react";
import type { ProfissionalConfig } from "@/types";

const DEPOIMENTOS = [
  { nome: "Ana Paula M.", bairro: "Batel", texto: "Minha casa nunca esteve tão limpa. Caprichosa e super confiável — deixo as chaves sem preocupação." },
  { nome: "Roberto S.", bairro: "Água Verde", texto: "Contratei e minha casa ficou impecável, detalhe por detalhe. Recomendo de olhos fechados." },
  { nome: "Juliana T.", bairro: "Cabral", texto: "Melhor decisão sair dos aplicativos e chamar direto. Preço justo e sempre pontual." },
];

export function Depoimentos({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;
  const primary = configuracao.cor_primaria;

  return (
    <section className="relative py-12">
      <div className="container-x">
        <div className="grid gap-5 md:grid-cols-3">
          {DEPOIMENTOS.map((d, i) => (
            <figure key={d.nome} className="flex h-full flex-col pl-5" style={{ borderLeft: `2px solid ${primary}30` }}>
              <span className="mb-3 flex gap-0.5 text-yellow-500">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} size={15} fill="currentColor" />
                ))}
              </span>
              <blockquote className="flex-1 font-serif text-lg italic leading-relaxed text-ink">
                &ldquo;{d.texto}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-sm text-ink-mute">
                <b className="font-semibold text-ink">{d.nome}</b> · {d.bairro}, {profissional.cidade}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}