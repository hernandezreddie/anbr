"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { linkWhatsApp } from "@/lib/whatsapp";
import { getCopyEfetivo, preencherCopy } from "@/lib/copys-padrao";
import { Badge } from "@/components/ui/Badge";
import type { ProfissionalConfig } from "@/types";

export function WhatsAppFloat({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  const copy = getCopyEfetivo(
    profissional.categoria,
    (configuracao as any).copy_variante,
    (configuracao as any).textos_personalizados
  );
  const msg = preencherCopy(copy.whatsapp_msg, { nome: profissional.primeiro_nome });

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > lastScroll && y > 120) {
          setVisible(false);
        } else if (y < lastScroll) {
          setVisible(true);
        }
        setLastScroll(y);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScroll]);

  return (
    <motion.a
      href={linkWhatsApp(msg, profissional.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
      animate={{ opacity: visible ? 1 : 0, scale: reduce ? 1 : 1 }}
      transition={{ delay: 1, duration: 0.4, ease: "easeOut" }}
      className="fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/30" />
      <MessageCircle size={22} />
      <Badge variant="promo" size="sm" className="absolute -top-1 -right-1">
        Chat
      </Badge>
    </motion.a>
  );
}