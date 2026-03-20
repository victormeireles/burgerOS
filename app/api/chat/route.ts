import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  question: z.string().min(2),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Pergunta inválida." }, { status: 400 });
  }

  const { question } = parsed.data;
  return NextResponse.json({
    answer:
      "Recebi sua pergunta e a V1 já está pronta para o próximo passo de RAG.\n\n" +
      `Pergunta recebida: "${question}"\n\n` +
      "Na próxima iteração vamos buscar contexto nas bases salvas antes de gerar a resposta final.",
  });
}
