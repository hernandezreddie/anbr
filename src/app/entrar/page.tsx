"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff } from "lucide-react";

function EntrarForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = user
        ? await supabase
            .from("profiles")
            .select("profissional_id, role, profissionais(slug)")
            .eq("id", user.id)
            .single()
        : { data: null };
      const prof = profile?.profissionais as { slug: string } | { slug: string }[] | null;
      const slug = Array.isArray(prof) ? prof[0]?.slug : prof?.slug;
      const role = profile?.role;
      if (role === "admin" || role === "plataforma") {
        router.replace("/admin");
      } else if (slug) {
        router.replace(`/${slug}/painel`);
      } else {
        router.replace("/");
      }
    });
  }, [router]);

  useEffect(() => {
    const cb = searchParams.get("callback");
    const er = searchParams.get("erro");
    if (er === "callback") setErro("Link expirado ou inválido. Entre novamente.");
    if (er === "senha") setErro("Email ou senha incorretos.");
    if (er === "recuperado") setInfo("Senha atualizada! Faça login com a nova senha.");
    if (cb) setInfo("Pré-visualizando como outro usuário.");
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setInfo("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro("Email ou senha incorretos");
      setLoading(false);
      return;
    }

    // Descobrir role e slug do usuário
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase
          .from("profiles")
          .select("profissional_id, role, profissionais(slug)")
          .eq("id", user.id)
          .single()
      : { data: null };

    const prof = profile?.profissionais as { slug: string } | { slug: string }[] | null;
    const slug = Array.isArray(prof) ? prof[0]?.slug : prof?.slug;
    const role = profile?.role;

    if (role === "admin" || role === "plataforma") {
      router.replace("/admin");
      return;
    }

    if (slug) {
      router.replace(`/${slug}/painel`);
      return;
    }

    setErro("Conta sem sistema vinculado. Contate o suporte.");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-white p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-8 shadow-lg shadow-neutral-200/50">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center">
            <Logo className="h-14 w-14" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">AN.BR</h1>
          <p className="mt-1 text-sm text-neutral-500">Entre na sua conta</p>
        </div>

        {erro && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>}
        {info && <div className="mb-4 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-700">{info}</div>}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:opacity-50"
          />
          <div className="relative">
            <input
              type={verSenha ? "text" : "password"}
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-11 text-sm outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setVerSenha((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700"
            >
              {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        <div className="mt-5 space-y-2 text-center text-sm">
          <Link href="/recuperar-senha" className="block text-teal-700 hover:underline">
            Esqueci minha senha
          </Link>
          <p className="text-neutral-500">
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="font-medium text-teal-700 hover:underline">
              Criar meu sistema
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense>
      <EntrarForm />
    </Suspense>
  );
}