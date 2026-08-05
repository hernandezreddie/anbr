"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export function PwaInstallButton() {
  const [prompt, setPrompt] = useState<Event | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function instalar() {
    if (!prompt) return;
    const bip = prompt as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
    await bip.prompt();
    const choice = await bip.userChoice;
    if (choice.outcome === "accepted") setPrompt(null);
  }

  if (!prompt) return null;

  return (
    <button
      type="button"
      onClick={instalar}
      className="flex w-full items-center gap-2 rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)]/10"
    >
      <Download size={16} />
      Instalar app
    </button>
  );
}
