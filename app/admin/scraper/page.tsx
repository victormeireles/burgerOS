"use client";

import { useState } from "react";
import Link from "next/link";

export default function ScraperPage() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function startScraping() {
    if (!url.trim()) return;
    setLoading(true);
    setStatus("Iniciando coleta...");
    try {
      const response = await fetch("/api/reviews/ifood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ifoodUrl: url }),
      });
      const data = await response.json();
      if (data.success) {
        setStatus(`Sucesso! Run ID: ${data.runId}. Verifique o progresso no Apify.`);
      } else {
        setStatus(`Erro: ${data.error || "Algo deu errado"}`);
      }
    } catch (e: any) {
      console.error(e);
      setStatus(`Erro de conexão: ${e.message || "Verifique o console do navegador"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "40px", maxWidth: 600, margin: "0 auto", color: "#fff" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/" style={{ color: "#888" }}>← Voltar para Home</Link>
      </div>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Extrair Reviews (iFood)</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Cole a URL da hamburgueria no iFood"
          style={{ padding: "12px", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "white" }}
        />
        <button
          onClick={startScraping}
          disabled={loading}
          style={{ padding: "12px", cursor: "pointer", borderRadius: 8, border: "none", background: "#f5f5f5", color: "#000", fontWeight: 600 }}
        >
          {loading ? "Processando..." : "Extrair Reviews"}
        </button>
      </div>
      {status && (
        <div style={{ marginTop: 20, padding: 15, background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "#aaa" }}>
          {status}
        </div>
      )}
    </main>
  );
}
