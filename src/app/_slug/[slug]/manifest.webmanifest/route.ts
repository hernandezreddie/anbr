import { getProfissionalFullConfig } from "@/lib/db/profissionais";
import { notFound } from "next/navigation";
import type { MetadataRoute } from "next";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const config = await getProfissionalFullConfig(slug);

  if (!config) notFound();

  const manifest: MetadataRoute.Manifest = {
    name: `${config.profissional.nome} | Agendamento`,
    short_name: config.profissional.primeiro_nome,
    description: `Agende com ${config.profissional.primeiro_nome}`,
    start_url: `/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: config.configuracao.cor_primaria,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };

  return Response.json(manifest);
}
