import { createClient } from "@/lib/supabase/server";
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

  return <AgenteClient profissionalId={profile.profissional_id} slug={slug} />;
}
