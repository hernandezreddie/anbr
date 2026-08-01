"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { linkWhatsApp } from "@/lib/whatsapp";
import { Search, MessageCircle, Sparkles } from "lucide-react";
import { Dica } from "@/components/painel/Dica";
import { obterEtapaCliente, type HistoricoCliente } from "@/lib/etapas-cliente";

type ClienteResumo = {
  nome: string;
  whatsapp: string;
  total: number;
  ultimo: string;
  historico: HistoricoCliente[];
};

export default function ClientesPage() {
  const [items, setItems] = useState<ClienteResumo[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [aviso, setAviso] = useState("");

  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("agendamentos")
      .select("cliente_nome, cliente_whatsapp, data, status")
      .not("cliente_nome", "is", null)
      .order("data", { ascending: false });
    if (!data) { setLoading(false); return; }

    const map = new Map<string, { total: number; ultimo: string; whatsapp: string; historico: { data: string | null; status: string | null }[] }>();
    for (const row of data as { cliente_nome: string; cliente_whatsapp: string | null; data: string | null; status: string | null }[]) {
      const key = row.cliente_nome.trim().toLowerCase();
      if (!key) continue;
      const existente = map.get(key);
      if (existente) {
        existente.total++;
        existente.historico.push({ data: row.data, status: row.status });
        if (row.data && row.data > existente.ultimo) existente.ultimo = row.data;
      } else {
        map.set(key, {
          total: 1,
          ultimo: row.data ?? "",
          whatsapp: row.cliente_whatsapp ?? "",
          historico: [{ data: row.data, status: row.status }],
        });
      }
    }

    const clientes = Array.from(map.entries()).map(([key, v]) => ({
      nome: key.charAt(0).toUpperCase() + key.slice(1),
      whatsapp: v.whatsapp,
      total: v.total,
      ultimo: v.ultimo,
      historico: v.historico as HistoricoCliente[],
    }));
    setItems(clientes);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const flash = (m: string) => {
    setAviso(m);
    setTimeout(() => setAviso(""), 2500);
  };

  const filtrados = items.filter((c) =>
    c.nome.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      {aviso && (
        <div className="mb-4">
          <p className="rounded-xl bg-teal-50 px-4 py-2.5 text-sm text-teal-800">{aviso}</p>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <p className="mt-1 text-ink-soft">{items.length} cliente(s) no total</p>
      </div>

      <div className="mb-6">
        <Dica>
          Cada cliente mostra em que etapa está e o <strong>próximo passo sugerido</strong>.
          Toque no botão verde para mandar a mensagem pronta no WhatsApp.
        </Dica>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome…"
          className="w-full rounded-xl border border-line bg-paper py-3 pl-10 pr-4 text-sm text-ink outline-none focus:border-teal-600"
        />
      </div>

      {loading ? (
        <p className="text-sm text-ink-mute">Carregando…</p>
      ) : filtrados.length === 0 ? (
        <p className="text-sm text-ink-mute">Nenhum cliente ainda. Eles aparecem aqui quando reservam pelo site.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtrados.map((c) => {
            const etapa = obterEtapaCliente(c.historico, c.nome.split(" ")[0]);
            return (
              <div key={c.nome} className="rounded-2xl border border-line bg-paper p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-serif text-lg font-semibold text-ink">{c.nome}</p>
                    <p className="mt-1 text-xs text-ink-mute">{c.total} reserva(s)</p>
                    {c.ultimo && (
                      <p className="text-xs text-ink-mute">
                        Última: {new Date(c.ultimo + "T12:00:00").toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${etapa.cor}`}>
                    {etapa.nome}
                  </span>
                </div>

                <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50/50 p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-teal-700">
                    <Sparkles size={12} /> Próximo passo
                  </p>
                  <p className="mt-0.5 text-xs text-teal-900">{etapa.proximoPasso}</p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-ink-mute">{etapa.descricao}</p>
                  {c.whatsapp && (
                    <a
                      href={linkWhatsApp(etapa.mensagemSugerida, c.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      <MessageCircle size={14} /> Enviar mensagem
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
