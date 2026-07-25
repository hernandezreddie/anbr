"use client";

import type { ProfissionalConfig } from "@/types";

function formatPreco(valor: number) {
  return "R$ " + valor.toFixed(2).replace(".", ",");
}

function precoLabel(s: ProfissionalConfig["servicos"][number]) {
  if (s.tipo_preco === "fixo") {
    return formatPreco(s.preco_fixo) + (s.duracao_minutos ? ` · ${s.duracao_minutos}min` : "");
  }
    return `R$ ${s.valor_hora.toFixed(2).replace(".", ",")}/h · a partir de ${formatPreco(s.valor_hora * s.horas_minimas)}`;
  }

export function Servicos({ config }: { config: ProfissionalConfig }) {
  return (
    <section className="bg-ivory py-16">
      <div className="container-x">
        <h2 className="mb-10 text-center text-3xl font-semibold">Meus serviços</h2>
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
          {config.servicos.map((s) => (
            <div key={s.id} className="card p-6">
              <h3 className="mb-2 text-xl font-semibold">{s.nome}</h3>
              <p className="mb-4 text-ink-soft">{s.descricao}</p>
              <p className="text-lg font-semibold" style={{ color: config.configuracao.cor_primaria }}>
                {precoLabel(s)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
