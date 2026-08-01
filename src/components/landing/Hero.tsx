"use client";

import { Fragment, useCallback, useRef } from "react";
import { motion, useReducedMotion, type Easing } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { linkWhatsApp } from "@/lib/whatsapp";
import { getCopyPadrao, preencherCopy } from "@/lib/copys-padrao";
import { accento } from "@/lib/cores";
import { Button } from "@/components/ui/Button";
import type { ProfissionalConfig } from "@/types";

export function Hero({ config }: { config: ProfissionalConfig }) {
  const { profissional, configuracao } = config;
  const reduce = useReducedMotion();
  const primary = configuracao.cor_primaria;
  const heroRef = useRef<HTMLDivElement>(null);
  const temImagem = !!(configuracao.foto_fundo || configuracao.logo_url);
  const sombraTexto = temImagem ? { textShadow: "0 2px 18px rgba(0,0,0,0.30)" } : undefined;

  const copy = getCopyPadrao(profissional.categoria, (configuracao as any).copy_variante);
  const preencher = (texto: string) =>
    preencherCopy(texto, {
      nome: profissional.primeiro_nome,
      cidade: profissional.cidade,
    });

  const tituloLinha1 = preencher(copy.hero_titulo[0]).split(" ");
  const tituloLinha2 = preencher(copy.hero_titulo[1]).split(" ");

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
  };
  const ease: Easing = [0.22, 1, 0.36, 1];
  const word = {
    hidden: { opacity: 0, y: reduce ? 0 : "0.4em" },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
  };
  const fade = {
    hidden: { opacity: 0, y: reduce ? 0 : 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
  };

  const handleRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height) * 2;
    Object.assign(ripple.style, {
      position: "absolute",
      borderRadius: "50%",
      background: "rgba(255,255,255,0.25)",
      width: `${size}px`,
      height: `${size}px`,
      left: `${e.clientX - rect.left - size / 2}px`,
      top: `${e.clientY - rect.top - size / 2}px`,
      transform: "scale(0)",
      animation: "rippleEffect 500ms ease-out forwards",
      pointerEvents: "none",
    });
    btn.classList.add("ripple-container");
    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  }, []);

  return (
    <section ref={heroRef} className="relative overflow-hidden pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16">
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        {configuracao.foto_fundo ? (
          <>
            <img src={configuracao.foto_fundo} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[var(--color-bg)]/60" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--color-bg)]/80 to-transparent" />
          </>
        ) : configuracao.logo_url ? (
          <>
            <img src={configuracao.logo_url} alt="" fetchPriority="high" className="absolute right-0 top-0 h-full w-full object-cover object-[center_16%] sm:w-[54%] sm:object-[center_14%]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/30 via-[var(--color-bg)]/45 to-[var(--color-bg)]/75 sm:hidden" />
            <div className="absolute inset-0 hidden bg-gradient-to-r from-[var(--color-bg)] from-15% via-[var(--color-bg)]/60 to-transparent sm:block" />
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[var(--color-bg)] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
          </>
        ) : null}
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full" style={{ background: primary + "12", filter: "blur(50px)" }} />
      </div>

      <div className="container-x relative">
        <div className="mx-auto max-w-3xl text-center">
          {configuracao.logo_url && (
            <div className="mb-6 animate-fade-in">
              <img src={configuracao.logo_url} alt={profissional.nome} className="mx-auto h-16 w-16 rounded-2xl object-contain shadow-lg ring-2 ring-white" />
            </div>
          )}
          <div className="mb-4 animate-fade-in-up inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-sm font-medium shadow-sm backdrop-blur-sm" style={{ borderColor: primary + "40", backgroundColor: primary + "15", color: accento(primary) }}>
            <span className="h-2 w-2 animate-pulse-dot rounded-full" style={{ backgroundColor: primary }} />
            {profissional.cidade}
          </div>

          <motion.h1 variants={container} initial="hidden" animate="show" className="font-serif text-[2.2rem] font-bold leading-[1.04] tracking-tight text-ink sm:text-4xl md:text-5xl lg:text-6xl" style={sombraTexto}>
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
                  <motion.span variants={word} className={`inline-block ${w === copy.hero_destaque ? "italic" : ""}`} style={w === copy.hero_destaque ? { color: accento(primary) } : {}}>
                    {w}
                  </motion.span>{" "}
                </Fragment>
              ))}
            </span>
          </motion.h1>

          <motion.p variants={fade} initial="hidden" animate="show" className="mt-5 max-w-xl text-base md:text-lg leading-relaxed mx-auto text-ink-soft" style={sombraTexto}>
            {preencher(copy.hero_sub)}
          </motion.p>

          <motion.div variants={fade} initial="hidden" animate="show" transition={{ delay: 0.08 }} className="mt-8 flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center">
            <Button variant="primary" size="lg" className="cta-glow touch-manipulation ripple-container" onClick={handleRipple} style={{ backgroundColor: primary }}>
              {copy.hero_cta1}
              <ArrowRight size={18} />
            </Button>
            <Button variant="outline" size="lg" className="touch-manipulation">
              {copy.hero_cta2}
            </Button>
          </motion.div>

          <motion.div variants={fade} initial="hidden" animate="show" transition={{ delay: 0.18 }} className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5"><Check size={14} style={{ color: primary }} /><b className="font-semibold text-ink">Agendamento online 24h</b></span>
            <span className="hidden sm:inline h-4 w-px bg-line" />
            <span className="flex items-center gap-1.5"><Check size={14} style={{ color: primary }} /><b className="font-semibold text-ink">Confirmação no WhatsApp</b></span>
            <span className="hidden sm:inline h-4 w-px bg-line" />
            <span className="flex items-center gap-1.5"><Check size={14} style={{ color: primary }} /><b className="font-semibold text-ink">Pago via Pix</b></span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}