import { getProfissionalFullConfig } from "@/lib/db/profissionais";
import { TEMPLATES } from "@/components/templates";
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
  };
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

  return (
    <div
      style={{
        "--color-primary": c.primary,
        "--color-secondary": c.secondary,
        "--color-bg": c.bg,
        "--color-paper": c.paper,
        "--color-ink": c.ink,
        "--color-ink-soft": c.ink_soft,
        "--color-line": c.line,
        "--font-heading": template.fonts.heading,
        "--font-body": template.fonts.body,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
