import { getProfissionalFullConfig } from "@/lib/db/profissionais";
import { TEMPLATES } from "@/components/templates";
import { notFound } from "next/navigation";

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = await getProfissionalFullConfig(slug);

  if (!config) notFound();

  const template = TEMPLATES[config.configuracao.template_id as keyof typeof TEMPLATES] || TEMPLATES[1];

  return (
    <main>
      <template.Hero config={config} />
      <template.Servicos config={config} />
    </main>
  );
}
