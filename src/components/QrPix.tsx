"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { gerarPixCopiaECola } from "@/lib/pix";
import { X, Check } from "lucide-react";

export function QrPix({
  valor,
  descricao,
  chave,
  nome,
  cidade,
  onClose,
}: {
  valor: number;
  descricao?: string;
  chave: string;
  nome: string;
  cidade: string;
  onClose: () => void;
}) {
  const [copiado, setCopiado] = useState(false);

  const payload = gerarPixCopiaECola({
    chave,
    nome,
    cidade,
    valor: valor > 0 ? valor : undefined,
    descricao,
  });

  async function copiar() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-ink">Cobrar com Pix</h3>
          <button onClick={onClose} className="text-ink-mute hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <p className="mb-1 text-sm text-ink-soft">Valor</p>
        <p className="mb-4 font-serif text-3xl font-semibold text-ink">
          R$ {valor.toFixed(2).replace(".", ",")}
        </p>
        <div className="mx-auto w-fit rounded-2xl border border-line bg-white p-3">
          <QRCodeSVG value={payload} size={188} level="M" />
        </div>
        <p className="mt-4 break-all rounded-xl bg-ivory px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
          {payload}
        </p>
        <button onClick={copiar} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-700 ${copiado ? "!bg-teal-700" : ""}`}>
          {copiado ? <Check size={16} /> : null}
          {copiado ? "Copiado!" : "Copiar Pix Copia e Cola"}
        </button>
        <p className="mt-3 text-xs text-ink-mute">
          A cliente paga na hora. Depois toque em &ldquo;Marcar pago&rdquo;.
        </p>
      </div>
    </div>
  );
}
