"use client";

import { useState } from "react";
import { IconChat, IconDownload, IconListCheck } from "@/components/Icons";
import type { CategoryKey, ConsultInput, ConsultResult, Understood } from "@/lib/consult";
import type { Strings } from "@/lib/i18n";
import { formatDate } from "@/lib/storage";
import type { Explanation, Lang } from "@/lib/types";

type Cat = CategoryKey | "own";
interface Q {
  id: string;
  cat: Cat;
  text: string;
  selected: boolean;
}

const EMPTY: ConsultInput = { concern: "", age: "", medicines: "", allergies: "", extra: [] };

/** "Questions to Ask Your Doctor": describe a concern -> Gemma organises it -> personalised questions. */
export default function Consult({ lang, t, report, onBack }: {
  lang: Lang;
  t: Strings;
  report: Explanation | null;
  onBack: () => void;
}) {
  const c = t.consult;
  const [input, setInput] = useState<ConsultInput>(EMPTY);
  const [result, setResult] = useState<ConsultResult | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [more, setMore] = useState("");
  const [own, setOwn] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate(next: ConsultInput) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: next, report, lang }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.result) throw new Error(data.error === "busy" ? "busy" : "generic");
      const r: ConsultResult = data.result;
      // Keep the user's own questions when regenerating.
      const mine = questions.filter((q) => q.cat === "own");
      setResult(r);
      setInput(next);
      setQuestions([
        ...r.categories.flatMap((cat) =>
          cat.questions.map((text, i) => ({ id: `${cat.key}-${i}-${Date.now()}`, cat: cat.key, text, selected: true })),
        ),
        ...mine,
      ]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error && e.message === "busy" ? t.errors.busy : t.errors.generic);
    } finally {
      setBusy(false);
    }
  }

  function addOwn() {
    const text = own.trim();
    if (!text) return;
    setQuestions((qs) => [...qs, { id: `own-${Date.now()}`, cat: "own", text, selected: true }]);
    setOwn("");
  }

  function toggle(id: string) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, selected: !q.selected } : q)));
  }

  const selected = questions.filter((q) => q.selected);
  const cats: Cat[] = [...(result?.categories.map((x) => x.key) ?? []), "own"];

  async function copy() {
    const text = cats
      .map((cat) => {
        const qs = selected.filter((q) => q.cat === cat);
        return qs.length ? `${c.cats[cat]}\n${qs.map((q, i) => `${i + 1}. ${q.text}`).join("\n")}` : "";
      })
      .filter(Boolean)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(`${c.printTitle}\n\n${text}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  if (busy && !result) {
    return (
      <section className="card center" aria-live="polite" aria-busy="true">
        <div className="spinner" />
        <h2 className="section-title">{c.loading}</h2>
        <p className="muted" style={{ margin: 0 }}>
          {t.loadingHint}
        </p>
      </section>
    );
  }

  // Step 1: describe the concern
  if (!result) {
    return (
      <>
        <h1 className="page-title">{c.title}</h1>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <section className="card stack">
          <label className="field">
            <span className="field-label">{c.concernLabel}</span>
            <textarea
              className="textarea"
              rows={5}
              value={input.concern}
              placeholder={c.placeholder}
              maxLength={3000}
              onChange={(e) => setInput({ ...input, concern: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="field-label">{c.age}</span>
            <input className="ask-input" inputMode="numeric" value={input.age} maxLength={20}
              onChange={(e) => setInput({ ...input, age: e.target.value })} />
          </label>
          <label className="field">
            <span className="field-label">{c.medicines}</span>
            <input className="ask-input" value={input.medicines} maxLength={500}
              onChange={(e) => setInput({ ...input, medicines: e.target.value })} />
          </label>
          <label className="field">
            <span className="field-label">{c.allergies}</span>
            <input className="ask-input" value={input.allergies} maxLength={300}
              onChange={(e) => setInput({ ...input, allergies: e.target.value })} />
          </label>
          {report && <p className="muted" style={{ margin: 0 }}>{c.reportAttached}</p>}
          <button className="btn btn-accent" disabled={busy || (!input.concern.trim() && !report)}
            onClick={() => generate(input)}>
            {c.submit}
          </button>
        </section>
        <button className="btn btn-secondary" onClick={onBack}>
          ← {t.history.back}
        </button>
      </>
    );
  }

  // Step 2: personalised questions
  const u = result.understood;
  const facts: [keyof Understood, string][] = (
    ["symptoms", "duration", "severity", "frequency", "associated", "age", "medications", "allergies", "history"] as const
  )
    .map((k) => [k, Array.isArray(u[k]) ? (u[k] as string[]).join(", ") : (u[k] as string)] as [keyof Understood, string])
    .filter(([, v]) => v);

  return (
    <>
      <div className="screen-only">
        {result.urgent && (
          <section className="card" role="alert">
            <div className="alert alert-urgent">
              <strong>🚑 {c.urgentTitle}</strong>
              <p style={{ margin: "6px 0 0" }}>{result.urgent_message || c.urgentDefault}</p>
            </div>
          </section>
        )}

        <div className="safety-note" role="note">
          ℹ️ {t.safetyNotice}
        </div>

        {facts.length > 0 && (
          <section className="card">
            <h2 className="section-title">{c.shared}</h2>
            <dl className="facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{c.fields[k]}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="card">
          <h2 className="section-title">{c.title}</h2>
          <p className="muted" style={{ marginTop: -6 }}>
            {c.hint}
          </p>
          {cats.map((cat) => {
            const qs = questions.filter((q) => q.cat === cat);
            if (!qs.length) return null;
            return (
              <div key={cat} className="q-group">
                <h3 className="q-cat">{c.cats[cat]}</h3>
                {qs.map((q) => (
                  <label key={q.id} className="q-item">
                    <input type="checkbox" checked={q.selected} onChange={() => toggle(q.id)} />
                    <span>{q.text}</span>
                  </label>
                ))}
              </div>
            );
          })}
          <form
            className="ask-row"
            style={{ marginTop: 12 }}
            onSubmit={(e) => {
              e.preventDefault();
              addOwn();
            }}
          >
            <input className="ask-input" value={own} onChange={(e) => setOwn(e.target.value)}
              placeholder={c.addOwnPlaceholder} aria-label={c.addOwnPlaceholder} maxLength={300} />
            <button className="btn btn-secondary ask-send" type="submit" disabled={!own.trim()}>
              {c.add}
            </button>
          </form>
        </section>

        {result.missing_info.length > 0 && (
          <section className="card">
            <h2 className="section-title">{c.missing}</h2>
            <ul className="list">
              {result.missing_info.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
            <textarea className="textarea" rows={3} style={{ marginTop: 12 }} value={more}
              placeholder={c.addMorePlaceholder} maxLength={1000} onChange={(e) => setMore(e.target.value)} />
            <button className="btn btn-primary" style={{ marginTop: 10 }} disabled={busy || !more.trim()}
              onClick={() => {
                const next = { ...input, extra: [...input.extra, more.trim()] };
                setMore("");
                generate(next);
              }}>
              {busy ? c.loading : c.regenerate}
            </button>
          </section>
        )}
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        <div className="stack">
          <button className="btn btn-accent" onClick={() => window.print()} disabled={!selected.length}>
            <IconDownload /> {c.download}
          </button>
          <button className="btn btn-secondary" onClick={copy} disabled={!selected.length}>
            <IconListCheck /> {copied ? c.copied : c.copy}
          </button>
          <button className="btn btn-secondary" onClick={() => {
            setResult(null);
            setQuestions([]);
            setInput(EMPTY);
          }}>
            <IconChat /> {c.newConcern}
          </button>
          <button className="btn btn-secondary" onClick={onBack}>
            ← {t.history.back}
          </button>
        </div>
      </div>

      {/* Printed / saved as PDF: only the selected questions */}
      <div className="print-only doc-summary">
        <h1>ArogyaMitra · {c.printTitle}</h1>
        <p className="doc-meta">
          {t.doctor.prepared}: {formatDate(new Date().toISOString(), lang)}
        </p>
        {facts.length > 0 && (
          <>
            <h2>{c.shared}</h2>
            <table>
              <tbody>
                {facts.map(([k, v]) => (
                  <tr key={k}>
                    <th style={{ width: "30%" }}>{c.fields[k]}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {cats.map((cat) => {
          const qs = selected.filter((q) => q.cat === cat);
          return qs.length ? (
            <div key={cat}>
              <h2>{c.cats[cat]}</h2>
              <ol>
                {qs.map((q) => (
                  <li key={q.id}>{q.text}</li>
                ))}
              </ol>
            </div>
          ) : null;
        })}
        <h2>{t.doctor.notes}</h2>
        <div className="doc-notes" />
        <p className="doc-foot">
          {t.safetyNotice} {t.disclaimer}
        </p>
      </div>
    </>
  );
}
