import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { PlanoClient } from "./PlanoClient";

export default async function PlanoPage({
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
    .select("plano, plano_expira_em")
    .eq("id", profile.profissional_id)
    .single();

  return (
    <PlanoClient
      slug={slug}
      profissionalId={profile.profissional_id}
      plano={prof?.plano || "gratis"}
      expiraEm={prof?.plano_expira_em || null}
    />
  );
}
