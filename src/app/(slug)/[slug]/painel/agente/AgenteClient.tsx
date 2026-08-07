"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Send, MessageSquare, BarChart3, Clock, Gauge } from "lucide-react";
import { AGENTE_MSG_POR_MES } from "@/lib/planos";
import { StatusAgente } from "@/components/painel/StatusAgente";

interface Props {
  profissionalId: string
  slug: string
}

export function AgenteClient({ profissionalId }: Props) {
  const [tab, setTab] = useState<"chat" | "conversas" | "uso">("chat");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Agent</h1>
          <p className="mt-1 text-sm text-gray-500">Assistente inteligente para seus clientes</p>
        </div>
      </div>

      <StatusAgente profissionalId={profissionalId} />
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1">
        {[
          { id: "chat" as const, label: "Chat", icon: Bot },
          { id: "conversas" as const, label: "Conversas", icon: MessageSquare },
          { id: "uso" as const, label: "Uso & Custos", icon: BarChart3 },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === t.id ? "bg-teal-600 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "chat" && <ChatView profissionalId={profissionalId} />}
      {tab === "conversas" && <ConversasView profissionalId={profissionalId} />}
      {tab === "uso" && <UsageView profissionalId={profissionalId} />}
    </div>
  );
}

function ChatView({ profissionalId }: { profissionalId: string }) {
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/agent/config?profissional_id=${profissionalId}`)
      .then((r) => r.json())
      .then((d) => setConfig(d.config));
  }, [profissionalId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const send = async () => {
    if (!msg.trim()) return;
    const userMsg = msg;
    setMsg("");
    setHistory((h) => [...h, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 75_000);
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profissional_id: profissionalId,
          mensagem: userMsg,
          historico: history.filter((h) => h.role !== "system"),
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      if (data.resposta) {
        setHistory((h) => [...h, { role: "assistant", content: data.resposta }]);
      } else if (data.error) {
        setHistory((h) => [...h, { role: "assistant", content: `⚠️ ${data.error}` }]);
      } else {
        setHistory((h) => [...h, { role: "assistant", content: "⚠️ O agente não retornou resposta. Verifique a chave de API em Status do Agente." }]);
      }
    } catch (e: any) {
      setHistory((h) => [
        ...h,
        {
          role: "assistant",
          content:
            e?.name === "AbortError"
              ? "⚠️ O agente demorou demais para responder. Tente novamente."
              : "⚠️ Erro ao conectar com o agente",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-teal-600" />
          <h3 className="font-semibold">
            {config?.enabled ? "Agente Ativo" : "Agente Inativo"}
          </h3>
          {config && (
            <span className="ml-auto text-xs text-gray-400">
              Modelo: {config.model} · Tools: {(config.tools_enabled || []).join(", ") || "nenhuma"}
            </span>
          )}
        </div>
      </div>

      <div className="h-[400px] space-y-3 overflow-y-auto p-6">
        {history.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Bot size={48} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm text-gray-400">
                {config?.enabled
                  ? "Pergunte algo sobre seus agendamentos, serviços ou clientes"
                  : "Agente desativado. Fale com o admin para ativar."}
              </p>
            </div>
          </div>
        )}
        {history.map((h, i) => (
          <div
            key={i}
            className={`flex ${h.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                h.role === "user"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {h.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
              <span className="animate-pulse">Pensando...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex gap-3">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Digite sua mensagem..."
            disabled={loading || !config?.enabled}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500 disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={loading || !msg.trim() || !config?.enabled}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            <Send size={16} />
            Enviar
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          As conversas são registradas para análise. Use este chat para testar o agente.
        </p>
      </div>
    </div>
  );
}

function ConversasView({ profissionalId }: { profissionalId: string }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/agent/conversations?profissional_id=${profissionalId}`)
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .finally(() => setLoading(false));
  }, [profissionalId]);

  const loadMessages = async (convId: string) => {
    setSelected(convId);
    const res = await fetch(`/api/agent/conversations/${convId}`);
    const data = await res.json();
    setMessages(data.messages || []);
  };

  if (loading) {
    return <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">Carregando...</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold">
            Conversas Recentes
            <span className="ml-2 text-sm font-normal text-gray-400">({conversations.length})</span>
          </h3>
        </div>
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Nenhuma conversa ainda</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => loadMessages(conv.id)}
                className={`flex w-full items-center gap-4 px-6 py-4 text-left text-sm hover:bg-gray-50 ${
                  selected === conv.id ? "bg-teal-50" : ""
                }`}
              >
                <MessageSquare size={18} className="shrink-0 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {conv.customer_name || `Cliente via ${conv.channel}`}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="capitalize">{conv.channel}</span>
                    <span>{conv.message_count} msgs</span>
                    <Clock size={12} />
                    <span>{new Date(conv.updated_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    conv.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {conv.status === "active" ? "Ativa" : "Fechada"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold">{selected ? "Mensagens" : "Selecione uma conversa"}</h3>
        </div>
        <div className="max-h-[500px] space-y-3 overflow-y-auto p-4">
          {selected === null && (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">
              Clique em uma conversa à esquerda
            </div>
          )}
          {messages.length === 0 && selected && (
            <div className="text-center text-sm text-gray-400">Nenhuma mensagem nesta conversa</div>
          )}
          {messages.map((m: any) => (
            <div
              key={m.id}
              className={`rounded-xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-blue-50 border border-blue-100"
                  : m.role === "assistant"
                    ? "bg-gray-50 border border-gray-100"
                    : "bg-yellow-50 border border-yellow-100"
              }`}
            >
              <span className="text-xs font-medium text-gray-400 uppercase">{m.role}</span>
              <p className="mt-0.5">{m.content}</p>
              {m.tokens_input > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  Tokens: {m.tokens_input} in / {m.tokens_output} out · Modelo: {m.model}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UsageView({ profissionalId }: { profissionalId: string }) {
  const [usage, setUsage] = useState<any>(null);
  const [plano, setPlano] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/agent/usage?profissional_id=${profissionalId}&period=30d`).then((r) => r.json()),
      fetch("/api/planos/me").then((r) => r.json()),
    ])
      .then(([u, p]) => {
        setUsage(u);
        setPlano(p && !p.error ? p : null);
      })
      .finally(() => setLoading(false));
  }, [profissionalId]);

  if (loading) {
    return <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">Carregando...</div>;
  }

  const limite = plano ? AGENTE_MSG_POR_MES[plano.plano as keyof typeof AGENTE_MSG_POR_MES] || 0 : 0;

  const agora = new Date();
  const mesAtual = usage?.usage?.filter((r: any) => {
    const d = new Date(r.date);
    return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
  });
  const msgsMes = (mesAtual || []).reduce((s: number, r: any) => s + (r.messages || 0), 0);
  const pctCota = limite > 0 ? Math.min(100, Math.round((msgsMes / limite) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BarChart3 size={16} />
            Tokens Input
          </div>
          <p className="mt-2 text-3xl font-bold">{(usage?.totals?.tokens_input || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BarChart3 size={16} />
            Tokens Output
          </div>
          <p className="mt-2 text-3xl font-bold">{(usage?.totals?.tokens_output || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MessageSquare size={16} />
            Mensagens (30d)
          </div>
          <p className="mt-2 text-3xl font-bold">{usage?.totals?.messages || 0}</p>
        </div>
      </div>

      {limite > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Gauge size={16} />
            Cota de IA do mês
          </div>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-bold">
              {msgsMes}
              <span className="text-base font-normal text-gray-400"> / {limite} mensagens</span>
            </p>
            <span className={`text-sm font-semibold ${pctCota >= 90 ? "text-red-600" : pctCota >= 70 ? "text-amber-600" : "text-teal-600"}`}>
              {pctCota}%
            </span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${pctCota >= 90 ? "bg-red-500" : pctCota >= 70 ? "bg-amber-500" : "bg-teal-500"}`}
              style={{ width: `${Math.max(4, pctCota)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Seu plano inclui {limite} mensagens de IA por mês. Para mais, faça upgrade no menu &ldquo;Meu Plano&rdquo;.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold">Histórico (30d)</h3>
        </div>
        {(!usage?.usage || usage.usage.length === 0) ? (
          <div className="p-8 text-center text-sm text-gray-400">Sem dados de uso nos últimos 30 dias</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500">
                  <th className="px-5 py-3">Data</th>
                  <th className="px-5 py-3">Tokens In</th>
                  <th className="px-5 py-3">Tokens Out</th>
                  <th className="px-5 py-3">Msgs</th>
                </tr>
              </thead>
              <tbody>
                {usage.usage.map((row: any) => (
                  <tr key={row.id} className="border-b border-gray-100 text-sm last:border-0 hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium">{new Date(row.date).toLocaleDateString("pt-BR")}</td>
                    <td className="px-5 py-3">{row.tokens_input?.toLocaleString() || 0}</td>
                    <td className="px-5 py-3">{row.tokens_output?.toLocaleString() || 0}</td>
                    <td className="px-5 py-3">{row.messages || 0}</td>
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
