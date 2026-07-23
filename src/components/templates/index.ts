import HeroClassico from "@/components/templates/classico/Hero";
import ServicosClassico from "@/components/templates/classico/Servicos";
import CtaClassico from "@/components/templates/classico/CtaButton";
import HeroModerno from "@/components/templates/moderno/Hero";

export const TEMPLATES = {
  1: {
    id: 1,
    nome: "Clássico",
    slug: "classico",
    colors: {
      primary: "#059669",
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
    Hero: HeroClassico,
    Servicos: ServicosClassico,
    CtaButton: CtaClassico,
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
    Hero: HeroModerno,
    Servicos: ServicosClassico,
    CtaButton: CtaClassico,
  },
} as const;

export type TemplateId = keyof typeof TEMPLATES;
