"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck } from "lucide-react";

type Stats = { profissionais: number; agendamentos: number };

const MIN_PROFISSIONAIS = 10;
const MIN_AGENDAMENTOS = 100;

export function AdocaoStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let ativo = true;
    fetch("/api/estatisticas")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Stats) => {
        if (ativo) setStats(d);
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, []);

  if (
    !stats ||
    stats.profissionais < MIN_PROFISSIONAIS ||
    stats.agendamentos < MIN_AGENDAMENTOS
  ) {
    return null;
  }

  const profExibido = Math.floor(stats.profissionais / 10) * 10;
  const agendExibido = Math.floor(stats.agendamentos / 100) * 100;

  return (
    <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center">
      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Users size={16} className="text-[var(--color-primary)]" />
        Mais de {profExibido} profissionais ativos
      </span>
      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
        <CalendarCheck size={16} className="text-[var(--color-primary)]" />
        Mais de {agendExibido} agendamentos realizados
      </span>
    </div>
  );
}
