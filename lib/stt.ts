"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "./types";

/**
 * Speech to text with the browser's Web Speech API (Chrome/Edge/Android, Safari). The Gemma 4 models on
 * the Gemini API (26B, 31B) don't accept audio, so recognition happens on the device and only text is sent.
 * Not part of the TypeScript DOM lib, so the minimal shape is declared here.
 */
interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognitionCtor = new () => Recognition;

const LOCALE: Record<Lang, string> = { en: "en-IN", hi: "hi-IN", gu: "gu-IN" };

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type SttError = "denied" | "no-speech" | "failed";

/** onText(text, final): interim text while speaking, then the final transcript. */
export function useSpeechInput(lang: Lang, onText: (text: string, final: boolean) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<SttError | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  useEffect(() => {
    setSupported(Boolean(getCtor()) && window.isSecureContext);
    return () => recRef.current?.abort();
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    recRef.current?.abort();
    const rec = new Ctor();
    rec.lang = LOCALE[lang];
    rec.continuous = false;
    rec.interimResults = true;
    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      onTextRef.current((finalText + interim).trim(), false);
    };
    rec.onerror = (e) => {
      setError(e.error === "not-allowed" || e.error === "service-not-allowed" ? "denied" : e.error === "no-speech" ? "no-speech" : "failed");
    };
    rec.onend = () => {
      setListening(false);
      if (finalText.trim()) onTextRef.current(finalText.trim(), true);
      recRef.current = null;
    };
    recRef.current = rec;
    setError(null);
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      setError("failed");
    }
  }, [lang]);

  return { supported, listening, error, start, stop };
}
