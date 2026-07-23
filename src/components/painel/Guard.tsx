import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profissional } from "@/types";

export default async function Guard({
  slug,
  children,
}: {
  slug: string;
  children: (profissional: Profissional) => React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${slug}/painel/login`);
  }

  const { data: profissional } = await supabase
    .from("profissionais")
    .select("*")
    .eq("email", user.email)
    .single();

  if (!profissional) {
    redirect(`/${slug}/painel/login`);
  }

  return <>{children(profissional as Profissional)}</>;
}
