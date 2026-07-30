import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SidebarClient } from "./SidebarClient";
import { PushSubscriber } from "@/components/PushSubscriber";

export default async function PainelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hdrs = await headers();
  const xPathname = hdrs.get("x-pathname") || "";
  const isLoginPage = xPathname.endsWith("/painel/login");

  if (!isLoginPage) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/${slug}/painel/login`);
    }

    // Check via profiles table (links auth.users to profissional)
    const { data: profile } = await supabase
      .from("profiles")
      .select("profissional_id, role, profissionais(slug)")
      .eq("id", user.id)
      .single();

    if (!profile) {
      redirect(`/${slug}/painel/login`);
    }

    // If the slug doesn't match this user's tenant, redirect
    const prof = Array.isArray(profile.profissionais)
      ? profile.profissionais[0]
      : profile.profissionais;
    if (prof && prof.slug !== slug) {
      redirect(`/${prof.slug}/painel`);
    }
  }

  return (
    <div className="flex min-h-screen">
      {!isLoginPage && <PushSubscriber />}
      {!isLoginPage && <SidebarClient slug={slug} />}
      <main className="flex-1 overflow-auto">
        <div className={isLoginPage ? "" : "container-x py-8"}>{children}</div>
      </main>
    </div>
  );
}
