import { createAdminClient } from "@/lib/supabase/admin";
import type { Profissional, ConfiguracaoVisual } from "@/types";
import { cache } from "react";

export async function getProfissionalBySlug(slug: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profissionais")
    .select("*")
    .eq("slug", slug)
    .single();
  return data as Profissional | null;
}

export async function getConfiguracaoVisual(profissionalId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("configuracoes")
    .select("*")
    .eq("profissional_id", profissionalId)
    .single();
  return data as ConfiguracaoVisual | null;
}

export const getProfissionalFullConfig = cache(async (slug: string) => {
  const supabase = createAdminClient();

  const { data: profissional } = await supabase
    .from("profissionais")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!profissional) return null;

  const pid = profissional.id;

  const [servicos, adicionais, frequencias, configuracao] = await Promise.all([
    supabase.from("servicos").select("*").eq("profissional_id", pid).eq("ativo", true).order("ordem"),
    supabase.from("adicionais").select("*").eq("profissional_id", pid).eq("ativo", true),
    supabase.from("frequencias").select("*").eq("profissional_id", pid).order("ordem"),
    getConfiguracaoVisual(pid),
  ]);

  return {
    profissional: profissional as Profissional,
    configuracao: configuracao || {
      profissional_id: pid,
      template_id: 1,
      cor_primaria: "#059669",
      cor_secundaria: "#1c1917",
      fonte_titulo: "Fraunces",
      fonte_corpo: "Inter",
      logo_url: "",
      foto_fundo: "",
      slogan: profissional.slogan,
      fundo_estilo: "none",
    },
    servicos: (servicos.data || []) as any[],
    adicionais: (adicionais.data || []) as any[],
    frequencias: (frequencias.data || []) as any[],
  };
});