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
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleLogin} className="card w-full max-w-sm p-8">
        <h1 className="mb-6 text-2xl font-semibold">Acessar painel</h1>

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
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
          />
          <input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
}
