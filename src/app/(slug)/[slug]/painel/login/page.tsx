"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PainelLogin({ params }: { params: Promise<{ slug: string }> }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro("Email ou senha incorretos");
      return;
    }

    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-white">
      <form onSubmit={handleLogin} className="card w-full max-w-sm p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mb-3 text-4xl">⚡</div>
          <h1 className="text-2xl font-bold tracking-tight">Acessar painel</h1>
          <p className="mt-1 text-sm text-ink-soft">Entre com seus dados de acesso</p>
        </div>

        {erro && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
          <input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
          >
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
}
