import OpenAI from "openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

let client: OpenAI | null = null;

/**
 * Lazy-init do cliente de embeddings: só cria se houver OPENAI_API_KEY,
 * permitindo upload/RAG com chave do tenant sem explodir no boot.
 */
function getEmbeddingsClient(): OpenAI {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada (necessária para embeddings)");
  client = new OpenAI({ apiKey });
  return client;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await getEmbeddingsClient().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  return res.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const res = await getEmbeddingsClient().embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  return res.data.map((d) => d.embedding);
}
