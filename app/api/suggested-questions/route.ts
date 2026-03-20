import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("suggested_questions")
    .select("id, question_text")
    .limit(100);

  if (error) {
    return NextResponse.json({ questions: [] }, { status: 200 });
  }

  const shuffled = [...(data ?? [])].sort(() => Math.random() - 0.5).slice(0, 3);
  return NextResponse.json({ questions: shuffled });
}
