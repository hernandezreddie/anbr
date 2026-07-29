"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { linkWhatsApp } from "@/lib/whatsapp";
import type { ProfissionalConfig } from "@/types";

export function Nav({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;

  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-b border-transparent bg-paper/80 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between">
        <a href={`/${profissional.slug}`} className="font-semibold text-ink">
          {configuracao.logo_url ? (
            <img src={configuracao.logo_url} alt={profissional.nome} className="h-8 w-auto" />
          ) : (
            <span className="text-lg font-semibold" style={{ fontFamily: configuracao.fonte_titulo }}>
              {profissional.primeiro_nome}
            </span>
          )}
        </a>
        <div className="flex items-center gap-4">
          <a href={`/${profissional.slug}/reservar`} className="btn-emerald btn-sm">
            Agendar
          </a>
        </div>
      </div>
    </nav>
  );
}