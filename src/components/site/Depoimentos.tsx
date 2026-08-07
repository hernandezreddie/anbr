"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Depoimento = {
  cliente_nome: string;
  nota: number;
  texto: string;
  created_at: string;
  profissionais: { nome: string; categoria?: string | null; cidade?: string | null } | { nome: string; categoria?: string | null; cidade?: string | null }[] | null;
};

export function Depoimentos() {
  const [deps, setDeps] = useState<Depoimento[] | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("avaliacoes")
          .select("cliente_nome, nota, texto, created_at, profissionais(nome, categoria, cidade)")
          .eq("aprovada", true)
          .order("created_at", { ascending: false })
          .limit(6);
        if (cancelado) return;
        const list = (data || []) as unknown as Depoimento[];
        const validos = list.filter((d) => d.texto && d.texto.trim().length > 10);
        setDeps(validos);
      } catch {
        if (!cancelado) setDeps([]);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  if (!deps || deps.length === 0) return null;

  const getProf = (d: Depoimento) => {
    const p = Array.isArray(d.profissionais) ? d.profissionais[0] : d.profissionais;
    if (!p?.nome) return "Profissional AN.BR";
    const extra = [p.categoria, p.cidade].filter(Boolean).join(" · ");
    return extra ? `${p.nome} · ${extra}` : p.nome;
  };

  const media = (deps.reduce((s, d) => s + d.nota, 0) / deps.length).toFixed(1).replace(".", ",");

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="container-x">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]/60">
            Quem já usa, recomenda
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Depoimentos <span className="text-[var(--color-primary)]">reais</span> de clientes
          </h2>
          <p className="mt-3 flex items-center justify-center gap-2 text-lg text-ink-soft">
            <span className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
              ))}
            </span>
            {media} de 5 — enviados pelos próprios clientes após o atendimento
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {deps.slice(0, 6).map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex h-full flex-col rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-6 transition-all hover:border-[var(--color-primary)]/30 hover:shadow-md"
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={s <= d.nota ? "fill-amber-400 text-amber-400" : "text-[var(--color-line)]"}
                  />
                ))}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink">“{d.texto}”</p>
              <div className="mt-5 flex items-center gap-3 border-t border-[var(--color-line)]/60 pt-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">
                  {d.cliente_nome.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{d.cliente_nome}</p>
                  <p className="truncate text-xs text-ink-soft">{getProf(d)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
