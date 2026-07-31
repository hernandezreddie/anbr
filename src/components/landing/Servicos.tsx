"use client";

import { ArrowRight, CalendarCheck } from "lucide-react";
import { getCopyPadrao } from "@/lib/copys-padrao";
import type { ProfissionalConfig } from "@/types";

export function Servicos({ config }: { config: ProfissionalConfig }) {
  const { profissional, servicos, configuracao } = config;
  const primary = configuracao.cor_primaria;

  const copy = getCopyPadrao(profissional.categoria);

  return (
    <section id="servicos" className="relative py-20 sm:py-28">
      <div className="container-x">
        <div className="flex flex-col items-end justify-between gap-6 sm:flex-row">
          <div className="max-w-xl">
            <p className="eyebrow mb-4" style={{ color: primary }}>Serviços</p>
            <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-[2.6rem]">
              {copy.servicos_titulo}
            </h2>
            <p className="mt-3 text-ink-soft">{copy.servicos_sub}</p>
          </div>
          <a href={`/${profissional.slug}/reservar`} className="btn-primary btn-lg shrink-0" style={{ backgroundColor: primary }}>
            Ver preços
            <ArrowRight size={18} />
          </a>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.map((s) => (
            <a
              key={s.id}
              href={`/${profissional.slug}/reservar`}
              className="group card flex h-full flex-col p-7 transition-all duration-300 hover:-translate-y-1"
              style={{ borderColor: "var(--color-line)" }}
            >
              <span
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors group-hover:text-white"
                style={{ backgroundColor: primary + "15", color: primary }}
              >
                <CalendarCheck size={24} />
              </span>
              <h3 className="font-serif text-xl font-semibold text-ink">{s.nome}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{s.descricao}</p>
              <span className="mt-auto pt-4 text-sm font-semibold uppercase tracking-wide" style={{ color: primary }}>
                {s.tipo_preco === "fixo"
                  ? `R$ ${s.preco_fixo?.toFixed(2).replace(".", ",")}`
                  : `a partir de ${s.horas_minimas}h · R$ ${(s.valor_hora).toFixed(2).replace(".", ",")}/h`}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
