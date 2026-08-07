import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { AgenteClient } from "./AgenteClient";

export default async function AgentePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${slug}/painel/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("profissional_id, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect(`/${slug}/painel/login`);

  // Get profissional_id from slug (URL), not from user profile.
  // This is critical so admins visiting other tenants' panels get the
  // correct profissional_id for the chatbot context.
  const adminDb = createAdminClient();
  const { data: profSlug } = await adminDb
    .from("profissionais")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  // Use the profissional_id from the slug tenant, not the logged-in user's tenant
  const profissionalId = profSlug?.id || profile.profissional_id;

  return <AgenteClient profissionalId={profissionalId} slug={slug} />;
}
