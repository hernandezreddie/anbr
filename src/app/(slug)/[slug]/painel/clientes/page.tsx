"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { linkWhatsApp } from "@/lib/whatsapp";
import { Search, Trash2, MessageCircle, MapPin } from "lucide-react";

type ClienteResumo = {
  nome: string;
  whatsapp: string;
  total: number;
  ultimo: string;
};

export default function ClientesPage() {
  const [items, setItems] = useState<ClienteResumo[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmar, setConfirmar] = useState<ClienteResumo | null>(null);
  const [busy, setBusy] = useState(false);
  const [aviso, setAviso] = useState("");

  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("agendamentos")
      .select("cliente_nome, cliente_whatsapp, data")
      .not("cliente_nome", "is", null)
      .order("data", { ascending: false });
    if (!data) { setLoading(false); return; }

    const map = new Map<string, { total: number; ultimo: string; whatsapp: string }>();
    for (const row of data as { cliente_nome: string; cliente_whatsapp: string | null; data: string | null }[]) {
      const key = row.cliente_nome.trim().toLowerCase();
      if (!key) continue;
      const existente = map.get(key);
      if (existente) {
        existente.total++;
        if (row.data && row.data > existente.ultimo) existente.ultimo = row.data;
      } else {
        map.set(key, {
          total: 1,
          ultimo: row.data ?? "",
          whatsapp: row.cliente_whatsapp ?? "",
        });
      }
    }

    const clientes = Array.from(map.entries()).map(([key, v]) => ({
      nome: key.charAt(0).toUpperCase() + key.slice(1),
      whatsapp: v.whatsapp,
      total: v.total,
      ultimo: v.ultimo,
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
          {filtrados.map((c) => (
            <div key={c.nome} className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-paper p-5">
              <div className="min-w-0">
                <p className="font-serif text-lg font-semibold text-ink">{c.nome}</p>
                <p className="mt-1 text-xs text-ink-mute">{c.total} reserva(s)</p>
                {c.ultimo && (
                  <p className="text-xs text-ink-mute">
                    Última: {new Date(c.ultimo + "T12:00:00").toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {c.whatsapp && (
                  <a
                    href={linkWhatsApp(`Olá ${c.nome}!`, c.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366] text-white transition-opacity hover:opacity-90"
                    aria-label={`WhatsApp de ${c.nome}`}
                  >
                    <MessageCircle size={18} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}