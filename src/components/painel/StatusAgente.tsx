"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Zap } from "lucide-react";

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

export function StatusAgente({ profissionalId, titulo = "Estado do AI Agent" }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testando, setTestando] = useState(false);

  const carregar = (testar = false) => {
    setLoading(!testando && !data);
    fetch(`/api/agent/status?profissional_id=${profissionalId}${testar ? "&teste=1" : ""}`)
      .then((r) => r.json())
      .then((d) => {
        if (testar) {
          setTestando(false);
        } else {
          setLoading(false);
        }
        setData(d);
      });
  };

  useEffect(() => {
    carregar(false);
  }, [profissionalId]);

  const rodarTeste = () => {
    setTestando(true);
    fetch(`/api/agent/status?profissional_id=${profissionalId}&teste=1`)
      .then((r) => r.json())
      .then((d) => {
        setTestando(false);
        setData(d);
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
              ? "conexão OK"
              : `${data.teste.tipo_erro || "erro"} — ${data.teste.mensagem?.slice(0, 100)}`}
          </span>
          {data.teste.duracao_ms != null && ` (${data.teste.duracao_ms}ms)`}
        </div>
      )}
    </div>
  );
}
