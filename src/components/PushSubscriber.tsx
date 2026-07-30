"use client";

import { useEffect } from "react";
import { assinarPush, assinaturaAtual, pushSuportado } from "@/lib/push";

export function PushSubscriber() {
  useEffect(() => {
    if (!pushSuportado()) return;

    async function init() {
      try {
        await navigator.serviceWorker.register("/sw.js");
        const sub = await assinarPush();
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription: sub.toJSON() }),
          });
        }
      } catch {
        // silencioso — push não é crítico
      }
    }

    init();
  }, []);

  return null;
}