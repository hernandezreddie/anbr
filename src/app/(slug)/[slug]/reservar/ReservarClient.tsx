"use client";

import { useState, useMemo } from "react";
import type { ProfissionalConfig, Servico, Adicional, Frequencia } from "@/types";
import { estimar } from "@/lib/precos";
import { mensagemReserva, linkWhatsApp } from "@/lib/whatsapp";

const round05 = (n: number) => Math.round(n * 2) / 2;

export function ReservarClient({ config }: { config: ProfissionalConfig }) {
  const [servicoId, setServicoId] = useState<string>(config.servicos[0]?.id || "");
  const [quartos, setQuartos] = useState(0);
  const [banheiros, setBanheiros] = useState(0);
  const [adicionaisSel, setAdicionaisSel] = useState<string[]>([]);
  const [freqId, setFreqId] = useState<string>("pontual");
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");

  const servico = config.servicos.find((s) => s.id === servicoId);
  const frequencia = config.frequencias.find((f) => f.slug === freqId) || null;

  const horasBase = servico
    ? round05(servico.horas_base + quartos * 0.75 + banheiros * 0.75)
    : 0;

  const adicionaisFiltrados = config.adicionais.filter(
    (a) => !servicoId || a.servico_id === servicoId || a.servico_id === servicoId,
  );

  const orcamento = servico
    ? estimar({
        servico,
        horas_base: horasBase,
        adicionais: config.adicionais,
        adicionaisSelecionados: adicionaisSel,
        frequencia,
      })
    : null;

  const handleSubmit = () => {
    if (!orcamento || !nome) return;

    const msg = mensagemReserva(config.profissional.primeiro_nome, {
      nome,
      servico: orcamento.servico_nome,
      adicionais: adicionaisSel
        .map((id) => config.adicionais.find((a) => a.id === id)?.nome)
        .filter(Boolean) as string[],
      horas: orcamento.horas,
      endereco,
      frequencia: frequencia?.nome || "Pontual",
      total: orcamento.total,
    });

    window.open(linkWhatsApp(msg, config.profissional.whatsapp), "_blank");
  };

  return (
    <div className="container-x py-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <h1 className="text-3xl font-semibold">Faça seu orçamento</h1>

          <section>
            <h2 className="mb-4 text-lg font-medium">1. Tipo de serviço</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {config.servicos.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServicoId(s.id)}
                  className={`card p-4 text-left transition-all ${
                    servicoId === s.id
                      ? "border-emerald-600 ring-2 ring-emerald-600"
                      : ""
                  }`}
                >
                  <div className="font-medium">{s.nome}</div>
                  <div className="mt-1 text-sm text-ink-soft">{s.descricao}</div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-medium">2. Cômodos</h2>
            <div className="flex gap-8">
              <div>
                <label className="text-sm text-ink-soft">Quartos</label>
                <div className="mt-1 flex items-center gap-3">
                  <button
                    onClick={() => setQuartos(Math.max(0, quartos - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-medium">{quartos}</span>
                  <button
                    onClick={() => setQuartos(quartos + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-ink-soft">Banheiros</label>
                <div className="mt-1 flex items-center gap-3">
                  <button
                    onClick={() => setBanheiros(Math.max(0, banheiros - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-medium">{banheiros}</span>
                  <button
                    onClick={() => setBanheiros(banheiros + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-medium">3. Adicionais</h2>
            <div className="flex flex-wrap gap-2">
              {config.adicionais.map((a) => (
                <button
                  key={a.id}
                  onClick={() =>
                    setAdicionaisSel((prev) =>
                      prev.includes(a.id)
                        ? prev.filter((id) => id !== a.id)
                        : [...prev, a.id],
                    )
                  }
                  className={`rounded-full border px-4 py-2 text-sm transition-all ${
                    adicionaisSel.includes(a.id)
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-line text-ink-soft hover:border-ink"
                  }`}
                >
                  {a.nome}
                  {a.preco > 0 && (
                    <span className="ml-1">
                      +R$ {a.preco.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-medium">4. Frequência</h2>
            <div className="flex flex-wrap gap-2">
              {config.frequencias.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFreqId(f.slug)}
                  className={`rounded-full border px-4 py-2 text-sm transition-all ${
                    freqId === f.slug
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-line text-ink-soft hover:border-ink"
                  }`}
                >
                  {f.nome}
                  {f.desconto > 0 && (
                    <span className="ml-1 text-emerald-600">-{f.desconto}%</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-medium">5. Seus dados</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none transition-all focus:border-emerald-600"
              />
              <input
                type="text"
                placeholder="Seu endereço (opcional)"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none transition-all focus:border-emerald-600"
              />
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="card p-6">
            <h3 className="mb-4 text-lg font-semibold">Resumo</h3>
            {orcamento ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-soft">Serviço</span>
                  <span>{orcamento.servico_nome}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-soft">Duração</span>
                  <span>{orcamento.horas}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-soft">Valor base</span>
                  <span>R$ {orcamento.bruto.toFixed(2).replace(".", ",")}</span>
                </div>
                {orcamento.desconto > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Desconto fidelidade</span>
                    <span>-R$ {orcamento.desconto.toFixed(2).replace(".", ",")}</span>
                  </div>
                )}
                <hr className="border-line" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>R$ {orcamento.total.toFixed(2).replace(".", ",")}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!nome}
                  className="mt-4 w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Enviar orçamento via WhatsApp
                </button>
              </div>
            ) : (
              <p className="text-ink-soft">Selecione um serviço para ver o valor</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
