import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/lib/openai";
import { knowledgeSystemPrompt } from "@/lib/prompts/knowledge";
import { getSupabaseAdmin } from "@/lib/supabase";

const bodySchema = z.object({
  title: z.string().min(3).max(120),
  rawText: z.string().min(40),
});

const llmOutputSchema = z.object({
  shortSummary: z.string().min(10).max(220),
  usageGuidance: z.string().min(10).max(260),
  suggestedQuestions: z.array(z.string().min(6).max(140)).length(3),
});

const idSchema = z.string().uuid();

async function generateKnowledgeMetadata(title: string, rawText: string) {
  const openai = getOpenAIClient();
  const preferredModel = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const payload = {
    response_format: { type: "json_object" as const },
    temperature: 0.2,
    messages: [
      { role: "system" as const, content: knowledgeSystemPrompt },
      {
        role: "user" as const,
        content: `Título: ${title}\n\nTexto bruto:\n${rawText}`,
      },
    ],
  };

  try {
    return await openai.chat.completions.create({ model: preferredModel, ...payload });
  } catch (error) {
    const maybeMessage = error instanceof Error ? error.message : "";
    const shouldFallback = preferredModel !== "gpt-4.1-mini" && maybeMessage.toLowerCase().includes("model");
    if (!shouldFallback) throw error;
    return openai.chat.completions.create({ model: "gpt-4.1-mini", ...payload });
  }
}

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  const result = await supabaseAdmin
    .from("knowledge_bases")
    .select("id, title, raw_text, short_summary, usage_guidance, created_at")
    .order("created_at", { ascending: false });

  if (result.error) {
    console.error("knowledge_base_list_error", result.error);
    return NextResponse.json({ error: "Falha ao listar bases." }, { status: 500 });
  }

  return NextResponse.json({ bases: result.data ?? [] });
}

export async function POST(request: Request) {
  try {
    const parsedBody = bodySchema.safeParse(await request.json());
    if (!parsedBody.success) return NextResponse.json({ error: "Dados inválidos para salvar a base." }, { status: 400 });

    const { title, rawText } = parsedBody.data;
    const supabaseAdmin = getSupabaseAdmin();
    const completion = await generateKnowledgeMetadata(title, rawText);
    const content = completion.choices[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "Não foi possível gerar metadados da base." }, { status: 502 });

    const parsedOutput = llmOutputSchema.safeParse(JSON.parse(content));
    if (!parsedOutput.success) return NextResponse.json({ error: "Saída da IA em formato inválido." }, { status: 502 });

    const { shortSummary, usageGuidance, suggestedQuestions } = parsedOutput.data;
    const baseInsert = await supabaseAdmin
      .from("knowledge_bases")
      .insert({ title, raw_text: rawText, short_summary: shortSummary, usage_guidance: usageGuidance })
      .select("id")
      .single();

    if (baseInsert.error || !baseInsert.data) {
      console.error("knowledge_base_insert_error", baseInsert.error);
      return NextResponse.json({ error: "Falha ao salvar base no banco." }, { status: 500 });
    }

    const rows = suggestedQuestions.map((questionText) => ({
      knowledge_base_id: baseInsert.data.id,
      question_text: questionText,
    }));
    const questionsInsert = await supabaseAdmin.from("suggested_questions").insert(rows);
    if (questionsInsert.error) {
      console.error("suggested_questions_insert_error", questionsInsert.error);
      await supabaseAdmin.from("knowledge_bases").delete().eq("id", baseInsert.data.id);
      return NextResponse.json({ error: "Falha ao salvar perguntas sugeridas." }, { status: 500 });
    }

    return NextResponse.json({ message: "Base salva com resumo e perguntas sugeridas." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno desconhecido.";
    console.error("knowledge_post_unhandled_error", error);
    return NextResponse.json({ error: "Erro interno ao processar base de conhecimento.", details: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const url = new URL(request.url);
    const idParsed = idSchema.safeParse(url.searchParams.get("id"));
    if (!idParsed.success) return NextResponse.json({ error: "ID inválido para editar base." }, { status: 400 });

    const parsedBody = bodySchema.safeParse(await request.json());
    if (!parsedBody.success) return NextResponse.json({ error: "Dados inválidos para editar base." }, { status: 400 });

    const { title, rawText } = parsedBody.data;
    const supabaseAdmin = getSupabaseAdmin();
    const completion = await generateKnowledgeMetadata(title, rawText);
    const content = completion.choices[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "Não foi possível gerar metadados da base." }, { status: 502 });

    const parsedOutput = llmOutputSchema.safeParse(JSON.parse(content));
    if (!parsedOutput.success) return NextResponse.json({ error: "Saída da IA em formato inválido." }, { status: 502 });

    const { shortSummary, usageGuidance, suggestedQuestions } = parsedOutput.data;
    const knowledgeBaseId = idParsed.data;

    const updateResult = await supabaseAdmin
      .from("knowledge_bases")
      .update({ title, raw_text: rawText, short_summary: shortSummary, usage_guidance: usageGuidance })
      .eq("id", knowledgeBaseId)
      .select("id")
      .single();

    if (updateResult.error || !updateResult.data) {
      console.error("knowledge_base_update_error", updateResult.error);
      return NextResponse.json({ error: "Falha ao editar base no banco." }, { status: 500 });
    }

    const deleteResult = await supabaseAdmin.from("suggested_questions").delete().eq("knowledge_base_id", knowledgeBaseId);
    if (deleteResult.error) {
      console.error("suggested_questions_delete_error", deleteResult.error);
      return NextResponse.json({ error: "Falha ao atualizar perguntas sugeridas." }, { status: 500 });
    }

    const rows = suggestedQuestions.map((questionText) => ({
      knowledge_base_id: knowledgeBaseId,
      question_text: questionText,
    }));
    const questionsInsert = await supabaseAdmin.from("suggested_questions").insert(rows);
    if (questionsInsert.error) {
      console.error("suggested_questions_reinsert_error", questionsInsert.error);
      return NextResponse.json({ error: "Falha ao salvar perguntas sugeridas atualizadas." }, { status: 500 });
    }

    return NextResponse.json({ message: "Base editada com sucesso." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno desconhecido.";
    console.error("knowledge_patch_unhandled_error", error);
    return NextResponse.json({ error: "Erro interno ao editar base de conhecimento.", details: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const idParsed = idSchema.safeParse(url.searchParams.get("id"));
    if (!idParsed.success) return NextResponse.json({ error: "ID inválido para remover base." }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin();
    const remove = await supabaseAdmin.from("knowledge_bases").delete().eq("id", idParsed.data);
    if (remove.error) {
      console.error("knowledge_base_delete_error", remove.error);
      return NextResponse.json({ error: "Falha ao remover base." }, { status: 500 });
    }

    return NextResponse.json({ message: "Base removida com sucesso." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno desconhecido.";
    console.error("knowledge_delete_unhandled_error", error);
    return NextResponse.json({ error: "Erro interno ao remover base.", details: message }, { status: 500 });
  }
}
