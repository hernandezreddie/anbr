import { getProfissionalFullConfig } from "@/lib/db/profissionais";
import { TEMPLATES } from "@/components/templates";
import { notFound } from "next/navigation";

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = await getProfissionalFullConfig(slug);

  if (!config) notFound();

  const template = TEMPLATES[config.configuracao.template_id as keyof typeof TEMPLATES] || TEMPLATES[1];

  return (
    <>
      <template.Nav config={config} />
      <main>
        <template.Hero config={config} />
        <template.Confianca config={config} />
        <template.Servicos config={config} />
        <template.Depoimentos config={config} />
        <template.CtaFinal config={config} />
      </main>
      <template.Footer config={config} />
      <template.WhatsAppFloat config={config} />
    </>
  );
}
