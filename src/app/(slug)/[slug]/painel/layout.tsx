import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SidebarClient } from "./SidebarClient";

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

    const { data: profissional } = await supabase
      .from("profissionais")
      .select("*")
      .eq("email", user.email)
      .single();

    if (!profissional) {
      redirect(`/${slug}/painel/login`);
    }
  }

  return (
    <div className="flex min-h-screen">
      {!isLoginPage && <SidebarClient slug={slug} />}
      <main className="flex-1 overflow-auto">
        <div className={isLoginPage ? "" : "container-x py-8"}>{children}</div>
      </main>
    </div>
  );
}
