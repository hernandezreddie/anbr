"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, User, Globe,
  Wrench, Scissors, Stethoscope, Dumbbell, Brush, ChefHat, Camera,
  MonitorSmartphone, Sparkles,
} from "lucide-react";
import { getServicosPadrao, getSloganPadrao, type CategoriaId } from "@/lib/servicos-padrao";

const categorias = [
  { id: "limpeza" as CategoriaId, icone: <Wrench size={24} />, nome: "Limpeza e Conservação" },
  { id: "beleza" as CategoriaId, icone: <Scissors size={24} />, nome: "Beleza e Estética" },
  { id: "saude" as CategoriaId, icone: <Stethoscope size={24} />, nome: "Saúde e Bem-estar" },
  { id: "personal" as CategoriaId, icone: <Dumbbell size={24} />, nome: "Personal & Esportes" },
  { id: "artes" as CategoriaId, icone: <Brush size={24} />, nome: "Artes e Ofícios" },
  { id: "gastronomia" as CategoriaId, icone: <ChefHat size={24} />, nome: "Gastronomia" },
  { id: "fotografia" as CategoriaId, icone: <Camera size={24} />, nome: "Fotografia e Eventos" },
  { id: "consultoria" as CategoriaId, icone: <MonitorSmartphone size={24} />, nome: "Consultoria e Aulas" },
];

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
  nome: "", descricao: "", tipo_preco: "por_hora",
  valor_hora: 25, horas_minimas: 2, preco_fixo: 60,
  duracao_minutos: 60, ordem,
});

const steps = [
  { num: 1, label: "Categoria", icone: <Sparkles size={16} /> },
  { num: 2, label: "Dados", icone: <User size={16} /> },
  { num: 3, label: "Endereço", icone: <Globe size={16} /> },
  { num: 4, label: "Serviços", icone: <Wrench size={16} /> },
  { num: 5, label: "Finalizar", icone: <Check size={16} /> },
];

