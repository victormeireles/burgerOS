import { NextResponse } from "next/server";
import { z } from "zod";
import { createChatCompletionWithFallback } from "@/lib/openai";
import { burgerChatSystemPrompt } from "@/lib/prompts/chat";
import { embedOne } from "@/lib/rag";
import { getSupabaseAdmin } from "@/lib/supabase";

const schema = z.object({
  question: z.string().min(2),
});

type MatchChunkRow = {
  id: string;
  knowledge_base_id: string;
  chunk_index: number;
  chunk_text: string;
  similarity: number;
};

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Pergunta inválida." }, { status: 400 });
    }

    const { question } = parsed.data;
    const supabaseAdmin = getSupabaseAdmin();

    const questionEmbedding = await embedOne(question);
    const topK = 8;
    const minSimilarity = 0.2;
    const matchResult = await supabaseAdmin.rpc("match_knowledge_chunks", {
      query_embedding: questionEmbedding,
      match_count: topK,
      min_similarity: minSimilarity,
    });

    if (matchResult.error) {
      console.error("chat_match_chunks_error", matchResult.error);
      return NextResponse.json(
        {
          error: "Falha ao buscar contexto vetorial no banco.",
          details: "Verifique se a migration de RAG foi aplicada no Supabase.",
        },
        { status: 500 },
      );
    }

    const chunks = (matchResult.data ?? []) as MatchChunkRow[];
    const contextPieces: string[] = [];
    let contextChars = 0;
    const contextCharLimit = 5000;

    for (const chunk of chunks) {
      const line = `[score=${chunk.similarity.toFixed(3)}] ${chunk.chunk_text}`;
      if (contextChars + line.length > contextCharLimit) break;
      contextPieces.push(line);
      contextChars += line.length;
    }

    const hasWeakContext = chunks.length === 0 || (chunks[0]?.similarity ?? 0) < 0.35;
    const contextBlock =
      contextPieces.length > 0
        ? contextPieces.join("\n\n")
        : "Sem contexto recuperado das bases de conhecimento para esta pergunta.";
    const confidenceHint = hasWeakContext
      ? "Contexto fraco ou insuficiente. Responder em best effort com transparência."
      : "Contexto razoável recuperado. Priorizar dados do contexto antes de conhecimento geral.";

    const completion = await createChatCompletionWithFallback({
      temperature: 0.2,
      messages: [
        { role: "system", content: burgerChatSystemPrompt },
        {
          role: "user",
          content:
            `Pergunta do usuário:\n${question}\n\n` +
            `Sinal de confiança:\n${confidenceHint}\n\n` +
            `Contexto recuperado (RAG):\n${contextBlock}`,
        },
      ]
    });

    const answer =
      completion.choices[0]?.message?.content?.trim() ??
      "Não consegui gerar resposta neste momento. Tente novamente em alguns segundos.";

    return NextResponse.json({
      answer,
      metadata: {
        retrievedChunks: chunks.length,
        topSimilarity: chunks[0]?.similarity ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno desconhecido.";
    console.error("chat_route_unhandled_error", error);
    return NextResponse.json({ error: "Erro interno ao gerar resposta do chat.", details: message }, { status: 500 });
  }
}
