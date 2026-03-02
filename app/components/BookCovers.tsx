"use client";

import { useState, useEffect, useRef, type RefObject } from "react";

const bookCovers = [
  // "plotter30.jpg",
  // "plotter31.jpg",
  // "plotter32.jpg",
  "plotter_2.png",
  "plotter_4.jpg",
  "plotter_5.jpg",
  "plotter_6.jpg",
  "plotter_7.jpg",
  "plotter_10.jpg",
  "plotter_8.jpg",
  "plotter421.jpg",
  "plotter.jpg",
  "plotter431.jpg",
  "original_6c20fd1a010bb5c6e5df5789483d28e8.gif",
];

// Scale factor: divide natural pixels by this to get display size.
// A 600px tall portrait becomes 120px, a 300px landscape becomes 60px.
const SCALE = 5;

interface ImageSize {
  src: string;
  w: number;
  h: number;
}

function nameFromSrc(src: string): string {
  // Strip _thumb.png or any extension
  const base = src.replace(/_thumb\.\w+$/, "").replace(/\.\w+$/, "");
  const parts = base.split("_");
  const author = parts[0].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const title = parts.slice(1).join(" ").split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return title ? `${author} — ${title}` : author;
}

function BookCover({
  img,
  index,
  visible,
  dimmed,
  onHover,
  onLeave,
  onClick,
  coverRef,
}: {
  img: ImageSize;
  index: number;
  visible: boolean;
  dimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick?: () => void;
  coverRef?: RefObject<HTMLDivElement | null>;
}) {
  const [hovered, setHovered] = useState(false);
  const isGif = img.src.endsWith(".gif");

  return (
    <div
      ref={coverRef}
      data-bounce-item
      onMouseEnter={() => {
        setHovered(true);
        onHover();
      }}
      onMouseLeave={() => {
        setHovered(false);
        onLeave();
      }}
      onClick={onClick}
      style={{
        position: "relative",
        opacity: visible ? (dimmed ? 0.65 : isGif ? 0.35 : 1) : 0,
        transition: "opacity 0.8s ease",
        outline: hovered ? "2px solid #999" : "none",
        outlineOffset: 2,
        borderRadius: 0,
        alignSelf: "flex-end",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/${img.src}`}
        alt=""
        style={{
          display: "block",
          width: img.w,
          height: img.h,
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: 4,
          left: 4,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 11,
          height: 11,
          fontSize: 6,
          borderRadius: "50%",
          border: hovered ? "1px solid #000" : "1px solid #ccc",
          color: hovered ? "#000" : "#bbb",
          backgroundColor: hovered ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)",
          transition: "color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease",
          lineHeight: 1,
          fontFamily: "inherit",
        }}
      >
        {index + 1}
      </span>
    </div>
  );
}

const BOUNCE_DELAY = 5000; // pause after all covers visible
const RAMP_DURATION = 4000; // 4 seconds to ramp from 0 to full speed

export default function BookCovers({
  onHover,
  onLeave,
  coverRefs,
  onAllVisible,
  onCoverHover,
  onCoverClick,
  connectedIndices,
  onBounceFrame,
  onBounceStart,
  visible = true,
  skipIntro = false,
  noBounce = false,
  captions,
}: {
  onHover: (text: string, title?: string) => void;
  onLeave: () => void;
  coverRefs?: Record<number, RefObject<HTMLDivElement | null>>;
  onAllVisible?: () => void;
  onCoverHover?: (index: number | null) => void;
  onCoverClick?: (index: number) => void;
  connectedIndices?: Set<number> | null;
  onBounceFrame?: () => void;
  onBounceStart?: () => void;
  visible?: boolean;
  skipIntro?: boolean;
  noBounce?: boolean;
  captions?: { plotter: string; sketchbook: string; press: string; painting: string; about: string };
}) {
  const [images, setImages] = useState<ImageSize[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const firedRef = useRef(false);
  const onAllVisibleRef = useRef(onAllVisible);
  onAllVisibleRef.current = onAllVisible;
  const onCoverHoverRef = useRef(onCoverHover);
  onCoverHoverRef.current = onCoverHover;
  const onBounceFrameRef = useRef(onBounceFrame);
  onBounceFrameRef.current = onBounceFrame;
  const onBounceStartRef = useRef(onBounceStart);
  onBounceStartRef.current = onBounceStart;
  const skipIntroRef = useRef(skipIntro);
  skipIntroRef.current = skipIntro;
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Preload to get natural dimensions
  useEffect(() => {
    let cancelled = false;
    const promises = bookCovers.map(
      (src) =>
        new Promise<ImageSize>((resolve) => {
          const img = new Image();
          img.onload = () => {
            let w = img.naturalWidth / SCALE;
            let h = img.naturalHeight / SCALE;

            // Cap max height at 130, scale width proportionally
            if (h > 130) {
              const ratio = 130 / h;
              w = w * ratio;
              h = 130;
            }

            // Enforce min width of 40 for very narrow images
            if (w < 40) {
              const ratio = 40 / w;
              w = 40;
              h = h * ratio;
            }

            resolve({
              src,
              w: Math.round(w),
              h: Math.round(h),
            });
          };
          img.onerror = () => {
            resolve({ src, w: 60, h: 90 });
          };
          img.src = `/${src}`;
        })
    );
    Promise.all(promises).then((results) => {
      if (!cancelled) setImages(results);
    });
    return () => { cancelled = true; };
  }, []);

  // Staggered reveal (or instant if skipIntro)
  useEffect(() => {
    if (skipIntroRef.current && images.length > 0 && visibleCount < images.length) {
      setVisibleCount(images.length);
      return;
    }
    if (visibleCount >= images.length) return;
    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, 750);
    return () => clearTimeout(timer);
  }, [visibleCount, images.length]);

  // Fire callback after last cover's fade transition completes
  useEffect(() => {
    if (visibleCount >= images.length && images.length > 0 && !firedRef.current) {
      firedRef.current = true;
      const delay = skipIntroRef.current ? 0 : 700;
      const t = setTimeout(() => onAllVisibleRef.current?.(), delay);
      return () => clearTimeout(t);
    }
  }, [visibleCount, images.length]);

  // DVD bounce animation — starts after all covers visible
  // Works entirely via DOM manipulation, no React state changes for layout
  useEffect(() => {
    if (visibleCount < images.length || images.length === 0 || !visible || noBounce) return;

    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    let cancelled = false;
    let rafId: number | null = null;
    let ro: ResizeObserver | null = null;

    const delayTimer = window.setTimeout(() => {
      if (cancelled) return;

      // Notify parent that bounce is starting (skipIntro note: delay is 0 so this fires immediately)
      onBounceStartRef.current?.();

      const itemEls = Array.from(container.querySelectorAll<HTMLDivElement>("[data-bounce-item]"));
      const n = itemEls.length;
      if (n === 0) return;

      // 1) Capture current positions from flex layout BEFORE changing anything
      const containerRect = container.getBoundingClientRect();
      const originalPositions = itemEls.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          cx: rect.left - containerRect.left + rect.width / 2,
          cy: rect.top - containerRect.top + rect.height / 2,
          w: rect.width,
          h: rect.height,
        };
      });

      // 2) Compute the bounce container height — fill to the bottom of the viewport
      const originalH = container.clientHeight;
      const containerTop = containerRect.top + window.scrollY;
      const viewportBottom = window.innerHeight + window.scrollY;
      const targetH = Math.max(viewportBottom - containerTop - 20, originalH);

      // 3) Position items FIRST (absolute + transform in one step to prevent any visible jump)
      const sizes = originalPositions.map((p) => ({ w: p.w, h: p.h }));
      itemEls.forEach((el, i) => {
        const p = originalPositions[i];
        el.style.position = "absolute";
        el.style.left = "0";
        el.style.top = "0";
        el.style.alignSelf = "";
        el.style.willChange = "transform";
        el.style.transform = `translate3d(${p.cx - p.w / 2}px, ${p.cy - p.h / 2}px, 0)`;
      });

      // Then switch container (safe — items are already absolutely positioned)
      // Transition height smoothly to avoid content jump
      container.style.display = "block";
      container.style.overflow = "hidden";
      container.style.transition = "height 1.2s ease";
      // Force layout with current height before transitioning
      container.style.height = originalH + "px";
      void container.offsetHeight; // force reflow
      container.style.height = targetH + "px";

      // Use the same physics as GalleryPage — constant speed, golden-angle directions
      const state = originalPositions.map((p, i) => {
        const speed = 3 + (i % 5) * 1.5; // varied speeds: 3, 4.5, 6, 7.5, 9
        const angle = (i * 2.39996) + 0.5; // golden angle offset
        return {
          x: p.cx,
          y: p.cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        };
      });

      const positionEl = (el: HTMLDivElement, x: number, y: number, iw: number, ih: number) => {
        el.style.transform = `translate3d(${x - iw / 2}px, ${y - ih / 2}px, 0)`;
      };

      for (let i = 0; i < n; i++) {
        positionEl(itemEls[i], state[i].x, state[i].y, sizes[i].w, sizes[i].h);
      }

      // 5) Show SVG overlay
      svg.style.position = "absolute";
      svg.style.top = "0";
      svg.style.left = "0";
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.pointerEvents = "none";
      svg.style.overflow = "visible";
      svg.style.display = "";

      const connGroup = svg.querySelector("#cover-connections") as SVGGElement | null;

      // Pre-allocate SVG path+dot pool (curved connections)
      const maxPairs = n * (n - 1) / 2;
      const NS = "http://www.w3.org/2000/svg";
      const pool: { path: SVGPathElement; dot1: SVGCircleElement; dot2: SVGCircleElement }[] = [];
      if (connGroup) {
        for (let p = 0; p < maxPairs; p++) {
          const path = document.createElementNS(NS, "path");
          path.setAttribute("stroke", "#e0e0e0");
          path.setAttribute("stroke-width", "1.5");
          path.setAttribute("fill", "none");
          path.style.opacity = "0";
          path.style.transition = "opacity 0.6s ease";
          const d1 = document.createElementNS(NS, "circle");
          d1.setAttribute("r", "3.5");
          d1.setAttribute("fill", "#ddd");
          d1.style.opacity = "0";
          d1.style.transition = "opacity 0.6s ease";
          const d2 = document.createElementNS(NS, "circle");
          d2.setAttribute("r", "3.5");
          d2.setAttribute("fill", "#ddd");
          d2.style.opacity = "0";
          d2.style.transition = "opacity 0.6s ease";
          connGroup.appendChild(path);
          connGroup.appendChild(d1);
          connGroup.appendChild(d2);
          pool.push({ path, dot1: d1, dot2: d2 });
        }
      }

      let w = container.clientWidth;
      let h = targetH;
      const pad = 6;
      const connectDist = 120;
      const disconnectDist = 180;

      const closestEdgeCenters = (
        ax: number, ay: number, aw: number, ah: number,
        bx: number, by: number, bw: number, bh: number,
      ) => {
        // Only left and right edges (no top/bottom)
        const edgesA = [
          { x: ax - aw / 2, y: ay },
          { x: ax + aw / 2, y: ay },
        ];
        const edgesB = [
          { x: bx - bw / 2, y: by },
          { x: bx + bw / 2, y: by },
        ];
        let bestDist = Infinity;
        let bestA = edgesA[0], bestB = edgesB[0];
        for (const ea of edgesA) {
          for (const eb of edgesB) {
            const dx = eb.x - ea.x, dy = eb.y - ea.y;
            const d = dx * dx + dy * dy;
            if (d < bestDist) { bestDist = d; bestA = ea; bestB = eb; }
          }
        }
        return { a: bestA, b: bestB, dist: Math.sqrt(bestDist) };
      };

      const partner: number[] = new Array(n).fill(-1);

      const updateConnections = () => {
        for (let i = 0; i < n; i++) {
          const j = partner[i];
          if (j < 0 || j <= i) continue;
          const a = state[i], b = state[j];
          const szA = sizes[i], szB = sizes[j];
          const { dist } = closestEdgeCenters(a.x, a.y, szA.w, szA.h, b.x, b.y, szB.w, szB.h);
          if (dist >= disconnectDist) {
            partner[i] = -1;
            partner[j] = -1;
          }
        }

        for (let i = 0; i < n; i++) {
          if (partner[i] >= 0) continue;
          let bestJ = -1, bestDist = connectDist;
          for (let j = 0; j < n; j++) {
            if (j === i || partner[j] >= 0) continue;
            const a = state[i], b = state[j];
            const szA = sizes[i], szB = sizes[j];
            const { dist } = closestEdgeCenters(a.x, a.y, szA.w, szA.h, b.x, b.y, szB.w, szB.h);
            if (dist < bestDist) { bestDist = dist; bestJ = j; }
          }
          if (bestJ >= 0) {
            partner[i] = bestJ;
            partner[bestJ] = i;
          }
        }

        let poolUsed = 0;
        for (let i = 0; i < n; i++) {
          const j = partner[i];
          if (j < 0 || j <= i) continue;
          const a = state[i], b = state[j];
          const szA = sizes[i], szB = sizes[j];
          const { a: ptA, b: ptB, dist } = closestEdgeCenters(a.x, a.y, szA.w, szA.h, b.x, b.y, szB.w, szB.h);
          if (poolUsed < pool.length) {
            const c = pool[poolUsed];
            const opacity = Math.max(0.15, 1 - dist / disconnectDist);
            // Cubic bezier — horizontal control points for fluid S-curve
            const cpOff = Math.abs(ptB.x - ptA.x) * 0.4;
            const aIsLeft = ptA.x < ptB.x;
            const d = `M${ptA.x},${ptA.y} C${ptA.x + (aIsLeft ? cpOff : -cpOff)},${ptA.y} ${ptB.x + (aIsLeft ? -cpOff : cpOff)},${ptB.y} ${ptB.x},${ptB.y}`;
            c.path.setAttribute("d", d);
            c.path.style.opacity = String(opacity);
            c.dot1.setAttribute("cx", String(ptA.x));
            c.dot1.setAttribute("cy", String(ptA.y));
            c.dot1.style.opacity = String(opacity);
            c.dot2.setAttribute("cx", String(ptB.x));
            c.dot2.setAttribute("cy", String(ptB.y));
            c.dot2.style.opacity = String(opacity);
            poolUsed++;
          }
        }
        for (let p = poolUsed; p < pool.length; p++) {
          pool[p].path.style.opacity = "0";
          pool[p].dot1.style.opacity = "0";
          pool[p].dot2.style.opacity = "0";
        }
      };

      const CONN_DELAY = 5000; // delay proximity lines by 5 seconds

      const startTime = performance.now();
      let lastTime = startTime;
      let bounceFrameCount = 0;
      const colGap = 4;

      const step = (now: number) => {
        if (cancelled) return;
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        bounceFrameCount++;
        const elapsed = now - startTime;

        // Gradual ramp: 0 → 1 over RAMP_DURATION (quadratic ease-in), skip if returning
        const ramp = skipIntroRef.current ? 1 : Math.min(1, elapsed / RAMP_DURATION);
        const ease = ramp * ramp;

        // Move each image, bounce off walls
        for (let i = 0; i < n; i++) {
          const s = state[i], sz = sizes[i];
          let nx = s.x + s.vx * ease * dt;
          let ny = s.y + s.vy * ease * dt;
          if (ny - sz.h / 2 < pad) { s.vy = Math.abs(s.vy); ny = pad + sz.h / 2; }
          if (ny + sz.h / 2 > h - pad) { s.vy = -Math.abs(s.vy); ny = h - pad - sz.h / 2; }
          if (nx - sz.w / 2 < pad) { s.vx = Math.abs(s.vx); nx = pad + sz.w / 2; }
          if (nx + sz.w / 2 > w - pad) { s.vx = -Math.abs(s.vx); nx = w - pad - sz.w / 2; }
          s.x = nx; s.y = ny;
        }

        // AABB collision with velocity swapping (elastic, like billiard balls)
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            const a = state[i], b = state[j];
            const szA = sizes[i], szB = sizes[j];
            const hwA = szA.w / 2 + colGap, hhA = szA.h / 2 + colGap;
            const hwB = szB.w / 2 + colGap, hhB = szB.h / 2 + colGap;
            const overlapX = (hwA + hwB) - Math.abs(b.x - a.x);
            const overlapY = (hhA + hhB) - Math.abs(b.y - a.y);
            if (overlapX > 0 && overlapY > 0) {
              if (overlapX < overlapY) {
                const sign = b.x > a.x ? 1 : -1;
                const push = overlapX / 2 + 0.5;
                a.x -= sign * push; b.x += sign * push;
                if ((a.vx - b.vx) * sign > 0) { const t = a.vx; a.vx = b.vx; b.vx = t; }
              } else {
                const sign = b.y > a.y ? 1 : -1;
                const push = overlapY / 2 + 0.5;
                a.y -= sign * push; b.y += sign * push;
                if ((a.vy - b.vy) * sign > 0) { const t = a.vy; a.vy = b.vy; b.vy = t; }
              }
            }
          }
        }

        for (let i = 0; i < n; i++) {
          positionEl(itemEls[i], state[i].x, state[i].y, sizes[i].w, sizes[i].h);
        }
        if (elapsed > CONN_DELAY) updateConnections();

        // Notify parent so it can reposition sidebar leader lines (throttled)
        if (bounceFrameCount % 3 === 0) {
          onBounceFrameRef.current?.();
        }

        rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);

      ro = new ResizeObserver(() => {
        if (cancelled) return;
        w = container.clientWidth;
        h = container.clientHeight;
        for (let i = 0; i < n; i++) {
          const s = state[i], sz = sizes[i];
          s.x = Math.max(pad + sz.w / 2, Math.min(w - pad - sz.w / 2, s.x));
          s.y = Math.max(pad + sz.h / 2, Math.min(h - pad - sz.h / 2, s.y));
        }
      });
      ro.observe(container);
    }, skipIntroRef.current ? 0 : BOUNCE_DELAY);

    return () => {
      cancelled = true;
      clearTimeout(delayTimer);
      if (rafId) cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      const connGroup = svg.querySelector("#cover-connections");
      if (connGroup) connGroup.innerHTML = "";

      // Restore container and items to original flex layout (must explicitly
      // set React's values back since DOM manipulation overwrote them)
      container.style.display = "flex";
      container.style.flexWrap = "wrap";
      container.style.alignItems = "flex-end";
      container.style.gap = "14px";
      container.style.height = "";
      container.style.overflow = "";
      container.style.transition = "none";
      // Force reflow then clear transition so layout snaps back instantly
      void container.offsetHeight;
      container.style.transition = "";
      const items = container.querySelectorAll<HTMLDivElement>("[data-bounce-item]");
      items.forEach((el) => {
        el.style.position = "relative";
        el.style.left = "";
        el.style.top = "";
        el.style.transform = "";
        el.style.willChange = "";
        el.style.alignSelf = "flex-end";
      });
      svg.style.display = "none";
    };
  }, [visibleCount, images.length, visible, noBounce]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        gap: 14,
        padding: "0 10px",
      }}
    >
      <svg
        ref={svgRef}
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <g id="cover-connections" />
      </svg>
      {images.map((img, i) => {
        const name = nameFromSrc(img.src);
        return (
          <BookCover
            key={img.src}
            img={img}
            index={i}
            visible={i < visibleCount}
            dimmed={
              (hoveredIdx !== null && hoveredIdx !== i) ||
              (connectedIndices != null && !connectedIndices.has(i))
            }
            onHover={() => {
              setHoveredIdx(i);
              onCoverHoverRef.current?.(i);
              const sketchbookIndices = [1, 2, 3, 4]; // plotter_4, _5, _6, _7
              const pressIndices = [5, 6, 7]; // plotter_10, _8, 421
              const paintingIndices = [8, 9]; // plotter, plotter431
              const caption = i === 0
                ? (captions?.plotter ?? "Pen Plotter Documentation | Click to View")
                : sketchbookIndices.includes(i)
                ? (captions?.sketchbook ?? "Pen Plotter Sketchbook (2026) | Click to View")
                : pressIndices.includes(i)
                ? (captions?.press ?? "Unthough Somewhere And Elsewhere Press Release | Click to View")
                : paintingIndices.includes(i)
                ? (captions?.painting ?? "Recent Paintings | Click to View")
                : i === 10
                ? (captions?.about ?? "Please feel free to reach out! My email is rsurmeie@risd.edu")
                : name;
              onHover(caption, caption);
            }}
            onLeave={() => {
              setHoveredIdx(null);
              onCoverHoverRef.current?.(null);
              onLeave();
            }}
            coverRef={coverRefs?.[i]}
            onClick={onCoverClick ? () => onCoverClick(i) : undefined}
          />
        );
      })}
    </div>
  );
}
