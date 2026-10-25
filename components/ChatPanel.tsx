"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EMERGENCY } from "@/lib/emergency";
import { processImage, type Page } from "@/lib/image";
import { speak, stopSpeaking, useVoice } from "@/lib/speech";
import { clearChat, formatDate, loadChat, loadReports, reportDate, saveChat } from "@/lib/storage";
import type { ChatMessage, SavedReport } from "@/lib/types";
import { useApp } from "./AppProvider";
import CameraCapture from "./CameraCapture";
import { IconCamera, IconCopy, IconPhone, IconSend, IconSpeaker, IconStop, IconTrash, IconX } from "./Icons";

interface Msg extends ChatMessage {
  emergency?: boolean;
  photo?: string; // preview only, never saved
}

export default function ChatPanel({ compact = false, initialReportIds = [] }: { compact?: boolean; initialReportIds?: string[] }) {
  const { t, lang, user } = useApp();
  const c = t.app.chat;
  const voice = useVoice(lang);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [attached, setAttached] = useState<string[]>(initialReportIds);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [photo, setPhoto] = useState<Page | null>(null);
  const [camera, setCamera] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReports(loadReports(user.id));
    if (!compact) setMessages(loadChat(user.id) as Msg[]);
  }, [user.id, compact]);

  useEffect(() => {
    if (!compact && !streaming) saveChat(user.id, messages.map(({ role, text, emergency }) => (emergency ? { role, text, emergency } : { role, text })));
  }, [messages, streaming, compact, user.id]);

  useEffect(() => {
    if (!compact) endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, compact]);

  const attachedReports = useMemo(() => reports.filter((r) => attached.includes(r.id)), [reports, attached]);
  const starters = useMemo(() => {
    const first = attachedReports[0]?.result.document_type;
    return first === "lab_report" ? c.starters.lab : first === "prescription" ? c.starters.rx : c.starters.general;
  }, [attachedReports, c]);

  const label = (r: SavedReport) => `${t.app.type[r.result.document_type]} ${formatDate(reportDate(r), lang)}`;

  const send = useCallback(
    async (text: string) => {
      const q = text.trim().slice(0, 2000);
      if ((!q && !photo) || streaming) return;
      setError(null);
      const userMsg: Msg = { role: "user", text: q || "📷", photo: photo?.dataUrl };
      const next: Msg[] = [...messages, userMsg];
      // Emergency words show a fixed card first, before any model text.
      if (EMERGENCY.test(q)) next.push({ role: "model", text: `${c.emergencyTitle}. ${c.emergencyText}`, emergency: true });
      next.push({ role: "model", text: "" });
      setMessages(next);
      setInput("");
      const image = photo?.dataUrl;
      setPhoto(null);
      setStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;
      let answer = "";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next.filter((m) => !m.emergency && m.text).map(({ role, text: tx }) => ({ role, text: tx })),
            reports: attachedReports.map((r) => r.result),
            image,
            lang,
          }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(res.status === 429 ? "busy" : "generic");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          let chunk = decoder.decode(value, { stream: true });
          if (chunk.includes("\u0000error")) throw new Error("generic");
          chunk = chunk.replace(/\u0000model:[^\n]*\n/g, "");
          answer += chunk;
          setMessages((m) => [...m.slice(0, -1), { role: "model", text: answer }]);
        }
        if (!answer.trim()) throw new Error("generic");
      } catch (e) {
        if (controller.signal.aborted) {
          setMessages((m) => (answer ? m : m.slice(0, -1)));
        } else {
          setMessages((m) => m.slice(0, -1));
          setError(e instanceof Error && e.message === "busy" ? t.errors.busy : c.error);
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, photo, streaming, attachedReports, lang, c, t.errors.busy],
  );

  async function onPhoto(blob: Blob) {
    setCamera(false);
    try {
      setPhoto(await processImage(blob));
    } catch {
      setError(t.errors.bad_image);
    }
  }

  function read(i: number, text: string) {
    if (!voice) return;
    if (speaking === i) {
      stopSpeaking();
      setSpeaking(null);
      return;
    }
    setSpeaking(i);
    speak(text, voice, () => setSpeaking(null));
  }

  async function copy(i: number, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  }

  const fallback = useCallback(() => {
    setCamera(false);
    fileRef.current?.click();
  }, []);

  return (
    <section className={compact ? "card chat-panel compact" : "chat-panel"} aria-label={compact ? t.app.report.ask : c.title}>
      {compact ? (
        <h2 className="section-title">{t.app.report.ask}</h2>
      ) : (
        <div className="chat-top">
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>{c.title}</h1>
            <p className="muted" style={{ margin: 0 }}>{c.intro}</p>
          </div>
          {messages.length > 0 && (
            <button className="icon-btn" onClick={() => { if (window.confirm(c.clear + "?")) { clearChat(user.id); setMessages([]); } }} aria-label={c.clear} title={c.clear}>
              <IconTrash size={20} />
            </button>
          )}
        </div>
      )}

      {!compact && (
        <div className="chips-row">
          {attachedReports.map((r) => (
            <span key={r.id} className="attach-chip">
              {c.using}: {label(r)}
              <button onClick={() => setAttached((a) => a.filter((x) => x !== r.id))} aria-label={`${c.removeAttachment} ${label(r)}`}>
                <IconX size={16} />
              </button>
            </span>
          ))}
          {reports.length > 0 ? (
            <select
              className="attach-select"
              aria-label={c.attach}
              value=""
              onChange={(e) => e.target.value && setAttached((a) => [...new Set([...a, e.target.value])].slice(0, 3))}
            >
              <option value="">+ {c.attach}</option>
              {reports.filter((r) => !attached.includes(r.id)).map((r) => (
                <option key={r.id} value={r.id}>{r.result.title || label(r)} · {formatDate(reportDate(r), lang)}</option>
              ))}
            </select>
          ) : (
            <span className="muted">{c.noReports}</span>
          )}
        </div>
      )}

      <div className="chat" aria-live="polite">
        {messages.map((m, i) =>
          m.emergency ? (
            <div key={i} className="emergency-card" role="alert">
              <strong>{c.emergencyTitle}</strong>
              <p>{c.emergencyText}</p>
              <a className="btn btn-accent btn-inline" href="tel:112"><IconPhone /> {c.call}</a>
            </div>
          ) : (
            <div key={i} className={`bubble bubble-${m.role}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {m.photo && <img src={m.photo} alt="" className="bubble-photo" />}
              {m.text || (streaming && i === messages.length - 1 ? <span className="muted">{c.thinking}</span> : null)}
              {m.role === "model" && m.text && !(streaming && i === messages.length - 1) && (
                <div className="bubble-tools">
                  <button onClick={() => copy(i, m.text)} aria-label={c.copy}>
                    <IconCopy size={16} /> {copied === i ? c.copied : c.copy}
                  </button>
                  {voice && (
                    <button onClick={() => read(i, m.text)} aria-label={c.read}>
                      {speaking === i ? <IconStop size={16} /> : <IconSpeaker size={16} />} {c.read}
                    </button>
                  )}
                </div>
              )}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      {messages.length === 0 && (
        <div className="suggestions">
          {starters.map((s) => (
            <button key={s} className="chip-btn" onClick={() => send(s)} disabled={streaming}>{s}</button>
          ))}
        </div>
      )}

      {error && <div className="error" role="alert">{error}</div>}

      {photo && (
        <div className="attach-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.dataUrl} alt="" />
          <button onClick={() => setPhoto(null)} aria-label={c.removeAttachment}><IconX size={16} /></button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onPhoto(f); }} />
      {camera && <CameraCapture t={t} onCapture={onPhoto} onClose={() => setCamera(false)} onFallback={fallback} />}

      <form className="ask-row" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        {!compact && (
          <button type="button" className="icon-btn" onClick={() => setCamera(true)} aria-label={c.attachPhoto}>
            <IconCamera size={22} />
          </button>
        )}
        <input className="ask-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={c.placeholder}
          aria-label={c.placeholder} maxLength={2000} />
        {streaming ? (
          <button type="button" className="btn btn-secondary ask-send" onClick={() => abortRef.current?.abort()} aria-label={c.stop}>
            <IconStop size={20} />
          </button>
        ) : (
          <button className="btn btn-primary ask-send" type="submit" disabled={!input.trim() && !photo} aria-label={c.send}>
            <IconSend size={20} />
          </button>
        )}
      </form>
    </section>
  );
}
