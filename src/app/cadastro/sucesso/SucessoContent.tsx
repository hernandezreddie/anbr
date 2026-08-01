"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check, ArrowRight, ExternalLink, Copy, MessageCircle, Eye, EyeOff,
  Smartphone, Download, LayoutDashboard, QrCode, CheckCheck, Sparkles,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/Button";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function SucessoInterno() {
  const params = useSearchParams();
  const slug = params.get("slug");
  const [origin, setOrigin] = useState("");
  const [creds, setCreds] = useState<{ email: string; senha: string } | null>(null);
  const [verSenha, setVerSenha] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BIPEvent | null>(null);
  const [copiado, setCopiado] = useState("");
  const [instalando, setInstalando] = useState(false);

  useEffect(() => { setOrigin(window.location.origin); }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("anbr_credenciais");
      if (raw) setCreds(JSON.parse(raw));
    } catch { /* ignora */ }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const link = slug && origin ? `${origin}/${slug}` : "";
  const linkPainel = link ? `${link}/painel` : "";

  const copiar = async (texto: string, chave: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(chave);
      setTimeout(() => setCopiado(""), 2000);
    } catch { /* ignora */ }
  };

  const instalar = async () => {
    if (!deferredPrompt) return;
    setInstalando(true);
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstalando(false);
  };

  const baixarQR = () => {
    const canvas = document.getElementById("qr-link") as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "meu-link-agendamento.png";
    a.click();
  };

  const btnCopiar = (texto: string, chave: string) => (
    <button
      onClick={() => copiar(texto, chave)}
      className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-ink-soft transition-all hover:bg-[var(--color-bg)] hover:text-ink"
      title="Copiar"
    >
      {copiado === chave ? <CheckCheck size={15} className="text-teal-500" /> : <Copy size={15} />}
      {copiado === chave ? "Copiado!" : "Copiar"}
    </button>
  );

  const inp = "w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[var(--color-primary)]";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12 px-4">
      <div className="mx-auto max-w-lg">

          {/* Success check */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full shadow-xl"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <Check size={40} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Sistema criado!
            </h1>
            <p className="mt-3 text-lg text-ink-soft">
              Sua empresa ou clínica já está no ar. <strong className="text-ink">Guarde suas credenciais</strong> para acessar o painel.
            </p>
          </div>

        {/* Credenciais */}
        {creds ? (
          <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <LayoutDashboard size={18} className="text-[var(--color-primary)]" />
              <h2 className="font-semibold text-ink">Suas credenciais de acesso</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium text-ink-soft">Email</p>
                <div className="flex items-center gap-1">
                  <input readOnly value={creds.email} className={inp} />
                  {btnCopiar(creds.email, "email")}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-ink-soft">Senha</p>
                <div className="flex items-center gap-1">
                  <div className="relative flex-1">
                    <input readOnly type={verSenha ? "text" : "password"} value={creds.senha} className={inp} />
                    <button type="button" onClick={() => setVerSenha((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft transition-colors hover:text-ink">
                      {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {btnCopiar(creds.senha, "senha")}
                </div>
              </div>
            </div>
            <a href={linkPainel || "#"}
              className="btn-primary mt-5 flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold shadow-lg shadow-[var(--color-primary)]/20">
              Abrir meu painel
              <ArrowRight size={18} />
            </a>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <LayoutDashboard size={18} className="text-[var(--color-primary)]" />
              <h2 className="font-semibold text-ink">Acesse seu painel</h2>
            </div>
            <p className="mb-4 text-sm text-ink-soft">
              Entre com o email e a senha que você usou no cadastro. Precisa delas novamente? Elas ficam guardadas neste dispositivo.
            </p>
            <a href={linkPainel || "#"}
              className="btn-primary flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold shadow-lg shadow-[var(--color-primary)]/20">
              Ir para o painel
              <ArrowRight size={18} />
            </a>
          </div>
        )}

        {/* Instalar app */}
        <div className="mt-5 rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
              <Smartphone size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-ink">Instale seu painel no celular</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Vire um app na tela inicial: abre direto no seu painel e você entra com email e senha acima.
              </p>
            </div>
          </div>

          {deferredPrompt ? (
            <button onClick={instalar} disabled={instalando}
              className="btn-primary mt-4 flex w-full items-center justify-center gap-2 px-6 py-3 text-sm font-semibold disabled:opacity-50">
              <Download size={18} />
              {instalando ? "Instalando..." : "Instalar agora"}
            </button>
          ) : (
            <div className="mt-4 space-y-2 text-sm text-ink-soft">
              <p className="font-medium text-ink">Como instalar:</p>
              <p className="flex gap-2"><span className="font-semibold text-ink">iPhone:</span> abra seu link no Safari → toque no ícone de compartilhar
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[var(--color-primary)]"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                → “Adicionar à Tela de Início”.</p>
              <p className="flex gap-2"><span className="font-semibold text-ink">Android:</span> abra seu link no Chrome → toque no menu
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[var(--color-primary)]"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                → “Adicionar à tela inicial”.</p>
              <a href={link || "#"} target="_blank" className="mt-3 inline-flex items-center gap-1.5 font-medium text-[var(--color-primary)] hover:underline">
                Abrir meu link
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>

        {/* Como usar */}
        <div className="mt-5 rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--color-primary)]" />
            <h2 className="font-semibold text-ink">Como usar seu sistema</h2>
          </div>
          <ol className="space-y-3">
            {[
              ["Abra o painel", "Entre com seu email e senha. Tudo acontece ali dentro."],
              ["Confirme os pedidos", "Quando alguém agendar, aparece aqui na hora. Um toque para confirmar."],
              ["Imprima o QR", "Ponha no balcão: o cliente aponta a câmera e agenda sozinho, direto com você."],
              ["Edite e converse", "Mude horários, cancele, cobre Pix e fale com o cliente — tudo na palma da mão."],
            ].map(([titulo, texto], i) => (
              <li key={titulo} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-ink-soft">
                  <strong className="text-ink">{titulo}.</strong> {texto}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Divulgar */}
        <div className="mt-5 rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MessageCircle size={18} className="text-[var(--color-primary)]" />
            <h2 className="font-semibold text-ink">Compartilhe seu link</h2>
          </div>
          {link && (
            <div className="mb-4 flex items-center gap-1">
              <input readOnly value={link} className={inp} />
              {btnCopiar(link, "link")}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <a href={link ? `https://wa.me/?text=${encodeURIComponent(`Marque aqui o seu horário: ${link}`)}` : "#"} target="_blank"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-all hover:brightness-110">
              <MessageCircle size={17} />
              WhatsApp
            </a>
            <button onClick={baixarQR} disabled={!link}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-line)] px-4 py-3 text-sm font-semibold text-ink transition-all hover:bg-[var(--color-bg)] disabled:opacity-50">
              <QrCode size={17} />
              Baixar QR
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-bg)]/50 p-4">
            {link ? (
              <QRCodeCanvas id="qr-link" value={link} size={132} level="M" marginSize={2} />
            ) : (
              <span className="text-sm text-ink-soft">QR indisponível</span>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-ink-soft">
            Seus clientes apontam a câmera do celular para o QR e já caem na sua página de agendamento.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a href="/"
            className="text-sm text-ink-soft underline-offset-2 transition-colors hover:text-ink hover:underline">
            Voltar para página inicial
          </a>
        </div>

      </div>
    </div>
  );
}

export default function SucessoContent() {
  return (
    <Suspense>
      <SucessoInterno />
    </Suspense>
  );
}
