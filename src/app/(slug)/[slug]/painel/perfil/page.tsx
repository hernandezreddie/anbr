"use client";

import { useState, useEffect } from "react";
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

export default function PerfilPage() {
  const pathname = usePathname();
  const slug = pathname.split("/")[1];
  const supabase = createClient();

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.from("servicos").select("*").order("ordem").then(({ data }) => {
      if (data) setServicos(data as Servico[]);
    });
  }, []);

  const updateServico = async (id: string, field: string, value: any) => {
    setSaving(id);
    setMsg("");
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meus serviços</h1>
        <p className="mt-1 text-ink-soft">Gerencie os serviços que aparecem na sua página</p>
      </div>

      {msg && (
        <div className="rounded-xl bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700">
          {msg}
        </div>
      )}

      <div className="space-y-4">
        {servicos.map((s) => (
          <div key={s.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                <div>
                  <input
                    type="text"
                    value={s.nome}
                    onChange={(e) => updateServico(s.id, "nome", e.target.value)}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-lg font-medium outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <textarea
                    value={s.descricao}
                    onChange={(e) => updateServico(s.id, "descricao", e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  {s.tipo_preco === "por_hora" ? (
                    <>
                      <div>
                        <label className="text-xs text-ink-soft">R$/hora</label>
                        <input
                          type="number"
                          value={s.valor_hora}
                          onChange={(e) => updateServico(s.id, "valor_hora", Number(e.target.value))}
                          className="mt-1 w-24 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-ink-soft">Horas mín</label>
                        <input
                          type="number"
                          value={s.horas_minimas}
                          onChange={(e) => updateServico(s.id, "horas_minimas", Number(e.target.value))}
                          className="mt-1 w-20 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-emerald-600"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs text-ink-soft">Preço fixo (R$)</label>
                        <input
                          type="number"
                          value={s.preco_fixo}
                          onChange={(e) => updateServico(s.id, "preco_fixo", Number(e.target.value))}
                          className="mt-1 w-28 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-ink-soft">Duração (min)</label>
                        <input
                          type="number"
                          value={s.duracao_minutos}
                          onChange={(e) => updateServico(s.id, "duracao_minutos", Number(e.target.value))}
                          className="mt-1 w-20 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-emerald-600"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex items-end">
                    <button
                      onClick={() => updateServico(s.id, "ativo", !s.ativo)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        s.ativo
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {s.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </div>
                </div>
              </div>
              {saving === s.id && <span className="text-sm text-ink-soft">Salvando...</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
