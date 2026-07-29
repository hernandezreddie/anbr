"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { linkWhatsApp } from "@/lib/whatsapp";
import type { ProfissionalConfig } from "@/types";

export function WhatsAppFloat({ config }: { config: ProfissionalConfig }) {
  const { profissional } = config;
  const reduce = useReducedMotion();

  return (
    <motion.a
      href={linkWhatsApp(`Olá ${profissional.primeiro_nome}! Gostaria de agendar um serviço. 😊`, profissional.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.4, ease: "easeOut" }}
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40" />
      <MessageCircle size={28} />
    </motion.a>
  );
}