"use client";

import { useState, useEffect } from "react";

interface Props {
  profissional: any
  config: any
  docs: any[]
}

export function AgentConfigClient({ profissional, config: initialConfig, docs: initialDocs }: Props) {
  const [config, setConfig] = useState(initialConfig || {
    enabled: false,
    system_prompt: "",
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 4096,
    tools_enabled: [],
    connectors: {},
  });
  const [docs, setDocs] = useState(initialDocs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"config" | "docs" | "chats" | "usage">("config");
  const [uploading, setUploading] = useState(false);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/agent/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profissional_id: profissional.id, ...config }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleTool = (tool: string) => {
    setConfig((prev: any) => ({
      ...prev,
      tools_enabled: prev.tools_enabled?.includes(tool)
        ? prev.tools_enabled.filter((t: string) => t !== tool)
        : [...(prev.tools_enabled || []), tool],
    }));
  };

  const toggleConnector = (conn: string) => {
    setConfig((prev: any) => ({
      ...prev,
      connectors: { ...prev.connectors, [conn]: !prev.connectors?.[conn] },
    }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("profissional_id", profissional.id);
      const res = await fetch("/api/agent/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setDocs((prev: any) => [data.doc, ...prev]);
      } else {
        alert(data.error || "Erro ao fazer upload");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const deleteDoc = async (docId: string) => {
    if (!confirm("Excluir documento da base de conhecimento?")) return;
    const res = await fetch(`/api/agent/docs/${docId}`, { method: "DELETE" });
    if (res.ok) {
      setDocs((prev: any[]) => prev.filter((d) => d.id !== docId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("config")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "config" ? "bg-teal-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              Config
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "docs" ? "bg-teal-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              Base {docs.length > 0 && `(${docs.length})`}
            </button>
            <button
              onClick={() => setActiveTab("chats")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "chats" ? "bg-teal-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              Conversas
            </button>
            <button
              onClick={() => setActiveTab("usage")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "usage" ? "bg-teal-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              Custos
            </button>
          </div>
        </div>

        <button
          onClick={saveConfig}
          disabled={saving}
          className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all ${
            saved ? "bg-teal-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Config"}
        </button>
      </div>

      {activeTab === "config" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold">Status do Agente</h3>
            <label className="mt-3 flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <span className="font-medium">Agente ativo</span>
                <p className="text-sm text-gray-500">Quando ativo, o AI Agent responde automaticamente</p>
              </div>
            </label>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold">System Prompt</h3>
            <p className="mt-1 text-sm text-gray-500">
              Instruções que definem a personalidade e regras do agente
            </p>
            <textarea
              value={config.system_prompt}
              onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
              rows={10}
              className="mt-3 w-full rounded-xl border border-gray-200 p-4 font-mono text-sm outline-none focus:border-blue-500"
              placeholder="Ex: Você é um assistente de agendamento da empresa X. Ajude clientes a agendar serviços, responder dúvidas sobre preços e horários. Seja educado e responda em português."
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <label className="text-sm font-medium text-gray-500">Modelo</label>
              <select
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="gpt-4o-mini">GPT-4o Mini ($0.15/$0.60)</option>
                <option value="gpt-4o">GPT-4o ($2.50/$10)</option>
                <option value="gpt-4.1-mini">GPT-4.1 Mini ($0.40/$1.60)</option>
              </select>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <label className="text-sm font-medium text-gray-500">Temperatura</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <span className="w-8 text-sm font-medium">{config.temperature}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <label className="text-sm font-medium text-gray-500">Max Tokens</label>
              <select
                value={config.max_tokens}
                onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value={2048}>2.048</option>
                <option value={4096}>4.096</option>
                <option value={8192}>8.192</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">MCP Tools</h3>
            <p className="mb-4 text-sm text-gray-500">
              Ferramentas que o AI Agent pode usar para acessar dados e agendar serviços
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { id: "database", label: "Base de Dados", desc: "Consultar agendamentos, serviços e clientes" },
                { id: "google_calendar", label: "Google Calendar", desc: "Verificar disponibilidade e criar eventos" },
                { id: "knowledge_base", label: "Base de Conhecimento", desc: "Buscar respostas nos documentos enviados" },
              ].map((tool) => (
                <label key={tool.id} className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 hover:border-blue-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.tools_enabled?.includes(tool.id)}
                    onChange={() => toggleTool(tool.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <div>
                    <span className="font-medium">{tool.label}</span>
                    <p className="text-xs text-gray-500">{tool.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Google Calendar</h3>
            <p className="mb-4 text-sm text-gray-500">
              Conecte o Google Calendar para verificar disponibilidade e criar eventos automaticamente
            </p>
            <GoogleCalendarConnect profissionalId={profissional.id} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Conectores</h3>
            <p className="mb-4 text-sm text-gray-500">
              Canais onde o AI Agent vai atender clientes
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { id: "whatsapp", label: "WhatsApp", desc: "Atender via WhatsApp", via: "Evolution API" },
                { id: "instagram", label: "Instagram DM", desc: "Atender via Instagram", via: "Meta API" },
                { id: "facebook", label: "Facebook Messenger", desc: "Atender via Messenger", via: "Meta API" },
              ].map((conn) => (
                <label key={conn.id} className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 hover:border-teal-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.connectors?.[conn.id]}
                    onChange={() => toggleConnector(conn.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600"
                  />
                  <div>
                    <span className="font-medium">{conn.label}</span>
                    <p className="text-xs text-gray-500">{conn.desc}</p>
                    <p className="text-xs text-gray-400">via {conn.via}</p>
                  </div>
                </label>
              ))}
            </div>
            {config.connectors?.whatsapp && (
              <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4">
                <WhatsAppConnect profissionalId={profissional.id} />
              </div>
            )}
            {(config.connectors?.instagram || config.connectors?.facebook) && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <MetaConnect profissionalId={profissional.id} />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="mb-2 text-lg font-semibold">Testar Agente</h3>
            <p className="mb-4 text-sm text-gray-500">Envie uma mensagem de teste para ver como o agente responde</p>
            <AgentTestChat profissionalId={profissional.id} />
          </div>
        </div>
      )}

      {activeTab === "docs" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Upload de Documentos</h3>
            <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 hover:border-teal-400">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  {uploading ? "Processando..." : "Clique para enviar PDF, DOCX ou TXT"}
                </p>
                <p className="mt-1 text-xs text-gray-400">O sistema vai extrair o texto, chunkear e indexar para RAG</p>
              </div>
              <input type="file" accept=".pdf,.docx,.txt" onChange={handleUpload} disabled={uploading} className="hidden" />
            </label>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="font-semibold">Documentos Indexados ({docs.length})</h3>
            </div>
            {docs.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">Nenhum documento enviado ainda</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {docs.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
                        {doc.type === "pdf" ? "📄" : doc.type === "docx" ? "📝" : "📃"}
                      </div>
                      <div>
                        <p className="font-medium">{doc.filename}</p>
                        <p className="text-xs text-gray-400">
                          {doc.chunk_count} chunks · ~{Math.round(doc.token_count / 100) * 100} tokens
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDoc(doc.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "chats" && <AgentConversationsView profissionalId={profissional.id} />}

      {activeTab === "usage" && <AgentUsageView profissionalId={profissional.id} />}
    </div>
  );
}

function WhatsAppConnect({ profissionalId }: { profissionalId: string }) {
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ instance_name: "", evolution_api_url: "", evolution_api_key: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch(`/api/whatsapp/instance?profissional_id=${profissionalId}`)
      .then((r) => r.json())
      .then((d) => { setInstance(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [profissionalId]);

  const createInstance = async () => {
    if (!form.instance_name || !form.evolution_api_url || !form.evolution_api_key) {
      alert("Preencha todos os campos");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/whatsapp/instance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profissional_id: profissionalId, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setInstance((prev: any) => ({ ...prev, configured: true, ...form }));
      } else {
        alert(data.error || "Erro ao criar instância");
      }
    } finally {
      setCreating(false);
    }
  };

  const deleteInstance = async () => {
    if (!confirm("Desconectar WhatsApp?")) return;
    await fetch("/api/whatsapp/instance", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profissional_id: profissionalId }),
    });
    setInstance({ configured: false });
  };

  const refreshQR = async () => {
    const res = await fetch(`/api/whatsapp/instance?profissional_id=${profissionalId}`);
    const d = await res.json();
    setInstance(d);
  };

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;

  if (instance?.configured) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm text-white ${instance.connection_status === "open" ? "bg-green-500" : "bg-yellow-500"}`}>
            {instance.connection_status === "open" ? "✓" : "?"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Instância: {instance.instance_name}</p>
            <p className="text-xs text-gray-500">Status: {instance.connection_status} {instance.phone_number && `· ${instance.phone_number}`}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={refreshQR} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50">Atualizar QR</button>
            <button onClick={deleteInstance} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">Desconectar</button>
          </div>
        </div>
        {instance.qrCode && (
          <div className="rounded-lg bg-white p-3 text-center">
            <p className="mb-2 text-xs font-medium text-gray-600">Escaneie o QR Code com o WhatsApp:</p>
            <pre className="overflow-auto rounded bg-gray-100 p-2 font-mono text-xs">{instance.qrCode}</pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Configure a Evolution API para conectar o WhatsApp:</p>
      <input
        value={form.instance_name}
        onChange={(e) => setForm({ ...form, instance_name: e.target.value })}
        placeholder="Nome da instância (ex: anbr-caridad)"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
      <input
        value={form.evolution_api_url}
        onChange={(e) => setForm({ ...form, evolution_api_url: e.target.value })}
        placeholder="URL da Evolution API (ex: https://evo.seudominio.com)"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
      <input
        value={form.evolution_api_key}
        onChange={(e) => setForm({ ...form, evolution_api_key: e.target.value })}
        placeholder="API Key da Evolution API"
        type="password"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
      <button
        onClick={createInstance}
        disabled={creating}
        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {creating ? "Criando..." : "Criar Instância"}
      </button>
    </div>
  );
}

function MetaConnect({ profissionalId }: { profissionalId: string }) {
  const [status, setStatus] = useState<{ connected: boolean; page_name?: string; instagram_name?: string; loading?: boolean }>({ connected: false });

  useEffect(() => {
    fetch(`/api/meta/auth?profissional_id=${profissionalId}`)
      .then((r) => r.json())
      .then((d) => setStatus({ ...d, loading: false }))
      .catch(() => setStatus({ connected: false, loading: false }));
  }, [profissionalId]);

  const connect = async () => {
    const res = await fetch("/api/meta/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profissional_id: profissionalId }),
    });
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  };

  if (status.connected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm">✓</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-700">
            Conectado: {status.page_name}
          </p>
          {status.instagram_name && <p className="text-xs text-gray-500">Instagram: {status.instagram_name}</p>}
        </div>
      </div>
    );
  }

  return (
    <button onClick={connect} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 hover:border-blue-300 w-full">
      <span className="text-lg">🔵</span>
      <div className="text-left">
        <p className="text-sm font-medium">Conectar Facebook / Instagram</p>
        <p className="text-xs text-gray-500">Autorizar com Meta para Messenger e Instagram DM</p>
      </div>
    </button>
  );
}

function GoogleCalendarConnect({ profissionalId }: { profissionalId: string }) {
  const [status, setStatus] = useState<{ connected: boolean; email?: string; loading?: boolean }>({ connected: false });

  useEffect(() => {
    fetch(`/api/google/auth?profissional_id=${profissionalId}`)
      .then((r) => r.json())
      .then((d) => setStatus({ ...d, loading: false }))
      .catch(() => setStatus({ connected: false, loading: false }));
  }, [profissionalId]);

  const connect = async () => {
    const res = await fetch("/api/google/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profissional_id: profissionalId }),
    });
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  };

  const disconnect = async () => {
    if (!confirm("Desconectar Google Calendar?")) return;
    await fetch("/api/google/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profissional_id: profissionalId }),
    });
    setStatus({ connected: false });
  };

  if (status.connected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 text-lg">✓</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-green-700">Conectado</p>
          {status.email && <p className="text-xs text-gray-500">{status.email}</p>}
        </div>
        <button onClick={disconnect} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
        <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.1 12c0-.8-.1-1.6-.3-2.4H12v4.6h5.2c-.2 1.2-.9 2.2-2 2.9v2.4h3.2c1.9-1.7 3-4.2 3-7.5z"/><path fill="#34A853" d="M12 22c2.7 0 5-1 6.7-2.6l-3.2-2.4c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.8v2.5C4.5 19.9 8 22 12 22z"/><path fill="#FBBC04" d="M6.2 13.7c-.2-.6-.3-1.2-.3-1.7s.1-1.1.3-1.7V7.8H2.8C2 9.3 1.5 10.8 1.5 12s.5 2.7 1.3 4.2l3.4-2.5z"/><path fill="#EA4335" d="M12 5.4c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 2.2 14.7 1 12 1 8 1 4.5 3.1 2.8 7l3.4 2.5c.8-2.5 3.1-4.1 5.8-4.1z"/></svg>
      </div>
      <div>
        <p className="text-sm font-medium">Conectar Google Calendar</p>
        <p className="text-xs text-gray-500">Autorizar acesso para verificar disponibilidade e criar eventos</p>
      </div>
    </button>
  );
}

function AgentTestChat({ profissionalId }: { profissionalId: string }) {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState<{ role: string; content: string; id?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [saving, setSaving] = useState(true);

  useEffect(() => {
    if (!saving && !convId) {
      fetch("/api/agent/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profissional_id: profissionalId, channel: "web_test" }),
      }).then(r => r.json()).then(d => {
        if (d.id) setConvId(d.id);
      }).catch(() => {});
    }
    setSaving(false);
  }, [saving, profissionalId, convId]);

  const saveMessage = async (role: string, content: string) => {
    if (!convId) return;
    await fetch(`/api/agent/conversations/${convId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, content, profissional_id: profissionalId }),
    }).catch(() => {});
  };

  const send = async () => {
    if (!msg.trim()) return;
    const userMsg = msg;
    setMsg("");
    setHistory((h) => [...h, { role: "user", content: userMsg }]);
    setLoading(true);
    saveMessage("user", userMsg);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profissional_id: profissionalId,
          mensagem: userMsg,
          historico: history.filter((h) => h.role !== "system"),
        }),
      });
      const data = await res.json();
      if (data.resposta) {
        setHistory((h) => [...h, { role: "assistant", content: data.resposta }]);
        saveMessage("assistant", data.resposta);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-3 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
        {history.length === 0 && (
          <p className="text-center text-sm text-gray-400">Digite algo para testar o agente</p>
        )}
        {history.map((h, i) => (
          <div key={i} className={`rounded-lg px-3 py-2 text-sm ${h.role === "user" ? "bg-blue-100 text-right" : "bg-white"}`}>
            <span className="text-xs font-medium text-gray-400">{h.role === "user" ? "Você" : "Agente"}:</span>
            <p>{h.content}</p>
          </div>
        ))}
        {loading && <p className="text-center text-sm text-gray-400">Agente pensando...</p>}
      </div>
      <div className="flex gap-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Digite uma mensagem..."
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        />
        <button
          onClick={send}
          disabled={loading || !msg.trim()}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

function AgentConversationsView({ profissionalId }: { profissionalId: string }) {
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

  if (loading) return <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-400">Carregando...</div>;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold">Conversas ({conversations.length})</h3>
        </div>
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">Nenhuma conversa ainda</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => loadMessages(conv.id)}
                className={`w-full px-6 py-3 text-left text-sm hover:bg-gray-50 ${
                  selected === conv.id ? "bg-blue-50" : ""
                }`}
              >
                <p className="font-medium">
                  {conv.customer_name || `via ${conv.channel}`} · {conv.message_count} msgs
                </p>
                <p className="text-xs text-gray-400">
                  {conv.channel} · {new Date(conv.updated_at).toLocaleString("pt-BR")}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold">{selected ? "Mensagens" : "Selecione uma conversa"}</h3>
        </div>
        <div className="max-h-96 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && selected && (
            <p className="text-center text-sm text-gray-400">Nenhuma mensagem</p>
          )}
          {messages.map((m: any) => (
            <div key={m.id} className={`rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-blue-100" : m.role === "assistant" ? "bg-gray-100" : "bg-yellow-50"}`}>
              <span className="text-xs font-medium text-gray-400">{m.role}</span>
              <p className="mt-0.5">{m.content}</p>
              {(m.tokens_input > 0 || m.tokens_output > 0) && (
                <p className="mt-1 text-xs text-gray-400">tokens: {m.tokens_input} in / {m.tokens_output} out</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentUsageView({ profissionalId }: { profissionalId: string }) {
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/agent/usage?profissional_id=${profissionalId}`)
      .then((r) => r.json())
      .then(setUsage)
      .finally(() => setLoading(false));
  }, [profissionalId]);

  if (loading) return <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-400">Carregando...</div>;
  if (!usage) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Tokens Input</p>
          <p className="mt-1 text-2xl font-bold">{usage.totals?.tokens_input?.toLocaleString() || 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Tokens Output</p>
          <p className="mt-1 text-2xl font-bold">{usage.totals?.tokens_output?.toLocaleString() || 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Mensagens</p>
          <p className="mt-1 text-2xl font-bold">{usage.totals?.messages || 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Custo Total</p>
          <p className="mt-1 text-2xl font-bold">${usage.totals?.cost?.toFixed(2) || "0.00"}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold">Histórico Diário</h3>
        </div>
        {usage.usage?.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">Sem dados de uso ainda</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-sm font-medium text-gray-500">
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3">Tokens In</th>
                <th className="px-5 py-3">Tokens Out</th>
                <th className="px-5 py-3">Msgs</th>
                <th className="px-5 py-3">Custo</th>
              </tr>
            </thead>
            <tbody>
              {usage.usage.map((row: any) => (
                <tr key={row.id} className="border-b border-gray-100 text-sm last:border-0">
                  <td className="px-5 py-3">{row.date}</td>
                  <td className="px-5 py-3">{row.tokens_input?.toLocaleString() || 0}</td>
                  <td className="px-5 py-3">{row.tokens_output?.toLocaleString() || 0}</td>
                  <td className="px-5 py-3">{row.messages || 0}</td>
                  <td className="px-5 py-3 font-medium">${Number(row.cost || 0).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
