"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ChatSession = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

type ChatMessage = {
  id: string;
  session_id: string;
  question_text: string;
  answer_text: string | null;
  status: "success" | "error";
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    void loadSessions();
  }, []);

  useEffect(() => {
    if (!selectedSessionId) {
      setMessages([]);
      return;
    }
    void loadMessages(selectedSessionId);
  }, [selectedSessionId]);

  async function loadSessions() {
    setLoadingSessions(true);
    try {
      const response = await fetch("/api/chat/history/sessions");
      if (!response.ok) return;
      const data = (await response.json()) as { sessions?: ChatSession[] };
      const list = data.sessions ?? [];
      setSessions(list);
      setSelectedSessionId((current) => current ?? list[0]?.id ?? null);
    } finally {
      setLoadingSessions(false);
    }
  }

  async function loadMessages(sessionId: string) {
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/chat/history/messages?sessionId=${sessionId}`);
      if (!response.ok) return;
      const data = (await response.json()) as { messages?: ChatMessage[] };
      setMessages(data.messages ?? []);
    } finally {
      setLoadingMessages(false);
    }
  }

  return (
    <main className="container">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Histórico do chat</h1>
        <Link href="/">Voltar ao chat</Link>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
        <aside style={{ border: "1px solid #2a2a2a", borderRadius: 12, background: "#141414", padding: 10 }}>
          <h2 style={{ margin: "4px 0 10px", fontSize: 16 }}>Sessões</h2>
          {loadingSessions ? (
            <p style={{ margin: 0 }}>Carregando sessões...</p>
          ) : sessions.length === 0 ? (
            <p style={{ margin: 0 }}>Nenhuma sessão registrada ainda.</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {sessions.map((session) => {
                const selected = selectedSessionId === session.id;
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedSessionId(session.id)}
                    style={{
                      textAlign: "left",
                      border: selected ? "1px solid #6a6a6a" : "1px solid #2f2f2f",
                      background: selected ? "#1f1f1f" : "#121212",
                      color: "#f1f1f1",
                      borderRadius: 8,
                      padding: "10px 12px",
                      cursor: "pointer",
                    }}
                  >
                    <strong style={{ display: "block", marginBottom: 4 }}>
                      {session.title?.trim() || "Sessão sem título"}
                    </strong>
                    <small style={{ color: "#b3b3b3" }}>
                      Atualizada em {new Date(session.updated_at).toLocaleString("pt-BR")}
                    </small>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <div style={{ border: "1px solid #2a2a2a", borderRadius: 12, background: "#141414", padding: 12 }}>
          <h2 style={{ margin: "4px 0 10px", fontSize: 16 }}>Mensagens</h2>
          {!selectedSessionId ? (
            <p style={{ margin: 0 }}>Selecione uma sessão para ver as mensagens.</p>
          ) : loadingMessages ? (
            <p style={{ margin: 0 }}>Carregando mensagens...</p>
          ) : messages.length === 0 ? (
            <p style={{ margin: 0 }}>Esta sessão ainda não tem mensagens.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {messages.map((msg) => (
                <article
                  key={msg.id}
                  style={{
                    border: "1px solid #2f2f2f",
                    borderRadius: 10,
                    padding: 10,
                    background: "#111",
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        borderRadius: 999,
                        padding: "4px 8px",
                        fontSize: 12,
                        background: msg.status === "success" ? "#17331f" : "#3b1717",
                        color: msg.status === "success" ? "#9ee0b2" : "#ffb3b3",
                      }}
                    >
                      {msg.status}
                    </span>
                    <small style={{ color: "#b3b3b3" }}>{new Date(msg.created_at).toLocaleString("pt-BR")}</small>
                  </div>

                  <div>
                    <strong>Pergunta:</strong>
                    <p style={{ margin: "4px 0 0", whiteSpace: "pre-wrap" }}>{msg.question_text}</p>
                  </div>

                  <div>
                    <strong>Resposta:</strong>
                    <p style={{ margin: "4px 0 0", whiteSpace: "pre-wrap" }}>
                      {msg.answer_text || msg.error_message || "Sem conteúdo de resposta."}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
