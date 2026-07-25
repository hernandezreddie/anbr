"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CadastroPage() {
  const [passo, setPasso] = useState(1);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    slug: "",
    whatsapp: "",
    cidade: "",
    pix_chave: "",
  });
  const [erro, setErro] = useState("");
  const router = useRouter();

  const slugFromNome = (nome: string) =>
    nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);

  const updateField = (field: string, value: string) => {
    const next = { ...form, [field]: value };
    if (field === "nome" && form.slug === slugFromNome(form.nome)) {
      next.slug = slugFromNome(value);
    }
    setForm(next);
  };

  const handleSubmit = async () => {
    setErro("");

    const res = await fetch("/api/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setErro(data.error || "Erro ao criar sistema");
      return;
    }

    router.push(`/cadastro/sucesso?slug=${data.slug}`);
  };

  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            {[1, 2, 3].map((p) => (
              <div
                key={p}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  passo >= p ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {p}
              </div>
            ))}
          </div>
          <h1 className="text-2xl font-semibold">Criar meu sistema</h1>
        </div>

        {passo === 1 && (
          <div className="card space-y-4 p-8">
            <h2 className="text-lg font-medium">Seus dados</h2>
            <input
              type="text"
              placeholder="Seu nome completo"
              value={form.nome}
              onChange={(e) => updateField("nome", e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
            />
            <input
              type="email"
              placeholder="Seu email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
            />
            <input
              type="password"
              placeholder="Sua senha"
              value={form.senha}
              onChange={(e) => updateField("senha", e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
            />
            <button
              onClick={() => setPasso(2)}
              disabled={!form.nome || !form.email || !form.senha}
              className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        )}

        {passo === 2 && (
          <div className="card space-y-4 p-8">
            <h2 className="text-lg font-medium">Seu endereço online</h2>
            <div>
              <label className="text-sm text-ink-soft">Seu subdomínio</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="maria-limpeza"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  className="flex-1 rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
                />
                <span className="text-sm text-ink-soft">.livreta.com.br</span>
              </div>
            </div>
            <input
              type="text"
              placeholder="Seu WhatsApp com DDD (ex: 5541999999999)"
              value={form.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
            />
            <input
              type="text"
              placeholder="Sua cidade"
              value={form.cidade}
              onChange={(e) => updateField("cidade", e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
            />
            <button
              onClick={() => setPasso(3)}
              disabled={!form.slug || !form.whatsapp || !form.cidade}
              className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        )}

        {passo === 3 && (
          <div className="card space-y-4 p-8">
            <h2 className="text-lg font-medium">Recebimento</h2>
            <input
              type="text"
              placeholder="Sua chave Pix (CPF, email, telefone ou aleatória)"
              value={form.pix_chave}
              onChange={(e) => updateField("pix_chave", e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
            />
            {erro && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</div>
            )}
            <button
              onClick={handleSubmit}
              disabled={!form.pix_chave}
              className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
            >
              Criar meu sistema
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
