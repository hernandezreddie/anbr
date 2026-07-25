"use client";

import type { ProfissionalConfig } from "@/types";

function precoLabel(s: ProfissionalConfig["servicos"][number]) {
  if (s.tipo_preco === "fixo") {
    const parts = [formatPreco(s.preco_fixo)];
    if (s.duracao_minutos) parts.push(`${s.duracao_minutos}min`);
    return parts.join(" · ");
  }
  return `${formatPreco(s.valor_hora)}/h · a partir de ${formatPreco(s.valor_hora * s.horas_minimas)}`;
}

function formatPreco(valor: number) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}

export function Servicos({ config }: { config: ProfissionalConfig }) {
  return (
    <section className="py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="animate-fade-in-up text-3xl font-bold tracking-tight">Meus serviços</h2>
          <p className="mt-3 animate-fade-in-up delay-100 text-lg text-ink-soft">
            Escolha o serviço ideal para você
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
          {config.servicos.map((s, i) => (
            <div
              key={s.id}
              className="group card relative overflow-hidden p-6 transition-all hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div
                className="absolute left-0 top-0 h-1 w-full transition-all group-hover:h-1.5"
                style={{ backgroundColor: config.configuracao.cor_primaria, opacity: 0.6 }}
              />
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold tracking-tight">{s.nome}</h3>
                  {s.descricao && (
                    <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{s.descricao}</p>
                  )}
                  <div className="mt-4 flex items-center gap-3">
                    <span
                      className="inline-flex items-center rounded-full px-3.5 py-1 text-sm font-semibold text-white"
                      style={{ backgroundColor: config.configuracao.cor_primaria }}
                    >
                      {precoLabel(s)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
