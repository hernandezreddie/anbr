"use client";

import { useState } from "react";
import { ArrowRight, CalendarCheck, Clock } from "lucide-react";
import { getCopyEfetivo } from "@/lib/copys-padrao";
import { accento } from "@/lib/cores";
import type { ProfissionalConfig } from "@/types";

export function Servicos({ config }: { config: ProfissionalConfig }) {
  const { profissional, servicos, configuracao } = config;
  const primary = configuracao.cor_primaria;
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const copy = getCopyEfetivo(
    profissional.categoria,
    (configuracao as any).copy_variante,
    (configuracao as any).textos_personalizados
  );

  return (
    <section id="servicos" className="relative py-16 sm:py-20">
      <div className="container-x">
        <div className="flex flex-col items-end justify-between gap-6 sm:flex-row">
          <div className="max-w-xl">
            <p className="eyebrow mb-4" style={{ color: accento(primary) }}>Serviços</p>
            <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-[2.6rem]">
              {copy.servicos_titulo}
            </h2>
            <p className="mt-3 text-ink-soft">{copy.servicos_sub}</p>
          </div>
          <a
            href={`/${profissional.slug}/reservar`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-7 py-3.5 text-base font-semibold text-[var(--color-primary-ink)] shadow-md shadow-[var(--color-primary)]/20 transition-all duration-150 hover:brightness-110 hover:shadow-lg active:scale-[0.97]"
            style={{ backgroundColor: primary }}
          >
            Ver preços
            <ArrowRight size={18} />
          </a>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.map((s, i) => (
            <a
              key={s.id}
              href={`/${profissional.slug}/reservar?servico=${encodeURIComponent(s.id)}`}
              className={`group block rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-paper)] shadow-[var(--shadow-md)] transition-all duration-300 ${activeIdx === i ? "ring-2" : ""}`}
              style={activeIdx === i ? { borderColor: primary + "40", boxShadow: `0 0 0 2px ${primary}30` } : { borderColor: "var(--color-line)" }}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
            >
              <div className="flex h-full flex-col p-8">
                <div className="flex items-start justify-between">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl transition-colors group-hover:text-white"
                    style={{ backgroundColor: primary + "15", color: accento(primary) }}
                  >
                    <CalendarCheck size={24} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accento(primary) }}>
                    {s.tipo_preco === "fixo" ? "Fixo" : "Por hora"}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold text-ink">{s.nome}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{s.descricao}</p>
                <div className="mt-auto pt-4 flex flex-col gap-1.5">
                  {s.tipo_preco === "fixo" ? (
                    <span className="text-sm font-semibold" style={{ color: accento(primary) }}>R$ {s.preco_fixo?.toFixed(2).replace(".", ",")}</span>
                  ) : (
                    <>
                      <span className="text-sm font-semibold" style={{ color: accento(primary) }}>R$ {s.valor_hora.toFixed(2).replace(".", ",")}/h</span>
                      <span className="text-xs text-ink-soft flex items-center gap-1"><Clock size={12} />Mínimo {s.horas_minimas}h</span>
                    </>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}