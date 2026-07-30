"use client";

import { Fragment } from "react";
import { motion, useReducedMotion, type Easing } from "framer-motion";
import { ArrowRight, Star, Check } from "lucide-react";
import { linkWhatsApp } from "@/lib/whatsapp";
import type { ProfissionalConfig } from "@/types";

export function Hero({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;
  const reduce = useReducedMotion();
  const primary = configuracao.cor_primaria;
  const nomeParts = profissional.primeiro_nome.split(" ");
  const primeiroNome = nomeParts[0];

  const tituloLinha1 = ["Sempre", "a", "mesma", "pessoa"];
  const tituloLinha2 = ["de", "confiança", "na", "sua", "casa."];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.055, delayChildren: 0.15 } },
  };
  const ease: Easing = [0.22, 1, 0.36, 1];
  const word = {
    hidden: { opacity: 0, y: reduce ? 0 : "0.5em" },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
  };
  const fade = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
  };

  return (
    <section className="relative overflow-hidden pb-16 pt-32 sm:pb-24 sm:pt-44">
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        {configuracao.logo_url && (
          <img
            src={configuracao.logo_url}
            alt=""
            fetchPriority="high"
            className="absolute right-0 top-0 h-full w-full object-cover object-[center_16%] sm:w-[54%] sm:object-[center_14%]"
          />
        )}
        {/* Mobile: gradient veil for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/30 via-[var(--color-bg)]/45 to-[var(--color-bg)]/75 sm:hidden" />
        {/* Desktop: soft lateral gradient (text left, image right) */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-[var(--color-bg)] from-15% via-[var(--color-bg)]/60 to-transparent sm:block" />
        {/* Top/bottom blends */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[var(--color-bg)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
        {/* Subtle primary glow */}
        <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full" style={{ background: primary + "15", filter: "blur(60px)" }} />
      </div>

      <div className="container-x relative">
        <div className="sm:max-w-[58%] lg:max-w-[56%]">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="eyebrow mb-6"
            style={{ color: primary }}
          >
            {profissional.cidade}
          </motion.p>

          <motion.h1
            variants={container}
            initial="hidden"
            animate="show"
            className="font-serif text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl md:text-7xl"
          >
            <span className="block">
              {tituloLinha1.map((w, i) => (
                <Fragment key={i}>
                  <motion.span variants={word} className="inline-block">{w}</motion.span>{" "}
                </Fragment>
              ))}
            </span>
            <span className="block">
              {tituloLinha2.map((w, i) => (
                <Fragment key={i}>
                  <motion.span
                    variants={word}
                    className={`inline-block ${w === "confiança" ? "italic" : ""}`}
                    style={w === "confiança" ? { color: primary } : {}}
                  >
                    {w}
                  </motion.span>{" "}
                </Fragment>
              ))}
            </span>
          </motion.h1>

          <motion.p
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft"
          >
            {profissional.slogan || `Sou ${profissional.primeiro_nome}. Cuido do seu lar com capricho e dedicação — direto com você, sem aplicativos no meio.`}
          </motion.p>

          <motion.div
            variants={fade}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
            className="mt-10 flex flex-col gap-3.5 sm:flex-row"
          >
            <a
              href={`/${profissional.slug}/reservar`}
              className="btn-emerald btn-lg"
              style={{ backgroundColor: primary }}
            >
              Ver meu preço em 1 minuto
              <ArrowRight size={18} />
            </a>
            <a
              href={linkWhatsApp(`Olá ${profissional.primeiro_nome}! Vi seu site e gostaria de agendar um serviço. 😊`, profissional.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost btn-lg"
            >
              Tirar dúvida no WhatsApp
            </a>
          </motion.div>

          <motion.div
            variants={fade}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2 }}
            className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-ink-soft"
          >
            <span className="flex items-center gap-1.5">
              <span className="flex text-yellow-500">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </span>
              <b className="font-semibold text-ink">5,0</b>
            </span>
            <span className="h-4 w-px bg-line" />
            <span><b className="font-semibold text-ink">+{profissional.cidade === "Curitiba" ? "200" : "50"}</b> clientes atendidos</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}