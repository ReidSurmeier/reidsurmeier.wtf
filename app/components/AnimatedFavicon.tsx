"use client";

import { useEffect } from "react";

export default function AnimatedFavicon() {
  useEffect(() => {
    const SIZE = 32;
    const FPS = 15;

    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = "/favicon.gif";
    img.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(img);

    document.querySelectorAll("link[rel='icon']").forEach((el) => el.remove());

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const drawFrame = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const old = document.querySelector("link[rel='icon']");
        if (old) old.remove();
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/png";
        link.href = dataUrl;
        document.head.appendChild(link);
      } catch {
        // ignore tainted canvas errors
      }
    };

    img.onload = () => {
      intervalId = setInterval(drawFrame, 1000 / FPS);
    };

    return () => {
      if (intervalId) clearInterval(intervalId);
      img.remove();
    };
  }, []);

  return null;
}
