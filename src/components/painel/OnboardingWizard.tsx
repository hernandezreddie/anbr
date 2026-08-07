"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Check, ArrowRight, MessageCircle, Palette, ClipboardList, Calendar, X, RefreshCw, CheckCircle2 } from "lucide-react";

type PassoId = "whatsapp" | "pagina" | "servicos" | "google";

type Passo = {
  id: PassoId;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  link: string;
  linkLabel: string;
  concluido: boolean;
};

const WHATSAPP_CONECTADO = ["connected", "open", "active"];

export function OnboardingWizard({ slug, profissionalId }: { slug: string; profissionalId: string }) {
  const STORAGE_KEY = `anbr_onboarding_${profissionalId}`;
  const [visivel, setVisivel] = useState(false);
  const [passoAtual, setPassoAtual] = useState(0);
  const [status, setStatus] = useState<Record<PassoId, boolean>>({
    whatsapp: false,
    pagina: false,
    servicos: false,
    google: false,
  });
  const [verificando, setVerificando] = useState(true);

  const verificarStatus = useCallback(async () => {
    setVerificando(true);
    const supabase = createClient();
    const novo: Record<PassoId, boolean> = { whatsapp: false, pagina: false, servicos: false, google: false };

    try {
      const r = await fetch(`/api/whatsapp/instance?profissional_id=${profissionalId}`);
      const j = await r.json();
      novo.whatsapp = j?.configured === true && WHATSAPP_CONECTADO.includes(j?.connection_status);
    } catch {}

    try {
      const { data } = await supabase.from("configuracoes").select("cor_primaria, logo_url").single();
      novo.pagina = !!data?.logo_url || (!!data?.cor_primaria && data.cor_primaria !== "#059669");
    } catch {}

    try {
      const { count } = await supabase
        .from("servicos")
        .select("id", { count: "exact", head: true })
        .eq("ativo", true);
      novo.servicos = (count || 0) > 0;
    } catch {}

    try {
      const { data } = await supabase.from("profissionais").select("calendar_email").single();
      novo.google = !!data?.calendar_email;
    } catch {}

    setStatus(novo);

    const todas = Object.values(novo).every(Boolean);
    if (todas) {
      localStorage.setItem(STORAGE_KEY, "completo");
      setVisivel(false);
    } else {
      // Embudo: avanza al primer paso que el profesional todavía no completó
      const ordem: PassoId[] = ["whatsapp", "pagina", "servicos", "google"];
      const primeiroIncompleto = ordem.findIndex((id) => !novo[id]);
      if (primeiroIncompleto >= 0) {
        setPassoAtual(primeiroIncompleto);
        localStorage.setItem(STORAGE_KEY, String(primeiroIncompleto));
      }
    }
    setVerificando(false);
  }, [STORAGE_KEY, profissionalId]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== "completo") {
      setVisivel(true);
      verificarStatus();
    }
  }, [STORAGE_KEY, verificarStatus]);

  const passos: Passo[] = [
    {
      id: "whatsapp",
      titulo: "Conecte seu WhatsApp",
      descricao: "O AI Agent precisa do WhatsApp para responder seus clientes 24h por dia. Conecte sua conta em 2 minutos.",
      icone: <MessageCircle size={20} />,
      link: `/${slug}/painel/agente`,
      linkLabel: "Configurar WhatsApp",
      concluido: status.whatsapp,
    },
    {
      id: "pagina",
      titulo: "Personalize sua página",
      descricao: "Escolha suas cores, faça upload do seu logo e defina o template. Sua página fica com a sua cara.",
      icone: <Palette size={20} />,
      link: `/${slug}/painel/perfil`,
      linkLabel: "Personalizar página",
      concluido: status.pagina,
    },
    {
      id: "servicos",
      titulo: "Cadastre seus serviços",
      descricao: "Informe o que você faz, seus preços e a duração de cada serviço. É o que seus clientes vão ver e agendar.",
      icone: <ClipboardList size={20} />,
      link: `/${slug}/painel/perfil`,
      linkLabel: "Cadastrar serviços",
      concluido: status.servicos,
    },
    {
      id: "google",
      titulo: "Conecte o Google Calendar",
      descricao: "Sincronize sua agenda do Google para evitar conflitos de horário. Seus compromissos pessoais aparecem bloqueados automaticamente.",
      icone: <Calendar size={20} />,
      link: `/${slug}/painel/agente`,
      linkLabel: "Conectar Google",
      concluido: status.google,
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
    let next = passoAtual + 1;
    while (next < passos.length && passos[next].concluido) next++;
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
            style={{ width: `${(passos.filter((p) => p.concluido).length / passos.length) * 100}%` }}
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
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                passo.concluido
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              }`}
            >
              {passo.concluido ? <CheckCircle2 size={20} /> : passo.icone}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-primary)]">
                Passo {passoAtual + 1} de {passos.length}
                {passo.concluido && (
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-emerald-700">
                    Concluído
                  </span>
                )}
              </p>
              <h3 className="text-lg font-semibold text-ink">{passo.titulo}</h3>
            </div>
          </div>

          <p className="text-sm text-ink-soft leading-relaxed">{passo.descricao}</p>

          {verificando ? (
            <div className="mt-5 flex items-center gap-2 text-sm text-ink-soft/60">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-[var(--color-primary)]" />
              Verificando sua configuração...
            </div>
          ) : passo.concluido ? (
            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                <CheckCircle2 size={16} />
                Já está tudo pronto
              </div>
              <button
                onClick={avancar}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
              >
                Continuar
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
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
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              {passos.map((p, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    p.concluido || i <= passoAtual
                      ? "bg-[var(--color-primary)]"
                      : "bg-[var(--color-line)]"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={verificarStatus}
                className="flex items-center gap-1 text-xs font-medium text-ink-soft/50 hover:text-ink-soft transition-colors"
              >
                <RefreshCw size={12} />
                Verificar novamente
              </button>
              <button
                onClick={pular}
                className="text-xs font-medium text-ink-soft/50 hover:text-ink-soft transition-colors"
              >
                Pular tour
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
