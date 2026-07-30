"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";

export default function QrPage() {
  const pathname = usePathname();
  const slug = pathname.split("/")[1];
  const wrap = useRef<HTMLDivElement>(null);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/${slug}/reservar`
    : "";

  function baixar() {
    const canvas = wrap.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-${slug}.png`;
    a.click();
  }

  return (
    <div className="grid place-items-center pt-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-8 text-center">
        <h1 className="font-serif text-2xl font-semibold text-ink">Mostre para o cliente</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Ele aponta a câmera, abre seu site e agenda na hora.
        </p>

        <div ref={wrap} className="mx-auto mt-6 w-fit rounded-2xl border border-line bg-white p-4">
          {url && (
            <QRCodeCanvas
              value={url}
              size={230}
              level="H"
              marginSize={2}
            />
          )}
        </div>

        <p className="mt-4 break-all text-xs text-ink-mute">{url}</p>

        <button
          onClick={baixar}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-ink/90"
        >
          <Download size={16} /> Baixar QR (imagem)
        </button>
      </div>
    </div>
  );
}