import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  const result = await supabaseAdmin
    .from("chat_sessions")
    .select("id, title, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (result.error) {
    console.error("chat_history_sessions_list_error", result.error);
    return NextResponse.json(
      {
        error: "Falha ao listar sessões de histórico.",
        details: "Verifique se a migration de histórico foi aplicada no Supabase.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ sessions: result.data ?? [] });
}
