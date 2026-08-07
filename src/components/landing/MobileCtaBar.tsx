"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { linkWhatsApp } from "@/lib/whatsapp";
import { getCopyEfetivo, preencherCopy } from "@/lib/copys-padrao";
import type { ProfissionalConfig } from "@/types";

export function MobileCtaBar({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;
  const [mostrar, setMostrar] = useState(false);

  const copy = getCopyEfetivo(
    profissional.categoria,
    (configuracao as any).copy_variante,
    (configuracao as any).textos_personalizados
  );
  const msg = preencherCopy(copy.whatsapp_msg, { nome: profissional.primeiro_nome });

  useEffect(() => {
    const onScroll = () => setMostrar(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {mostrar && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-[var(--color-paper)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        >
          <div className="flex items-center gap-2 p-3">
            <a
              href={`/${profissional.slug}/reservar`}
              className="flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold text-[var(--color-primary-ink)] shadow-lg transition-all active:scale-[0.97]"
              style={{ backgroundColor: configuracao.cor_primaria }}
            >
              {copy.hero_cta1 || "Agendar agora"}
              <ArrowRight size={16} />
            </a>
            <a
              href={linkWhatsApp(msg, profissional.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar no WhatsApp"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform active:scale-95"
            >
              <MessageCircle size={20} />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
