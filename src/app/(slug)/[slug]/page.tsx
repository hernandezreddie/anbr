import { getProfissionalFullConfig } from "@/lib/db/profissionais";
import { TEMPLATES } from "@/components/templates";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import type { ProfissionalConfig, Promocao } from "@/types";
import { Tag } from "lucide-react";
import { contrastante, accento } from "@/lib/cores";
import { RedesSociais } from "@/components/landing/RedesSociais";
import { MobileCtaBar } from "@/components/landing/MobileCtaBar";

function PromoBanner({ promo, config }: { promo: Promocao; config: ProfissionalConfig }) {
  const primary = config.configuracao.cor_primaria || "#059669";
  const ink = contrastante(primary);
  const accent = accento(primary);
  const badge =
    promo.tipo === "porcentagem"
      ? `${promo.valor}% OFF`
      : `R$ ${Number(promo.valor).toFixed(2).replace(".", ",")} OFF`;
  return (
    <div className="container-x">
      <a
        href={`/${config.profissional.slug}/reservar`}
        className="mt-4 flex items-center justify-between gap-3 overflow-hidden rounded-2xl px-5 py-3.5 shadow-lg transition-transform hover:scale-[1.01]"
        style={{ background: `linear-gradient(135deg, ${primary}, ${primary}dd)`, color: ink }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: ink + "1F" }}>
            <Tag size={17} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{promo.titulo}</p>
            <p className="truncate text-xs" style={{ color: ink + "B3" }}>{promo.texto || "Aproveite essa oferta por tempo limitado."}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold" style={{ color: accent }}>
          {badge}
        </span>
      </a>
    </div>
  );
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = await getProfissionalFullConfig(slug);

  if (!config) notFound();

  const template = TEMPLATES[config.configuracao.template_id as keyof typeof TEMPLATES] || TEMPLATES[1];
  const promosAtivas = (config.promocoes ?? []).filter((p) => p.ativo);

  const { data: avaliacoes } = await createAdminClient()
    .from("avaliacoes")
    .select("cliente_nome, nota, texto, created_at")
    .eq("profissional_id", config.profissional.id)
    .eq("aprovada", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div data-niche={config.profissional.categoria || "outro"}>
      <template.Nav config={config} />
      {promosAtivas.map((p) => (
        <PromoBanner key={p.id} promo={p} config={config} />
      ))}
      <main>
        <template.Hero config={config} />
        <template.Confianca config={config} />
        <template.Servicos config={config} />
        <template.Depoimentos config={config} avaliacoes={(avaliacoes || []) as any} />
        <template.CtaFinal config={config} />
      </main>
      <template.Footer config={config} />
      <RedesSociais config={config} />
      <template.WhatsAppFloat config={config} />
      <MobileCtaBar config={config} />
    </div>
  );
}
