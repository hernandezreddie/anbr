"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";

type Servico = {
  id: string;
  nome: string;
  descricao: string;
  tipo_preco: string;
  valor_hora: number;
  preco_fixo: number;
  horas_minimas: number;
  duracao_minutos: number;
  ativo: boolean;
  ordem: number;
};

type Configuracao = {
  profissional_id: string;
  cor_primaria: string;
  cor_secundaria: string;
  fonte_titulo: string;
  fonte_corpo: string;
  logo_url: string;
  slogan: string;
};

const fontes = [
  { value: "Fraunces", label: "Fraunces (elegante)" },
  { value: "Inter", label: "Inter (moderno)" },
  { value: "Playfair Display", label: "Playfair Display (clássico)" },
  { value: "DM Sans", label: "DM Sans (limpo)" },
];

export default function PerfilPage() {
  const pathname = usePathname();
  const slug = pathname.split("/")[1];
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [config, setConfig] = useState<Configuracao | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const carregar = async () => {
    const [servicosRes, configRes] = await Promise.all([
      supabase.from("servicos").select("*").order("ordem"),
      supabase.from("configuracoes").select("*").single(),
    ]);
    if (servicosRes.data) setServicos(servicosRes.data as Servico[]);
    if (configRes.data) setConfig(configRes.data as Configuracao);
  };

  useEffect(() => { carregar(); }, []);

  const updateServico = async (id: string, field: string, value: any) => {
    setSaving(id);
    const { error } = await supabase.from("servicos").update({ [field]: value }).eq("id", id);
    if (!error) {
      setServicos((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
      setMsg("Salvo!");
    } else {
      setMsg("Erro ao salvar");
    }
    setTimeout(() => setMsg(""), 2000);
    setSaving(null);
  };

  const updateConfig = async (field: string, value: string) => {
    if (!config) return;
    setConfig((prev) => prev ? { ...prev, [field]: value } : null);
    const res = await fetch("/api/config/atualizar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profissional_id: config.profissional_id, [field]: value }),
    });
    if (res.ok) setMsg("Salvo!");
    else setMsg("Erro ao salvar");
    setTimeout(() => setMsg(""), 2000);
  };

  const uploadLogo = async (file: File) => {
    if (!config) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("profissional_id", config.profissional_id);

    const res = await fetch("/api/upload/logo", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      setConfig((prev) => prev ? { ...prev, logo_url: data.url } : null);
      setMsg("Logo atualizado!");
    } else {
      setMsg(data.error || "Erro ao enviar logo");
    }
    setTimeout(() => setMsg(""), 2000);
    setUploading(false);
  };

  const removeLogo = async () => {
    if (!config?.logo_url) return;
    setConfig((prev) => prev ? { ...prev, logo_url: "" } : null);
    await fetch("/api/config/atualizar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profissional_id: config.profissional_id, logo_url: "" }),
    });
    setMsg("Logo removido");
    setTimeout(() => setMsg(""), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="mt-1 text-ink-soft">Personalize sua página profissional</p>
      </div>

      {msg && (
        <div className="rounded-xl bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700">
          {msg}
        </div>
      )}

      <div className="card p-6 space-y-6">
        <h2 className="text-lg font-semibold">Logo</h2>
        <div className="flex items-center gap-6">
          {config?.logo_url ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-line">
              <img src={config.logo_url} alt="Logo" className="h-full w-full object-contain" />
              <button onClick={removeLogo}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
              >×</button>
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-line bg-gray-50 text-3xl text-ink-soft">
              📷
            </div>
          )}
          <div>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
            >
              {uploading ? "Enviando..." : "Escolher imagem"}
            </button>
            <p className="mt-1.5 text-xs text-ink-soft">PNG, JPG ou WebP · Máx 5MB</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-6">
        <h2 className="text-lg font-semibold">Cores</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="text-sm text-ink-soft">Cor principal</label>
            <div className="mt-1.5 flex items-center gap-3">
              <input type="color" value={config?.cor_primaria || "#059669"}
                onChange={(e) => updateConfig("cor_primaria", e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border border-line" />
              <input type="text" value={config?.cor_primaria || "#059669"}
                onChange={(e) => updateConfig("cor_primaria", e.target.value)}
                className="flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-emerald-600 font-mono" />
            </div>
          </div>
          <div>
            <label className="text-sm text-ink-soft">Cor secundária</label>
            <div className="mt-1.5 flex items-center gap-3">
              <input type="color" value={config?.cor_secundaria || "#1c1917"}
                onChange={(e) => updateConfig("cor_secundaria", e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border border-line" />
              <input type="text" value={config?.cor_secundaria || "#1c1917"}
                onChange={(e) => updateConfig("cor_secundaria", e.target.value)}
                className="flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-emerald-600 font-mono" />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-6">
        <h2 className="text-lg font-semibold">Tipografia</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="text-sm text-ink-soft">Fonte dos títulos</label>
            <select value={config?.fonte_titulo || "Fraunces"}
              onChange={(e) => updateConfig("fonte_titulo", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
              {fontes.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-ink-soft">Fonte do corpo</label>
            <select value={config?.fonte_corpo || "Inter"}
              onChange={(e) => updateConfig("fonte_corpo", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
              {fontes.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-6">
        <h2 className="text-lg font-semibold">Serviços</h2>
        <div className="space-y-4">
          {servicos.map((s) => (
            <div key={s.id} className="rounded-xl border border-line p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <input type="text" value={s.nome}
                    onChange={(e) => updateServico(s.id, "nome", e.target.value)}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-lg font-medium outline-none focus:border-emerald-600" />
                  <textarea value={s.descricao}
                    onChange={(e) => updateServico(s.id, "descricao", e.target.value)} rows={2}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-emerald-600" />
                  <div className="flex flex-wrap gap-4">
                    {s.tipo_preco === "por_hora" ? (<>
                      <div><label className="text-xs text-ink-soft">R$/hora</label>
                        <input type="number" value={s.valor_hora}
                          onChange={(e) => updateServico(s.id, "valor_hora", Number(e.target.value))}
                          className="mt-1 w-24 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-emerald-600" /></div>
                      <div><label className="text-xs text-ink-soft">Horas mín</label>
                        <input type="number" value={s.horas_minimas}
                          onChange={(e) => updateServico(s.id, "horas_minimas", Number(e.target.value))}
                          className="mt-1 w-20 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-emerald-600" /></div>
                    </>) : (<>
                      <div><label className="text-xs text-ink-soft">Preço fixo (R$)</label>
                        <input type="number" value={s.preco_fixo}
                          onChange={(e) => updateServico(s.id, "preco_fixo", Number(e.target.value))}
                          className="mt-1 w-28 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-emerald-600" /></div>
                      <div><label className="text-xs text-ink-soft">Duração (min)</label>
                        <input type="number" value={s.duracao_minutos}
                          onChange={(e) => updateServico(s.id, "duracao_minutos", Number(e.target.value))}
                          className="mt-1 w-20 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-emerald-600" /></div>
                    </>)}
                    <div className="flex items-end">
                      <button onClick={() => updateServico(s.id, "ativo", !s.ativo)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${s.ativo ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {s.ativo ? "Ativo" : "Inativo"}
                      </button>
                    </div>
                  </div>
                </div>
                {saving === s.id && <span className="text-sm text-ink-soft shrink-0">Salvando...</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
