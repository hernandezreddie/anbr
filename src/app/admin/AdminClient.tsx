"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

export function AdminClient() {
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    slug: "",
    whatsapp: "",
    cidade: "",
  });
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    if (window.location.hash === "#novo-tenant") {
      setAberto(true);
    }
    const onHash = () => {
      if (window.location.hash === "#novo-tenant") setAberto(true);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const slugFromNome = (nome: string) =>
    nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setOk("");
    const res = await fetch("/api/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setErro(data.error || "Erro ao criar");
      return;
    }
    setOk(`Tenant "${form.nome}" criado! slug: ${data.slug}`);
    setForm({ nome: "", email: "", senha: "", slug: "", whatsapp: "", cidade: "" });
    setTimeout(() => { setAberto(false); setOk(""); window.location.reload(); }, 1500);
  };

  return (
    <div id="novo-tenant">
      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-teal-700"
      >
        <Plus size={14} /> Novo tenant
      </button>

      {aberto && (
        <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold">Criar novo tenant</h3>
          {erro && <div className="mb-3 rounded-lg bg-red-50 p-2.5 text-sm text-red-700">{erro}</div>}
          {ok && <div className="mb-3 rounded-lg bg-teal-50 p-2.5 text-sm text-teal-700">{ok}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input type="text" placeholder="Nome completo" value={form.nome} required
                onChange={(e) => {
                  const next = { ...form, nome: e.target.value };
                  if (next.slug === slugFromNome(form.nome)) next.slug = slugFromNome(e.target.value);
                  setForm(next);
                }}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-teal-600" />
              <input type="email" placeholder="Email" value={form.email} required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-teal-600" />
              <input type="password" placeholder="Senha" value={form.senha} required
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-teal-600" />
              <div>
                <input type="text" placeholder="Slug (URL)" value={form.slug} required
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-teal-600" />
                <p className="mt-1 text-xs text-neutral-400">/{form.slug || "..."}</p>
              </div>
              <input type="text" placeholder="WhatsApp (com DDD)" value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-teal-600" />
              <input type="text" placeholder="Cidade" value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-teal-600" />
            </div>
            <button type="submit" className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-neutral-700">
              Criar tenant
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
