import { createClient } from "@/lib/supabase/server";
import { isAdminPlataforma } from "@/lib/auth-roles";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { AdminBottomNav } from "./AdminBottomNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = user && (await isAdminPlataforma());

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-teal-50/40 p-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-xl shadow-neutral-200/50">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center">
            <Logo className="h-16 w-16" />
          </div>
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <ShieldAlert size={22} />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-neutral-900">
            Área restrita
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            {user
              ? "Sua conta não tem permissão de administração da plataforma AN.BR."
              : "Esta área é exclusiva da equipe AN.BR. Se você é um profissional, use o link do seu próprio sistema para acessar o painel."}
          </p>
          <div className="mt-6 space-y-2.5">
            {user ? (
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-700"
              >
                Voltar ao site <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link
                  href="/entrar"
                  className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-700"
                >
                  Entrar na minha conta <ArrowRight size={15} />
                </Link>
                <Link
                  href="/"
                  className="block py-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800"
                >
                  Voltar ao site
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex-1 pb-24">{children}</div>
      <AdminBottomNav />
    </div>
  );
}
