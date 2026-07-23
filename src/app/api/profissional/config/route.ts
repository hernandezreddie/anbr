import { getProfissionalFullConfig } from "@/lib/db/profissionais";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug é obrigatório" }, { status: 400 });
  }

  const config = await getProfissionalFullConfig(slug);

  if (!config) {
    return NextResponse.json({ error: "profissional não encontrado" }, { status: 404 });
  }

  return NextResponse.json(config);
}
