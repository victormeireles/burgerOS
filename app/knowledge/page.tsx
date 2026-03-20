"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type KnowledgeBase = {
  id: string;
  title: string;
  raw_text: string;
  short_summary: string;
  usage_guidance: string;
  created_at: string;
};

export default function KnowledgePage() {
  const [bases, setBases] = useState<KnowledgeBase[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    void loadBases();
  }, []);

  async function loadBases() {
    const response = await fetch("/api/knowledge");
    if (!response.ok) return;
    const data = (await response.json()) as { bases?: KnowledgeBase[] };
    setBases(data.bases ?? []);
  }

  function startEditing(base: KnowledgeBase) {
    setEditingId(base.id);
    setTitle(base.title);
    setRawText(base.raw_text);
    setResultMessage("");
  }

  function clearForm() {
    setEditingId(null);
    setTitle("");
    setRawText("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !rawText.trim()) return;

    setLoading(true);
    setResultMessage("");
    try {
      const isEditing = Boolean(editingId);
      const response = await fetch(`/api/knowledge${isEditing ? `?id=${editingId}` : ""}`, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, rawText }),
      });
      const data = (await response.json()) as { message?: string; error?: string; details?: string };
      if (!response.ok) {
        setResultMessage(data.details ? `${data.error} (${data.details})` : (data.error ?? "Falha ao salvar base."));
        return;
      }

      setResultMessage(data.message ?? "Base salva com sucesso.");
      clearForm();
      await loadBases();
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    const confirmed = window.confirm("Deseja remover esta base de conhecimento?");
    if (!confirmed) return;

    const response = await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" });
    const data = (await response.json()) as { message?: string; error?: string; details?: string };
    if (!response.ok) {
      setResultMessage(data.details ? `${data.error} (${data.details})` : (data.error ?? "Falha ao remover base."));
      return;
    }

    if (editingId === id) clearForm();
    setResultMessage(data.message ?? "Base removida com sucesso.");
    await loadBases();
  }

  return (
    <main className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Base de conhecimento</h1>
        <Link href="/">Voltar ao chat</Link>
      </div>

      <form
        onSubmit={onSubmit}
        style={{
          display: "grid",
          gap: 12,
          maxWidth: 980,
          background: "#171717",
          border: "1px solid #2a2a2a",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span>Título da base</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Fornecedores de pão brioche SP"
            style={{
              background: "#0f0f0f",
              color: "#f5f5f5",
              border: "1px solid #2c2c2c",
              borderRadius: 10,
              padding: 10,
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Texto da base</span>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Cole aqui o conteúdo que será transformado em conhecimento..."
            rows={14}
            style={{
              background: "#0f0f0f",
              color: "#f5f5f5",
              border: "1px solid #2c2c2c",
              borderRadius: 10,
              padding: 10,
              resize: "vertical",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: 180,
            background: "#f5f5f5",
            color: "#141414",
            border: "none",
            borderRadius: 10,
            padding: "10px 14px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Salvando..." : editingId ? "Salvar edição" : "Salvar base"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={clearForm}
            style={{
              width: 180,
              background: "transparent",
              color: "#f5f5f5",
              border: "1px solid #3d3d3d",
              borderRadius: 10,
              padding: "10px 14px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Cancelar edição
          </button>
        )}

        {resultMessage && <p style={{ margin: 0 }}>{resultMessage}</p>}
      </form>

      <section style={{ marginTop: 20, display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Bases cadastradas</h2>

        {bases.length === 0 ? (
          <p style={{ margin: 0, color: "#c7c7c7" }}>Nenhuma base cadastrada ainda.</p>
        ) : (
          bases.map((base) => (
            <article
              key={base.id}
              style={{
                border: "1px solid #2d2d2d",
                borderRadius: 12,
                padding: 14,
                background: "#141414",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <strong>{base.title}</strong>
                <small style={{ color: "#b6b6b6" }}>{new Date(base.created_at).toLocaleString("pt-BR")}</small>
              </div>
              <p style={{ margin: 0, color: "#d8d8d8" }}>{base.short_summary}</p>
              <p style={{ margin: 0, color: "#b8b8b8" }}>Quando usar: {base.usage_guidance}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => startEditing(base)}
                  style={{
                    border: "1px solid #3c3c3c",
                    background: "transparent",
                    color: "#f5f5f5",
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(base.id)}
                  style={{
                    border: "1px solid #703333",
                    background: "#2a1111",
                    color: "#ffb3b3",
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer",
                  }}
                >
                  Remover
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
