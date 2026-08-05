"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { getAgentPrompt, TONS_ATENDIMENTO } from "@/lib/agent-prompts";
import { getCategoriaPadrao } from "@/lib/servicos-padrao";
import { StatusAgente } from "@/components/painel/StatusAgente";

interface Props {
  profissional: any
  config: any
  docs: any[]
}

const MODELOS = [
  { grupo: "OpenAI", id: "gpt-4o-mini", nome: "GPT-4o Mini", desc: "Rápido e barato — ótimo para começar", badge: "Recomendado" },
  { grupo: "OpenAI", id: "gpt-4.1-mini", nome: "GPT-4.1 Mini", desc: "Bom equilíbrio entre custo e qualidade" },
  { grupo: "OpenAI", id: "gpt-4o", nome: "GPT-4o", desc: "Mais inteligente da OpenAI" },
  { grupo: "Anthropic", id: "claude-sonnet-4-20250514", nome: "Claude Sonnet 4", desc: "Ótimo em conversas naturais" },
  { grupo: "Anthropic", id: "claude-haiku-3-5-20241022", nome: "Claude Haiku 3.5", desc: "Rápido e econômico" },
  { grupo: "Google", id: "gemini-1.5-flash", nome: "Gemini Flash 1.5", desc: "Grátis para testar — precisa de API key do Google" },
  { grupo: "Google", id: "gemini-2.5-flash", nome: "Gemini Flash 2.5", desc: "Mais novo e barato — com tool-calling", badge: "Recomendado Google" },
  { grupo: "OpenRouter", id: "openai/gpt-4o-mini", nome: "GPT-4o Mini (via OpenRouter)", desc: "Funciona com API key do OpenRouter" },
  { grupo: "OpenRouter", id: "deepseek/deepseek-chat", nome: "DeepSeek Chat", desc: "Rápido, barato e ótimo para Portugal/PT-BR" },
  { grupo: "OpenRouter", id: "meta-llama/llama-3.1-8b-instruct:free", nome: "Llama 3.1 8B (grátis)", desc: "Modelo gratuito do OpenRouter para testar", badge: "Grátis" },
]

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
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    const saved = (initialConfig as any)?.api_keys || {};
    return { gemini: "", openai: "", anthropic: "", openrouter: "", ...Object.fromEntries(Object.entries(saved).map(([k, v]) => [k, v as string])) };
  });
  const [chavesSalvas, setChavesSalvas] = useState<Record<string, boolean>>({});
  const [mostrarChaves, setMostrarChaves] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"config" | "docs" | "chats" | "usage">("config");
  const [uploading, setUploading] = useState(false);
  const [tomPrompt, setTomPrompt] = useState("equilibrado");

  useEffect(() => {
    const saved = (initialConfig as any)?.api_keys || {};
    setChavesSalvas({
      gemini: !!saved.gemini,
      openai: !!saved.openai,
      anthropic: !!saved.anthropic,
      openrouter: !!saved.openrouter,
    });
  }, [initialConfig]);

  const applyPromptPronto = () => {
    const prompt = getAgentPrompt(profissional?.categoria, tomPrompt)
      .replace(/\{nome\}/g, profissional?.nome || "seu negócio")
      .replace(/\{cidade\}/g, profissional?.cidade || "sua cidade");
    setConfig({ ...config, system_prompt: prompt });
    setSaved(false);
  };

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

  const salvarChaves = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/agent/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profissional_id: profissional.id,
          api_keys: Object.fromEntries(Object.entries(apiKeys).filter(([, v]) => v?.trim())),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setChavesSalvas({ gemini: !!apiKeys.gemini, openai: !!apiKeys.openai, anthropic: !!apiKeys.anthropic, openrouter: !!apiKeys.openrouter });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert(data.error || "Erro ao salvar chaves");
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
      {/* Botão flutuante: sempre visível em tela para salvar a configuração */}
      <button
        onClick={saveConfig}
        disabled={saving}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all ${
          saved ? "bg-teal-500" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        <CheckCircle size={18} />
        {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Configuração"}
      </button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("config")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "config" ? "bg-teal-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Configuração
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "docs" ? "bg-teal-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Base de conhecimento {docs.length > 0 && `(${docs.length})`}
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

      {activeTab === "config" && (
        <div className="space-y-6">
          <StatusAgente profissionalId={profissional.id} titulo="Diagnóstico do AI Agent" />
          {/* PASSO 1 — Ligar o atendente */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">1</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Ligar o atendente</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Ao ativar, o assistente responde automaticamente pelos canais conectados abaixo.
                </p>
                <label className="mt-3 flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className={`font-medium ${config.enabled ? "text-teal-700" : "text-gray-500"}`}>
                    {config.enabled ? "Atendente ligado" : "Atendente desligado"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* PASSO 2 — Personalidade */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">2</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Personalidade do atendente</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Como ele deve falar com seus clientes. Escolha um tom e clique em <strong>Aplicar</strong> — depois pode ajustar o texto abaixo.
                </p>

                <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/50 p-4">
                  <p className="text-sm font-medium text-teal-800">
                    Tom pronto para {getCategoriaPadrao(profissional?.categoria)?.nome ?? "seu nicho"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {TONS_ATENDIMENTO.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTomPrompt(t.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          tomPrompt === t.id ? "bg-teal-600 text-white" : "bg-white text-teal-700 border border-teal-200 hover:bg-teal-50"
                        }`}
                      >
                        {t.nome}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-teal-700">{TONS_ATENDIMENTO.find((t) => t.id === tomPrompt)?.instrucao}</p>
                  <button
                    type="button"
                    onClick={applyPromptPronto}
                    className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                  >
                    Aplicar este tom
                  </button>
                </div>

                <textarea
                  value={config.system_prompt}
                  onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
                  rows={8}
                  className="mt-3 w-full rounded-xl border border-gray-200 p-4 font-mono text-sm outline-none focus:border-blue-500"
                  placeholder="Instruções que o atendente deve seguir..."
                />
              </div>
            </div>
          </div>

          {/* PASSO 3 — Modelo de IA */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">3</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Modelo de IA</h3>
                <p className="mt-1 text-sm text-gray-500">
                  O &quot;cérebro&quot; do atendente. Cada um precisa da chave (API key) do fornecedor correspondente configurada no servidor.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {MODELOS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setConfig({ ...config, model: m.id })}
                      className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                        config.model === m.id
                          ? "border-teal-500 bg-teal-50/50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      {config.model === m.id && (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        </span>
                      )}
                      <p className="pr-6 text-xs font-bold uppercase tracking-wide text-gray-400">{m.grupo}</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{m.nome}</p>
                      <p className="mt-1 text-xs text-gray-500">{m.desc}</p>
                      {m.badge && (
                        <span className="mt-2 inline-block rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                          {m.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <label className="text-sm font-medium text-gray-700">
                    Modelo personalizado (qualquer ID de modelo)
                  </label>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Ex.: <code className="rounded bg-gray-100 px-1">openai/gpt-4o-mini</code>,{" "}
                    <code className="rounded bg-gray-100 px-1">deepseek/deepseek-chat</code>,{" "}
                    <code className="rounded bg-gray-100 px-1">meta-llama/llama-3.1-8b-instruct:free</code>,{" "}
                    <code className="rounded bg-gray-100 px-1">gpt-4o-mini</code>. Modelos no padrão{" "}
                    <code className="rounded bg-gray-100 px-1">provedor/modelo</code> usam o OpenRouter.
                  </p>
                  <input
                    value={config.model || ""}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    placeholder="Digite o ID do modelo (ex: openai/gpt-4o-mini)"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-teal-500"
                  />
                </div>

                {/* API keys por fornecedor */}
                <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-teal-800">Chaves de API deste negócio</p>
                      <p className="mt-0.5 text-xs text-teal-700/80">
                        Cole aqui a chave do fornecedor (Google, OpenAI, etc.) deste cliente. Se vazio, o sistema usa a chave global da plataforma.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMostrarChaves((v) => !v)}
                      className="shrink-0 rounded-lg border border-teal-300 bg-white px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50"
                    >
                      {mostrarChaves ? "Ocultar chaves" : "Mostrar/editar"}
                    </button>
                  </div>
                  {mostrarChaves && (
                    <div className="mt-3 space-y-3">
                      {([
                        { key: "openai", label: "OpenAI", placeholder: "sk-..." },
                        { key: "gemini", label: "Google (Gemini)", placeholder: "AIza..." },
                        { key: "anthropic", label: "Anthropic (Claude)", placeholder: "sk-ant-..." },
                        { key: "openrouter", label: "OpenRouter", placeholder: "sk-or-..." },
                      ] as const).map((prov) => (
                        <div key={prov.key}>
                          <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
                            {prov.label}
                            {chavesSalvas[prov.key] ? (
                              <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-700">• salva</span>
                            ) : (
                              <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">usando chave da plataforma</span>
                            )}
                          </label>
                          <input
                            type="password"
                            value={apiKeys[prov.key] || ""}
                            onChange={(e) => setApiKeys({ ...apiKeys, [prov.key]: e.target.value })}
                            placeholder={placeholderFor(prov)}
                            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-teal-500"
                          />
                        </div>
                      ))}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={salvarChaves}
                          disabled={saving}
                          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                        >
                          {saving ? "Salvando..." : "Salvar chaves"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setApiKeys({ gemini: "", openai: "", anthropic: "", openrouter: "" })}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Temperatura (criatividade)</label>
                    <div className="mt-1 flex items-center gap-3">
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
                  <div>
                    <label className="text-xs font-medium text-gray-500">Tamanho máximo da resposta</label>
                    <select
                      value={config.max_tokens}
                      onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                      <option value={2048}>Curta (2.048)</option>
                      <option value={4096}>Normal (4.096)</option>
                      <option value={8192}>Longa (8.192)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PASSO 4 — O que o atendente pode fazer */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">4</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">O que o atendente pode fazer</h3>
                <p className="mt-1 text-sm text-gray-500">Escolha as permissões — quanto mais, mais útil, mas também mais poderoso.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {[
                    { id: "database", label: "Consultar sua agenda", desc: "Ver agendamentos, serviços e clientes para responder" },
                    { id: "google_calendar", label: "Usar Google Calendar", desc: "Verificar horários livres e criar eventos automaticamente" },
                    { id: "knowledge_base", label: "Responder com documentos", desc: "Buscar respostas nos documentos que você enviar" },
                  ].map((tool) => (
                    <label key={tool.id} className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 hover:border-teal-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.tools_enabled?.includes(tool.id)}
                        onChange={() => toggleTool(tool.id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600"
                      />
                      <div>
                        <span className="font-medium">{tool.label}</span>
                        <p className="text-xs text-gray-500">{tool.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PASSO 5 — Canais de atendimento */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">5</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Onde o atendente vai atender</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Ligue os canais e faça a conexão — a configuração aparece ao lado de cada um.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {[
                    { id: "whatsapp", label: "WhatsApp", desc: "Atender via WhatsApp", via: "Cloud API (Meta) ou Evolution" },
                    { id: "instagram", label: "Instagram DM", desc: "Atender via Instagram", via: "Meta (clique para autorizar)" },
                    { id: "facebook", label: "Facebook Messenger", desc: "Atender via Messenger", via: "Meta (clique para autorizar)" },
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
                        <p className="text-xs text-gray-400">{conn.via}</p>
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
            </div>
          </div>

          {/* PASSO 6 — Google Calendar */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">6</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Google Calendar</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Opcional — use para o atendente verificar horários livres e criar eventos automaticamente.
                </p>
                <div className="mt-4">
                  <GoogleCalendarConnect profissionalId={profissional.id} />
                </div>
              </div>
            </div>
          </div>

          {/* PASSO 7 — Testar */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">7</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Testar o atendente</h3>
                <p className="mt-1 text-sm text-gray-500">Envie uma mensagem como se fosse um cliente para ver a resposta.</p>
                <div className="mt-4">
                  <AgentTestChat profissionalId={profissional.id} />
                </div>
              </div>
            </div>
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
  const [provider, setProvider] = useState<"meta_cloud" | "evolution">("meta_cloud");
  const [form, setForm] = useState({
    phone_number_id: "",
    waba_id: "",
    meta_access_token: "",
    meta_phone_number: "",
    instance_name: "",
    evolution_api_url: "",
    evolution_api_key: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [metaRes, evoRes] = await Promise.all([
          fetch(`/api/whatsapp/meta/instance?profissional_id=${profissionalId}`),
          fetch(`/api/whatsapp/instance?profissional_id=${profissionalId}`),
        ]);
        const meta = await metaRes.json();
        const evo = await evoRes.json();
        if (meta.configured) {
          setProvider("meta_cloud");
          setInstance({ ...meta, provider: "meta_cloud" });
        } else if (evo.configured) {
          setProvider("evolution");
          setInstance({ ...evo, provider: "evolution" });
        }
      } catch {}
      setLoading(false);
    })();
  }, [profissionalId]);

  const saveMetaCloud = async () => {
    setError("");
    if (!form.phone_number_id || !form.meta_access_token) {
      setError("Preencha Phone Number ID e Token de Acesso");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/whatsapp/meta/instance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profissional_id: profissionalId, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setInstance({ configured: true, provider: "meta_cloud", connection_status: "connected", ...form });
      } else {
        setError(data.error || "Erro ao conectar");
      }
    } finally {
      setCreating(false);
    }
  };

  const createEvolution = async () => {
    setError("");
    if (!form.instance_name || !form.evolution_api_url || !form.evolution_api_key) {
      setError("Preencha todos os campos da Evolution API");
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
        setInstance({ configured: true, provider: "evolution", connection_status: "creating", ...form });
      } else {
        setError(data.error || "Erro ao criar instância");
      }
    } finally {
      setCreating(false);
    }
  };

  const deleteInstance = async () => {
    if (!confirm("Desconectar WhatsApp?")) return;
    const url =
      instance.provider === "meta_cloud"
        ? "/api/whatsapp/meta/instance"
        : "/api/whatsapp/instance";
    await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profissional_id: profissionalId }),
    });
    setInstance(null);
  };

  const refreshQR = async () => {
    const res = await fetch(`/api/whatsapp/instance?profissional_id=${profissionalId}`);
    const d = await res.json();
    setInstance(d);
  };

  if (loading) return <p className="text-sm text-gray-400">Carregando...</p>;

  if (instance?.configured) {
    const connected = instance.connection_status === "connected" || instance.connection_status === "open";
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm text-white ${connected ? "bg-green-500" : "bg-yellow-500"}`}>
            {connected ? "✓" : "?"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {instance.provider === "meta_cloud" ? "WhatsApp Cloud API (Meta)" : `Instância: ${instance.instance_name}`}
            </p>
            <p className="text-xs text-gray-500">
              Status: {instance.connection_status}
              {instance.meta_phone_number && ` · ${instance.meta_phone_number}`}
              {instance.phone_number && ` · ${instance.phone_number}`}
            </p>
            {instance.provider === "meta_cloud" && instance.webhook_url && (
              <p className="mt-1 text-xs text-gray-400">
                Webhook: <span className="font-mono">{instance.webhook_url}</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {instance.provider === "evolution" && (
              <button onClick={refreshQR} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50">Atualizar QR</button>
            )}
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
      <div className="flex gap-2">
        <button
          onClick={() => setProvider("meta_cloud")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${provider === "meta_cloud" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          API Oficial (Meta)
        </button>
        <button
          onClick={() => setProvider("evolution")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${provider === "evolution" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Evolution API (QR)
        </button>
      </div>

      {provider === "meta_cloud" ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Use a API oficial do WhatsApp (Meta Cloud API). Não precisa de servidor extra — só o token e os IDs do painel da Meta.
          </p>
          <input
            value={form.phone_number_id}
            onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })}
            placeholder="Phone Number ID (ex: 123456789012345)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            value={form.waba_id}
            onChange={(e) => setForm({ ...form, waba_id: e.target.value })}
            placeholder="WABA ID (opcional, ex: 987654321)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            value={form.meta_phone_number}
            onChange={(e) => setForm({ ...form, meta_phone_number: e.target.value })}
            placeholder="Número do WhatsApp (opcional, ex: 5511999999999)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            value={form.meta_access_token}
            onChange={(e) => setForm({ ...form, meta_access_token: e.target.value })}
            placeholder="Token de Acesso (permanente, do WhatsApp Cloud API)"
            type="password"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={saveMetaCloud}
            disabled={creating}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {creating ? "Conectando..." : "Conectar WhatsApp Cloud API"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Configure a Evolution API para conectar o WhatsApp (requer servidor Evolution próprio):</p>
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
            onClick={createEvolution}
            disabled={creating}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {creating ? "Criando..." : "Criar Instância"}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function MetaConnect({ profissionalId }: { profissionalId: string }) {
  const [status, setStatus] = useState<{ connected: boolean; page_name?: string; instagram_name?: string; loading?: boolean }>({ connected: false });
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetch(`/api/meta/auth?profissional_id=${profissionalId}`)
      .then((r) => r.json())
      .then((d) => setStatus({ ...d, loading: false }))
      .catch(() => setStatus({ connected: false, loading: false }));
  }, [profissionalId]);

  const connect = async () => {
    setConnecting(true);
    setError("");
    const res = await fetch("/api/meta/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profissional_id: profissionalId }),
    });
    const data = await res.json();
    setConnecting(false);
    if (!res.ok || !data.url) {
      setError(data.error || "Falha ao iniciar conexão com a Meta");
      return;
    }
    window.open(data.url, "_blank");
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
    <div>
      <button onClick={connect} disabled={connecting} className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 hover:border-blue-300 disabled:opacity-50">
        <span className="text-lg">🔵</span>
        <div className="text-left">
          <p className="text-sm font-medium">{connecting ? "Conectando..." : "Conectar Facebook / Instagram"}</p>
          <p className="text-xs text-gray-500">Autorizar com Meta para Messenger e Instagram DM</p>
        </div>
      </button>
      {error && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
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
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadConversations = async () => {
    const res = await fetch(`/api/agent/conversations?profissional_id=${profissionalId}`);
    const data = await res.json();
    setConversations(data.conversations || []);
    setLoading(false);
  };

  const loadMessages = async (convId: string) => {
    setSelected(convId);
    const res = await fetch(`/api/agent/conversations/${convId}`);
    const data = await res.json();
    setMessages(data.messages || []);
  };

  useEffect(() => {
    loadConversations();
  }, [profissionalId]);

  useEffect(() => {
    if (!selected) return;
    const timer = setInterval(() => loadMessages(selected), 5000);
    return () => clearInterval(timer);
  }, [selected]);

  useEffect(() => {
    if (selected) {
      const el = document.getElementById("agent-chat-log");
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages, selected]);

  const sendReply = async () => {
    const text = draft.trim();
    if (!text || !selected || sending) return;
    setSending(true);
    setError("");
    const res = await fetch(`/api/agent/conversations/${selected}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setError(data.error || "Falha ao enviar");
      return;
    }
    setDraft("");
    await loadMessages(selected);
    loadConversations();
  };

  const channelMeta = (channel: string) => {
    switch (channel) {
      case "whatsapp": return { icon: "💬", label: "WhatsApp", cls: "bg-green-100 text-green-700" };
      case "instagram": return { icon: "📸", label: "Instagram DM", cls: "bg-pink-100 text-pink-700" };
      case "messenger": return { icon: "🔵", label: "Messenger", cls: "bg-blue-100 text-blue-700" };
      case "web": case "web_test": return { icon: "🌐", label: "Web", cls: "bg-gray-100 text-gray-600" };
      default: return { icon: "✉️", label: channel, cls: "bg-gray-100 text-gray-600" };
    }
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
            {conversations.map((conv: any) => {
              const ch = channelMeta(conv.channel);
              return (
                <button
                  key={conv.id}
                  onClick={() => loadMessages(conv.id)}
                  className={`w-full px-6 py-3 text-left text-sm hover:bg-gray-50 ${
                    selected === conv.id ? "bg-blue-50" : ""
                  }`}
                >
                  <p className="flex items-center justify-between font-medium">
                    <span className="truncate">{conv.customer_name || `via ${conv.channel}`}</span>
                    <span className={`ml-2 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${ch.cls}`}>
                      {ch.icon} {ch.label}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {conv.message_count} msgs · {new Date(conv.updated_at).toLocaleString("pt-BR")}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold">{selected ? "Mensagens" : "Selecione uma conversa"}</h3>
        </div>
        <div id="agent-chat-log" className="max-h-96 flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && selected && (
            <p className="text-center text-sm text-gray-400">Nenhuma mensagem</p>
          )}
          {messages.map((m: any) => (
            <div key={m.id} className={`rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-blue-100" : m.role === "assistant" ? "bg-gray-100" : "bg-yellow-50"}`}>
              <span className="text-xs font-medium text-gray-400">{m.role}</span>
              <p className="mt-0.5 whitespace-pre-wrap">{m.content}</p>
              {(m.tokens_input > 0 || m.tokens_output > 0) && (
                <p className="mt-1 text-xs text-gray-400">tokens: {m.tokens_input} in / {m.tokens_output} out</p>
              )}
            </div>
          ))}
        </div>
        {selected && (
          <div className="border-t border-gray-200 p-4">
            {error && (
              <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
                rows={2}
                placeholder="Responder como o profissional..."
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
              />
              <button
                onClick={sendReply}
                disabled={sending || !draft.trim()}
                className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
              >
                {sending ? "Enviando..." : "Enviar"}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-gray-400">
              Enter envia · Shift+Enter quebra linha · a resposta vai para o canal da conversa
            </p>
          </div>
        )}
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

function placeholderFor(prov: { key: string; label: string; placeholder: string }) {
  return `${prov.placeholder} (vazio = usar chave da plataforma)`;
}
