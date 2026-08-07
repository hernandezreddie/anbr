"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Save, Trash2, Pencil, Shield, ShieldOff, Loader2, Ban, X, KeyRound, Eye, EyeOff, Palette } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { PLANOS, type PlanoId } from "@/lib/planos";
import { FUNDOS } from "@/lib/backgrounds";

type Prof = {
  id: string;
  nome: string;
  slug: string;
  email: string;
  whatsapp: string;
  cidade: string;
  slogan: string;
  status: string;
  plano: string;
  plano_expira_em: string | null;
  pix_chave: string;
  pix_nome: string;
  pix_cidade: string;
};

export function TenantDetailClient({
  prof,
  config,
  dominio,
  agenteAtivo,
}: {
  prof: Prof;
  config: any;
  dominio: any;
  agenteAtivo: boolean;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nome: prof.nome,
    email: prof.email,
    whatsapp: prof.whatsapp,
    cidade: prof.cidade,
    slogan: prof.slogan,
    pix_chave: prof.pix_chave,
    pix_nome: prof.pix_nome,
    pix_cidade: prof.pix_cidade,
  });
  const [planoModal, setPlanoModal] = useState(false);
  const [planoForm, setPlanoForm] = useState<PlanoId>((prof.plano as PlanoId) || "gratis");
  const [expiraInput, setExpiraInput] = useState(
    prof.plano_expira_em ? prof.plano_expira_em.slice(0, 10) : ""
  );
  const [estenderDias, setEstenderDias] = useState<number>(0);
  const [delAberto, setDelAberto] = useState(false);
  const [delConfirmando, setDelConfirmando] = useState(false);
  const [senhaModal, setSenhaModal] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [verNovaSenha, setVerNovaSenha] = useState(false);
  const [verConfirmarSenha, setVerConfirmarSenha] = useState(false);
  const [landingForm, setLandingForm] = useState({
    template_id: Number(config?.template_id) || 1,
    fundo_estilo: config?.fundo_estilo || "none",
    video_fundo: config?.video_fundo || "",
  });

  const notificar = (ok: string) => {
    setMsg(ok);
    setErro("");
    setTimeout(() => setMsg(""), 3000);
  };
  const notificarErro = (e: string) => {
    setErro(e);
    setMsg("");
  };

  async function mudarStatus() {
    const novo = prof.status === "ativo" ? "suspenso" : "ativo";
    setBusy("status");
    const res = await fetch("/api/admin/tenant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: prof.id, status: novo }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) return notificarErro(data.error || "Erro ao mudar status");
    notificar(novo === "ativo" ? "Tenant ativado" : "Tenant suspenso");
    router.refresh();
  }

  async function salvarEdicao() {
    setBusy("edit");
    const res = await fetch("/api/admin/tenant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: prof.id, ...form }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) return notificarErro(data.error || "Erro ao salvar");
    setEditando(false);
    notificar("Tenant atualizado");
    router.refresh();
  }

  async function salvarPlano() {
    setBusy("plano");
    const res = await fetch("/api/admin/tenant/plano", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: prof.id,
        plano: planoForm,
        expira_em: expiraInput || null,
        estender_dias: estenderDias > 0 ? estenderDias : undefined,
      }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) return notificarErro(data.error || "Erro ao trocar plano");
    setPlanoModal(false);
    setEstenderDias(0);
    notificar(`Plano ${data.nome} salvo · expira ${data.expira_em ? new Date(data.expira_em).toLocaleDateString("pt-BR") : "sem data"}`);
    router.refresh();
  }

  async function salvarSenha() {
    if (novaSenha.length < 6) return notificarErro("A senha precisa ter no mínimo 6 caracteres");
    if (novaSenha !== confirmarSenha) return notificarErro("As senhas não conferem");
    setBusy("senha");
    const res = await fetch("/api/admin/tenant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: prof.id, senha: novaSenha }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) return notificarErro(data.error || "Erro ao trocar senha");
    setSenhaModal(false);
    setNovaSenha("");
    setConfirmarSenha("");
    notificar("Senha do tenant trocada");
  }

  async function salvarLanding() {
    setBusy("landing");
    const res = await fetch("/api/admin/tenant/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: prof.id, ...landingForm }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) return notificarErro(data.error || "Erro ao salvar landing");
    notificar("Landing do tenant atualizada");
    router.refresh();
  }

  async function eliminar() {
    setDelConfirmando(true);
    const res = await fetch("/api/admin/tenant", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: prof.id }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setDelConfirmando(false);
      notificarErro(data.error || "Erro ao eliminar");
    }
  }

  const input = "w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-teal-600";

  return (
    <>
      {msg && <Toast message={msg} type="success" duration={3000} onClose={() => setMsg("")} />}
      {erro && <Toast message={erro} type="error" duration={4000} onClose={() => setErro("")} />}

      {/* Ações rápidas */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          variant={prof.status === "ativo" ? "danger" : "primary"}
          size="sm"
          onClick={mudarStatus}
          disabled={busy === "status"}
          leftIcon={busy === "status" ? <Loader2 size={14} className="animate-spin" /> : prof.status === "ativo" ? <ShieldOff size={14} /> : <Shield size={14} />}
        >
          {prof.status === "ativo" ? "Suspender tenant" : "Ativar tenant"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEditando((v) => !v)} leftIcon={<Pencil size={14} />}>
          Editar dados
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPlanoModal(true)} leftIcon={<Check size={14} />}>
          Trocar plano
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSenhaModal(true)} leftIcon={<KeyRound size={14} />}>
          Trocar senha
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDelAberto(true)} leftIcon={<Trash2 size={14} />}>
          Eliminar
        </Button>
      </div>

      {/* Editar dados */}
      {editando && (
        <div className="mt-4 rounded-2xl border border-line bg-white p-5">
          <h3 className="text-sm font-semibold">Editar dados do tenant</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-ink-soft">Nome</label>
              <input className={input} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft">Email</label>
              <input className={input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft">WhatsApp</label>
              <input className={input} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft">Cidade</label>
              <input className={input} value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-ink-soft">Slogan</label>
              <input className={input} value={form.slogan} onChange={(e) => setForm({ ...form, slogan: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft">Chave Pix</label>
              <input className={input} value={form.pix_chave} onChange={(e) => setForm({ ...form, pix_chave: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft">Nome Pix</label>
              <input className={input} value={form.pix_nome} onChange={(e) => setForm({ ...form, pix_nome: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft">Cidade Pix</label>
              <input className={input} value={form.pix_cidade} onChange={(e) => setForm({ ...form, pix_cidade: e.target.value })} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={salvarEdicao} disabled={busy === "edit"} leftIcon={busy === "edit" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}>
              Salvar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditando(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Trocar plano */}
      {planoModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/40 p-4" onClick={() => !busy && setPlanoModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Trocar plano</h3>
              <button onClick={() => setPlanoModal(false)} className="text-neutral-400 hover:text-neutral-700"><X size={18} /></button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(["gratis", "profissional", "ia_premium"] as PlanoId[]).map((p) => (
                <button key={p} onClick={() => setPlanoForm(p)}
                  className={`rounded-xl border p-3 text-center transition-all ${
                    planoForm === p ? "border-teal-600 bg-teal-50" : "border-line hover:border-neutral-300"
                  }`}>
                  <p className="text-sm font-semibold">{PLANOS[p].nome}</p>
                  <p className="mt-0.5 text-[10px] text-ink-soft">R$ {PLANOS[p].precoMensal}/mês</p>
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-ink-soft">Expira em (deixe vazio = sem data)</label>
                <input type="date" className={input} value={expiraInput} onChange={(e) => setExpiraInput(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-soft">Estender X dias (opcional, soma à data atual)</label>
                <input type="number" min={0} className={input} value={estenderDias || ""} placeholder="ex: 30"
                  onChange={(e) => setEstenderDias(Number(e.target.value))} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPlanoModal(false)}>Cancelar</Button>
              <Button size="sm" onClick={salvarPlano} disabled={busy === "plano"} leftIcon={busy === "plano" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}>
                Salvar plano
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Trocar senha */}
      {senhaModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/40 p-4" onClick={() => !busy && setSenhaModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-neutral-500" />
                <h3 className="text-lg font-semibold">Trocar senha do tenant</h3>
              </div>
              <button onClick={() => setSenhaModal(false)} className="text-neutral-400 hover:text-neutral-700"><X size={18} /></button>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Nova senha de acesso ao painel de <strong>{prof.nome}</strong> (/{prof.slug}).
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-ink-soft">Nova senha</label>
                <div className="relative mt-1">
                  <input type={verNovaSenha ? "text" : "password"} className={input} value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
                  <button type="button" onClick={() => setVerNovaSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                    {verNovaSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-soft">Repetir nova senha</label>
                <div className="relative mt-1">
                  <input type={verConfirmarSenha ? "text" : "password"} className={input} value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)} placeholder="Digite a senha novamente" />
                  <button type="button" onClick={() => setVerConfirmarSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                    {verConfirmarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSenhaModal(false)}>Cancelar</Button>
              <Button size="sm" onClick={salvarSenha} disabled={busy === "senha"}
                leftIcon={busy === "senha" ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}>
                Trocar senha
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Eliminar */}
      {delAberto && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-2 text-red-600">
              <Ban size={18} />
              <h3 className="text-lg font-semibold">Eliminar tenant</h3>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Isso elimina <strong>{prof.nome}</strong> (/{prof.slug}) e <strong>todos</strong> os dados relacionados:
              agendamentos, clientes, serviços, configurações, AI agent e o usuário de acesso.
              Essa ação é irreversível.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDelAberto(false)}>Cancelar</Button>
              <Button variant="danger" size="sm" onClick={eliminar} disabled={delConfirmando}
                leftIcon={delConfirmando ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}>
                {delConfirmando ? "Eliminando..." : "Eliminar definitivamente"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Landing do prestador */}
      <div className="mt-6 rounded-2xl border border-line bg-white p-5">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-teal-600" />
          <h3 className="text-sm font-semibold">Landing do prestador</h3>
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          Plantilla, fundo e vídeo de fundo da página pública. O prestador também pode ajustar no painel.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-ink-soft">Plantilla visual</label>
            <select className={input} value={landingForm.template_id}
              onChange={(e) => setLandingForm({ ...landingForm, template_id: Number(e.target.value) })}>
              <option value={1}>Clássico (serifada elegante)</option>
              <option value={2}>Moderno (minimalista)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-soft">Fundo</label>
            <select className={input} value={landingForm.fundo_estilo}
              onChange={(e) => setLandingForm({ ...landingForm, fundo_estilo: e.target.value })}>
              {FUNDOS.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-soft">Vídeo de fundo (URL)</label>
            <input className={input} value={landingForm.video_fundo} placeholder="https://...mp4 (opcional)"
              onChange={(e) => setLandingForm({ ...landingForm, video_fundo: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={salvarLanding} disabled={busy === "landing"}
            leftIcon={busy === "landing" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}>
            Salvar landing
          </Button>
        </div>
      </div>

      {/* Info extra */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs text-ink-soft">Cor primária</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full border border-neutral-200" style={{ backgroundColor: config?.cor_primaria || "#059669" }} />
            <span className="font-mono text-sm">{config?.cor_primaria || "#059669"}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs text-ink-soft">Fundo</p>
          <p className="mt-2 text-sm font-medium capitalize">{config?.fundo_estilo || "none"}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs text-ink-soft">Domínio</p>
          {dominio ? (
            <div className="mt-2">
              <p className="text-sm font-medium">{dominio.domain}</p>
              <p className={`text-xs ${dominio.verified ? "text-teal-600" : "text-amber-600"}`}>
                {dominio.verified ? "Verificado" : `SSL: ${dominio.ssl_status || "pendente"}`}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">—</p>
          )}
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs text-ink-soft">AI Agent</p>
          <p className={`mt-2 text-sm font-medium ${agenteAtivo ? "text-teal-600" : "text-neutral-400"}`}>
            {agenteAtivo ? "Ativo" : "Inativo"}
          </p>
        </div>
      </div>
    </>
  );
}
