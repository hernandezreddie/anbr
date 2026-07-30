import { createClient } from "@/lib/supabase/server";
import { fundoStyle, type FundoEstilo } from "@/lib/backgrounds";
import { PainelAuthGate } from "./PainelAuthGate";

export default async function PainelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: config } = await supabase
    .from("configuracoes")
    .select("cor_primaria, fundo_estilo")
    .single();
  const fundo = fundoStyle((config?.fundo_estilo || "none") as FundoEstilo, config?.cor_primaria || "#059669");

  return (
    <div className="flex min-h-screen" style={fundo as React.CSSProperties}>
      <PainelAuthGate slug={slug}>{children}</PainelAuthGate>
    </div>
  );
}
