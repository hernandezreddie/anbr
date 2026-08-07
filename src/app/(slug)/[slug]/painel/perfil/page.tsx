"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Save, Check, Play } from "lucide-react";
import { motion } from "framer-motion";
import { FUNDOS } from "@/lib/backgrounds";
import { getCopyPadrao } from "@/lib/copys-padrao";
import { getMensagensPadrao } from "@/lib/servicos-padrao";
import { TEMAS_POR_NICHO, getTemaPorNicho, type TemaPreset } from "@/lib/temas";
import { Copy } from "lucide-react";
import { Dica } from "@/components/painel/Dica";
import { TextosPersonalizadosEditor } from "@/components/painel/TextosPersonalizadosEditor";

type Servico = {
  id: string;
  nome: string;
  descricao: string;
  tipo_preco: string;
  valor_hora: number;
  preco_fixo: number;
  horas_minimas: number;
  duracao_minutos: number;
  multiplicador: number;
  horas_extras: number;
  ativo: boolean;
  ordem: number;
};

type Adicional = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  horas: number;
  ativo: boolean;
};

type Frequencia = {
  id: string;
  nome: string;
  slug: string;
  desconto: number;
  ordem: number;
};

type Configuracao = {
  profissional_id: string;
  template_id: number;
  cor_primaria: string;
  cor_secundaria: string;
  fonte_titulo: string;
  fonte_corpo: string;
  logo_url: string;
  foto_fundo: string;
  video_fundo: string;
  slogan: string;
  fundo_estilo: string;
  max_agendamentos_dia: string;
  horario_inicio?: number | null;
  horario_fim?: number | null;
  copy_variante?: number;
  msg_variante?: number;
  instagram?: string;
  facebook?: string;
  google_maps?: string;
  textos_personalizados?: Record<string, any> | null;
};

const OPCOES_HORARIO = Array.from({ length: 48 }, (_, i) => {
  const min = i * 30;
  return {
    min,
    label: `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`,
  };
});

type Profissional = {
  id: string;
  nome: string;
  slogan: string;
  cidade: string;
  whatsapp: string;
  pix_chave: string;
  pix_nome: string;
  pix_cidade: string;
  categoria?: string | null;
  link_avaliacao?: string | null;
};

const fontes = [
  { value: "Fraunces", label: "Fraunces (elegante)" },
  { value: "Inter", label: "Inter (moderno)" },
  { value: "Playfair Display", label: "Playfair Display (clássico)" },
  { value: "DM Sans", label: "DM Sans (limpo)" },
];

const inp = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600";
const inpMini = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600";

function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-neutral-900">{title}</h2>
      {children}
    </div>
  );
}

