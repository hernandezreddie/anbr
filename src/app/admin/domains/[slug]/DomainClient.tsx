"use client"

import { useState } from "react"

interface Props {
  profissional: { id: string; nome: string; slug: string }
  domain: any
}

export function DomainClient({ profissional, domain: initialDomain }: Props) {
  const [domain, setDomain] = useState(initialDomain || null)
  const [newDomain, setNewDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const addDomain = async () => {
    if (!newDomain.trim()) return
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profissional_id: profissional.id, domain: newDomain.trim() }),
      })
      const data = await res.json()

      if (data.success) {
        setDomain(data)
        setMessage("Domínio adicionado! Configure os registros DNS abaixo.")
      } else {
        setMessage(`Erro: ${data.error}`)
      }
    } catch {
      setMessage("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  const verifyDomain = async () => {
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/domains", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profissional_id: profissional.id }),
      })
      const data = await res.json()

      setDomain((prev: any) => ({ ...prev, ssl_status: data.ssl_status, verified: data.verified }))
      setMessage(data.verified ? "Domínio verificado com sucesso! SSL ativo." : `Status SSL: ${data.ssl_status}`)
    } catch {
      setMessage("Erro ao verificar")
    } finally {
      setLoading(false)
    }
  }

  const removeDomain = async () => {
    if (!confirm("Remover domínio personalizado?")) return
    setLoading(true)

    try {
      await fetch("/api/domains", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profissional_id: profissional.id }),
      })
      setDomain(null)
      setNewDomain("")
      setMessage("Domínio removido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Domínio Personalizado</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure um domínio próprio para o booking do {profissional.nome}.
          Ex: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">agenda.meusite.com.br</code>
        </p>

        {domain ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${
                domain.verified ? "bg-green-500" : "bg-amber-500"
              }`}>
                {domain.verified ? "✓" : "!"}
              </div>
              <div className="flex-1">
                <p className="font-medium">{domain.domain}</p>
                <p className="text-sm text-gray-500">
                  SSL: {domain.ssl_status} {domain.verified ? "· Verificado" : "· Pendente"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={verifyDomain}
                  disabled={loading}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Verificar
                </button>
                <button
                  onClick={removeDomain}
                  disabled={loading}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remover
                </button>
              </div>
            </div>

            {domain.validation_records && domain.validation_records.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-2 text-sm font-semibold">Registros DNS necessários</h3>
                <p className="mb-3 text-xs text-gray-500">
                  Adicione estes registros no DNS do seu domínio:
                </p>
                <div className="space-y-2">
                  {domain.validation_records.map((record: any, i: number) => (
                    <div key={i} className="rounded-lg bg-white p-3 font-mono text-xs">
                      <span className="font-medium text-gray-500">{record.type}</span>
                      <code className="ml-2">{record.name}</code>
                      <span className="mx-2 text-gray-300">→</span>
                      <code>{record.value}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="ex: agenda.meusite.com.br"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
            <button
              onClick={addDomain}
              disabled={loading || !newDomain.trim()}
              className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Processando..." : "Adicionar Domínio"}
            </button>
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {message}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Como configurar</h2>
        <ol className="mt-4 list-inside list-decimal space-y-3 text-sm text-gray-600">
          <li>
            <strong>Adicione um domínio</strong> acima (ex: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">agenda.meusite.com.br</code>)
          </li>
          <li>
            No seu provedor de DNS, crie um registro <strong>CNAME</strong> apontando seu domínio para{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">autonexabrasil.com.br</code>
          </li>
          <li>
            Se solicitado, adicione os registros de <strong>validação SSL</strong> mostrados acima
          </li>
          <li>
            Clique em <strong>Verificar</strong> para confirmar que o SSL foi emitido
          </li>
        </ol>
      </div>
    </div>
  )
}
