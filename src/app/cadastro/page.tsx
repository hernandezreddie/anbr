"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, User, Globe, Eye, EyeOff,
  Wrench, Scissors, Stethoscope, Dumbbell, Brush, ChefHat, Camera,
  MonitorSmartphone, Sparkles, Briefcase, Hand, HeartPulse, Car, PawPrint,
} from "lucide-react";
import { getServicosPadrao, getSloganPadrao, type CategoriaId } from "@/lib/servicos-padrao";
import { getCopyPadrao } from "@/lib/copys-padrao";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const categorias = [
  { id: "limpeza" as CategoriaId, icone: <Wrench size={24} />, nome: "Limpeza e Conservação" },
  { id: "beleza" as CategoriaId, icone: <Scissors size={24} />, nome: "Beleza e Estética" },
  { id: "unhas" as CategoriaId, icone: <Hand size={24} />, nome: "Manicure & Nail Designer" },
  { id: "saude" as CategoriaId, icone: <Stethoscope size={24} />, nome: "Saúde e Bem-estar" },
  { id: "clinica" as CategoriaId, icone: <HeartPulse size={24} />, nome: "Clínica e Consultório" },
  { id: "personal" as CategoriaId, icone: <Dumbbell size={24} />, nome: "Personal & Esportes" },
  { id: "automotivo" as CategoriaId, icone: <Car size={24} />, nome: "Automotivo" },
  { id: "veterinario" as CategoriaId, icone: <PawPrint size={24} />, nome: "Pet Shop & Veterinária" },
  { id: "artes" as CategoriaId, icone: <Brush size={24} />, nome: "Artes e Ofícios" },
  { id: "gastronomia" as CategoriaId, icone: <ChefHat size={24} />, nome: "Gastronomia" },
  { id: "fotografia" as CategoriaId, icone: <Camera size={24} />, nome: "Fotografia e Eventos" },
  { id: "consultoria" as CategoriaId, icone: <MonitorSmartphone size={24} />, nome: "Consultoria e Aulas" },
  { id: "outro" as CategoriaId, icone: <Briefcase size={24} />, nome: "Outro Negócio" },
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
  const [copyVariante, setCopyVariante] = useState(0);
  const [slugEditado, setSlugEditado] = useState(false);
  const [servicos, setServicos] = useState<ServicoForm[]>([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [verSenha, setVerSenha] = useState(false);
  const [consentimento, setConsentimento] = useState(false);

  const slugFromNome = (nome: string) =>
    nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

  const updateField = (field: string, value: string) => {
    const next = { ...form, [field]: value };
    if (field === "nome" && !slugEditado)
      next.slug = slugFromNome(value);
    if (field === "slug" && value !== slugFromNome(form.nome))
      setSlugEditado(true);
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
    if (!consentimento) {
      setErro("Para criar sua conta, aceite os Termos de Uso e a Política de Privacidade.");
      return;
    }
    setErro(""); setEnviando(true);
    const payload = {
      nome: form.nome, email: form.email, senha: form.senha,
      slug: form.slug, whatsapp: form.whatsapp, cidade: form.cidade,
      pix_chave: form.pix_chave, slogan: form.slogan || `${form.nome} — Profissional de confiança`,
      template_id: form.template_id,
      copy_variante: copyVariante,
      categoria,
      consentimento: true,
      servicos: servicos.filter((s) => s.nome.trim()),
    };
    const res = await fetch("/api/cadastro", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setEnviando(false);
    if (!res.ok) { setErro(data.error || "Erro ao criar sistema"); return; }
    try {
      sessionStorage.setItem("anbr_credenciais", JSON.stringify({ email: form.email, senha: form.senha }));
    } catch { /* ignora */ }
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
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink transition-colors">
            <ArrowLeft size={16} />
            Voltar
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md"><Logo className="h-6 w-6" /></span>
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
            {passo === 2 && "Seu negócio"}
            {passo === 3 && "Seu endereço online"}
            {passo === 4 && "Seus serviços"}
            {passo === 5 && "Finalizar"}
            </h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              {passo === 1 && "Escolha a categoria que melhor descreve seu negócio."}
              {passo === 2 && "O nome que seus clientes vão ver — e o acesso ao seu painel."}
              {passo === 3 && "Defina seu link público e contato."}
              {passo === 4 && "Quais serviços você oferece?"}
              {passo === 5 && "Revise e personalize seu sistema."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {passo === 1 && (
              <motion.div key="passo1" variants={containerVar} initial="hidden" animate="visible" exit="exit">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {categorias.map((cat) => {
                    const selected = categoria === cat.id;
                    return (
                    <motion.button
                      key={cat.id}
                      onClick={() => {
  setCategoria(cat.id);
  const padrao = getServicosPadrao(cat.id);
  setServicos(padrao.map((s, i) => ({ ...s, ordem: i + 1 })));
  updateField("slogan", getSloganPadrao(cat.id));
}}
                      whileTap={{ scale: 0.95 }}
                      animate={{ scale: selected ? 1.03 : 1 }}
                      className={`card relative flex flex-col items-center gap-3 p-5 text-center transition-all ${
                        selected
                          ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-md shadow-[var(--color-primary)]/10"
                          : "hover:border-[var(--color-primary)]/40 hover:shadow-sm"
                      }`}
                    >
                      {selected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)]"
                        >
                          <Check size={12} className="text-white" />
                        </motion.span>
                      )}
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                        selected
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      }`}>
                        {cat.icone}
                      </div>
                      <span className="text-sm font-medium text-ink leading-tight">{cat.nome}</span>
                    </motion.button>
                    );
                  })}
                </div>
                <div className="mt-8 flex justify-end">
                <Button variant="primary" size="lg" className="gap-2" onClick={() => setPasso(2)} disabled={!categoria}>
                  Continuar <ChevronRight size={16} />
                </Button>
                </div>
              </motion.div>
            )}

            {passo === 2 && (
              <motion.div key="passo2" variants={containerVar} initial="hidden" animate="visible" exit="exit">
                <Card className="space-y-5 p-8">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">Nome do seu negócio</label>
                    <input type="text" placeholder="Ex: Dona Maria Limpeza" value={form.nome}
                      onChange={(e) => updateField("nome", e.target.value)} className={inp} />
                    <p className="mt-1.5 text-xs text-ink-soft">
                      Como seus clientes vão te encontrar. Pode ser seu nome, o da empresa ou uma marca —
                      aparece na sua página, no WhatsApp e no Pix. Você pode mudar depois.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">Seu email</label>
                    <input type="email" placeholder="voce@email.com" value={form.email}
                      onChange={(e) => updateField("email", e.target.value)} className={inp} />
                    <p className="mt-1.5 text-xs text-ink-soft">Usamos para você entrar no painel.</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">Sua senha</label>
                    <div className="relative">
                      <input type={verSenha ? "text" : "password"} placeholder="No mínimo 6 caracteres" value={form.senha}
                        onChange={(e) => updateField("senha", e.target.value)} className={inp} />
                      <button type="button" onClick={() => setVerSenha((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors">
                        {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </Card>
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" size="lg" className="gap-2" onClick={() => setPasso(1)}>
                    <ArrowLeft size={16} /> Voltar
                  </Button>
                  <Button variant="primary" size="lg" className="flex-1 gap-2" onClick={() => setPasso(3)} disabled={!form.nome || !form.email || !form.senha}>
                    Continuar <ChevronRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {passo === 3 && (
              <motion.div key="passo3" variants={containerVar} initial="hidden" animate="visible" exit="exit">
                <Card className="space-y-5 p-8">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">Seu link</label>
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-white px-4 has-[input:focus]:border-[var(--color-primary)]">
                      <span className="text-sm text-ink-soft shrink-0">autonexabrasil.com.br/</span>
                      <input type="text" placeholder="seu-negocio" value={form.slug}
                        onChange={(e) => updateField("slug", e.target.value)}
                        className="flex-1 py-3 text-sm outline-none bg-transparent" />
                    </div>
                    <p className="mt-1.5 text-xs text-ink-soft">
                      {slugEditado
                        ? "Link personalizado — é assim que seus clientes vão te achar."
                        : "Gerado a partir do nome do seu negócio — pode editar à vontade."}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">WhatsApp</label>
                    <input type="text" placeholder="Ex: 5541999999999" value={form.whatsapp}
                      onChange={(e) => updateField("whatsapp", e.target.value)} className={inp} />
                    <p className="mt-1.5 text-xs text-ink-soft">Com DDI (55) e DDD. É por ele que você recebe confirmações e lembretes dos agendamentos.</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">Sua cidade</label>
                    <input type="text" placeholder="Ex: Curitiba" value={form.cidade}
                      onChange={(e) => updateField("cidade", e.target.value)} className={inp} />
                  </div>
                </Card>
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" size="lg" className="gap-2" onClick={() => setPasso(2)}>
                    <ArrowLeft size={16} /> Voltar
                  </Button>
                  <Button variant="primary" size="lg" className="flex-1 gap-2" onClick={() => setPasso(4)} disabled={!form.slug || !form.whatsapp || !form.cidade}>
                    Continuar <ChevronRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {passo === 4 && (
              <motion.div key="passo4" variants={containerVar} initial="hidden" animate="visible" exit="exit">
                <Card className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-ink-soft">
                      {categoria === "outro"
                        ? "Configure seus serviços manualmente — do seu jeito, no seu detalhe."
                        : "Adicione os serviços que você oferece"}
                    </p>
                    <Button variant="primary" size="sm" onClick={addServico}>
                      + Adicionar
                    </Button>
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
                </Card>
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" size="lg" className="gap-2" onClick={() => setPasso(3)}>
                    <ArrowLeft size={16} /> Voltar
                  </Button>
                  <Button variant="primary" size="lg" className="flex-1 gap-2" onClick={() => setPasso(5)} disabled={!servicos.some((s) => s.nome.trim())}>
                    Continuar <ChevronRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {passo === 5 && (
              <motion.div key="passo5" variants={containerVar} initial="hidden" animate="visible" exit="exit">
                <Card className="p-8 space-y-6">
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
                    <p className="mt-1.5 text-xs text-ink-soft">Aparece logo abaixo do nome no seu site. Se deixar vazio, criamos um pra você.</p>
                  </div>

                  {/* Texto do site */}
                  {categoria && (
                    <div>
                      <label className="text-sm text-ink-soft mb-1.5 block font-medium">Texto do seu site</label>
                      <p className="mb-3 text-xs text-ink-soft">
                        Textos prontos escritos para o seu tipo de negócio — título, subtítulo e chamadas.
                        Escolha o que mais combina com você (dá pra trocar depois no painel).
                      </p>
                      <div className="grid gap-3">
                        {[0, 1, 2].map((i) => {
                          const copy = getCopyPadrao(categoria as CategoriaId, i);
                          const baseCopy = getCopyPadrao(categoria as CategoriaId);
                          const variante = i === 0
                            ? { nome: "Equilibrado", descricao: "Texto padrão: claro e acolhedor" }
                            : { nome: baseCopy.variantes?.[i]?.nome || `Opção ${i}`, descricao: baseCopy.variantes?.[i]?.descricao || "" };
                          const selected = copyVariante === i;
                          return (
                            <motion.button
                              key={i}
                              type="button"
                              onClick={() => setCopyVariante(i)}
                              whileTap={{ scale: 0.98 }}
                              className={`relative rounded-2xl border-2 p-4 text-left transition-all ${
                                selected
                                  ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 bg-[var(--color-primary)]/[0.03]"
                                  : "border-[var(--color-line)] bg-white hover:border-[var(--color-primary)]/40"
                              }`}
                            >
                              {selected && (
                                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)]">
                                  <Check size={12} className="text-white" />
                                </span>
                              )}
                              <p className="text-sm font-semibold text-ink">
                                {variante.nome}
                                <span className="ml-2 text-xs font-normal text-ink-soft">{variante.descricao}</span>
                              </p>
                              <p className="mt-2 text-sm font-serif text-ink leading-snug">
                                {copy.hero_titulo.join(" ")}
                              </p>
                              <p className="mt-1 text-xs text-ink-soft line-clamp-2">{copy.hero_sub}</p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Template selector */}
                  <div>
                    <label className="text-sm text-ink-soft mb-3 block font-medium">Template visual</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 1, nome: "Clássico", desc: "Verde elegante", bg: "from-teal-50 to-white", accent: "bg-teal-600" },
                        { id: 2, nome: "Moderno", desc: "Minimalista", bg: "from-neutral-50 to-white", accent: "bg-ink" },
                      ].map((t) => {
                        const selected = form.template_id === t.id;
                        return (
                          <motion.button
                            key={t.id}
                            onClick={() => setForm((prev) => ({ ...prev, template_id: t.id }))}
                            whileTap={{ scale: 0.97 }}
                            animate={{ scale: selected ? 1.02 : 1 }}
                            className={`relative overflow-hidden rounded-2xl border-2 text-left transition-all ${
                              selected
                                ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/25 shadow-md shadow-[var(--color-primary)]/10"
                                : "border-transparent bg-white hover:border-[var(--color-primary)]/40"
                            }`}
                          >
                            {selected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] shadow-md"
                              >
                                <Check size={15} className="text-white" />
                              </motion.div>
                            )}
                            <div className={`h-20 bg-gradient-to-br ${t.bg} p-4 flex flex-col justify-end`}>
                              <div className={`h-5 w-24 rounded ${t.accent} opacity-80`} />
                              <div className="mt-1 h-2 w-32 rounded bg-[var(--color-line)]/50" />
                            </div>
                            <div className="p-4">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-sm text-ink">{t.nome}</p>
                                {selected && (
                                  <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-primary)]"
                                  >
                                    Selecionado
                                  </motion.span>
                                )}
                              </div>
                              <p className="text-xs text-ink-soft mt-0.5">{t.desc}</p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {erro && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{erro}</div>}

                  {/* Consentimento LGPD */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)]/50 p-4 transition-colors hover:border-[var(--color-primary)]/40">
                    <input
                      type="checkbox"
                      checked={consentimento}
                      onChange={(e) => setConsentimento(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]"
                    />
                    <span className="text-sm leading-relaxed text-ink-soft">
                      Li e aceito os{" "}
                      <Link href="/termos" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--color-primary)] underline underline-offset-2">Termos de Uso</Link>{" "}
                      e a{" "}
                      <Link href="/privacidade" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--color-primary)] underline underline-offset-2">Política de Privacidade</Link>{" "}
                      e autorizo o tratamento dos meus dados pessoais conforme a LGPD (Lei 13.709/2018).
                    </span>
                  </label>

                <Button variant="primary" size="lg" className="w-full gap-2" onClick={handleSubmit} disabled={enviando}>
                  {enviando ? "Criando sistema..." : "Criar meu sistema"}
                  {!enviando && <ChevronRight size={16} />}
                </Button>
              </Card>
              <div className="mt-6">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto" onClick={() => setPasso(4)}>
                  <ArrowLeft size={16} /> Voltar
                </Button>
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
