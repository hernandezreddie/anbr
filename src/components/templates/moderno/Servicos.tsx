"use client";

import type { ProfissionalConfig } from "@/types";

function formatPreco(valor: number) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}

function precoLabel(s: ProfissionalConfig["servicos"][number]) {
  if (s.tipo_preco === "fixo") {
    const parts = [formatPreco(s.preco_fixo)];
    if (s.duracao_minutos) parts.push(`${s.duracao_minutos}min`);
    return parts.join(" · ");
  }
  return `${formatPreco(s.valor_hora)}/h`;
}

export function Servicos({ config }: { config: ProfissionalConfig }) {
  const primary = config.configuracao.cor_primaria;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white to-violet-50 py-20">
      <div className="absolute right-0 top-0 -mr-40 -mt-40 h-80 w-80 animate-float rounded-full bg-violet-200/30 blur-3xl" style={{ animationDelay: "1s" }} />
      <div className="container-x relative">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 animate-fade-in-up inline-block rounded-full bg-violet-100 px-4 py-1 text-sm font-medium text-violet-700">
            Serviços
          </div>
          <h2 className="animate-fade-in-up delay-100 text-3xl font-bold tracking-tight">Meus serviços</h2>
          <p className="mt-3 animate-fade-in-up delay-200 text-lg text-ink-soft">
            Escolha o serviço ideal para você
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
          {config.servicos.map((s, i) => (
            <div
              key={s.id}
              className="group card relative overflow-hidden border-0 bg-white/80 p-6 shadow-md backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${(i + 1) * 150}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold tracking-tight">{s.nome}</h3>
                  {s.descricao && (
                    <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{s.descricao}</p>
                  )}
                  <div className="mt-4 flex items-center gap-3">
                    <span
                      className="inline-flex items-center rounded-full px-3.5 py-1 text-sm font-semibold text-white"
                      style={{ backgroundColor: primary }}
                    >
                      {precoLabel(s)}
                    </span>
                    {s.tipo_preco !== "fixo" && (
                      <span className="text-xs text-ink-soft">
                        mín. {s.horas_minimas}h
                      </span>
                    )}
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
