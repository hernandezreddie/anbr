"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Zap, Key, Eye, EyeOff, Shield } from "lucide-react";

interface Props {
  profissionalId: string;
  titulo?: string;
}

type Nivel = "ok" | "aviso" | "erro";

const ICONES: Record<Nivel, React.ReactElement> = {
  ok: <Zap size={16} className="text-teal-500" />,
  aviso: <AlertTriangle size={16} className="text-amber-500" />,
  erro: <XCircle size={16} className="text-red-500" />,
};

const CORES: Record<Nivel, string> = {
  ok: "bg-teal-50 border-teal-200 text-teal-800",
  aviso: "bg-amber-50 border-amber-200 text-amber-800",
  erro: "bg-red-50 border-red-200 text-red-800",
};

const PROVEDORES = [
  { key: "openai", label: "OpenAI", placeholder: "sk-..." },
  { key: "openrouter", label: "OpenRouter", placeholder: "sk-or-..." },
  { key: "anthropic", label: "Anthropic", placeholder: "sk-ant-..." },
  { key: "gemini", label: "Gemini", placeholder: "AIza..." },
] as const;

interface ApiKeysData {
  openai?: string;
  openrouter?: string;
  anthropic?: string;
  gemini?: string;
}

export function StatusAgente({ profissionalId, titulo = "Estado do AI Agent" }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testando, setTestando] = useState(false);
  const [keysSaving, setKeysSaving] = useState(false);
  const [keysSaved, setKeysSaved] = useState(false);
  const [keysAberto, setKeysAberto] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [apiKeys, setApiKeys] = useState<ApiKeysData>({});
  const [apiKeysLoaded, setApiKeysLoaded] = useState(false);

  const carregar = (testar = false) => {
    setLoading(!testando && !data);
    fetch(`/api/agent/status?profissional_id=${profissionalId}${testar ? "&teste=1" : ""}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
        setTestando(false);
      });
  };

  const carregarKeys = () => {
    fetch(`/api/agent/config?profissional_id=${profissionalId}`)
      .then((r) => r.json())
      .then((d) => {
        setApiKeys(d.config?.api_keys || {});
        setApiKeysLoaded(true);
      });
  };

  useEffect(() => {
    carregar(false);
    carregarKeys();
  }, [profissionalId]);

  const rodarTeste = () => {
    setTestando(true);
    carregar(true);
  };

  const salvarKeys = async () => {
    setKeysSaving(true);
    try {
      await fetch("/api/agent/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profissional_id: profissionalId, api_keys: apiKeys }),
      });
      setKeysSaved(true);
      setTimeout(() => setKeysSaved(false), 2000);
    } catch {}
    setKeysSaving(false);
  };

  const toggleVisivel = (key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-400">Verificando estado do agente...</p>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm text-red-700">{data?.error || "Não foi possível carregar o estado do agente."}</p>
      </div>
    );
  }

  const status: Array<{ nivel: Nivel; titulo: string; detalhe: string; acao?: string }> =
    data.status || [];

  const temErro = status.some((s) => s.nivel === "erro");
  const temAviso = status.some((s) => s.nivel === "aviso");

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl border p-5 ${
          temErro ? "border-red-200 bg-red-50" : temAviso ? "border-amber-200 bg-amber-50" : "border-teal-200 bg-teal-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={18}
              className={temErro ? "text-red-600" : temAviso ? "text-amber-600" : "text-teal-600"}
            />
            <h3 className="font-semibold">{titulo}</h3>
          </div>
          <button
            onClick={rodarTeste}
            disabled={testando}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={12} className={testando ? "animate-spin" : ""} />
            {testando ? "Testando..." : "Testar conexão"}
          </button>
        </div>

        <div className="mt-3 space-y-2.5">
          {status.map((s, i) => (
            <div key={i} className={`flex gap-2 rounded-lg border px-3 py-2 ${CORES[s.nivel]}`}>
              <span className="mt-0.5 shrink-0">{ICONES[s.nivel as Nivel]}</span>
              <div className="text-sm">
                <p className="font-medium">{s.titulo}</p>
                <p className="mt-0.5 text-xs opacity-90">{s.detalhe}</p>
                {s.acao && <p className="mt-0.5 text-xs italic">💡 {s.acao}</p>}
              </div>
            </div>
          ))}
        </div>

        {data.teste && (
          <div className="mt-3 border-t border-gray-200 pt-2.5 text-xs text-gray-500">
            Último teste:{" "}
            <span className={data.teste.ok ? "text-teal-600 font-medium" : "text-red-600 font-medium"}>
              {data.teste.ok
                ? `conexão OK (via ${data.teste.usando_chave_propria ? "sua chave" : "chave AN.BR"})`
                : `${data.teste.tipo_erro || "erro"} — ${data.teste.mensagem?.slice(0, 100)}`}
            </span>
            {data.teste.duracao_ms != null && ` (${data.teste.duracao_ms}ms)`}
          </div>
        )}
      </div>

      {/* API Keys Section */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <button
          onClick={() => setKeysAberto((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <div className="flex items-center gap-2">
            <Key size={18} className="text-gray-400" />
            <div>
              <h3 className="font-semibold text-sm">Chaves de API</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Use suas próprias chaves ou deixe em branco para usar as da AN.BR
              </p>
            </div>
          </div>
          <span className={`text-gray-400 transition-transform ${keysAberto ? "rotate-90" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </span>
        </button>

        {keysAberto && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-3 space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3.5">
              <Shield size={18} className="mt-0.5 shrink-0 text-blue-500" />
              <div className="text-xs text-blue-800">
                <p className="font-medium">Por padrão, a AN.BR fornece as chaves de IA.</p>
                <p className="mt-1">Se preferir usar suas próprias chaves da OpenAI, OpenRouter, Anthropic ou Gemini, cole-as abaixo. As chaves são armazenadas com criptografia e nunca são exibidas para terceiros.</p>
              </div>
            </div>

            {PROVEDORES.map(({ key, label, placeholder }) => {
              const valor = apiKeys[key as keyof ApiKeysData] || "";
              const temValor = !!valor;
              const visivel = visibleKeys.has(key);

              return (
                <div key={key}>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    {label}
                    {temValor && (
                      <span className="ml-2 text-teal-600 font-normal">
                        ✓ configurada
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={visivel ? "text" : "password"}
                        value={valor}
                        onChange={(e) =>
                          setApiKeys((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        placeholder={placeholder}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-sm outline-none focus:border-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleVisivel(key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {visivel ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={salvarKeys}
              disabled={keysSaving}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-all"
            >
              {keysSaving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Salvando...
                </>
              ) : keysSaved ? (
                <>
                  <CheckCircle size={14} />
                  Salvo!
                </>
              ) : (
                "Salvar chaves"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
