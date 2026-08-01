import { getProfissionalFullConfig } from "@/lib/db/profissionais";
import { fundoStyle, type FundoEstilo } from "@/lib/backgrounds";
import { TEMPLATES } from "@/components/templates";
import { contrastante, accento } from "@/lib/cores";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const config = await getProfissionalFullConfig(slug);
  if (!config) return { title: "Não encontrado" };

  return {
    title: `${config.profissional.nome} | Agendamento Online`,
    description: config.profissional.slogan,
    manifest: `/${slug}/manifest.webmanifest`,
    icons: "/favicon.svg",
  };
}

const googleFonts = ["Fraunces", "Inter", "Playfair Display", "DM Sans"];

function fontUrl(name: string) {
  const encoded = name.replace(/ /g, "+");
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700&display=swap`;
}

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = await getProfissionalFullConfig(slug);

  if (!config) notFound();

  const template = TEMPLATES[config.configuracao.template_id as keyof typeof TEMPLATES] || TEMPLATES[1];
  const c = template.colors;

  const headingFont = config.configuracao.fonte_titulo || template.fonts.heading;
  const bodyFont = config.configuracao.fonte_corpo || template.fonts.body;

  const fundo = fundoStyle((config.configuracao.fundo_estilo || "none") as FundoEstilo, config.configuracao.cor_primaria || c.primary);
  const primary = config.configuracao.cor_primaria || c.primary;

  const fontsToLoad = [headingFont, bodyFont].filter((f) => googleFonts.includes(f));
  const uniqueFonts = [...new Set(fontsToLoad)];

  return (
    <>
      {uniqueFonts.map((f) => (
        <link key={f} rel="stylesheet" href={fontUrl(f)} />
      ))}
      <div
        className="min-h-screen"
        style={{
          ...fundo,
          "--color-primary": primary,
          "--color-primary-ink": contrastante(primary),
          "--color-primary-accent": accento(primary),
          "--color-secondary": config.configuracao.cor_secundaria || c.secondary,
          "--color-bg": c.bg,
          "--color-paper": c.paper,
          "--color-ink": c.ink,
          "--color-ink-soft": c.ink_soft,
          "--color-line": c.line,
          "--font-heading": headingFont,
          "--font-body": bodyFont,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </>
  );
}
