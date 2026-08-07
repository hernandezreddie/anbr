import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fundoStyle, type FundoEstilo } from "@/lib/backgrounds";
import { PainelAuthGate } from "./PainelAuthGate";
import { PainelPrimaryProvider } from "./primary-context";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data: prof } = await createAdminClient()
      .from("profissionais")
      .select("nome, slogan")
      .eq("slug", slug)
      .maybeSingle();
    if (prof?.nome) {
      return { title: `${prof.nome} — Painel`, description: prof.slogan || undefined };
    }
  } catch {
    // best-effort: nunca bloquear el título del painel
  }
  return { title: "Painel" };
}

export default async function PainelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const [{ data: config }, { data: prof }] = await Promise.all([
    supabase.from("configuracoes").select("cor_primaria, fundo_estilo").single(),
    supabase.from("profissionais").select("categoria").eq("slug", slug).maybeSingle(),
  ]);
  const fundo = fundoStyle((config?.fundo_estilo || "none") as FundoEstilo, config?.cor_primaria || "#059669");
  const primary = config?.cor_primaria || "#059669";

  return (
    <PainelPrimaryProvider primary={primary}>
      <div className="flex min-h-screen flex-col" style={fundo as React.CSSProperties} data-niche={prof?.categoria || "outro"}>
        <PainelAuthGate slug={slug}>{children}</PainelAuthGate>
      </div>
    </PainelPrimaryProvider>
  );
}
