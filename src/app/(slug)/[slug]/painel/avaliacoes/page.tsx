import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { AvaliacoesClient } from "./AvaliacoesClient";

type AvaliacaoRow = {
  id: string;
  cliente_nome: string;
  nota: number;
  texto: string;
  aprovada: boolean;
  created_at: string | null;
};

type ConvitePendenteRow = {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  data: string | null;
};

export default async function AvaliacoesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${slug}/painel/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("profissional_id")
    .eq("id", user.id)
    .single();
  if (!profile) redirect(`/${slug}/painel/login`);

  const adminDb = createAdminClient();
  const { data: prof } = await adminDb
    .from("profissionais")
    .select("id, slug")
    .eq("id", profile.profissional_id)
    .single();

  if (!prof || prof.slug !== slug) redirect(`/${slug}/painel/login`);

  const [{ data: avaliacoes }, { data: pendentes }] = await Promise.all([
    adminDb
      .from("avaliacoes")
      .select("id, cliente_nome, nota, texto, aprovada, created_at")
      .eq("profissional_id", prof.id)
      .order("created_at", { ascending: false }),
    adminDb
      .from("agendamentos")
      .select("id, cliente_nome, cliente_whatsapp, data")
      .eq("profissional_id", prof.id)
      .eq("status", "concluido")
      .eq("convite_avaliacao_enviado", false)
      .not("token_avaliacao", "is", null)
      .not("cliente_whatsapp", "is", null)
      .order("data", { ascending: false }),
  ]);

  return (
    <AvaliacoesClient
      slug={slug}
      avaliacoes={(avaliacoes || []) as AvaliacaoRow[]}
      convitesPendentes={(pendentes || []) as ConvitePendenteRow[]}
    />
  );
}
