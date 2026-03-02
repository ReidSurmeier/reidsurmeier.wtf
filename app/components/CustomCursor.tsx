"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Use matchMedia so JS and CSS agree on the exact same breakpoint
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches && !("ontouchstart" in window));
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: -20,
        left: -20,
        width: 8,
        height: 8,
        background: "transparent",
        border: "1px solid #ccc",
        pointerEvents: "none",
        zIndex: 999999,
        transform: "translate(-50%, -50%)",
        mixBlendMode: "difference",
      }}
    />
  );
}
