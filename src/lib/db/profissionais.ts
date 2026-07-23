import { createAdminClient } from "@/lib/supabase/admin";
import type { Profissional, ConfiguracaoVisual } from "@/types";

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

export async function getProfissionalFullConfig(slug: string) {
  const supabase = createAdminClient();

  const [profissional, servicos, adicionais, frequencias] = await Promise.all([
    supabase.from("profissionais").select("*").eq("slug", slug).single(),
    supabase
      .from("servicos")
      .select("*")
      .eq("profissional_id", (await supabase.from("profissionais").select("id").eq("slug", slug).single()).data?.id)
      .eq("ativo", true)
      .order("ordem"),
    supabase.from("adicionais").select("*").eq("profissional_id", (await supabase.from("profissionais").select("id").eq("slug", slug).single()).data?.id).eq("ativo", true),
    supabase.from("frequencias").select("*").eq("profissional_id", (await supabase.from("profissionais").select("id").eq("slug", slug).single()).data?.id).order("ordem"),
  ]);

  if (!profissional.data) return null;

  const configuracao = await getConfiguracaoVisual(profissional.data.id);

  return {
    profissional: profissional.data as Profissional,
    configuracao: configuracao || {
      profissional_id: profissional.data.id,
      template_id: 1,
      cor_primaria: "#059669",
      cor_secundaria: "#1c1917",
      fonte_titulo: "Fraunces",
      fonte_corpo: "Inter",
      logo_url: "",
      slogan: profissional.data.slogan,
    },
    servicos: (servicos.data || []) as any[],
    adicionais: (adicionais.data || []) as any[],
    frequencias: (frequencias.data || []) as any[],
  };
}
