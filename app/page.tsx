"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type SuggestedQuestion = {
  id: string;
  question_text: string;
};

export default function HomePage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedQuestion[]>([]);

  useEffect(() => {
    void loadSuggestions();
  }, []);

  async function loadSuggestions() {
    const response = await fetch("/api/suggested-questions", { method: "GET" });
    if (!response.ok) return;
    const data = (await response.json()) as { questions: SuggestedQuestion[] };
    setSuggestions(data.questions ?? []);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    try {
      const payload: { question: string; sessionId?: string } = { question };
      if (sessionId) payload.sessionId = sessionId;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { answer: string; sessionId?: string };
      setAnswer(data.answer ?? "Não foi possível gerar resposta.");
      if (data.sessionId) setSessionId(data.sessionId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <section style={{ width: "100%", maxWidth: 720 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>Ei, Victor. Tudo pronto para começar?</h1>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/history">Histórico</Link>
            <Link href="/knowledge">Gerenciar bases</Link>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setQuestion(item.question_text)}
                style={{
                  background: "#1a1a1a",
                  color: "#cfcfcf",
                  border: "1px solid #2e2e2e",
                  borderRadius: 999,
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                {item.question_text}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          style={{
            background: "#1f1f1f",
            border: "1px solid #2d2d2d",
            borderRadius: 20,
            padding: 14,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Pergunte alguma coisa"
            style={{
              flex: 1,
              background: "transparent",
              color: "#f5f5f5",
              border: "none",
              outline: "none",
              fontSize: 16,
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#f5f5f5",
              color: "#111",
              borderRadius: 999,
              border: "none",
              padding: "10px 14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {loading ? "..." : "Enviar"}
          </button>
        </form>

        {answer && (
          <article
            style={{
              marginTop: 20,
              background: "#161616",
              border: "1px solid #2a2a2a",
              borderRadius: 14,
              padding: 16,
              whiteSpace: "pre-wrap",
            }}
          >
            {answer}
          </article>
        )}
      </section>
    </main>
  );
}
