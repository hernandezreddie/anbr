"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff, KeyRound } from "lucide-react";

export default function RedefinirSenhaPage() {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [pronto, setPronto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let retryCount = 0;
    const maxRetries = 5;
    
    const checkSession = async () => {
      try {
        // Force session refresh from storage/cookies
        await supabase.auth.getSession();
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (!userError && user) {
            // Check if this is a recovery session (has the recovery token)
            setPronto(true);
          } else {
            setErro("Link inválido ou expirado. Solicite um nuevo link de recuperação.");
          }
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkSession, 1000);
        } else {
          setErro("Link inválido ou expirado. Solicite um nuevo link de recuperação.");
        }
      } catch (e) {
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(checkSession, 1000);
        } else {
          setErro("Link inválido ou expirado. Solicite un nuevo link de recuperação.");
        }
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (senha.length < 6) {
      setErro("A senha precisa ter no mínimo 6 caracteres");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não conferem");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);

    if (error) {
      setErro(error.message);
      return;
    }

    await supabase.auth.signOut();
    router.replace("/entrar?erro=recuperado");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-white p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-8 shadow-lg shadow-neutral-200/50">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center">
            <Logo className="h-14 w-14" />
          </div>
          <h1 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight text-neutral-900">
            <KeyRound size={22} /> Nova senha
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Defina sua nova senha de acesso</p>
        </div>

        {erro && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>}

        {pronto && (
          <div className="space-y-4">
            <div className="relative">
              <input
                type={verSenha ? "text" : "password"}
                placeholder="Nova senha"
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
            <div className="relative">
              <input
                type={verConfirmar ? "text" : "password"}
                placeholder="Confirmar nova senha"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-11 text-sm outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setVerConfirmar((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700"
              >
                {verConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </div>
        )}

        {!pronto && !erro && <p className="text-center text-sm text-neutral-500">Verificando link...</p>}

        {!pronto && erro && (
          <p className="mt-5 text-center text-sm">
            <Link href="/recuperar-senha" className="font-medium text-teal-700 hover:underline">
              Solicitar novo link
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}