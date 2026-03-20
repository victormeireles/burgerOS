import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";

const sessionIdSchema = z.string().uuid();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  const parsed = sessionIdSchema.safeParse(sessionId);
  if (!parsed.success) {
    return NextResponse.json({ error: "sessionId inválido." }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const result = await supabaseAdmin
    .from("chat_messages")
    .select("id, session_id, question_text, answer_text, status, error_message, metadata, created_at")
    .eq("session_id", parsed.data)
    .order("created_at", { ascending: true });

  if (result.error) {
    console.error("chat_history_messages_list_error", result.error);
    return NextResponse.json(
      {
        error: "Falha ao listar mensagens da sessão.",
        details: "Verifique se a migration de histórico foi aplicada no Supabase.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ messages: result.data ?? [] });
}
