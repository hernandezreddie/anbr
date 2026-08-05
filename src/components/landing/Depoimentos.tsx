"use client";

import { Star } from "lucide-react";
import { getCopyEfetivo, preencherCopy, rotacionarDepoimentos } from "@/lib/copys-padrao";
import type { ProfissionalConfig } from "@/types";

export type AvaliacaoPublica = {
  cliente_nome: string;
  nota: number;
  texto: string;
  created_at?: string | null;
};

export function Depoimentos({
  config,
  avaliacoes = [],
}: {
  config: ProfissionalConfig;
  avaliacoes?: AvaliacaoPublica[];
}) {
  const { profissional, configuracao } = config;
  const primary = configuracao.cor_primaria;

  const copy = getCopyEfetivo(
    profissional.categoria,
    (configuracao as any).copy_variante,
    (configuracao as any).textos_personalizados
  );
  const preencher = (texto: string) =>
    preencherCopy(texto, {
      nome: profissional.primeiro_nome,
      cidade: profissional.cidade,
    });

  const pool = [...copy.depoimentos, ...(copy.depoimentos_extra ?? [])];
  const reais = avaliacoes.slice(0, 3);
  const padrao = rotacionarDepoimentos(pool, String(profissional.id ?? profissional.nome), 3)
    .slice(reais.length);

  const cards = [
    ...reais.map((a) => (
      <figure key={a.cliente_nome} className="flex h-full flex-col pl-5" style={{ borderLeft: `2px solid ${primary}30` }}>
        <span className="mb-3 flex gap-0.5 text-yellow-500">
          {[0, 1, 2, 3, 4].map((s) => (
            <Star key={s} size={15} className={s < a.nota ? "" : "text-neutral-200"} fill="currentColor" />
          ))}
        </span>
        <blockquote className="flex-1 font-serif text-lg italic leading-relaxed text-ink">
          &ldquo;{a.texto || "Serviço excelente, recomendo!"}&rdquo;
        </blockquote>
        <figcaption className="mt-4 text-sm text-ink-mute">
          <b className="font-semibold text-ink">{a.cliente_nome}</b> · Cliente verificado
        </figcaption>
      </figure>
    )),
    ...padrao.map((d) => (
      <figure key={d.nome} className="flex h-full flex-col pl-5" style={{ borderLeft: `2px solid ${primary}30` }}>
        <span className="mb-3 flex gap-0.5 text-yellow-500">
          {[0, 1, 2, 3, 4].map((s) => (
            <Star key={s} size={15} fill="currentColor" />
          ))}
        </span>
        <blockquote className="flex-1 font-serif text-lg italic leading-relaxed text-ink">
          &ldquo;{preencher(d.texto)}&rdquo;
        </blockquote>
        <figcaption className="mt-4 text-sm text-ink-mute">
          <b className="font-semibold text-ink">{d.nome}</b> · {d.bairro}, {profissional.cidade}
        </figcaption>
      </figure>
    )),
  ].slice(0, 3);

  return (
    <section className="relative py-12">
      <div className="container-x">
        <div className="grid gap-5 md:grid-cols-3">
          {cards}
        </div>
      </div>
    </section>
  );
}
