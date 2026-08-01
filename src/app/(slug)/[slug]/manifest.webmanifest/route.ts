import { NextRequest, NextResponse } from "next/server";
import { getProfissionalFullConfig } from "@/lib/db/profissionais";

export const dynamic = "force-dynamic";

const BASE =
  process.env.NEXT_PUBLIC_DOMAIN || "https://autonexabrasil.com.br";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const config = await getProfissionalFullConfig(slug);

  const base = BASE.replace(/\/+$/, "");

  if (!config) {
    return NextResponse.json(
      {
        name: "AN.BR",
        short_name: "AN.BR",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#059669",
        icons: [
          { src: `${base}/icon.svg`, sizes: "any", type: "image/svg+xml" },
          { src: `${base}/icon-192.png`, sizes: "192x192", type: "image/png" },
          { src: `${base}/icon-512.png`, sizes: "512x512", type: "image/png" },
        ],
      },
      { headers: { "Content-Type": "application/manifest+json" } }
    );
  }

  const { profissional, configuracao } = config;
  const nome = profissional.nome || profissional.primeiro_nome;
  const cor = configuracao.cor_primaria || "#059669";
  const logo = configuracao.logo_url;

  const icons: MetadataRouteManifestIcon[] = [
    { src: `${base}/icon.svg`, sizes: "any", type: "image/svg+xml" },
    { src: `${base}/icon-192.png`, sizes: "192x192", type: "image/png" },
    { src: `${base}/icon-512.png`, sizes: "512x512", type: "image/png" },
  ];

  if (logo) {
    icons.unshift({ src: logo, sizes: "any" });
  }

  return NextResponse.json(
    {
      name: `${nome} | Agendamento Online`,
      short_name: nome.length > 12 ? nome.slice(0, 12) : nome,
      description: config.profissional.slogan || "Agende online",
      id: `/${slug}/painel`,
      start_url: `/${slug}/painel`,
      scope: `/${slug}`,
      display: "standalone",
      background_color: "#ffffff",
      theme_color: cor,
      icons,
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}

type MetadataRouteManifestIcon = {
  src: string;
  sizes?: string;
  type?: string;
  purpose?: string;
};
