"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { SidebarClient } from "./SidebarClient";
import { PushSubscriber } from "@/components/PushSubscriber";
import { UpgradeBanner } from "@/components/painel/UpgradeBanner";

export function PainelAuthGate({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const isLoginPage = pathname.endsWith("/painel/login");

  useEffect(() => {
    const supabase = createClient();

    if (isLoginPage) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace(`/${slug}/painel`);
        } else {
          setReady(true);
        }
      });
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          router.replace(`/${slug}/painel/login`);
          return;
        }
        supabase
          .from("profiles")
          .select("profissional_id, role, profissionais(slug)")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (!profile) {
              router.replace(`/${slug}/painel/login`);
              return;
            }
            const prof = Array.isArray(profile.profissionais)
              ? profile.profissionais[0]
              : profile.profissionais;
            if (prof && prof.slug !== slug) {
              router.replace(`/${prof.slug}/painel`);
              return;
            }
            setReady(true);
          });
      });
    }
  }, [slug, pathname, router, isLoginPage]);

  if (!ready && !isLoginPage) return null;

  return (
    <>
      {!isLoginPage && <PushSubscriber />}
      {!isLoginPage && <SidebarClient slug={slug} />}
      <main className="flex-1 overflow-auto pb-20 lg:pb-20">
        <div className={isLoginPage ? "" : "container-x py-8"}>
          {!isLoginPage && <UpgradeBanner slug={slug} />}
          {children}
        </div>
      </main>
    </>
  );
}