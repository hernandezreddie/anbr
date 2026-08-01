"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Save, Loader2, Wallet } from "lucide-react";
import { PLANOS } from "@/lib/planos";

type Pagamento = {
  id: number;
  profissional_id: string;
  plano: string;
  frequencia: string;
  valor: number;
  status: "pendente" | "pago" | "cancelado";
  criado_em: string;
  pago_em: string | null;
  profissionais: { nome: string; slug: string; email: string; plano: string } | null;
};

type ConfigPlataforma = {
  pix_chave: string;
  pix_nome: string;
  pix_cidade: string;
  whatsapp: string;
};

export function PlanosAdmin() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [config, setConfig] = useState<ConfigPlataforma>({ pix_chave: "", pix_nome: "", pix_cidade: "", whatsapp: "" });
  const [carregando, setCarregando] = useState(true);
  const [confirmando, setConfirmando] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [salvo, setSalvo] = useState(false);

  const carregar = useCallback(async () => {
    const [pagRes, cfgRes] = await Promise.all([
      fetch("/api/planos/pagamentos"),
      fetch("/api/planos/config"),
    ]);
    if (pagRes.ok) setPagamentos(await pagRes.json());
    if (cfgRes.ok) setConfig(await cfgRes.json());
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function confirmar(id: number) {
    setConfirmando(id);
    setMsg("");
    const res = await fetch("/api/planos/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pagamento_id: id }),
    });
    const data = await res.json();
    setConfirmando(null);
    if (!res.ok) {
      setMsg(data.error || "Erro ao confirmar");
      return;
    }
    setMsg(`Plano ${PLANOS[data.plano as keyof typeof PLANOS]?.nome || data.plano} ativado até ${new Date(data.expira_em).toLocaleDateString("pt-BR")}`);
    carregar();
  }

  async function salvarConfig() {
    const res = await fetch("/api/planos/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (res.ok) {
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2000);
    } else {
      const data = await res.json();
      setMsg(data.error || "Erro ao salvar");
    }
  }

  const pendentes = pagamentos.filter((p) => p.status === "pendente");
  const historico = pagamentos.filter((p) => p.status !== "pendente");

  return (
    <div className="mt-4 space-y-4" id="assinaturas">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Wallet size={16} className="text-teal-600" /> Assinaturas Pix
        </h2>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h3 className="text-xs font-semibold">Configuração Pix da plataforma</h3>
            <p className="mt-0.5 text-[11px] text-neutral-500">
              Chave usada para receber os pagamentos de assinatura (CPF/CNPJ, celular ou e-mail).
            </p>
            <div className="mt-3 space-y-2">
              <input
                type="text"
                placeholder="Chave Pix"
                value={config.pix_chave}
                onChange={(e) => setConfig({ ...config, pix_chave: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nome do titular"
                  value={config.pix_nome}
                  onChange={(e) => setConfig({ ...config, pix_nome: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
                <input
                  type="text"
                  placeholder="Cidade"
                  value={config.pix_cidade}
                  onChange={(e) => setConfig({ ...config, pix_cidade: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
              </div>
              <input
                type="text"
                placeholder="WhatsApp de suporte (com DDD)"
                value={config.whatsapp}
                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
              <button
                onClick={salvarConfig}
                className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-teal-700"
              >
                {salvo ? <Check size={14} /> : <Save size={14} />}
                {salvo ? "Salvo!" : "Salvar"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h3 className="text-xs font-semibold">Pagamentos pendentes ({pendentes.length})</h3>
            {carregando ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
                <Loader2 size={14} className="animate-spin" /> Carregando...
              </p>
            ) : pendentes.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-500">Nenhum pagamento aguardando confirmação.</p>
            ) : (
              <ul className="mt-2 divide-y divide-neutral-100">
                {pendentes.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {p.profissionais?.nome || "Profissional"}
                        <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                          {PLANOS[p.plano as keyof typeof PLANOS]?.nome || p.plano}
                        </span>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {p.profissionais?.slug || "—"} · {p.frequencia} · R$ {p.valor.toFixed(2).replace(".", ",")} ·{" "}
                        {new Date(p.criado_em).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <button
                      onClick={() => confirmar(p.id)}
                      disabled={confirmando === p.id}
                      className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {confirmando === p.id ? "Confirmando..." : "Confirmar pago"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {msg && (
          <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
            {msg}
          </div>
        )}

        {historico.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-gray-50 text-left text-xs font-medium text-neutral-500">
                  <th className="px-3 py-2">Profissional</th>
                  <th className="px-3 py-2">Plano</th>
                  <th className="px-3 py-2">Freq.</th>
                  <th className="px-3 py-2">Valor</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Pago em</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-3 py-2 text-sm">{p.profissionais?.nome || "—"}</td>
                    <td className="px-3 py-2 text-sm">{PLANOS[p.plano as keyof typeof PLANOS]?.nome || p.plano}</td>
                    <td className="px-3 py-2 text-sm capitalize">{p.frequencia}</td>
                    <td className="px-3 py-2 text-sm">R$ {p.valor.toFixed(2).replace(".", ",")}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "pago" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {p.status === "pago" ? "Pago" : "Cancelado"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-neutral-500">
                      {p.pago_em ? new Date(p.pago_em).toLocaleString("pt-BR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
