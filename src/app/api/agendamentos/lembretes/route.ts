import { processarLembretesGlobais } from "@/lib/notificacoes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const auth = request.headers.get("authorization") || "";
      if (auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
    }

    const resultado = await processarLembretesGlobais();
    return NextResponse.json(resultado);
  } catch (err) {
    console.error("Erro ao enviar lembretes:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
