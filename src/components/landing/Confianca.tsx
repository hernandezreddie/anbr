"use client";

import { Shield, Wallet, Heart } from "lucide-react";
import type { ProfissionalConfig } from "@/types";

const HOOKS = [
  {
    icon: Shield,
    titulo: "Você nunca abre a porta pra um estranho",
    texto: "A mesma profissional em todas as visitas. Nada de rostos diferentes a cada semana — só confiança que se constrói.",
  },
  {
    icon: Wallet,
    titulo: "Sem app no meio. Sem comissão no seu bolso.",
    texto: "Combinamos tudo pelo WhatsApp, sem a comissão de um aplicativo encarecendo o seu serviço.",
  },
  {
    icon: Heart,
    titulo: "Cuidado em cada detalhe",
    texto: "Uma reputação construída lar por lar, com nota 5,0 de quem já me conhece.",
  },
];

export function Confianca({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;
  const primary = configuracao.cor_primaria;

  return (
    <section className="relative py-20 sm:py-28">
      <div className="container-x">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4" style={{ color: primary }}>Por que escolher {profissional.primeiro_nome}</p>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-[2.6rem]">
            As famílias de {profissional.cidade} confiam — e recomendam.
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
          {HOOKS.map((h, i) => (
            <div key={h.titulo} className="flex h-full flex-col bg-paper p-8">
              <span className="mb-6" style={{ color: primary }}>
                <h.icon size={24} />
              </span>
              <h3 className="font-serif text-xl font-semibold text-ink">{h.titulo}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{h.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}