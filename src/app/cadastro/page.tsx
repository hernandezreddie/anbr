"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ServicoForm = {
  nome: string;
  descricao: string;
  tipo_preco: "por_hora" | "fixo";
  valor_hora: number;
  horas_minimas: number;
  preco_fixo: number;
  duracao_minutos: number;
  ordem: number;
};

const servicoVazio = (ordem: number): ServicoForm => ({
  nome: "",
  descricao: "",
  tipo_preco: "por_hora",
  valor_hora: 25,
  horas_minimas: 2,
  preco_fixo: 60,
  duracao_minutos: 60,
  ordem,
});

export default function CadastroPage() {
  const [passo, setPasso] = useState(1);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    slug: "",
    whatsapp: "",
    cidade: "",
    pix_chave: "",
    slogan: "",
    template_id: 1,
  });
  const [servicos, setServicos] = useState<ServicoForm[]>([servicoVazio(1), servicoVazio(2)]);
  const [erro, setErro] = useState("");
  const router = useRouter();

  const slugFromNome = (nome: string) =>
    nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);

  const updateField = (field: string, value: string) => {
    const next = { ...form, [field]: value };
    if (field === "nome" && form.slug === slugFromNome(form.nome)) {
      next.slug = slugFromNome(value);
    }
    setForm(next);
  };

  const updateServico = (idx: number, field: keyof ServicoForm, value: string | number) => {
    setServicos((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addServico = () => {
    setServicos((prev) => [...prev, servicoVazio(prev.length + 1)]);
  };

  const removeServico = (idx: number) => {
    setServicos((prev) => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, ordem: i + 1 })));
  };

  const handleSubmit = async () => {
    setErro("");

    const payload = {
      nome: form.nome,
      email: form.email,
      senha: form.senha,
      slug: form.slug,
      whatsapp: form.whatsapp,
      cidade: form.cidade,
      pix_chave: form.pix_chave,
      slogan: form.slogan || `${form.nome} — Profissional de confiança`,
      template_id: form.template_id,
      servicos: servicos.filter((s) => s.nome.trim()),
    };

    const res = await fetch("/api/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setErro(data.error || "Erro ao criar sistema");
      return;
    }

    router.push(`/cadastro/sucesso?slug=${data.slug}`);
  };

  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((p) => (
              <div
                key={p}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  passo >= p ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {p}
              </div>
            ))}
          </div>
          <h1 className="text-2xl font-semibold">Criar meu sistema</h1>
        </div>

        {passo === 1 && (
          <div className="card space-y-4 p-8">
            <h2 className="text-lg font-medium">Seus dados</h2>
            <input
              type="text"
              placeholder="Seu nome completo"
              value={form.nome}
              onChange={(e) => updateField("nome", e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
            />
            <input
              type="email"
              placeholder="Seu email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
            />
            <input
              type="password"
              placeholder="Sua senha"
              value={form.senha}
              onChange={(e) => updateField("senha", e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
            />
            <button
              onClick={() => setPasso(2)}
              disabled={!form.nome || !form.email || !form.senha}
              className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        )}

        {passo === 2 && (
          <div className="card space-y-4 p-8">
            <h2 className="text-lg font-medium">Seu endereço online</h2>
            <div>
              <label className="text-sm text-ink-soft">Seu subdomínio</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="maria-limpeza"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  className="flex-1 rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
                />
                <span className="text-sm text-ink-soft shrink-0">.livreta.com.br</span>
              </div>
            </div>
            <input
              type="text"
              placeholder="Seu WhatsApp com DDD (ex: 5541999999999)"
              value={form.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
            />
            <input
              type="text"
              placeholder="Sua cidade"
              value={form.cidade}
              onChange={(e) => updateField("cidade", e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setPasso(1)}
                className="w-32 rounded-xl border border-line px-6 py-3 font-medium transition-all hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                onClick={() => setPasso(3)}
                disabled={!form.slug || !form.whatsapp || !form.cidade}
                className="flex-1 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {passo === 3 && (
          <div className="card space-y-4 p-8">
            <h2 className="text-lg font-medium">Recebimento</h2>
            <input
              type="text"
              placeholder="Sua chave Pix (CPF, email, telefone ou aleatória)"
              value={form.pix_chave}
              onChange={(e) => updateField("pix_chave", e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setPasso(2)}
                className="w-32 rounded-xl border border-line px-6 py-3 font-medium transition-all hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                onClick={() => setPasso(4)}
                disabled={!form.pix_chave}
                className="flex-1 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {passo === 4 && (
          <div className="card space-y-6 p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Seus serviços</h2>
              <button
                onClick={addServico}
                className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-100"
              >
                + Adicionar
              </button>
            </div>
            {servicos.map((s, i) => (
              <div key={i} className="rounded-xl border border-line p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-soft">Serviço {i + 1}</span>
                  {servicos.length > 1 && (
                    <button
                      onClick={() => removeServico(i)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Nome do serviço"
                    value={s.nome}
                    onChange={(e) => updateServico(i, "nome", e.target.value)}
                    className="col-span-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
                  />
                  <input
                    type="text"
                    placeholder="Descrição"
                    value={s.descricao}
                    onChange={(e) => updateServico(i, "descricao", e.target.value)}
                    className="col-span-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
                  />
                  <div>
                    <label className="text-sm text-ink-soft">Modelo de preço</label>
                    <select
                      value={s.tipo_preco}
                      onChange={(e) => updateServico(i, "tipo_preco", e.target.value as "por_hora" | "fixo")}
                      className="mt-1 w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
                    >
                      <option value="por_hora">Por hora</option>
                      <option value="fixo">Preço fixo</option>
                    </select>
                  </div>
                  {s.tipo_preco === "por_hora" ? (
                    <>
                      <div>
                        <label className="text-sm text-ink-soft">Valor por hora (R$)</label>
                        <input
                          type="number"
                          min={0}
                          value={s.valor_hora}
                          onChange={(e) => updateServico(i, "valor_hora", Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink-soft">Horas mínimas</label>
                        <input
                          type="number"
                          min={1}
                          step={0.5}
                          value={s.horas_minimas}
                          onChange={(e) => updateServico(i, "horas_minimas", Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm text-ink-soft">Preço fixo (R$)</label>
                        <input
                          type="number"
                          min={0}
                          value={s.preco_fixo}
                          onChange={(e) => updateServico(i, "preco_fixo", Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink-soft">Duração (minutos)</label>
                        <input
                          type="number"
                          min={5}
                          step={5}
                          value={s.duracao_minutos}
                          onChange={(e) => updateServico(i, "duracao_minutos", Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <button
                onClick={() => setPasso(3)}
                className="w-32 rounded-xl border border-line px-6 py-3 font-medium transition-all hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                onClick={() => setPasso(5)}
                disabled={servicos.every((s) => !s.nome.trim())}
                className="flex-1 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {passo === 5 && (
          <div className="card space-y-4 p-8">
            <h2 className="text-lg font-medium">Slogan e visual</h2>
            <input
              type="text"
              placeholder="Seu slogan (ex: Limpeza profissional em Curitiba)"
              value={form.slogan}
              onChange={(e) => updateField("slogan", e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-emerald-600"
            />
            <div>
              <label className="text-sm text-ink-soft">Template visual</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {[
                  { id: 1, nome: "Clássico", desc: "Verde e elegante" },
                  { id: 2, nome: "Moderno", desc: "Roxo e minimalista" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setForm((prev) => ({ ...prev, template_id: t.id }))}
                    className={`card p-4 text-left transition-all ${
                      form.template_id === t.id ? "border-emerald-600 ring-2 ring-emerald-600" : ""
                    }`}
                  >
                    <div className="font-medium">{t.nome}</div>
                    <div className="mt-1 text-sm text-ink-soft">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            {erro && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setPasso(4)}
                className="w-32 rounded-xl border border-line px-6 py-3 font-medium transition-all hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700"
              >
                Criar meu sistema
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}