export default function PerfilPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fundoInputRef = useRef<HTMLInputElement>(null);

  const [profissional, setProfissional] = useState<Profissional | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);
  const [frequencias, setFrequencias] = useState<Frequencia[]>([]);
  const [config, setConfig] = useState<Configuracao | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmarDelete, setConfirmarDelete] = useState<{ tipo: string; id: string } | null>(null);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 2500);
  };

  const carregar = async () => {
    const [profRes, servicosRes, adicionaisRes, frequenciasRes, configRes] = await Promise.all([
      supabase.from("profissionais").select("*").single(),
      supabase.from("servicos").select("*").order("ordem"),
      supabase.from("adicionais").select("*").order("nome"),
      supabase.from("frequencias").select("*").order("ordem"),
      supabase.from("configuracoes").select("*").single(),
    ]);
    if (profRes.error) console.error("Erro ao carregar profissional:", profRes.error);
    if (configRes.error) console.error("Erro ao carregar configurações:", configRes.error);
    if (profRes.data) setProfissional(profRes.data as Profissional);
    if (servicosRes.data) setServicos(servicosRes.data as Servico[]);
    if (adicionaisRes.data) setAdicionais(adicionaisRes.data as Adicional[]);
    if (frequenciasRes.data) setFrequencias(frequenciasRes.data as Frequencia[]);
    if (configRes.data) {
      const cfg = configRes.data as Configuracao;
      setConfig({
        ...cfg,
        copy_variante: Number(cfg.copy_variante) || 0,
        msg_variante: Number(cfg.msg_variante) || 0,
      });
    }
  };

  useEffect(() => { carregar(); }, []);

  async function salvarTudo() {
    if (!profissional) {
      flash("Não foi possível carregar seus dados. Recarregue a página.");
      return;
    }
    setSaving(true);

    const TIMEOUT = 10000; // 10s

    const profPromise = supabase.from("profissionais").update({
      nome: profissional.nome,
      slogan: profissional.slogan,
      cidade: profissional.cidade,
      whatsapp: profissional.whatsapp,
      pix_chave: profissional.pix_chave,
      pix_nome: profissional.pix_nome,
      pix_cidade: profissional.pix_cidade,
      link_avaliacao: profissional.link_avaliacao || null,
    }).eq("id", profissional.id);

    const configPromise = fetch("/api/config/atualizar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profissional_id: config?.profissional_id || profissional.id,
        cor_primaria: config?.cor_primaria,
        cor_secundaria: config?.cor_secundaria,
        template_id: config?.template_id ?? 1,
        fonte_titulo: config?.fonte_titulo,
        fonte_corpo: config?.fonte_corpo,
        fundo_estilo: config?.fundo_estilo || "none",
        max_agendamentos_dia: config?.max_agendamentos_dia
          ? Number(config.max_agendamentos_dia)
          : null,
        horario_inicio: config?.horario_inicio ?? null,
        horario_fim: config?.horario_fim ?? null,
        copy_variante: Number(config?.copy_variante) || 0,
        msg_variante: Number(config?.msg_variante) || 0,
        instagram: config?.instagram ?? "",
        facebook: config?.facebook ?? "",
        google_maps: config?.google_maps ?? "",
        textos_personalizados: config?.textos_personalizados ?? null,
      }),
    });

    function withTimeout(p: any, label: string): Promise<any> {
      return Promise.race([
        Promise.resolve(p),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timeout`)), TIMEOUT)),
      ]);
    }

    try {
      const [profRes, configRes] = await Promise.all([
        withTimeout(profPromise, "profissionais"),
        withTimeout(configPromise, "config"),
      ]);

      if ((profRes as any).error) throw new Error((profRes as any).error.message);
      if (!(configRes as Response).ok) {
        const err = await (configRes as Response).json().catch(() => ({}));
        throw new Error(err.error || "configurações não salvaram");
      }

      flash("Tudo salvo! ✔");
      carregar();
    } catch (e: any) {
      flash("Erro ao salvar: " + (e.message || e));
    } finally {
      setSaving(false);
    }
  }

  function updateProfField(field: keyof Profissional, value: string) {
    setProfissional((prev) => prev ? { ...prev, [field]: value } : null);
  }

  function updateConfigField(field: keyof Configuracao, value: any) {
    setConfig((prev) => prev ? { ...prev, [field]: value } : null);
  }

  function aplicarTema(t: TemaPreset) {
    updateConfigField("template_id", t.template_id);
    updateConfigField("cor_primaria", t.cor_primaria);
    updateConfigField("cor_secundaria", t.cor_secundaria);
    updateConfigField("fundo_estilo", t.fundo_estilo);
    updateConfigField("fonte_titulo", t.fonte_titulo);
    updateConfigField("fonte_corpo", t.fonte_corpo);
    flash("Tema aplicado! Toque em Salvar alterações para publicar");
  }

  async function updateServico(id: string, field: string, value: any) {
    await supabase.from("servicos").update({ [field]: value }).eq("id", id);
    setServicos((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  async function addServico() {
    if (!profissional) return;
    const { data } = await supabase.from("servicos").insert({
      profissional_id: profissional.id,
      nome: "Novo serviço",
      descricao: "",
      tipo_preco: "por_hora",
      valor_hora: 0,
      preco_fixo: 0,
      horas_minimas: 0,
      duracao_minutos: 60,
      multiplicador: 1,
      horas_extras: 0,
      ativo: true,
      ordem: servicos.length,
    }).select().single();
    if (data) {
      setServicos((prev) => [...prev, data as Servico]);
      flash("Serviço criado!");
    }
  }

  async function deleteServico(id: string) {
    await supabase.from("servicos").delete().eq("id", id);
    setServicos((prev) => prev.filter((s) => s.id !== id));
    setConfirmarDelete(null);
    flash("Serviço excluído");
  }

  async function addAdicional() {
    if (!profissional) return;
    const { data } = await supabase.from("adicionais").insert({
      profissional_id: profissional.id,
      nome: "Novo adicional",
      descricao: "",
      preco: 0,
      horas: 0,
      ativo: true,
    }).select().single();
    if (data) {
      setAdicionais((prev) => [...prev, data as Adicional]);
      flash("Adicional criado!");
    }
  }

  async function updateAdicional(id: string, field: string, value: any) {
    await supabase.from("adicionais").update({ [field]: value }).eq("id", id);
    setAdicionais((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }

  async function deleteAdicional(id: string) {
    await supabase.from("adicionais").delete().eq("id", id);
    setAdicionais((prev) => prev.filter((a) => a.id !== id));
    setConfirmarDelete(null);
    flash("Adicional excluído");
  }

  async function addFrequencia() {
    if (!profissional) return;
    const { data } = await supabase.from("frequencias").insert({
      profissional_id: profissional.id,
      nome: "Nova frequência",
      slug: "nova",
      desconto: 0,
      ordem: frequencias.length,
    }).select().single();
    if (data) {
      setFrequencias((prev) => [...prev, data as Frequencia]);
      flash("Frequência criada!");
    }
  }

  async function updateFrequencia(id: string, field: string, value: any) {
    await supabase.from("frequencias").update({ [field]: value }).eq("id", id);
    setFrequencias((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  }

  async function deleteFrequencia(id: string) {
    await supabase.from("frequencias").delete().eq("id", id);
    setFrequencias((prev) => prev.filter((f) => f.id !== id));
    setConfirmarDelete(null);
    flash("Frequência excluída");
  }

  const uploadLogo = async (file: File) => {
    if (!config) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("profissional_id", config.profissional_id);

    const res = await fetch("/api/upload/logo", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      setConfig((prev) => prev ? { ...prev, logo_url: data.url } : null);
      flash("Logo atualizado!");
    } else flash(data.error || "Erro ao enviar logo");
    setUploading(false);
  };

  const removeLogo = async () => {
    if (!config?.logo_url) return;
    setConfig((prev) => prev ? { ...prev, logo_url: "" } : null);
    await fetch("/api/config/atualizar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profissional_id: config!.profissional_id, logo_url: "" }),
    });
    flash("Logo removido");
  };

  const uploadFundo = async (file: File) => {
    if (!config) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("profissional_id", config.profissional_id);
    formData.append("destino", "fundo");

    const res = await fetch("/api/upload/logo", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      setConfig((prev) => prev ? { ...prev, foto_fundo: data.url } : null);
      flash("Foto de fundo atualizada!");
    } else flash(data.error || "Erro ao enviar foto");
    setUploading(false);
  };

  const removeFundo = async () => {
    if (!config?.foto_fundo) return;
    setConfig((prev) => prev ? { ...prev, foto_fundo: "" } : null);
    await fetch("/api/config/atualizar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profissional_id: config!.profissional_id, foto_fundo: "" }),
    });
    flash("Foto de fundo removida");
  };

  const uploadVideo = async (file: File) => {
    if (!config) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("profissional_id", config.profissional_id);
    formData.append("destino", "video");
    const res = await fetch("/api/upload/logo", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      setConfig((prev) => prev ? { ...prev, video_fundo: data.url } : null);
      flash("Vídeo de fundo atualizado!");
    } else flash(data.error || "Erro ao enviar vídeo");
    setUploading(false);
  };

  const removeVideo = async () => {
    if (!config?.video_fundo) return;
    setConfig((prev) => prev ? { ...prev, video_fundo: "" } : null);
    await fetch("/api/config/atualizar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profissional_id: config!.profissional_id, video_fundo: "" }),
    });
    flash("Vídeo de fundo removido");
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/70 bg-white/90 px-4 py-4 pb-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Perfil</h1>
          <p className="mt-1 text-sm text-neutral-500">Personalize sua página e gerencie serviços</p>
        </div>        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              updateConfigField("template_id", 1);
              updateConfigField("fundo_estilo", "none");
              updateConfigField("cor_primaria", "#059669");
              updateConfigField("cor_secundaria", "#1c1917");
              updateConfigField("fonte_titulo", "Fraunces");
              updateConfigField("fonte_corpo", "Inter");
              flash("Padrões restaurados! Salve para aplicar");
            }}
            className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-100"
          >
            Restaurar padrões
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={salvarTudo}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 disabled:opacity-50"
          >
          <Save size={16} />
          {saving ? "Salvando..." : "Salvar alterações"}
          </motion.button>
        </div>
      </div>

      <Dica>
        Tudo que você mudar aqui aparece na sua página pública — cores, logo, foto de fundo e serviços.
        Não esqueça de tocar em <strong>Salvar alterações</strong> no final.
      </Dica>

      {msg && (
        <div className="rounded-xl bg-teal-50 px-5 py-3 text-sm font-medium text-teal-700">{msg}</div>
      )}
      {/* Dados do Profissional + Cores + Tipografia — salvos com botão */}
      <CardSection title="Dados do Profissional">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Nome</label>
            <input value={profissional?.nome || ""} onChange={(e) => updateProfField("nome", e.target.value)} className={inp} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">WhatsApp (com DDI)</label>
            <input value={profissional?.whatsapp || ""} onChange={(e) => updateProfField("whatsapp", e.target.value)} className={inp} placeholder="5541999999999" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Slogan</label>
            <input value={profissional?.slogan || ""} onChange={(e) => updateProfField("slogan", e.target.value)} className={inp} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Cidade</label>
            <input value={profissional?.cidade || ""} onChange={(e) => updateProfField("cidade", e.target.value)} className={inp} />
          </div>
        </div>
        <div className="mt-4 border-t border-neutral-100 pt-4">
          <p className="mb-3 text-sm font-semibold text-neutral-500">Dados Pix</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-500">Chave Pix</label>
              <input value={profissional?.pix_chave || ""} onChange={(e) => updateProfField("pix_chave", e.target.value)} className={inp} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-500">Nome do titular</label>
              <input value={profissional?.pix_nome || ""} onChange={(e) => updateProfField("pix_nome", e.target.value)} className={inp} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-500">Cidade do titular</label>
              <input value={profissional?.pix_cidade || ""} onChange={(e) => updateProfField("pix_cidade", e.target.value)} className={inp} />
            </div>
          </div>
        <div className="mt-4 border-t border-neutral-100 pt-4">
          <p className="mb-1 text-sm font-semibold text-neutral-500">Link de avaliação (opcional)</p>
          <p className="mb-3 text-xs text-neutral-400">
            Link direto da sua avaliação no Google. Se preenchido, o convite enviado após o serviço aponta para ele (tem prioridade sobre o Google Maps).
          </p>
          <input
            value={profissional?.link_avaliacao || ""}
            onChange={(e) => updateProfField("link_avaliacao", e.target.value)}
            className={inp}
            placeholder="https://search.google.com/local/writereview?placeid=..."
          />
        </div>
        </div>
      </CardSection>
      <CardSection title="Logo">
        <div className="flex items-center gap-6">
          {config?.logo_url ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={config.logo_url} alt="Logo" className="h-full w-full object-contain" />
              <button onClick={removeLogo}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
              >×</button>
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-3xl text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
          )}
          <div>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-teal-700 disabled:opacity-50"
            >{uploading ? "Enviando..." : "Escolher imagem"}</button>
            <p className="mt-1.5 text-xs text-neutral-500">PNG, JPG ou WebP · Máx 5MB</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
          </div>
        </div>
      </CardSection>

      {/* Foto de fundo */}
      <CardSection title="Foto de fundo da página">
        <div className="flex items-center gap-6">
          {config?.foto_fundo ? (
            <div className="relative h-28 w-48 overflow-hidden rounded-xl border border-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={config.foto_fundo} alt="Foto de fundo" className="h-full w-full object-cover" />
              <button onClick={removeFundo}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
              >×</button>
            </div>
          ) : (
            <div className="flex h-28 w-48 items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
          )}
          <div>
            <button onClick={() => fundoInputRef.current?.click()} disabled={uploading}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-teal-700 disabled:opacity-50"
            >{uploading ? "Enviando..." : "Escolher foto"}</button>
            <p className="mt-1.5 text-xs text-neutral-500">Aparece grande atrás do título da página, com leve transparência. PNG, JPG ou WebP · Máx 5MB</p>
            <input ref={fundoInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFundo(f); }} />
          </div>
        </div>
      </CardSection>

      {/* Vídeo de fundo */}
      <CardSection title="Vídeo de fundo">
        <div className="flex items-center gap-6">
          {config?.video_fundo ? (
            <div className="relative h-28 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <video src={config.video_fundo} autoPlay muted loop playsInline className="h-full w-full object-cover" />
              <button onClick={removeVideo}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
              >×</button>
            </div>
          ) : (
            <div className="flex h-28 w-48 items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-neutral-400">
              <Play size={28} />
            </div>
          )}
          <div>
            <button onClick={() => videoInputRef.current?.click()} disabled={uploading}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-teal-700 disabled:opacity-50"
            >{uploading ? "Enviando..." : config?.video_fundo ? "Trocar vídeo" : "Enviar vídeo"}</button>
            <p className="mt-1.5 max-w-xs text-xs text-neutral-500">
              Loop curto (10–20s) na vertical funciona melhor no celular. Toca no fundo da página,
              no lugar da foto, com leve transparência. MP4 ou WebM · Máx 15MB · Sem som
            </p>
            <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadVideo(f); }} />
          </div>
        </div>
      </CardSection>

      {/* Fundo */}
      <CardSection title="Fundo da página">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FUNDOS.map((f) => {
            const selected = (config?.fundo_estilo || "none") === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                updateConfigField("fundo_estilo", f.id);
                updateConfigField("cor_primaria", f.primary);
                updateConfigField("cor_secundaria", f.secondary);
              }}
                className={`relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                  selected ? "border-teal-500 shadow-sm" : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div
                  className="-mx-4 -mt-4 mb-3 h-16"
                  style={{
                    background: f.id === "none" ? config?.cor_primaria || "#059669" : undefined,
                  }}
                >
                  {f.id !== "none" && (
                    <div
                      className="h-full w-full"
                      style={{
                        backgroundImage: f.id === "dots"
                          ? `radial-gradient(${config?.cor_primaria || "#059669"}20 1px, transparent 1px)`
                          : f.id === "waves"
                          ? `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 0 50 10 Q 75 20 100 10' stroke='${encodeURIComponent(config?.cor_primaria || "#059669")}20' fill='none' stroke-width='2'/%3E%3C/svg%3E")`
                          : f.id === "geometric"
                          ? `linear-gradient(45deg,${config?.cor_primaria || "#059669"}08 25%,transparent 25%),linear-gradient(-45deg,${config?.cor_primaria || "#059669"}08 25%,transparent 25%),linear-gradient(45deg,transparent 75%,${config?.cor_primaria || "#059669"}08 75%),linear-gradient(-45deg,transparent 75%,${config?.cor_primaria || "#059669"}08 75%)`
                          : undefined,
                        backgroundSize: f.id === "dots" ? "20px 20px" : f.id === "geometric" ? "40px 40px" : undefined,
                        background: f.id === "mesh"
                          ? `linear-gradient(135deg, ${config?.cor_primaria || "#059669"}, ${config?.cor_primaria || "#059669"}88)`
                          : f.id === "aurora"
                          ? `linear-gradient(135deg, ${config?.cor_primaria || "#059669"}, #a855f7, #f472b6)`
                          : f.id === "glass"
                          ? `linear-gradient(135deg, ${config?.cor_primaria || "#059669"}44, white)`
                          : f.id === "noise"
                          ? `linear-gradient(${config?.cor_primaria || "#059669"}, ${config?.cor_primaria || "#059669"}dd)`
                          : undefined,
                      }}
                    >
                      {f.id === "noise" && (
                        <div className="h-full w-full" style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.1'/%3E%3C/svg%3E")`,
                          backgroundSize: "256px 256px",
                        }} />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-neutral-900">{f.nome}</p>
                <p className="text-xs text-neutral-500">{f.descricao}</p>
              </button>
            );
          })}
        </div>
      </CardSection>

      {/* Tema do seu nicho */}
      <CardSection title="Tema do seu nicho">
        <p className="-mt-3 mb-4 text-sm text-neutral-500">
          Temas prontos pensados para cada tipo de negócio — plantilla, cores, fundo e fontes de uma vez só.
          Toque em um tema e depois em <strong>Salvar alterações</strong>.
        </p>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Plantilla visual</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 1, nome: "Clássico", desc: "Serifada elegante, tons suaves" },
            { id: 2, nome: "Moderno", desc: "Minimalista, linhas retas" },
          ].map((t) => {
            const selected = (config?.template_id ?? 1) === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { updateConfigField("template_id", t.id); flash("Plantilla aplicada! Salve para publicar"); }}
                className={`relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                  selected ? "border-teal-500 shadow-sm" : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                {selected && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white"><Check size={13} /></span>
                )}
                <div
                  className="-mx-4 -mt-4 mb-3 flex h-12 items-end px-3 pb-1.5"
                  style={{ background: t.id === 1 ? "linear-gradient(135deg,#059669,#14b8a6)" : "linear-gradient(135deg,#7c3aed,#1e1b4b)" }}
                >
                  <span className="text-lg font-semibold text-white" style={{ fontFamily: t.id === 1 ? "Fraunces, serif" : "Inter, sans-serif" }}>Aa</span>
                </div>
                <p className="text-sm font-medium text-neutral-900">{t.nome}</p>
                <p className="text-xs text-neutral-500">{t.desc}</p>
              </button>
            );
          })}
        </div>

        <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-400">Temas prontos por nicho</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(Object.entries(TEMAS_POR_NICHO) as [string, TemaPreset][]).map(([cat, t]) => {
            const ehMeuNicho = cat === profissional?.categoria;
            const ativo =
              (config?.template_id ?? 1) === t.template_id &&
              (config?.cor_primaria || "").toLowerCase() === t.cor_primaria.toLowerCase() &&
              (config?.fundo_estilo || "none") === t.fundo_estilo;
            return (
              <button
                key={cat}
                onClick={() => aplicarTema(t)}
                className={`relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                  ativo ? "border-teal-500 shadow-sm" : "border-neutral-200 hover:border-neutral-300"
                } ${ehMeuNicho ? "ring-1 ring-teal-400/40" : ""}`}
              >
                <div
                  className="-mx-4 -mt-4 mb-3 flex h-14 items-end justify-end p-2"
                  style={{ background: `linear-gradient(135deg, ${t.cor_primaria}, ${t.cor_secundaria})` }}
                >
                  {ehMeuNicho && (
                    <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">Seu nicho</span>
                  )}
                </div>
                <p className="text-sm font-medium text-neutral-900">{t.nome}</p>
                <p className="text-xs text-neutral-500">{t.descricao}</p>
                <p className="mt-1.5 text-[10px] text-neutral-400">{t.template_id === 1 ? "Clássico" : "Moderno"} · fundo {t.fundo_estilo}</p>
              </button>
            );
          })}
        </div>
      </CardSection>

      {/* Cores */}
      <CardSection title="Cores">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Cor principal</label>
            <div className="flex items-center gap-3">
              <input type="color" value={config?.cor_primaria || "#059669"}
                onChange={(e) => updateConfigField("cor_primaria", e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border border-neutral-200" />
              <input type="text" value={config?.cor_primaria || "#059669"}
                onChange={(e) => updateConfigField("cor_primaria", e.target.value)}
                className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 font-mono" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Cor secundária</label>
            <div className="flex items-center gap-3">
              <input type="color" value={config?.cor_secundaria || "#1c1917"}
                onChange={(e) => updateConfigField("cor_secundaria", e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-lg border border-neutral-200" />
              <input type="text" value={config?.cor_secundaria || "#1c1917"}
                onChange={(e) => updateConfigField("cor_secundaria", e.target.value)}
                className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 font-mono" />
            </div>
          </div>
        </div>
      </CardSection>

      {/* Tipografia */}
      <CardSection title="Tipografia">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Fonte dos títulos</label>
            <select value={config?.fonte_titulo || "Fraunces"}
              onChange={(e) => updateConfigField("fonte_titulo", e.target.value)}
              className={inp}>
              {fontes.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Fonte do corpo</label>
            <select value={config?.fonte_corpo || "Inter"}
              onChange={(e) => updateConfigField("fonte_corpo", e.target.value)}
              className={inp}>
              {fontes.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>
      </CardSection>

      {/* Texto do site — copy pronta por nicho */}
      <CardSection title="Texto do site">
        <p className="-mt-3 mb-4 text-sm text-neutral-500">
          Textos prontos escritos para o seu tipo de negócio — título, subtítulo e chamadas da sua página.
          Escolha o estilo e toque em <strong>Salvar alterações</strong>.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => {
            const copy = getCopyPadrao(profissional?.categoria, i);
            const base = getCopyPadrao(profissional?.categoria);
            const meta = i === 0
              ? { nome: "Equilibrado", descricao: "Texto padrão: claro e acolhedor" }
              : { nome: base.variantes?.[i]?.nome || `Opção ${i}`, descricao: base.variantes?.[i]?.descricao || "" };
            const selected = (config?.copy_variante ?? 0) === i;
            return (
              <motion.button
                key={i}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => updateConfigField("copy_variante", i)}
                className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                  selected ? "border-teal-500 bg-teal-50/50 shadow-sm" : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                {selected && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                )}
                <p className="pr-6 text-sm font-semibold text-neutral-900">{meta.nome}</p>
                <p className="text-xs text-neutral-500">{meta.descricao}</p>
                <p className="mt-3 font-serif text-[15px] font-semibold leading-snug text-neutral-900">
                  {copy.hero_titulo.join(" ")}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{copy.hero_sub}</p>
              </motion.button>
            );
          })}
        </div>
      </CardSection>

      {/* Textos personalizados — edição manual */}
      <CardSection title="Editar meus textos (opcional)">
        <p className="-mt-3 mb-4 text-sm text-neutral-500">
          Preencha só os campos que quiser mudar. O que ficar vazio usa o texto pronto do seu nicho.
          Toque em <strong>Salvar alterações</strong> ao final para aplicar.
        </p>

        <TextosPersonalizadosEditor
          valor={config?.textos_personalizados ?? {}}
          onChange={(novo) => updateConfigField("textos_personalizados", novo)}
          categoria={profissional?.categoria}
          variante={config?.copy_variante ?? 0}
        />
      </CardSection>

      {/* Mensagens do WhatsApp */}
      <CardSection title="Mensagens do WhatsApp">
        <p className="-mt-3 mb-4 text-sm text-neutral-500">
          Modelos prontos para confirmar agendamentos e mandar lembretes aos seus clientes.
          Escolha o estilo, toque em <strong>Salvar alterações</strong> e copie o texto na hora de conversar.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => {
            const msg = getMensagensPadrao(profissional?.categoria, i);
            const selected = (config?.msg_variante ?? 0) === i;
            return (
              <div key={i} className={`relative rounded-xl border-2 p-4 transition-all ${selected ? "border-teal-500 bg-teal-50/50 shadow-sm" : "border-neutral-200 bg-white"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-neutral-900">{msg.nome}</p>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(msg.confirmacao); flash(`Texto "${msg.nome}" copiado!`); }}
                    className="rounded-lg border border-neutral-200 px-2 py-1 text-[11px] text-neutral-500 hover:bg-neutral-50"
                    title="Copiar mensagem de confirmação"
                  >
                    <Copy size={12} className="inline" /> Copiar
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => updateConfigField("msg_variante", i)}
                  className="mt-2 block w-full text-left"
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">Confirmação</p>
                  <p className="mt-0.5 line-clamp-3 text-xs text-neutral-600">{msg.confirmacao}</p>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-neutral-400">Lembrete</p>
                  <p className="mt-0.5 line-clamp-3 text-xs text-neutral-600">{msg.lembrete}</p>
                </button>
                {selected && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardSection>

      {/* Suas redes */}
      <CardSection title="Suas redes">
        <p className="-mt-3 mb-4 text-sm text-neutral-500">
          Cole os links das suas redes e do Google Maps. Eles aparecem no rodapé do seu site —
          junto do WhatsApp, você fica completo digitalmente.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Instagram</label>
            <input
              value={config?.instagram ?? ""}
              onChange={(e) => updateConfigField("instagram", e.target.value)}
              placeholder="https://instagram.com/seuperfil"
              className={inp}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Facebook</label>
            <input
              value={config?.facebook ?? ""}
              onChange={(e) => updateConfigField("facebook", e.target.value)}
              placeholder="https://facebook.com/seupagina"
              className={inp}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Google Maps</label>
            <input
              value={config?.google_maps ?? ""}
              onChange={(e) => updateConfigField("google_maps", e.target.value)}
              placeholder="Link da sua ficha no Google Maps"
              className={inp}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-neutral-400">
          Para o Maps: abra sua empresa no Google Maps, toque em Compartilhar e copie o link.
        </p>
      </CardSection>

      {/* Limites */}
      <CardSection title="Limites">
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-500">
            Limite de agendamentos por dia
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input type="number" min="0" placeholder="Sem limite"
              value={config?.max_agendamentos_dia ?? ""}
              onChange={(e) => updateConfigField("max_agendamentos_dia", e.target.value)}
              className="w-32 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600" />
            <span className="text-xs text-neutral-400">
              Deixe vazio para aceitar quantos quiser. O site bloqueia novos pedidos quando atingir o limite.
            </span>
          </div>
        </div>
        <div className="mt-5 border-t border-neutral-100 pt-4">
          <label className="mb-1 block text-xs font-semibold text-neutral-500">
            Horário de atendimento
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={config?.horario_inicio ?? ""}
              onChange={(e) => updateConfigField("horario_inicio", e.target.value ? Number(e.target.value) : null)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600">
              <option value="">08:00 (padrão)</option>
              {OPCOES_HORARIO.map((o) => (
                <option key={o.min} value={o.min}>{o.label}</option>
              ))}
            </select>
            <span className="text-xs text-neutral-400">até</span>
            <select
              value={config?.horario_fim ?? ""}
              onChange={(e) => updateConfigField("horario_fim", e.target.value ? Number(e.target.value) : null)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600">
              <option value="">20:00 (padrão)</option>
              {OPCOES_HORARIO.map((o) => (
                <option key={o.min} value={o.min}>{o.label}</option>
              ))}
            </select>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            O cliente só verá horários dentro desta faixa no site de reservas. Deixe em branco para 08:00–20:00.
          </p>
        </div>
      </CardSection>

      {/* Serviços — auto-save inline */}
      <CardSection title="Serviços">
        <div className="space-y-3">
          {servicos.map((s) => (
            <div key={s.id} className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={s.nome}
                      onChange={(e) => updateServico(s.id, "nome", e.target.value)}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-base font-medium outline-none focus:border-teal-600" />
                    <div className="flex gap-2">
                      <select value={s.tipo_preco}
                        onChange={(e) => updateServico(s.id, "tipo_preco", e.target.value)}
                        className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600">
                        <option value="por_hora">Por hora</option>
                        <option value="fixo">Preço fixo</option>
                      </select>
                      <button onClick={() => updateServico(s.id, "ativo", !s.ativo)}
                        className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-all ${s.ativo ? "bg-teal-100 text-teal-700" : "bg-neutral-200 text-neutral-500"}`}>
                        {s.ativo ? "Ativo" : "Inativo"}
                      </button>
                    </div>
                  </div>
                  <textarea value={s.descricao}
                    onChange={(e) => updateServico(s.id, "descricao", e.target.value)} rows={2}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600" placeholder="Descrição do serviço" />
                  <div className="flex flex-wrap gap-4">
                    {s.tipo_preco === "por_hora" ? (<>
                      <div><label className="text-xs text-neutral-500">R$/hora</label>
                        <input type="number" value={s.valor_hora}
                          onChange={(e) => updateServico(s.id, "valor_hora", Number(e.target.value))}
                          className="mt-1 w-24 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600" /></div>
                      <div><label className="text-xs text-neutral-500">Horas mín</label>
                        <input type="number" value={s.horas_minimas}
                          onChange={(e) => updateServico(s.id, "horas_minimas", Number(e.target.value))}
                          className="mt-1 w-20 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600" /></div>
                      <div><label className="text-xs text-neutral-500">Multiplicador</label>
                        <input type="number" step="0.1" value={s.multiplicador || 1}
                          onChange={(e) => updateServico(s.id, "multiplicador", Number(e.target.value))}
                          className="mt-1 w-20 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600" /></div>
                    </>) : (<>
                      <div><label className="text-xs text-neutral-500">Preço fixo (R$)</label>
                        <input type="number" value={s.preco_fixo}
                          onChange={(e) => updateServico(s.id, "preco_fixo", Number(e.target.value))}
                          className="mt-1 w-28 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600" /></div>
                      <div><label className="text-xs text-neutral-500">Duração (min)</label>
                        <input type="number" value={s.duracao_minutos}
                          onChange={(e) => updateServico(s.id, "duracao_minutos", Number(e.target.value))}
                          className="mt-1 w-20 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600" /></div>
                    </>)}
                    <div><label className="text-xs text-neutral-500">Ordem</label>
                      <input type="number" value={s.ordem}
                        onChange={(e) => updateServico(s.id, "ordem", Number(e.target.value))}
                        className="mt-1 w-20 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600" /></div>
                  </div>
                </div>
                <button onClick={() => setConfirmarDelete({ tipo: "servico", id: s.id })}
                  className="shrink-0 rounded-lg p-2 text-neutral-400 transition-all hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addServico}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-3 text-sm font-medium text-neutral-500 transition-all hover:border-teal-400 hover:text-teal-600">
          <Plus size={16} /> Novo Serviço
        </button>
      </CardSection>

      {/* Adicionais — auto-save inline */}
      <CardSection title="Adicionais (serviços extras)">
        <div className="space-y-3">
          {adicionais.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
              <div className="flex-1 grid gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-neutral-500">Nome</label>
                  <input value={a.nome} onChange={(e) => updateAdicional(a.id, "nome", e.target.value)} className={inpMini} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">Preço (R$)</label>
                  <input type="number" step="0.01" value={a.preco} onChange={(e) => updateAdicional(a.id, "preco", Number(e.target.value))} className={inpMini} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">Horas</label>
                  <input type="number" step="0.5" value={a.horas} onChange={(e) => updateAdicional(a.id, "horas", Number(e.target.value))} className={inpMini} />
                </div>
                <div className="sm:col-span-3">
                  <label className="mb-1 block text-xs text-neutral-500">Descrição</label>
                  <input value={a.descricao} onChange={(e) => updateAdicional(a.id, "descricao", e.target.value)} className={inpMini} />
                </div>
                <div className="flex items-end gap-2">
                  <button onClick={() => updateAdicional(a.id, "ativo", !a.ativo)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${a.ativo ? "bg-teal-100 text-teal-700" : "bg-neutral-200 text-neutral-500"}`}>
                    {a.ativo ? "Ativo" : "Inativo"}
                  </button>
                  <button onClick={() => setConfirmarDelete({ tipo: "adicional", id: a.id })}
                    className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addAdicional}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-3 text-sm font-medium text-neutral-500 transition-all hover:border-teal-400 hover:text-teal-600">
          <Plus size={16} /> Novo Adicional
        </button>
      </CardSection>

      {/* Frequências — auto-save inline */}
      <CardSection title="Frequências (descontos por recorrência)">
        <div className="space-y-3">
          {frequencias.map((f) => (
            <div key={f.id} className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
              <div className="flex-1 grid gap-3 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">Nome</label>
                  <input value={f.nome} onChange={(e) => updateFrequencia(f.id, "nome", e.target.value)} className={inpMini} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">Slug</label>
                  <input value={f.slug} onChange={(e) => updateFrequencia(f.id, "slug", e.target.value)} className={inpMini} placeholder="ex: semanal" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">Desconto (%)</label>
                  <input type="number" value={f.desconto} onChange={(e) => updateFrequencia(f.id, "desconto", Number(e.target.value))} className={inpMini} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">Ordem</label>
                  <input type="number" value={f.ordem} onChange={(e) => updateFrequencia(f.id, "ordem", Number(e.target.value))} className={inpMini} />
                </div>
              </div>
              <button onClick={() => setConfirmarDelete({ tipo: "frequencia", id: f.id })}
                className="mt-5 shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addFrequencia}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-3 text-sm font-medium text-neutral-500 transition-all hover:border-teal-400 hover:text-teal-600">
          <Plus size={16} /> Nova Frequência
        </button>
      </CardSection>

      {/* Delete confirmation modal */}
      {confirmarDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/30 px-4 pb-12 sm:items-center sm:pb-0"
          onClick={() => setConfirmarDelete(null)}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <p className="text-lg font-semibold text-neutral-900">Excluir?</p>
              <p className="mt-2 text-sm text-neutral-500">Não dá para desfazer.</p>
            </div>
            <div className="flex border-t border-neutral-100">
              <button onClick={() => setConfirmarDelete(null)}
                className="btn-outline flex-1 justify-center py-4">Voltar</button>
              <button onClick={() => {
                if (confirmarDelete.tipo === "servico") deleteServico(confirmarDelete.id);
                else if (confirmarDelete.tipo === "adicional") deleteAdicional(confirmarDelete.id);
                else if (confirmarDelete.tipo === "frequencia") deleteFrequencia(confirmarDelete.id);
              }}
                className="flex-1 py-4 text-sm font-semibold text-white transition-colors bg-red-600 hover:bg-red-700">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}