export default function CadastroPage() {
  const [passo, setPasso] = useState(1);
  const [categoria, setCategoria] = useState<CategoriaId | "">("");
  const router = useRouter();
  const [form, setForm] = useState({
    nome: "", email: "", senha: "", slug: "",
    whatsapp: "", cidade: "", pix_chave: "", slogan: "", template_id: 1,
  });
  const [servicos, setServicos] = useState<ServicoForm[]>([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const slugFromNome = (nome: string) =>
    nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

  const updateField = (field: string, value: string) => {
    const next = { ...form, [field]: value };
    if (field === "nome" && form.slug === slugFromNome(form.nome))
      next.slug = slugFromNome(value);
    setForm(next);
  };

  const updateServico = (idx: number, field: keyof ServicoForm, value: string | number) => {
    setServicos((prev) => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; return next; });
  };

  const addServico = () => setServicos((prev) => [...prev, servicoVazio(prev.length + 1)]);
  const removeServico = (idx: number) =>
    setServicos((prev) => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, ordem: i + 1 })));

  const handleSubmit = async () => {
    if (!categoria) return;
    setErro(""); setEnviando(true);
    const payload = {
      nome: form.nome, email: form.email, senha: form.senha,
      slug: form.slug, whatsapp: form.whatsapp, cidade: form.cidade,
      pix_chave: form.pix_chave, slogan: form.slogan || `${form.nome} — Profissional de confiança`,
      template_id: form.template_id,
      categoria,
      servicos: servicos.filter((s) => s.nome.trim()),
    };
    const res = await fetch("/api/cadastro", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setEnviando(false);
    if (!res.ok) { setErro(data.error || "Erro ao criar sistema"); return; }
    router.push(`/cadastro/sucesso?slug=${data.slug}`);
  };

  const podeAvancar = () => {
    if (passo === 1) return !!categoria;
    if (passo === 2) return form.nome && form.email && form.senha;
    if (passo === 3) return form.slug && form.whatsapp && form.cidade;
    if (passo === 4) return servicos.some((s) => s.nome.trim());
    return true;
  };

  const containerVar = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
  };

  const inp = "w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10";
  const inpMini = "w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none transition-all focus:border-[var(--color-primary)]";

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Mini header */}
      <header className="border-b border-[var(--color-line)]/50 bg-white/80 backdrop-blur-md">
        <div className="container-x flex h-14 items-center">
          <a href="/" className="flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink transition-colors">
            <ArrowLeft size={16} />
            Voltar
          </a>
          <div className="ml-auto flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--color-primary)] text-white text-xs font-bold">L</span>
            <span className="font-serif text-sm font-semibold">AN.BR</span>
          </div>
        </div>
      </header>

      <div className="container-x py-10 sm:py-16">
        <div className="mx-auto max-w-2xl">

          {/* Step indicator */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => (
                <div key={s.num} className="flex items-center">
                  <div className={`flex items-center gap-2 ${passo >= s.num ? "text-[var(--color-primary)]" : "text-[var(--color-line)]"}`}>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all ${
                      passo > s.num ? "bg-[var(--color-primary)] text-white" :
                      passo === s.num ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20" :
                      "bg-[var(--color-line)]/50 text-ink-soft"
                    }`}>
                      {passo > s.num ? <Check size={14} /> : s.num}
                    </div>
                    <span className="hidden text-xs font-medium sm:inline">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`mx-2 h-px w-6 sm:w-12 transition-colors ${passo > s.num ? "bg-[var(--color-primary)]" : "bg-[var(--color-line)]"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {passo === 1 && "Qual seu tipo de serviço?"}
              {passo === 2 && "Seus dados"}
              {passo === 3 && "Seu endereço online"}
              {passo === 4 && "Seus serviços"}
              {passo === 5 && "Finalizar"}
            </h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              {passo === 1 && "Escolha a categoria que melhor descreve seu negócio."}
              {passo === 2 && "Informações básicas para criar sua conta."}
              {passo === 3 && "Defina seu link público e contato."}
              {passo === 4 && "Quais serviços você oferece?"}
              {passo === 5 && "Revise e personalize seu sistema."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {passo === 1 && (
              <motion.div key="passo1" variants={containerVar} initial="hidden" animate="visible" exit="exit">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {categorias.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
  setCategoria(cat.id);
  const padrao = getServicosPadrao(cat.id);
  setServicos(padrao.map((s, i) => ({ ...s, ordem: i + 1 })));
  updateField("slogan", getSloganPadrao(cat.id));
}}
                      className={`card flex flex-col items-center gap-3 p-5 text-center transition-all ${
                        categoria === cat.id
                          ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-sm"
                          : "hover:border-[var(--color-primary)]/40 hover:shadow-sm"
                      }`}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                        categoria === cat.id
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      }`}>
                        {cat.icone}
                      </div>
                      <span className="text-sm font-medium text-ink leading-tight">{cat.nome}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <button onClick={() => setPasso(2)} disabled={!categoria}
                    className="btn-emerald gap-2 px-6 py-3 text-sm font-semibold disabled:opacity-50">
                    Continuar <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {passo === 2 && (
              <motion.div key="passo2" variants={containerVar} initial="hidden" animate="visible" exit="exit">
                <div className="card space-y-4 p-8">
                  <input type="text" placeholder="Seu nome completo" value={form.nome}
                    onChange={(e) => updateField("nome", e.target.value)} className={inp} />
                  <input type="email" placeholder="Seu email" value={form.email}
                    onChange={(e) => updateField("email", e.target.value)} className={inp} />
                  <input type="password" placeholder="Sua senha" value={form.senha}
                    onChange={(e) => updateField("senha", e.target.value)} className={inp} />
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setPasso(1)}
                    className="flex w-32 items-center justify-center gap-2 rounded-xl border border-[var(--color-line)] px-6 py-3 text-sm font-medium text-ink transition-all hover:bg-white">
                    <ArrowLeft size={16} /> Voltar
                  </button>
                  <button onClick={() => setPasso(3)} disabled={!form.nome || !form.email || !form.senha}
                    className="flex-1 btn-emerald gap-2 px-6 py-3 text-sm font-semibold disabled:opacity-50">
                    Continuar <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {passo === 3 && (
              <motion.div key="passo3" variants={containerVar} initial="hidden" animate="visible" exit="exit">
                <div className="card space-y-4 p-8">
                  <div>
                    <label className="text-sm text-ink-soft mb-1.5 block">Seu link</label>
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-white px-4 has-[input:focus]:border-[var(--color-primary)]">
                      <span className="text-sm text-ink-soft shrink-0">livreta.com.br/</span>
                      <input type="text" placeholder="seu-negocio" value={form.slug}
                        onChange={(e) => updateField("slug", e.target.value)}
                        className="flex-1 py-3 text-sm outline-none bg-transparent" />
                    </div>
                  </div>
                  <input type="text" placeholder="Seu WhatsApp com DDD (ex: 5541999999999)" value={form.whatsapp}
                    onChange={(e) => updateField("whatsapp", e.target.value)} className={inp} />
                  <input type="text" placeholder="Sua cidade" value={form.cidade}
                    onChange={(e) => updateField("cidade", e.target.value)} className={inp} />
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setPasso(2)}
                    className="flex w-32 items-center justify-center gap-2 rounded-xl border border-[var(--color-line)] px-6 py-3 text-sm font-medium text-ink transition-all hover:bg-white">
                    <ArrowLeft size={16} /> Voltar
                  </button>
                  <button onClick={() => setPasso(4)} disabled={!form.slug || !form.whatsapp || !form.cidade}
                    className="flex-1 btn-emerald gap-2 px-6 py-3 text-sm font-semibold disabled:opacity-50">
                    Continuar <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {passo === 4 && (
              <motion.div key="passo4" variants={containerVar} initial="hidden" animate="visible" exit="exit">
                <div className="card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-ink-soft">Adicione os serviços que você oferece</p>
                    <button onClick={addServico}
                      className="rounded-lg bg-[var(--color-primary)]/10 px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)]/20">
                      + Adicionar
                    </button>
                  </div>
                  <div className="space-y-4">
                    {servicos.map((s, i) => (
                      <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)]/50 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Serviço {i + 1}</span>
                          {servicos.length > 1 && (
                            <button onClick={() => removeServico(i)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remover</button>
                          )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <input type="text" placeholder="Nome do serviço" value={s.nome}
                            onChange={(e) => updateServico(i, "nome", e.target.value)}
                            className="col-span-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]" />
                          <input type="text" placeholder="Descrição (opcional)" value={s.descricao}
                            onChange={(e) => updateServico(i, "descricao", e.target.value)}
                            className="col-span-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]" />
                          <div>
                            <label className="mb-1 block text-xs text-ink-soft">Tipo</label>
                            <select value={s.tipo_preco}
                              onChange={(e) => updateServico(i, "tipo_preco", e.target.value as "por_hora" | "fixo")}
                              className="w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]">
                              <option value="por_hora">Por hora</option>
                              <option value="fixo">Preço fixo</option>
                            </select>
                          </div>
                          {s.tipo_preco === "por_hora" ? (
                            <>
                              <div>
                                <label className="mb-1 block text-xs text-ink-soft">R$/hora</label>
                                <input type="number" min={0} value={s.valor_hora}
                                  onChange={(e) => updateServico(i, "valor_hora", Number(e.target.value))}
                                  className="w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]" />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-ink-soft">Horas mínimas</label>
                                <input type="number" min={1} step={0.5} value={s.horas_minimas}
                                  onChange={(e) => updateServico(i, "horas_minimas", Number(e.target.value))}
                                  className="w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]" />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <label className="mb-1 block text-xs text-ink-soft">Preço (R$)</label>
                                <input type="number" min={0} value={s.preco_fixo}
                                  onChange={(e) => updateServico(i, "preco_fixo", Number(e.target.value))}
                                  className="w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]" />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-ink-soft">Duração (min)</label>
                                <input type="number" min={5} step={5} value={s.duracao_minutos}
                                  onChange={(e) => updateServico(i, "duracao_minutos", Number(e.target.value))}
                                  className="w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setPasso(3)}
                    className="flex w-32 items-center justify-center gap-2 rounded-xl border border-[var(--color-line)] px-6 py-3 text-sm font-medium text-ink transition-all hover:bg-white">
                    <ArrowLeft size={16} /> Voltar
                  </button>
                  <button onClick={() => setPasso(5)} disabled={!servicos.some((s) => s.nome.trim())}
                    className="flex-1 btn-emerald gap-2 px-6 py-3 text-sm font-semibold disabled:opacity-50">
                    Continuar <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {passo === 5 && (
              <motion.div key="passo5" variants={containerVar} initial="hidden" animate="visible" exit="exit">
                <div className="card p-8 space-y-6">
                  {/* Recebimento */}
                  <div>
                    <label className="text-sm text-ink-soft mb-1.5 block font-medium">Chave Pix</label>
                    <input type="text" placeholder="Sua chave Pix (CPF, email, telefone)" value={form.pix_chave}
                      onChange={(e) => updateField("pix_chave", e.target.value)}
                      className={inp} />
                  </div>
                  <div>
                    <label className="text-sm text-ink-soft mb-1.5 block font-medium">Slogan</label>
                    <input type="text" placeholder="Ex: Limpeza profissional em Curitiba" value={form.slogan}
                      onChange={(e) => updateField("slogan", e.target.value)}
                      className={inp} />
                  </div>

                  {/* Template selector */}
                  <div>
                    <label className="text-sm text-ink-soft mb-3 block font-medium">Template visual</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 1, nome: "Clássico", desc: "Verde elegante", bg: "from-emerald-50 to-white", accent: "bg-emerald-600" },
                        { id: 2, nome: "Moderno", desc: "Minimalista", bg: "from-neutral-50 to-white", accent: "bg-ink" },
                      ].map((t) => (
                        <button key={t.id}
                          onClick={() => setForm((prev) => ({ ...prev, template_id: t.id }))}
                          className={`card overflow-hidden text-left transition-all ${
                            form.template_id === t.id ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-sm" : ""
                          }`}
                        >
                          <div className={`h-20 bg-gradient-to-br ${t.bg} p-4 flex flex-col justify-end`}>
                            <div className={`h-5 w-24 rounded ${t.accent} opacity-80`} />
                            <div className="mt-1 h-2 w-32 rounded bg-[var(--color-line)]/50" />
                          </div>
                          <div className="p-4">
                            <p className="font-semibold text-sm text-ink">{t.nome}</p>
                            <p className="text-xs text-ink-soft mt-0.5">{t.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {erro && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{erro}</div>}

                  <button onClick={handleSubmit} disabled={enviando}
                    className="w-full btn-emerald justify-center gap-2 px-6 py-3.5 text-sm font-semibold disabled:opacity-50">
                    {enviando ? "Criando sistema..." : "Criar meu sistema"}
                    {!enviando && <ChevronRight size={16} />}
                  </button>
                </div>
                <div className="mt-6">
                  <button onClick={() => setPasso(4)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-line)] px-6 py-3 text-sm font-medium text-ink transition-all hover:bg-white w-full sm:w-32">
                    <ArrowLeft size={16} /> Voltar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Categorias dict for default services */}
      {categoria && <input type="hidden" />}
    </div>
  );
}