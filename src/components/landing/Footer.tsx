"use client";

import type { ProfissionalConfig } from "@/types";
import { linkWhatsApp } from "@/lib/whatsapp";

export function Footer({ config }: { config: ProfissionalConfig }) {
  const { profissional } = config;

  return (
    <footer className="border-t border-line py-12">
      <div className="container-x">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-ink-soft">
            &copy; {new Date().getFullYear()} {profissional.nome}. Todos os direitos reservados.
          </p>
          <a
            href={linkWhatsApp(`Olá ${profissional.primeiro_nome}!`, profissional.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ink-soft underline-offset-2 hover:underline"
          >
            Fale comigo no WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
