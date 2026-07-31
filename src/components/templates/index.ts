import { Nav as NavClassico } from "@/components/templates/classico/Nav";
import { Hero as HeroClassico } from "@/components/templates/classico/Hero";
import { Confianca as ConfiancaClassico } from "@/components/templates/classico/Confianca";
import { Servicos as ServicosClassico } from "@/components/templates/classico/Servicos";
import { Depoimentos as DepoimentosClassico } from "@/components/templates/classico/Depoimentos";
import { CtaFinal as CtaFinalClassico } from "@/components/templates/classico/CtaFinal";
import { Footer as FooterClassico } from "@/components/templates/classico/Footer";
import { WhatsAppFloat as WhatsAppFloatClassico } from "@/components/templates/classico/WhatsAppFloat";
import { Nav as NavModerno } from "@/components/templates/moderno/Nav";
import { Hero as HeroModerno } from "@/components/templates/moderno/Hero";
import { Confianca as ConfiancaModerno } from "@/components/templates/moderno/Confianca";
import { Servicos as ServicosModerno } from "@/components/templates/moderno/Servicos";
import { Depoimentos as DepoimentosModerno } from "@/components/templates/moderno/Depoimentos";
import { CtaFinal as CtaFinalModerno } from "@/components/templates/moderno/CtaFinal";
import { Footer as FooterModerno } from "@/components/templates/moderno/Footer";
import { WhatsAppFloat as WhatsAppFloatModerno } from "@/components/templates/moderno/WhatsAppFloat";

export const TEMPLATES = {
  1: {
    id: 1,
    nome: "Clássico",
    slug: "classico",
    colors: {
      primary: "#14b8a6",
      secondary: "#1c1917",
      bg: "#faf8f5",
      paper: "#ffffff",
      ink: "#1c1917",
      ink_soft: "#6b6560",
      line: "#e5e2df",
    },
    fonts: {
      heading: "Fraunces",
      body: "Inter",
    },
    Nav: NavClassico,
    Hero: HeroClassico,
    Confianca: ConfiancaClassico,
    Servicos: ServicosClassico,
    Depoimentos: DepoimentosClassico,
    CtaFinal: CtaFinalClassico,
    Footer: FooterClassico,
    WhatsAppFloat: WhatsAppFloatClassico,
  },
  2: {
    id: 2,
    nome: "Moderno",
    slug: "moderno",
    colors: {
      primary: "#7c3aed",
      secondary: "#1e1b4b",
      bg: "#ffffff",
      paper: "#ffffff",
      ink: "#1e1b4b",
      ink_soft: "#6b7280",
      line: "#e5e7eb",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    Nav: NavModerno,
    Hero: HeroModerno,
    Confianca: ConfiancaModerno,
    Servicos: ServicosModerno,
    Depoimentos: DepoimentosModerno,
    CtaFinal: CtaFinalModerno,
    Footer: FooterModerno,
    WhatsAppFloat: WhatsAppFloatModerno,
  },
} as const;

export type TemplateId = keyof typeof TEMPLATES;
