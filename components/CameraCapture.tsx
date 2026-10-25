"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Strings } from "@/lib/i18n";
import { IconBolt, IconRotate, IconX } from "./Icons";

type TorchCaps = MediaTrackCapabilities & { torch?: boolean };
type TorchSet = MediaTrackConstraintSet & { torch?: boolean };

/**
 * Full-screen live camera with a document frame. Calls onFallback() when a live preview can't run
 * (no getUserMedia, not HTTPS); shows how to allow access when permission is denied.
 */
export default function CameraCapture({ t, onCapture, onClose, onFallback }: {
  t: Strings;
  onCapture: (photo: Blob) => void;
  onClose: () => void;
  onFallback: () => void;
}) {
  const c = t.app.camera;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [state, setState] = useState<"starting" | "live" | "denied">("starting");
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        onFallback();
        return;
      }
      setState("starting");
      stop();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        const caps = (track.getCapabilities?.() ?? {}) as TorchCaps;
        setTorchAvailable(Boolean(caps.torch));
        setTorchOn(false);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setState("live");
      } catch (e) {
        if (cancelled) return;
        const name = e instanceof DOMException ? e.name : "";
        if (name === "NotAllowedError" || name === "SecurityError") setState("denied");
        else onFallback();
      }
    }
    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [facing, attempt, onFallback, stop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function close() {
    stop();
    onClose();
  }

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as TorchSet] });
      setTorchOn(next);
    } catch {
      setTorchAvailable(false);
    }
  }

  function shoot() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        stop();
        if (blob) onCapture(blob);
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="camera" role="dialog" aria-modal="true" aria-label={c.fit}>
      <video ref={videoRef} className="camera-video" playsInline muted autoPlay />
      {state === "live" && (
        <div className="camera-frame" aria-hidden="true">
          <span>{c.fit}</span>
        </div>
      )}
      {state === "starting" && <p className="camera-status">{c.starting}</p>}
      {state === "denied" && (
        <div className="camera-denied" role="alert">
          <p>{c.denied}</p>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => setAttempt((a) => a + 1)}>
              {t.app.scan.takePhoto}
            </button>
            <button className="btn btn-secondary" onClick={() => { stop(); onFallback(); }}>
              {t.app.scan.choosePhoto}
            </button>
          </div>
        </div>
      )}

      <div className="camera-top">
        <button className="camera-icon" onClick={close} aria-label={c.cancel}>
          <IconX size={26} />
        </button>
        {torchAvailable && (
          <button className="camera-icon" onClick={toggleTorch} aria-pressed={torchOn} aria-label={torchOn ? c.torchOff : c.torchOn}>
            <IconBolt size={24} />
          </button>
        )}
      </div>

      <div className="camera-bottom">
        <button className="camera-text" onClick={close}>
          {c.cancel}
        </button>
        <button className="camera-shutter" onClick={shoot} disabled={state !== "live"} aria-label={c.shutter}>
          <span />
        </button>
        <button className="camera-icon" onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
          aria-label={c.switchCam}>
          <IconRotate size={24} />
        </button>
      </div>
    </div>
  );
}
