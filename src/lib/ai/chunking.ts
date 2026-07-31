const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 80;

export function chunkText(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = start + CHUNK_SIZE;

    if (end >= normalized.length) {
      chunks.push(normalized.slice(start).trim());
      break;
    }

    const searchSpace = normalized.slice(start, end + 50);
    let breakPoint = searchSpace.lastIndexOf("\n\n");
    if (breakPoint === -1 || breakPoint < CHUNK_SIZE / 2)
      breakPoint = searchSpace.lastIndexOf("\n");
    if (breakPoint === -1 || breakPoint < CHUNK_SIZE / 2)
      breakPoint = searchSpace.lastIndexOf(".");
    if (breakPoint === -1 || breakPoint < CHUNK_SIZE / 2)
      breakPoint = searchSpace.lastIndexOf(" ");
    if (breakPoint === -1) breakPoint = CHUNK_SIZE;

    chunks.push(normalized.slice(start, start + breakPoint).trim());
    start += breakPoint - CHUNK_OVERLAP;
  }

  return chunks.filter((c) => c.length > 20);
}

export async function extractTextFromFile(
  file: File
): Promise<{ text: string; type: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const type = file.name.endsWith(".pdf")
    ? "pdf"
    : file.name.endsWith(".docx")
      ? "docx"
      : "txt";

  if (type === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return { text: result.text, type };
  }

  if (type === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value, type };
  }

  return { text: buffer.toString("utf-8"), type };
}
