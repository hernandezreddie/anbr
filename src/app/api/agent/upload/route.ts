import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const profissionalId = formData.get("profissional_id") as string;
    const docType = formData.get("type") as string || "arquivo";

    if (!file || !profissionalId) {
      return NextResponse.json({ error: "file e profissional_id são obrigatórios" }, { status: 400 });
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 10MB." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido. Use PDF, TXT, DOC ou DOCX." }, { status: 400 });
    }

    const { extractTextFromFile, chunkText } = await import("@/lib/ai/chunking");
    const { generateEmbeddings } = await import("@/lib/ai/embeddings");
    const { estimarTokens, calcularCustoEmbedding } = await import("@/lib/ai/costs");

    const { text, type } = await extractTextFromFile(file);
    if (!text.trim()) {
      return NextResponse.json({ error: "Não foi possível extrair texto do arquivo" }, { status: 400 });
    }

    const chunks = chunkText(text);
    if (chunks.length === 0) {
      return NextResponse.json({ error: "Texto muito curto após processamento" }, { status: 400 });
    }

    const embeddings = await generateEmbeddings(chunks);
    const tokenCount = estimarTokens(text);
    const embedCost = calcularCustoEmbedding(tokenCount);

    const adminDb = createAdminClient();

    const { data: doc, error: docError } = await adminDb
      .from("knowledge_docs")
      .insert({
        profissional_id: profissionalId,
        filename: file.name,
        type: docType,
        content: text.slice(0, 30000),
        chunk_count: chunks.length,
        token_count: tokenCount,
      })
      .select()
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: docError?.message || "Erro ao salvar documento" }, { status: 500 });
    }

    const chunkRows = chunks.map((content, i) => ({
      doc_id: doc.id,
      profissional_id: profissionalId,
      content,
      chunk_index: i,
      embedding: embeddings[i],
    }));

    const { error: chunksError } = await adminDb
      .from("knowledge_chunks")
      .insert(chunkRows as any);

    if (chunksError) {
      await adminDb.from("knowledge_docs").delete().eq("id", doc.id);
      return NextResponse.json({ error: chunksError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      doc: { id: doc.id, filename: file.name, type, chunks: chunks.length, tokens: tokenCount },
      cost: embedCost,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno ao processar upload" }, { status: 500 });
  }
}
