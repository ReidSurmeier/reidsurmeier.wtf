"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TextScatterLoaderProps {
  text: string;
  amount?: number;
  fontSize?: number;
  interval?: number;
  windowSize?: number;
  duration?: number;
  onDone?: () => void;
}

interface Frag {
  startX: number;
  y: number;
  offset: number;
  speed: number;
  driftSpeed: number; // horizontal drift in % per second
  typedChars: number;
  typeDelay: number;
  opacity: number;
}

export default function TextScatterLoader({
  text,
  amount = 10,
  fontSize = 2.5,
  interval = 20,
  windowSize = 20,
  duration = 1600,
  onDone,
}: TextScatterLoaderProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fragsRef = useRef<Frag[]>([]);
  const charsRef = useRef(Array.from(text));
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);
  const [fading, setFading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const frags: Frag[] = [];
    const chars = charsRef.current;
    const baseSpeed = 4 + Math.random() * 2; // shared drift speed so they move together
    for (let i = 0; i < amount; i++) {
      frags.push({
        startX: 20 + (i / amount) * 70, // spread horizontally across the screen
        y: 45, // all on the same row, centered
        offset: Math.floor(Math.random() * chars.length),
        speed: 0.15 + Math.random() * 0.2,
        driftSpeed: baseSpeed + Math.random() * 1, // nearly identical speeds
        typedChars: 0,
        typeDelay: i * 40, // slight stagger left to right
        opacity: 0.25 + Math.random() * 0.35,
      });
    }
    fragsRef.current = frags;
  }, [amount]);

  const getWindow = useCallback(
    (offset: number, maxChars: number) => {
      const c = charsRef.current;
      const len = c.length;
      const start = Math.floor(offset) % len;
      const show = Math.min(maxChars, windowSize);
      let result = "";
      for (let i = 0; i < show; i++) {
        result += c[((start + i) % len + len) % len];
      }
      return result;
    },
    [windowSize]
  );

  useEffect(() => {
    if (done) return;
    const els: HTMLDivElement[] = [];

    const setup = () => {
      const container = canvasRef.current;
      if (!container || fragsRef.current.length === 0) {
        rafRef.current = requestAnimationFrame(setup);
        return;
      }

      const frags = fragsRef.current;
      for (let i = 0; i < frags.length; i++) {
        const el = document.createElement("div");
        el.style.position = "absolute";
        el.style.fontFamily = "var(--site-font)";
        el.style.fontSize = `${fontSize}vh`;
        el.style.color = "#ccc";
        el.style.whiteSpace = "nowrap";
        el.style.lineHeight = "1";
        el.style.userSelect = "none";
        el.style.willChange = "transform";
        el.style.opacity = String(frags[i].opacity);
        container.appendChild(el);
        els.push(el);
      }

      startRef.current = performance.now();
      let lastUpdate = 0;

      const tick = (now: number) => {
        const elapsed = now - startRef.current;
        const dt = elapsed / 1000; // seconds
        const frags = fragsRef.current;

        const shouldUpdate = now - lastUpdate > interval;
        if (shouldUpdate) lastUpdate = now;

        for (let i = 0; i < frags.length; i++) {
          const f = frags[i];

          if (shouldUpdate) {
            f.offset += f.speed;
            if (elapsed > f.typeDelay && f.typedChars < windowSize) {
              f.typedChars = Math.min(
                windowSize,
                Math.floor((elapsed - f.typeDelay) / 60)
              );
            }
          }

          // Linear right-to-left drift
          const x = f.startX - f.driftSpeed * dt;

          const el = els[i];
          el.style.left = `${x}%`;
          el.style.top = `${f.y}%`;

          if (shouldUpdate) {
            el.textContent = getWindow(f.offset, f.typedChars);
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(setup);

    return () => {
      cancelAnimationFrame(rafRef.current);
      els.forEach((el) => { if (el.parentNode) el.remove(); });
    };
  }, [done, fontSize, interval, getWindow]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), duration);
    const doneTimer = setTimeout(() => {
      setDone(true);
      onDone?.();
    }, duration + 600);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [duration, onDone]);

  if (done) return null;

  return (
    <div
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        background: "#fff",
        zIndex: 50,
        overflow: "hidden",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.6s ease",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <style>{`@keyframes barcodeIn { from { opacity: 0; } to { opacity: 0.06; } }`}</style>
      <img
        src="/barcode.png"
        alt=""
        style={{
          position: "absolute",
          bottom: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 120,
          height: "auto",
          opacity: fading ? 0 : 0.06,
          filter: "grayscale(100%) brightness(2)",
          zIndex: 51,
          transition: "opacity 1s ease",
          animation: "barcodeIn 1s ease forwards",
        }}
      />
    </div>
  );
}
