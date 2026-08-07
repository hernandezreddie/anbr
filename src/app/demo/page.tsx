import type { Metadata } from "next";
import { DemoClient } from "./DemoClient";

export const metadata: Metadata = {
  title: "Demonstração — AN.BR",
  description:
    "Veja como funciona o sistema AN.BR: painel com agenda, cobrança Pix e AI Agent atendendo no WhatsApp. Crie o seu grátis em 5 minutos.",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return <DemoClient />;
}
