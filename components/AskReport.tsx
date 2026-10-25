"use client";

import { useState } from "react";
import type { Strings } from "@/lib/i18n";
import type { ChatMessage, Explanation, Lang } from "@/lib/types";

/** "Ask your report": short Q&A answered by Gemma 4 using only the data read from this paper. */
export default function AskReport({ report, lang, t }: { report: Explanation; lang: Lang; t: Strings }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = report.document_type === "lab_report" ? t.ask.suggestLab : t.ask.suggestRx;

  async function send(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", text: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report, messages: next, lang }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.answer) throw new Error(data.error === "busy" ? "busy" : "generic");
      setMessages([...next, { role: "model", text: data.answer }]);
    } catch (e) {
      setError(e instanceof Error && e.message === "busy" ? t.errors.busy : t.errors.generic);
      setMessages(messages);
      setInput(q);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2 className="section-title">{t.ask.title}</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        {t.ask.hint}
      </p>

      {messages.length > 0 && (
        <div className="chat" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`bubble bubble-${m.role}`}>
              {m.text}
            </div>
          ))}
        </div>
      )}
      {busy && <p className="muted">{t.ask.thinking}</p>}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {messages.length === 0 && (
        <div className="suggestions">
          {suggestions.map((s) => (
            <button key={s} className="chip-btn" onClick={() => send(s)} disabled={busy}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="ask-row"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          className="ask-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.ask.placeholder}
          aria-label={t.ask.placeholder}
          maxLength={500}
        />
        <button className="btn btn-primary ask-send" type="submit" disabled={busy || !input.trim()}>
          {t.ask.send}
        </button>
      </form>
    </section>
  );
}
