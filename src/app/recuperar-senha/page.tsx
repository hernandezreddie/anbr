"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { Mail } from "lucide-react";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/redefinir-senha`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);

    if (error) {
      setErro(error.message);
      return;
    }

    setEnviado(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-white p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-8 shadow-lg shadow-neutral-200/50">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center">
            <Logo className="h-14 w-14" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Recuperar senha</h1>
          <p className="mt-1 text-sm text-neutral-500">Enviaremos um link para redefinir sua senha</p>
        </div>

        {enviado ? (
          <div className="rounded-xl bg-teal-50 px-4 py-4 text-center text-sm text-teal-700">
            <Mail size={20} className="mx-auto mb-2" />
            <p>Enviamos um link de recuperação para <strong>{email}</strong>.</p>
            <p className="mt-1 text-teal-600/80">Verifique sua caixa de entrada (e o spam).</p>
            <Link href="/entrar" className="mt-4 inline-block font-medium text-teal-700 underline underline-offset-2 hover:text-teal-900">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            {erro && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>}
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
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </button>
            </div>
            <p className="mt-5 text-center text-sm text-neutral-500">
              Lembrou a senha?{" "}
              <Link href="/entrar" className="font-medium text-teal-700 hover:underline">
                Voltar para o login
              </Link>
            </p>
          </>
        )}
      </form>
    </div>
  );
}