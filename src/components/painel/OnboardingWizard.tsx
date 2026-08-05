"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, MessageCircle, Palette, ClipboardList, Calendar, X } from "lucide-react";

type Passo = {
  id: string;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  link: string;
  linkLabel: string;
  concluido: boolean;
};

export function OnboardingWizard({ slug, profissionalId }: { slug: string; profissionalId: string }) {
  const STORAGE_KEY = `anbr_onboarding_${profissionalId}`;
  const [visivel, setVisivel] = useState(false);
  const [passoAtual, setPassoAtual] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== "completo") {
      const current = saved ? parseInt(saved, 10) : 0;
      setPassoAtual(current);
      setVisivel(true);
    }
  }, [STORAGE_KEY]);

  const passos: Passo[] = [
    {
      id: "whatsapp",
      titulo: "Conecte seu WhatsApp",
      descricao: "O AI Agent precisa do WhatsApp para responder seus clientes 24h por dia. Conecte sua conta em 2 minutos.",
      icone: <MessageCircle size={20} />,
      link: `/${slug}/painel/agente`,
      linkLabel: "Configurar WhatsApp",
      concluido: false,
    },
    {
      id: "pagina",
      titulo: "Personalize sua página",
      descricao: "Escolha suas cores, faça upload do seu logo e defina o template. Sua página fica com a sua cara.",
      icone: <Palette size={20} />,
      link: `/${slug}/painel/perfil`,
      linkLabel: "Personalizar página",
      concluido: false,
    },
    {
      id: "servicos",
      titulo: "Cadastre seus serviços",
      descricao: "Informe o que você faz, seus preços e a duração de cada serviço. É o que seus clientes vão ver e agendar.",
      icone: <ClipboardList size={20} />,
      link: `/${slug}/painel/perfil`,
      linkLabel: "Cadastrar serviços",
      concluido: false,
    },
    {
      id: "google",
      titulo: "Conecte o Google Calendar",
      descricao: "Sincronize sua agenda do Google para evitar conflitos de horário. Seus compromissos pessoais aparecem bloqueados automaticamente.",
      icone: <Calendar size={20} />,
      link: `/${slug}/painel/agente`,
      linkLabel: "Conectar Google",
      concluido: false,
    },
  ];

  const fechar = () => {
    setVisivel(false);
  };

  const pular = () => {
    localStorage.setItem(STORAGE_KEY, "completo");
    setVisivel(false);
  };

  const avancar = () => {
    const next = passoAtual + 1;
    if (next >= passos.length) {
      localStorage.setItem(STORAGE_KEY, "completo");
      setVisivel(false);
    } else {
      setPassoAtual(next);
      localStorage.setItem(STORAGE_KEY, String(next));
    }
  };

  const passo = passos[passoAtual];

  if (!visivel || !passo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--color-primary)]/20 bg-white shadow-md"
      >
        <div className="absolute top-0 left-0 right-0 h-1">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-500"
            style={{ width: `${((passoAtual + 1) / passos.length) * 100}%` }}
          />
        </div>

        <button
          onClick={fechar}
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full text-ink-soft/40 hover:text-ink-soft hover:bg-[var(--color-bg)] transition-colors"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>

        <div className="p-6 pt-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              {passo.icone}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-primary)]">
                Passo {passoAtual + 1} de {passos.length}
              </p>
              <h3 className="text-lg font-semibold text-ink">{passo.titulo}</h3>
            </div>
          </div>

          <p className="text-sm text-ink-soft leading-relaxed">{passo.descricao}</p>

          <div className="mt-5 flex items-center gap-3">
            <Link
              href={passo.link}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
            >
              {passo.linkLabel}
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={avancar}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-white px-4 py-2.5 text-sm font-medium text-ink-soft transition-all hover:bg-[var(--color-bg)]"
            >
              <Check size={15} />
              Já fiz isso
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              {passos.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i <= passoAtual ? "bg-[var(--color-primary)]" : "bg-[var(--color-line)]"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={pular}
              className="text-xs font-medium text-ink-soft/50 hover:text-ink-soft transition-colors"
            >
              Pular tour
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
