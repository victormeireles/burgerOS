import { getOpenAIClient } from "@/lib/openai";

export type ChunkRecord = {
  chunkIndex: number;
  chunkText: string;
};

const DEFAULT_CHUNK_SIZE = 900;
const DEFAULT_CHUNK_OVERLAP = 180;

export function chunkText(text: string, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_CHUNK_OVERLAP): ChunkRecord[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const step = Math.max(1, chunkSize - overlap);
  const chunks: ChunkRecord[] = [];

  let index = 0;
  for (let start = 0; start < normalized.length; start += step) {
    const end = Math.min(start + chunkSize, normalized.length);
    const chunk = normalized.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push({ chunkIndex: index, chunkText: chunk });
      index += 1;
    }
    if (end >= normalized.length) break;
  }

  return chunks;
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const openai = getOpenAIClient();
  const model = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
  const response = await openai.embeddings.create({
    model,
    input: texts,
  });

  return response.data.map((item) => item.embedding);
}

export async function embedOne(text: string): Promise<number[]> {
  const [embedding] = await embedMany([text]);
  return embedding;
}
