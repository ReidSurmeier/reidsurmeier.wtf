/*
      RSRSRSRSba   RSRSRSRSRS8  RS  RSRSRSRSba,
      RS      "8b  RS           RS  RS      `"8b
      RS      ,8P  RS           RS  RS        `8b
      RSaaaaaa8P'  RSaaaaa      RS  RS         RS
      RS""""RS'    RS"""""      RS  RS         RS
      RS    `8b    RS           RS  RS         8P
      RS     `8b   RS           RS  RS      .a8P
      RS      `8b  RSRSRSRSRS8  RS  RSRSRSRSY"'


       adRSRS8ba   RS        RS  RSRSRSRSba   RSb           dRS  RSRSRSRSRS8  RS  RSRSRSRSRS8  RSRSRSRSba
      d8"     "8b  RS        RS  RS      "8b  RS8b         dRS8  RS           RS  RS           RS      "8b
      Y8,          RS        RS  RS      ,8P  RS`8b       d8'RS  RS           RS  RS           RS      ,8P
      `Y8aaaaa,    RS        RS  RSaaaaaa8P'  RS `8b     d8' RS  RSaaaaa      RS  RSaaaaa      RSaaaaaa8P'
        `"""""8b,  RS        RS  RS""""RS'    RS  `8b   d8'  RS  RS"""""      RS  RS"""""      RS""""RS'
              `8b  RS        RS  RS    `8b    RS   `8b d8'   RS  RS           RS  RS           RS    `8b
      Y8a     a8P  Y8a.    .a8P  RS     `8b   RS    `RS8'    RS  RS           RS  RS           RS     `8b
       "YRSRS8P"    `"YRSRSY"'   RS      `8b  RS     `8'     RS  RSRSRSRSRS8  RS  RSRSRSRSRS8  RS      `8b


       I8,        8        ,8I  RSRSRSRSRSRS  RSRSRSRSRS8
       `8b       d8b       d8'       RS       RS
        "8,     ,8"8,     ,8"        RS       RS
         Y8     8P Y8     8P         RS       RSaaaaa
         `8b   d8' `8b   d8'         RS       RS"""""
          `8a a8'   `8a a8'          RS       RS
      RS8  `8a8'     `8a8'           RS       RS
      RS8   `8'       `8'            RS       RS

      (graphic design and programming by Reid Surmeier)
*/
"use client";

import { useState, useCallback, useEffect, useRef, forwardRef } from "react";
import { txtTiles, imgTiles } from "./data";
import type { TileData } from "./data";
import OverviewTile from "./components/OverviewTile";
import DetailView from "./components/DetailView";
import BookCovers from "./components/BookCovers";
import ContactForm from "./components/ContactForm";
import AboutPage from "./components/AboutPage";
import CVPage from "./components/CVPage";
import EmbedPage from "./components/EmbedPage";
import InstagramPage from "./components/InstagramPage";
import GalleryPage from "./components/GalleryPage";

// Grey-themed FPS/MS stats panel for sidebar — auto-scaling graphs
function SidebarStats() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const PR = Math.round(window.devicePixelRatio || 1);
    const DISPLAY_W = 110, DISPLAY_H = 48;
    const W = DISPLAY_W * PR, H = DISPLAY_H * PR;
    const TX = 4 * PR, TY = 2 * PR;
    const GX = 4 * PR, GY = 15 * PR, GW = (DISPLAY_W - 8) * PR, GH = 30 * PR;
    const colors = ["#EFEF3B", "#C5D5F0", "#C5A0D0"];

    const maxPoints = GW;
    function makePanel(label: string, fg: string) {
      const wrapper = document.createElement("div");
      wrapper.style.cssText = "border:1px solid #eee;width:110px;box-sizing:border-box";
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      canvas.style.cssText = `width:${DISPLAY_W}px;height:${DISPLAY_H}px;display:block`;
      wrapper.appendChild(canvas);
      const ctx = canvas.getContext("2d")!;
      ctx.font = `500 ${9 * PR}px TestPitchSans,sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillStyle = "#ccc"; ctx.fillText(label, TX, TY);
      let allMin = Infinity, allMax = 0;
      const history: number[] = [];
      return {
        wrapper, canvas, ctx, fg,
        update(value: number) {
          allMin = Math.min(allMin, value); allMax = Math.max(allMax, value);
          history.push(value);
          if (history.length > maxPoints) history.shift();

          // Auto-scale: compute min/max from visible history
          let hMin = Infinity, hMax = -Infinity;
          for (const v of history) {
            if (v < hMin) hMin = v;
            if (v > hMax) hMax = v;
          }
          const range = hMax - hMin || 1;
          const scaleMin = hMin - range * 0.15;
          const scaleMax = hMax + range * 0.15;
          const scaleRange = scaleMax - scaleMin;

          // Clear
          ctx.clearRect(0, 0, W, H);

          // Text
          ctx.fillStyle = "#ccc"; ctx.globalAlpha = 1;
          ctx.fillText(`${Math.round(value)} ${label} (${Math.round(allMin)}-${Math.round(allMax)})`, TX, TY);

          // Line graph
          if (history.length > 1) {
            const step = GW / (maxPoints - 1);
            ctx.beginPath();
            for (let i = 0; i < history.length; i++) {
              const x = GX + (maxPoints - history.length + i) * step;
              const y = GY + GH - ((history[i] - scaleMin) / scaleRange) * GH;
              if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = fg;
            ctx.lineWidth = 1.5 * PR;
            ctx.globalAlpha = 0.8;
            ctx.stroke();

            // Fill under the line
            ctx.lineTo(GX + GW, GY + GH);
            ctx.lineTo(GX + (maxPoints - history.length) * step, GY + GH);
            ctx.closePath();
            ctx.fillStyle = fg;
            ctx.globalAlpha = 0.12;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        },
      };
    }

    const raf = makePanel("RAF", "#D5F0C5");
    const ms = makePanel("MS", colors[1]);
    const kb = makePanel("KB", colors[2]);

    el.appendChild(raf.wrapper);
    el.appendChild(ms.wrapper);
    el.appendChild(kb.wrapper);

    let beginTime = performance.now(), prevTime = beginTime, frames = 0;
    let lastTotalKB = 0;
    let rafId: number;

    const loop = () => {
      const now = performance.now();
      frames++;

      ms.update(now - beginTime);
      beginTime = now;

      if (now >= prevTime + 1000) {
        // RAF — animation callbacks per second
        raf.update((frames * 1000) / (now - prevTime));

        // KB/s — transfer rate since last tick (cross-browser)
        const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
        let totalKB = 0;
        for (const e of entries) {
          totalKB += (e.transferSize || 0);
        }
        totalKB /= 1024;
        const deltaKB = totalKB - lastTotalKB;
        lastTotalKB = totalKB;
        kb.update(deltaKB);

        prevTime = now; frames = 0;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      el.innerHTML = "";
    };
  }, []);

  return <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 8 }} />;
}

// Typewriter component: smooth gradient reveal
function TypewriterText({ children, delay = 0, speed = 30, onDone }: { children: string; delay?: number; speed?: number; onDone?: () => void }) {
  const [charCount, setCharCount] = useState(0);
  const [started, setStarted] = useState(false);
  const text = children;
  const doneRef = useRef(false);
  const FADE_WINDOW = 6; // chars over which the gradient fades
  const totalSteps = Array.from(text).length + FADE_WINDOW; // keep going past end so trailing chars fully fade in

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (charCount >= totalSteps) {
      if (!doneRef.current && onDone) { doneRef.current = true; onDone(); }
      return;
    }
    const timer = setTimeout(() => setCharCount((c) => c + 1), speed);
    return () => clearTimeout(timer);
  }, [started, charCount, totalSteps, speed, onDone]);

  // Group chars into words so words never break mid-character
  const segments = text.split(/(\s+)/);
  const hasCJK = /[\u3000-\u9fff\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff]/.test(text);
  let globalIdx = 0;
  return (
    <span>
      {segments.map((seg, si) => {
        const isSpace = /^\s+$/.test(seg);
        const chars = Array.from(seg).map((char) => {
          const i = globalIdx++;
          let opacity = 0;
          if (i < charCount - FADE_WINDOW) {
            opacity = 1;
          } else if (i < charCount) {
            opacity = (charCount - i) / FADE_WINDOW;
          }
          return (
            <span
              key={i}
              className="achar"
              style={{
                display: isSpace ? undefined : "inline-block",
                opacity,
                transition: "opacity 0.3s ease",
              }}
            >
              {char}
            </span>
          );
        });
        if (isSpace) return <span key={`s${si}`}>{chars}</span>;
        return <span key={`s${si}`} style={hasCJK ? undefined : { whiteSpace: "nowrap" }}>{chars}</span>;
      })}
    </span>
  );
}

// Animated text: characters jiggle and scale on hover
function AnimatedText({ children }: { children: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {}, [children]);

  const handleCharEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = e.currentTarget;
    const y = (Math.random() * 5 - 2).toFixed(1);
    el.style.transform = `translateY(${y}px)`;
    el.style.fontSize = "1.2em";
    el.style.transition = "transform 0.6s cubic-bezier(.6,0,.1,1), font-size 0.6s cubic-bezier(.6,0,.1,1)";
    setTimeout(() => {
      el.style.fontSize = "";
      el.style.transform = "translateY(0)";
    }, 300);
  };

  // Group chars into words so words never break mid-character
  const segments = children.split(/(\s+)/);
  const hasCJK = /[\u3000-\u9fff\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff]/.test(children);
  let globalIdx = 0;
  return (
    <span ref={containerRef}>
      {segments.map((seg, si) => {
        const isSpace = /^\s+$/.test(seg);
        const chars = Array.from(seg).map((char) => {
          const i = globalIdx++;
          return (
            <span
              key={i}
              className="achar"
              onMouseEnter={isSpace ? undefined : handleCharEnter}
              style={{
                display: isSpace ? undefined : "inline-block",
                transition: "transform 0.6s cubic-bezier(.6,0,.1,1), font-size 0.6s cubic-bezier(.6,0,.1,1)",
              }}
            >
              {char}
            </span>
          );
        });
        if (isSpace) return <span key={`s${si}`}>{chars}</span>;
        return <span key={`s${si}`} style={hasCJK ? undefined : { whiteSpace: "nowrap" }}>{chars}</span>;
      })}
    </span>
  );
}

export const translations = {
  en: {
    quote: "What looks good today may not look good tomorrow",
    collection: "Collection of Recent Work 2025\u20132026",
    prints: "Prints",
    drawings: "Drawings",
    painting: "Painting",
    sculpture_nav: "Sculpture",
    writing: "Writing",
    archive: "Archive",
    lectures: "Keynotes / Workshops",
    cv: "Curriculum Vitae",
    homepage: "Homepage",
    aboutContact: "About/Contact",
    social: "Instagram",
    contact: "Contact",
    downloadCv: "Download CV & Selected Press (PDF)",
    positioning: "Biography_26",
    featuredWork: "Featured Work",
    essays: "Essays (TXT)",
    press: "Press (IMG)",
    bioStrong: "Reid Surmeier, I.S.P.",
    bio1a: ", is the independent studio practice of",
    bio1b: ", an American multidisciplinary designer and artist working across",
    bio2: ". His work explores the evolving relationship between humans and computers, focusing on how both are",
    bio3: " increasingly intertwined in the processes of",
    bio4: " reality.",
    computation: "computation",
    painting_hl: "painting",
    sculpture: "sculpture",
    creating: "creating",
    perceiving: "perceiving",
    interpreting: "interpreting",
    capPlotter: "Pen Plotter Documentation | Click to View",
    capSketchbook: "Pen Plotter Sketchbook (2026) | Click to View",
    capPress: "Unthough Somewhere And Elsewhere Press Release | Click to View",
    capPainting: "Recent Paintings | Click to View",
    capAbout: "Please feel free to reach out! My email is rsurmeie@risd.edu",
  },
  de: {
    quote: "Was heute gut aussieht, muss morgen nicht gut aussehen",
    collection: "Sammlung aktueller Arbeiten 2025\u20132026",
    prints: "Drucke",
    drawings: "Zeichnungen",
    painting: "Malerei",
    sculpture_nav: "Skulptur",
    writing: "Schreiben",
    archive: "Archiv",
    lectures: "Keynotes / Workshops",
    cv: "Lebenslauf",
    homepage: "Startseite",
    aboutContact: "\u00dcber/Kontakt",
    social: "Instagram",
    contact: "Kontakt",
    downloadCv: "Lebenslauf & Ausgewählte Presse (PDF)",
    positioning: "Biography_26",
    featuredWork: "Ausgewählte Arbeiten",
    essays: "Essays (TXT)",
    press: "Presse (IMG)",
    bioStrong: "Reid Surmeier, I.S.P.",
    bio1a: ", ist die unabhängige Studiopraxis von ",
    bio1b: ", einem amerikanischen multidisziplinären Designer und Künstler, der in den Bereichen ",
    bio2: " arbeitet. Seine Arbeit untersucht die sich entwickelnde Beziehung zwischen Menschen und Computern und konzentriert sich darauf, wie beide ",
    bio3: "zunehmend in den Prozessen des ",
    bio4: " der Realität verflochten sind.",
    computation: "Computation",
    painting_hl: "Malerei",
    sculpture: "Skulptur",
    creating: "Schaffens",
    perceiving: "Wahrnehmens",
    interpreting: "Interpretierens",
    capPlotter: "Stiftplotter-Dokumentation | Klicken zum Ansehen",
    capSketchbook: "Stiftplotter-Skizzenbuch (2026) | Klicken zum Ansehen",
    capPress: "Unthough Somewhere And Elsewhere Pressemitteilung | Klicken zum Ansehen",
    capPainting: "Aktuelle Gem\u00E4lde | Klicken zum Ansehen",
    capAbout: "Kontaktieren Sie mich gerne! Meine E-Mail ist rsurmeie@risd.edu",
  },
  fr: {
    quote: "Ce qui est beau aujourd\u2019hui ne le sera peut-\u00eatre pas demain",
    collection: "Collection de travaux r\u00e9cents 2025\u20132026",
    prints: "Estampes",
    drawings: "Dessins",
    painting: "Peinture",
    sculpture_nav: "Sculpture",
    writing: "\u00c9criture",
    archive: "Archives",
    lectures: "Keynotes / Workshops",
    cv: "Curriculum Vitae",
    homepage: "Accueil",
    aboutContact: "\u00c0 propos/Contact",
    social: "Instagram",
    contact: "Contact",
    downloadCv: "T\u00e9l\u00e9charger CV & Presse s\u00e9lectionn\u00e9e (PDF)",
    positioning: "Biography_26",
    featuredWork: "Travaux en vedette",
    essays: "Essais (TXT)",
    press: "Presse (IMG)",
    bioStrong: "Reid Surmeier, I.S.P.",
    bio1a: ", est la pratique ind\u00e9pendante de ",
    bio1b: ", un designer et artiste multidisciplinaire am\u00e9ricain travaillant dans les domaines de la ",
    bio2: ". Son travail explore la relation \u00e9volutive entre les humains et les ordinateurs, en se concentrant sur la fa\u00e7on dont les deux sont ",
    bio3: "de plus en plus imbriqu\u00e9s dans les processus de ",
    bio4: " de la r\u00e9alit\u00e9.",
    computation: "computation",
    painting_hl: "peinture",
    sculpture: "sculpture",
    creating: "cr\u00e9ation",
    perceiving: "perception",
    interpreting: "interpr\u00e9tation",
    capPlotter: "Documentation du traceur \u00e0 stylo | Cliquer pour voir",
    capSketchbook: "Carnet de croquis du traceur (2026) | Cliquer pour voir",
    capPress: "Communiqu\u00e9 de presse Unthough Somewhere And Elsewhere | Cliquer pour voir",
    capPainting: "Peintures r\u00e9centes | Cliquer pour voir",
    capAbout: "N\u2019h\u00e9sitez pas \u00e0 me contacter ! Mon email est rsurmeie@risd.edu",
  },
  ko: {
    quote: "\uC624\uB298 \uC88B\uC544 \uBCF4\uC774\uB294 \uAC83\uC774 \uB0B4\uC77C\uC740 \uC88B\uC544 \uBCF4\uC774\uC9C0 \uC54A\uC744 \uC218 \uC788\uB2E4",
    collection: "\uCD5C\uADFC \uC791\uD488 \uBAA8\uC74C 2025\u20132026",
    prints: "\uD310\uD654",
    drawings: "\uB4DC\uB85C\uC789",
    painting: "\uD68C\uD654",
    sculpture_nav: "\uC870\uAC01",
    writing: "\uAE00\uC4F0\uAE30",
    archive: "\uC544\uCE74\uC774\uBE0C",
    lectures: "Keynotes / Workshops",
    cv: "\uC774\uB825\uC11C",
    homepage: "\uD648\uD398\uC774\uC9C0",
    aboutContact: "\uC18C\uAC1C/\uC5F0\uB77D\uCC98",
    social: "Instagram",
    contact: "\uC5F0\uB77D\uCC98",
    downloadCv: "\uC774\uB825\uC11C & \uC120\uBCC4 \uBCF4\uB3C4\uC790\uB8CC \uB2E4\uC6B4\uB85C\uB4DC (PDF)",
    positioning: "Biography_26",
    featuredWork: "\uC8FC\uC694 \uC791\uD488",
    essays: "\uC5D0\uC138\uC774 (TXT)",
    press: "\uBCF4\uB3C4 (IMG)",
    bioStrong: "Reid Surmeier, I.S.P.",
    bio1a: "\uB294 \uBBF8\uAD6D\uC758 \uB2E4\uD559\uC81C\uC801 \uB514\uC790\uC774\uB108 \uBC0F \uC608\uC220\uAC00 ",
    bio1b: "\uC758 \uB3C5\uB9BD \uC2A4\uD29C\uB514\uC624 \uD504\uB809\uD2F0\uC2A4\uC785\uB2C8\uB2E4. ",
    bio2: " \uBD84\uC57C\uC5D0\uC11C \uD65C\uB3D9\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uADF8\uC758 \uC791\uD488\uC740 \uC778\uAC04\uACFC \uCEF4\uD4E8\uD130 \uC0AC\uC774\uC758 \uBC1C\uC804\uD558\uB294 \uAD00\uACC4\uB97C \uD0D0\uAD6C\uD558\uBA70, \uB458 \uB2E4 ",
    bio3: "\uC810\uC810 \uB354 \uAE4A\uC774 \uC5BD\uD600\uAC00\uB294 ",
    bio4: " \uD604\uC2E4\uC758 \uACFC\uC815\uC5D0 \uCD08\uC810\uC744 \uB9DE\uCD94\uACE0 \uC788\uC2B5\uB2C8\uB2E4.",
    computation: "\uCEF4\uD4E8\uD14C\uC774\uC158",
    painting_hl: "\uD68C\uD654",
    sculpture: "\uC870\uAC01",
    creating: "\uCC3D\uC791",
    perceiving: "\uC778\uC2DD",
    interpreting: "\uD574\uC11D",
    capPlotter: "\uD39C \uD50C\uB85C\uD130 \uBB38\uC11C | \uD074\uB9AD\uD558\uC5EC \uBCF4\uAE30",
    capSketchbook: "\uD39C \uD50C\uB85C\uD130 \uC2A4\uCF00\uCE58\uBD81 (2026) | \uD074\uB9AD\uD558\uC5EC \uBCF4\uAE30",
    capPress: "Unthough Somewhere And Elsewhere \uBCF4\uB3C4 \uC790\uB8CC | \uD074\uB9AD\uD558\uC5EC \uBCF4\uAE30",
    capPainting: "\uCD5C\uADFC \uD68C\uD654 | \uD074\uB9AD\uD558\uC5EC \uBCF4\uAE30",
    capAbout: "\uC5F0\uB77D \uC8FC\uC138\uC694! \uC774\uBA54\uC77C: rsurmeie@risd.edu",
  },
  id: {
    quote: "Yang terlihat bagus hari ini mungkin tidak terlihat bagus besok",
    collection: "Koleksi Karya Terbaru 2025\u20132026",
    prints: "Cetakan",
    drawings: "Gambar",
    painting: "Lukisan",
    sculpture_nav: "Patung",
    writing: "Tulisan",
    archive: "Arsip",
    lectures: "Keynotes / Workshops",
    cv: "Daftar Riwayat Hidup",
    homepage: "Beranda",
    aboutContact: "Tentang/Kontak",
    social: "Instagram",
    contact: "Kontak",
    downloadCv: "Unduh CV & Pers Terpilih (PDF)",
    positioning: "Biography_26",
    featuredWork: "Karya Unggulan",
    essays: "Esai (TXT)",
    press: "Pers (IMG)",
    bioStrong: "Reid Surmeier, I.S.P.",
    bio1a: ", adalah praktik studio independen dari ",
    bio1b: ", seorang desainer dan seniman multidisiplin Amerika yang berkarya di bidang ",
    bio2: ". Karyanya mengeksplorasi hubungan yang terus berkembang antara manusia dan komputer, berfokus pada bagaimana keduanya ",
    bio3: "semakin terkait dalam proses ",
    bio4: " realitas.",
    computation: "komputasi",
    painting_hl: "lukisan",
    sculpture: "patung",
    creating: "penciptaan",
    perceiving: "persepsi",
    interpreting: "interpretasi",
    capPlotter: "Dokumentasi Pen Plotter | Klik untuk Melihat",
    capSketchbook: "Buku Sketsa Pen Plotter (2026) | Klik untuk Melihat",
    capPress: "Siaran Pers Unthough Somewhere And Elsewhere | Klik untuk Melihat",
    capPainting: "Lukisan Terbaru | Klik untuk Melihat",
    capAbout: "Jangan ragu untuk menghubungi! Email saya rsurmeie@risd.edu",
  },
  zh: {
    quote: "\u4ECA\u5929\u770B\u8D77\u6765\u597D\u7684\uFF0C\u660E\u5929\u4E0D\u4E00\u5B9A\u597D\u770B",
    collection: "\u8FD1\u4F5C\u5408\u96C6 2025\u20132026",
    prints: "\u7248\u753B",
    drawings: "\u7D20\u63CF",
    painting: "\u7ED8\u753B",
    sculpture_nav: "\u96D5\u5851",
    writing: "\u5199\u4F5C",
    archive: "\u6863\u6848",
    lectures: "Keynotes / Workshops",
    cv: "\u7B80\u5386",
    homepage: "\u9996\u9875",
    aboutContact: "\u5173\u4E8E/\u8054\u7CFB",
    social: "Instagram",
    contact: "\u8054\u7CFB",
    downloadCv: "\u4E0B\u8F7D\u7B80\u5386\u4E0E\u7CBE\u9009\u62A5\u9053 (PDF)",
    positioning: "Biography_26",
    featuredWork: "\u7CBE\u9009\u4F5C\u54C1",
    essays: "\u6587\u7AE0 (TXT)",
    press: "\u62A5\u9053 (IMG)",
    bioStrong: "Reid Surmeier, I.S.P.",
    bio1a: "\uFF0C\u662F\u7F8E\u56FD\u591A\u5B66\u79D1\u8BBE\u8BA1\u5E08\u548C\u827A\u672F\u5BB6 ",
    bio1b: " \u7684\u72EC\u7ACB\u5DE5\u4F5C\u5BA4\u5B9E\u8DF5\u3002\u4ED6\u7684\u5DE5\u4F5C\u6DB5\u76D6 ",
    bio2: " \u7B49\u9886\u57DF\u3002\u4ED6\u7684\u4F5C\u54C1\u63A2\u7D22\u4EBA\u7C7B\u4E0E\u8BA1\u7B97\u673A\u4E4B\u95F4\u4E0D\u65AD\u53D1\u5C55\u7684\u5173\u7CFB\uFF0C\u5173\u6CE8\u4E24\u8005\u5982\u4F55",
    bio3: "\u5728\u4EE5\u4E0B\u8FC7\u7A0B\u4E2D\u65E5\u76CA\u4EA4\u7EC7\uFF1A",
    bio4: "\u73B0\u5B9E\u3002",
    computation: "\u8BA1\u7B97",
    painting_hl: "\u7ED8\u753B",
    sculpture: "\u96D5\u5851",
    creating: "\u521B\u9020",
    perceiving: "\u611F\u77E5",
    interpreting: "\u8BE0\u91CA",
    capPlotter: "\u7B14\u7ED8\u4EEA\u6587\u6863 | \u70B9\u51FB\u67E5\u770B",
    capSketchbook: "\u7B14\u7ED8\u4EEA\u5199\u751F\u7C3F (2026) | \u70B9\u51FB\u67E5\u770B",
    capPress: "Unthough Somewhere And Elsewhere \u65B0\u95FB\u7A3F | \u70B9\u51FB\u67E5\u770B",
    capPainting: "\u8FD1\u671F\u7ED8\u753B | \u70B9\u51FB\u67E5\u770B",
    capAbout: "\u6B22\u8FCE\u8054\u7CFB\u6211\uFF01\u90AE\u7BB1: rsurmeie@risd.edu",
  },
  ja: {
    quote: "\u4ECA\u65E5\u826F\u304F\u898B\u3048\u308B\u3082\u306E\u304C\u3001\u660E\u65E5\u306F\u826F\u304F\u898B\u3048\u306A\u3044\u304B\u3082\u3057\u308C\u306A\u3044",
    collection: "\u8FD1\u4F5C\u30B3\u30EC\u30AF\u30B7\u30E7\u30F3 2025\u20132026",
    prints: "\u7248\u753B",
    drawings: "\u30C9\u30ED\u30FC\u30A4\u30F3\u30B0",
    painting: "\u7D75\u753B",
    sculpture_nav: "\u5F6B\u523B",
    writing: "\u57F7\u7B46",
    archive: "\u30A2\u30FC\u30AB\u30A4\u30D6",
    lectures: "Keynotes / Workshops",
    cv: "\u5C65\u6B74\u66F8",
    homepage: "\u30DB\u30FC\u30E0\u30DA\u30FC\u30B8",
    aboutContact: "\u6982\u8981/\u304A\u554F\u3044\u5408\u308F\u305B",
    social: "Instagram",
    contact: "\u304A\u554F\u3044\u5408\u308F\u305B",
    downloadCv: "\u5C65\u6B74\u66F8\u30FB\u4E3B\u8981\u30D7\u30EC\u30B9\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9 (PDF)",
    positioning: "Biography_26",
    featuredWork: "\u6CE8\u76EE\u306E\u4F5C\u54C1",
    essays: "\u30A8\u30C3\u30BB\u30A4 (TXT)",
    press: "\u30D7\u30EC\u30B9 (IMG)",
    bioStrong: "Reid Surmeier, I.S.P.",
    bio1a: "\u306F\u3001\u30A2\u30E1\u30EA\u30AB\u306E\u5B66\u969B\u7684\u30C7\u30B6\u30A4\u30CA\u30FC\u30FB\u30A2\u30FC\u30C6\u30A3\u30B9\u30C8 ",
    bio1b: " \u306E\u72EC\u7ACB\u30B9\u30BF\u30B8\u30AA\u30D7\u30E9\u30AF\u30C6\u30A3\u30B9\u3067\u3059\u3002\u5F7C\u306E\u6D3B\u52D5\u306F ",
    bio2: "\u5F7C\u306E\u4F5C\u54C1\u306F\u3001\u4EBA\u9593\u3068\u30B3\u30F3\u30D4\u30E5\u30FC\u30BF\u306E\u9032\u5316\u3059\u308B\u95A2\u4FC2\u3092\u63A2\u6C42\u3057\u3001\u4E21\u8005\u304C\u3044\u304B\u306B",
    bio3: "\u4EE5\u4E0B\u306E\u30D7\u30ED\u30BB\u30B9\u3067\u307E\u3059\u307E\u3059\u7D61\u307F\u5408\u3063\u3066\u3044\u308B\u304B\u306B\u7126\u70B9\u3092\u5F53\u3066\u3066\u3044\u307E\u3059\uFF1A",
    bio4: "\u73FE\u5B9F\u3002",
    computation: "\u30B3\u30F3\u30D4\u30E5\u30C6\u30FC\u30B7\u30E7\u30F3",
    painting_hl: "\u7D75\u753B",
    sculpture: "\u5F6B\u523B",
    creating: "\u5275\u9020",
    perceiving: "\u77E5\u899A",
    interpreting: "\u89E3\u91C8",
    capPlotter: "\u30DA\u30F3\u30D7\u30ED\u30C3\u30BF\u30FC\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8 | \u30AF\u30EA\u30C3\u30AF\u3057\u3066\u898B\u308B",
    capSketchbook: "\u30DA\u30F3\u30D7\u30ED\u30C3\u30BF\u30FC\u30B9\u30B1\u30C3\u30C1\u30D6\u30C3\u30AF (2026) | \u30AF\u30EA\u30C3\u30AF\u3057\u3066\u898B\u308B",
    capPress: "Unthough Somewhere And Elsewhere \u30D7\u30EC\u30B9\u30EA\u30EA\u30FC\u30B9 | \u30AF\u30EA\u30C3\u30AF\u3057\u3066\u898B\u308B",
    capPainting: "\u6700\u8FD1\u306E\u7D75\u753B | \u30AF\u30EA\u30C3\u30AF\u3057\u3066\u898B\u308B",
    capAbout: "\u304A\u6C17\u8EFD\u306B\u3054\u9023\u7D61\u304F\u3060\u3055\u3044\uFF01\u30E1\u30FC\u30EB: rsurmeie@risd.edu",
  },
} as const;

// Shows typewriter on first load, then switches to hover-animated text
function BioText({ children, delay = 0, typed, onDone }: { children: string; delay?: number; typed: boolean; onDone?: () => void }) {
  if (typed) {
    return <AnimatedText>{children}</AnimatedText>;
  }
  return <TypewriterText delay={delay} speed={45} onDone={onDone}>{children}</TypewriterText>;
}

function AnimatedDivider({ delay = 0 }: { delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      borderTop: "1px solid #eee",
      margin: "14px 0",
      width: visible ? 110 : 0,
      transition: "width 0.5s ease",
    }} />
  );
}

const highlightColors = [
  "#EFEF3B", "#C5D5F0", "#C5A0D0", "#F0C5D5",
  "#D5F0C5", "#F0D5C5", "#C5F0E8", "#E8C5F0",
];

function Highlight({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  const [bg, setBg] = useState(color);
  const randomize = () => {
    const other = highlightColors.filter((c) => c !== bg);
    setBg(other[Math.floor(Math.random() * other.length)]);
  };
  return (
    <span
      onMouseEnter={randomize}
      onMouseLeave={() => setBg(color)}
      style={{
        background: bg,
        padding: "1px 2px",
        color: "#666",
        transition: "background 0.3s ease",
      }}
    >
      {children}
    </span>
  );
}

type IconDef = { char: string; shape?: "circle" | "square" | "triangle" };

function SidebarIcon({ char, shape = "circle", hovered }: IconDef & { hovered: boolean }) {
  const border = hovered ? "1px solid #000" : "1px solid #ddd";
  const color = hovered ? "#000" : "#ddd";
  const base = {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    fontSize: 8,
    color,
    transition: "color 0.15s ease, border-color 0.15s ease",
    flexShrink: 0,
  };
  if (shape === "triangle") {
    return (
      <span style={{ ...base, width: 14, height: 14, position: "relative" as const }}>
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ position: "absolute", top: 0, left: 0 }}>
          <polygon points="7,1 13,13 1,13" fill="none" stroke={color} strokeWidth="1" style={{ transition: "stroke 0.15s ease" }} />
        </svg>
        <span style={{ position: "relative", top: 1, fontSize: 7 }}>{char}</span>
      </span>
    );
  }
  return (
    <span style={{
      ...base,
      border,
      borderRadius: shape === "square" ? 2 : "50%",
      width: 14,
      height: 14,
    }}>{char}</span>
  );
}

const SidebarLink = forwardRef<HTMLDivElement, { icons: IconDef[]; trailingIcons?: IconDef[]; label: string; href?: string; typeDelay?: number; typeSpeed?: number; skipType?: boolean; highlighted?: boolean; dimmed?: boolean; mobileNav?: boolean; marquee?: boolean; hideLabel?: boolean; onMouseEnter?: () => void; onMouseLeave?: () => void }>(
  function SidebarLink({ icons, trailingIcons, label, href, typeDelay, typeSpeed, skipType, highlighted, dimmed, mobileNav, marquee, hideLabel, onMouseEnter, onMouseLeave }, ref) {
    const [hovered, setHovered] = useState(false);
    const [typed, setTyped] = useState(!!skipType);
    const [activated, setActivated] = useState(false);

    // When hideLabel flips from true to false, activate the typewriter
    useEffect(() => {
      if (!hideLabel && !activated) {
        setActivated(true);
      }
    }, [hideLabel, activated]);

    const isExternal = href && !href.startsWith("/");
    const Wrapper = href ? "a" : "div";
    const linkProps = href ? { href, ...(isExternal ? { target: "_blank" as const, rel: "noopener noreferrer" } : {}) } : {};
    const active = hovered || highlighted;
    return (
      <Wrapper
        {...linkProps}
        ref={ref as React.Ref<HTMLDivElement & HTMLAnchorElement>}
        onMouseEnter={() => { setHovered(true); onMouseEnter?.(); }}
        onMouseLeave={() => { setHovered(false); onMouseLeave?.(); }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: mobileNav ? 8 : 3,
          color: active ? "#000" : mobileNav ? "#999" : "#ddd",
          opacity: dimmed ? 0.65 : 1,
          transform: hovered ? "translateX(4px)" : "translateX(0)",
          transition: "color 0.8s ease, opacity 0.8s ease, transform 0.15s ease",
          width: "100%",
          lineHeight: mobileNav ? "28px" : "16px",
          fontSize: mobileNav ? 14 : undefined,
        }}
      >
        {icons.map((ic, i) => (
          <SidebarIcon key={i} char={ic.char} shape={ic.shape} hovered={active || false} />
        ))}
        {activated && (
          <span style={{ marginLeft: 2 }}>
            {typed ? <AnimatedText>{label}</AnimatedText> : <TypewriterText delay={typeDelay || 0} speed={typeSpeed ?? 35} onDone={() => setTimeout(() => setTyped(true), 400)}>{label}</TypewriterText>}
          </span>
        )}
        {activated && trailingIcons?.map((ic, i) => (
          <SidebarIcon key={`t${i}`} char={ic.char} shape={ic.shape} hovered={active || false} />
        ))}
      </Wrapper>
    );
  }
);

function SectionLabel({ label, visible }: { label: string; visible: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        marginLeft: 6,
        fontSize: 13,
        fontWeight: 400,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.05s steps(1)",
        color: hovered ? "#000" : "#bbb",
      }}
    >
      <AnimatedText>{label}</AnimatedText>
    </div>
  );
}

function LangButton({ label, active, onClick, typeDelay }: { label: string; active: boolean; onClick: () => void; typeDelay?: number }) {
  const [hovered, setHovered] = useState(false);
  const [typed, setTyped] = useState(typeDelay === undefined);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "transparent",
        border: 0,
        padding: 0,
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        color: hovered || active ? "#000" : "#bbb",
        transition: "color 0.15s ease",
      }}
    >
      {typed ? <AnimatedText>{label}</AnimatedText> : <TypewriterText delay={typeDelay!} speed={30} onDone={() => setTyped(true)}>{label}</TypewriterText>}
    </button>
  );
}

// Typewriter: reveals text word-by-word with choppy timing
function useTypewriter(text: string, msPerWord = 60) {
  const [wordCount, setWordCount] = useState(0);
  const words = text.split(" ");
  useEffect(() => {
    setWordCount(0);
  }, [text]);
  useEffect(() => {
    if (wordCount >= words.length) return;
    const timer = setTimeout(() => setWordCount((c) => c + 1), msPerWord);
    return () => clearTimeout(timer);
  }, [wordCount, words.length, msPerWord]);
  return { revealed: words.slice(0, wordCount).join(" "), done: wordCount >= words.length };
}

export default function Home() {
  const [lang, setLang] = useState<"en" | "de" | "fr" | "ko" | "id" | "zh" | "ja">("en");

  // Auto-detect browser language on mount — checks navigator.languages (full
  // preference list, supported by Safari 11+, Chrome, Firefox) then falls back
  // to navigator.language.  First matching supported language wins.
  useEffect(() => {
    const supported: Record<string, typeof lang> = {
      ko: "ko", de: "de", fr: "fr", id: "id", zh: "zh", ja: "ja", en: "en",
    };
    const candidates = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
    for (const tag of candidates) {
      const prefix = tag?.toLowerCase().split("-")[0];
      if (prefix && prefix in supported) {
        setLang(supported[prefix]);
        break;
      }
    }
  }, []);


  const t = translations[lang];
  const [caption, setCaption] = useState("");
  const [captionTitle, setCaptionTitle] = useState("");
  // Staggered reveal for TXT tiles
  const [txtVisible, setTxtVisible] = useState(0);
  // Staggered reveal for IMG tiles
  const [imgVisible, setImgVisible] = useState(0);
  // Bio reveal
  const [bioRevealed, setBioRevealed] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const aboutAudioRef = useRef<HTMLAudioElement>(null);
  const [aboutAudioPlaying, setAboutAudioPlaying] = useState(false);
  const [showCV, setShowCV] = useState(false);
  const [showInstagram, setShowInstagram] = useState(false);
  const [showGallery, setShowGallery] = useState<string | null>(null);
  const [coversReady, setCoversReady] = useState(false);
  const hasPlayedIntroRef = useRef(false);
  const [activeCoverIdx, setActiveCoverIdx] = useState<number | null>(null);
  // Which sidebar category is hovered: "prints" | "painting" | "press" | "writing" | null
  const [hoveredSidebarCategory, setHoveredSidebarCategory] = useState<string | null>(null);
  // Whether any essay tile is hovered (dims covers same as "writing")
  const [essayTileHovered, setEssayTileHovered] = useState(false);
  // Map cover index → sidebar category
  const highlightedCategory = activeCoverIdx !== null
    ? activeCoverIdx <= 7 ? "prints" : activeCoverIdx <= 9 ? "painting" : "about"
    : null;
  // Effective hovered category (sidebar hover or essay tile hover)
  const effectiveHoverCategory = hoveredSidebarCategory ?? (essayTileHovered ? "writing" : null);
  // Which cover indices should stay full opacity when a sidebar item is hovered
  // "writing" / essay hover → empty set (all covers dim)
  const connectedCoverIndices: Set<number> | null = effectiveHoverCategory === "prints"
    ? new Set([0, 1, 2, 3, 4])
    : effectiveHoverCategory === "press"
    ? new Set([6, 7, 8])
    : effectiveHoverCategory === "painting"
    ? new Set([8, 9])
    : effectiveHoverCategory === "about"
    ? new Set([10])
    : effectiveHoverCategory === "writing"
    ? new Set()
    : null;
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [embedTitle, setEmbedTitle] = useState("");
  const [embedInput, setEmbedInput] = useState("");
  const [embedScale, setEmbedScale] = useState(1);
  const [embedML, setEmbedML] = useState(0);
  const [embedMR, setEmbedMR] = useState(0);
  const isHomePage = !showContact && !showAbout && !showCV && !showInstagram && !showGallery && !embedUrl;
  const [homeFadeIn, setHomeFadeIn] = useState(false);
  const prevIsHomeRef = useRef(isHomePage);
  useEffect(() => {
    if (isHomePage && !prevIsHomeRef.current) {
      setHomeFadeIn(true);
      const t = setTimeout(() => setHomeFadeIn(false), 50);
      return () => clearTimeout(t);
    }
    prevIsHomeRef.current = isHomePage;
  }, [isHomePage]);

  // Single audio element for about page — autoplay when opened, stop when closed
  useEffect(() => {
    const audio = aboutAudioRef.current;
    if (!audio) return;
    if (showAbout) {
      audio.volume = 1;
      audio.play().catch(() => { /* autoplay blocked */ });
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [showAbout]);

  // Header reveals
  const [headerRevealed, setHeaderRevealed] = useState(false);
  const [featuredRevealed, setFeaturedRevealed] = useState(false);
  const [txtLabelRevealed, setTxtLabelRevealed] = useState(false);
  const [imgLabelRevealed, setImgLabelRevealed] = useState(false);
  const [sidebarRevealed, setSidebarRevealed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarOpenRef = useRef(false);
  useEffect(() => { sidebarOpenRef.current = sidebarOpen; }, [sidebarOpen]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [showQuoteMarquee, setShowQuoteMarquee] = useState(false);
  const [marqueeSidebarIdx, setMarqueeSidebarIdx] = useState<number | null>(null);
  const [navHistory, setNavHistory] = useState<string[]>(["home"]);
  const [navIndex, setNavIndex] = useState(0);

  // Gallery page keys
  const galleryPages = ["prints", "drawings", "painting", "sculpture", "archive", "lectures", "webui"] as const;

  // Apply a page state by name
  const applyPage = useCallback((page: string) => {
    setShowContact(page === "contact");
    setShowAbout(page === "about");
    setShowCV(page === "cv");
    setShowInstagram(page === "instagram");
    setShowGallery((galleryPages as readonly string[]).includes(page) ? page : null);
    if (page === "are.na") {
      setEmbedUrl("https://www.are.na/reid-surmeier/channels?theme=light");
      setEmbedTitle("Are.na");
      setEmbedInput("Input_006");
      setEmbedScale(1);
      setEmbedML(0);
      setEmbedMR(0);
    } else if (page === "garden") {
      setEmbedUrl("https://www.reidsurmeier.garden/");
      setEmbedTitle("Garden");
      setEmbedInput("Input_007");
      setEmbedScale(1);
      setEmbedML(0);
      setEmbedMR(0);
    } else if (page === "writing_page") {
      setEmbedUrl("https://substack.com/@reidsurmeier/posts");
      setEmbedTitle("Writing");
      setEmbedInput("Input_013");
      setEmbedScale(1);
      setEmbedML(0);
      setEmbedMR(0);
    } else {
      setEmbedUrl(null);
    }
  }, []);

  // Navigate to a page (push to history)
  const navigateTo = useCallback((page: string) => {
    // Properly dispose LeaderLine instances and waypoints before navigating
    drawTimersRef.current.forEach((t) => clearTimeout(t));
    drawTimersRef.current = [];
    leaderLinesRef.current.forEach((line) => { try { line.remove(); } catch { /* already removed */ } });
    leaderLinesRef.current = [];
    waypointEls.current.forEach((el) => { try { el.remove(); } catch { /* already removed */ } });
    waypointEls.current = [];
    isBouncingRef.current = false;
    document.querySelectorAll("body > svg").forEach((el) => el.remove());
    setHoveredSidebarCategory(null);
    setBioFade(false);
    setCaption("");
    setNavHistory(prev => [...prev.slice(0, navIndex + 1), page]);
    setNavIndex(prev => prev + 1);
    applyPage(page);
  }, [navIndex, applyPage]);

  // Scatter all visible content then navigate (Locomotive-style transition)
  const scatterAndNavigate = useCallback((page: string) => {
    // Clear leader lines immediately
    drawTimersRef.current.forEach((t) => clearTimeout(t));
    drawTimersRef.current = [];
    leaderLinesRef.current.forEach((line) => { try { line.remove(); } catch { /* already removed */ } });
    leaderLinesRef.current = [];
    waypointEls.current.forEach((el) => { try { el.remove(); } catch { /* already removed */ } });
    waypointEls.current = [];
    document.querySelectorAll("body > svg").forEach((el) => el.remove());
    setHoveredSidebarCategory(null);
    setBioFade(false);
    setCaption("");

    // Find all visible content containers inside the desktop area
    const parent = desktopContentRef.current;
    if (!parent) { navigateTo(page); return; }

    // Gather elements from all visible page containers (homepage + sub-pages)
    const allElements: HTMLElement[] = [];
    parent.querySelectorAll<HTMLElement>(":scope > div").forEach((container) => {
      const style = window.getComputedStyle(container);
      if (style.display === "none" || style.visibility === "hidden") return;
      container.querySelectorAll<HTMLElement>(":scope > div, :scope > form, :scope > iframe").forEach((el) => {
        allElements.push(el);
      });
    });

    if (allElements.length === 0) { navigateTo(page); return; }

    allElements.forEach((el) => {
      const randX = -(Math.random() * 600 + 300);
      const randY = (Math.random() - 0.5) * 600;
      const randRot = -(Math.random() * 15 + 5);
      el.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 1, 1), opacity 0.4s ease";
      el.style.transform = `translate(${randX}px, ${randY}px) rotate(${randRot}deg)`;
      el.style.opacity = "0";
    });

    setTimeout(() => {
      allElements.forEach((el) => {
        el.style.transition = "";
        el.style.transform = "";
        el.style.opacity = "";
      });
      navigateTo(page);
    }, 500);
  }, [navigateTo]);

  // Go back
  const navBack = useCallback(() => {
    if (navIndex <= 0) return;
    const newIdx = navIndex - 1;
    setNavIndex(newIdx);
    applyPage(navHistory[newIdx]);
  }, [navIndex, navHistory, applyPage]);

  // Go forward
  const navForward = useCallback(() => {
    if (navIndex >= navHistory.length - 1) return;
    const newIdx = navIndex + 1;
    setNavIndex(newIdx);
    applyPage(navHistory[newIdx]);
  }, [navIndex, navHistory, applyPage]);

  // Leader line refs & cleanup stores
  const printsRef = useRef<HTMLDivElement>(null);
  const paintingRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const sculptureRef = useRef<HTMLDivElement>(null);
  const webUiRef = useRef<HTMLDivElement>(null);
  const gardenRef = useRef<HTMLDivElement>(null);
  const bioPaintingRef = useRef<HTMLSpanElement>(null);
  const bioSculptureRef = useRef<HTMLSpanElement>(null);
  const bioComputationRef = useRef<HTMLSpanElement>(null);
  const bioCreatingRef = useRef<HTMLSpanElement>(null);
  const bioPerceivingRef = useRef<HTMLSpanElement>(null);
  const bioInterpretingRef = useRef<HTMLSpanElement>(null);
  const bioContainerRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const desktopContentRef = useRef<HTMLDivElement>(null);
  const featuredWorkRef = useRef<HTMLDivElement>(null);
  const [sidebarNavTop, setSidebarNavTop] = useState(280);
  const [bioFade, setBioFade] = useState(false);
  const writingRef = useRef<HTMLDivElement>(null);
  const lecturesRef = useRef<HTMLDivElement>(null);
  const cover0Ref = useRef<HTMLDivElement>(null);   // plotter_2 (index 0)
  const cover1Ref = useRef<HTMLDivElement>(null);   // plotter_4 (index 1)
  const cover2Ref = useRef<HTMLDivElement>(null);   // plotter_5 (index 2)
  const cover3Ref = useRef<HTMLDivElement>(null);   // plotter_6 (index 3)
  const cover4Ref = useRef<HTMLDivElement>(null);   // plotter_7 (index 4)
  const cover5Ref = useRef<HTMLDivElement>(null);   // plotter_10 (index 5)
  const cover6Ref = useRef<HTMLDivElement>(null);    // plotter_8 (index 6)
  const cover7Ref = useRef<HTMLDivElement>(null);    // plotter421 (index 7)
  const cover8Ref = useRef<HTMLDivElement>(null);    // plotter.jpg (index 8)
  const cover9Ref = useRef<HTMLDivElement>(null);    // plotter431 (index 9)
  const cover10Ref = useRef<HTMLDivElement>(null);   // star gif (index 10)
  const pressRef = useRef<HTMLDivElement>(null);
  const fotografierenRef = useRef<HTMLDivElement>(null);
  const txtRef0 = useRef<HTMLDivElement>(null);
  const txtRef1 = useRef<HTMLDivElement>(null);
  const txtRef2 = useRef<HTMLDivElement>(null);
  const txtRef3 = useRef<HTMLDivElement>(null);
  const txtRef4 = useRef<HTMLDivElement>(null);
  const txtRef5 = useRef<HTMLDivElement>(null);
  const leaderLinesRef = useRef<Array<{ remove: () => void; position?: () => void }>>([]);
  const waypointEls = useRef<HTMLElement[]>([]);
  const drawTimersRef = useRef<number[]>([]);
  const activeRedrawRef = useRef<((instant?: boolean) => void) | null>(null);
  const isBouncingRef = useRef(false);

  // Suppress LeaderLine's internal console.error("A disconnected element was
  // passed.") during position updates and line creation.  LeaderLine doesn't
  // throw — it calls console.error directly — so try/catch can't catch it.
  const suppressDisconnectedError = useCallback(<T,>(fn: () => T): T | undefined => {
    const orig = console.error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error = (...args: any[]) => {
      if (typeof args[0] === "string" && args[0].includes("disconnected")) return;
      orig.apply(console, args);
    };
    try { return fn(); } catch { /* */ } finally { console.error = orig; }
  }, []);

  // Create an invisible fixed-position waypoint div
  const createWaypoint = useCallback((x: number, y: number): HTMLElement => {
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:1px;height:1px;pointer-events:none;`;
    document.body.appendChild(el);
    waypointEls.current.push(el);
    return el;
  }, []);

  // Animate draw-in on an SVG: stroke-dashoffset full→0
  const animateDrawIn = useCallback((svgEl: SVGSVGElement, delay: number, duration: number) => {
    const paths = svgEl.querySelectorAll("path, line, polyline");
    svgEl.style.opacity = "0";
    const timerId = window.setTimeout(() => {
      svgEl.style.transition = "opacity 0.3s ease";
      svgEl.style.opacity = "1";
      paths.forEach((p) => {
        const pathEl = p as SVGGeometryElement;
        if (typeof pathEl.getTotalLength !== "function") return;
        const len = pathEl.getTotalLength();
        pathEl.style.strokeDasharray = `${len}`;
        pathEl.style.strokeDashoffset = `${len}`;
        pathEl.getBoundingClientRect();
        pathEl.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        pathEl.style.strokeDashoffset = "0";
      });
    }, delay);
    drawTimersRef.current.push(timerId);
  }, []);

  // Shared: draw curved fluid leader lines from a source sidebar item to targets
  const drawLines = useCallback(
    (sourceRef: React.RefObject<HTMLDivElement | null>, targets: Array<{ ref: React.RefObject<HTMLDivElement | null>; color: string; endSocket?: string }>, instant = false) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const W = window as any;
      if (!sourceRef.current || !W.LeaderLine || !document.body.contains(sourceRef.current)) return;
      const LL = W.LeaderLine;

      const sourceRect = sourceRef.current.getBoundingClientRect();
      const sourceMidY = sourceRect.top + sourceRect.height / 2;
      // Anchor the line start at the sidebar border, not on the text
      const sidebarBorderX = sourceRect.left - 10;
      const startWp = createWaypoint(sidebarBorderX, sourceMidY);
      const svgsBefore = new Set(document.querySelectorAll("body > svg"));

      suppressDisconnectedError(() => {
        for (const { ref, color, endSocket } of targets) {
          if (!ref.current || !document.body.contains(ref.current)) continue;
          try {
            const targetRect = ref.current.getBoundingClientRect();
            const targetMidY = targetRect.top + targetRect.height / 2;

            const line = new LL(startWp, ref.current, {
              path: "fluid",
              color,
              size: 2,
              endSocket: endSocket || (sourceMidY < targetMidY ? "top" : "bottom"),
              startPlug: "disc",
              endPlug: "disc",
              startPlugSize: 2,
              endPlugSize: 2,
            });
            leaderLinesRef.current.push(line);
          } catch { /* element disconnected during construction */ }
        }
      });

      // Raise & animate new SVGs
      const newSvgs: SVGSVGElement[] = [];
      document.querySelectorAll("body > svg").forEach((svg) => {
        if (!svgsBefore.has(svg)) newSvgs.push(svg as SVGSVGElement);
      });
      newSvgs.forEach((svg, i) => {
        const el = svg as unknown as HTMLElement;
        el.style.zIndex = "10000";
        el.style.pointerEvents = "none";
        if (instant) {
          el.style.opacity = "1";
        } else {
          animateDrawIn(svg, i * 200, 600);
        }
      });
    },
    [animateDrawIn, createWaypoint]
  );

  const clearLines = useCallback(() => {
    drawTimersRef.current.forEach((t) => clearTimeout(t));
    drawTimersRef.current = [];
    leaderLinesRef.current.forEach((line) => { try { line.remove(); } catch { /* already removed */ } });
    leaderLinesRef.current = [];
    waypointEls.current.forEach((el) => { try { el.remove(); } catch { /* already removed */ } });
    waypointEls.current = [];
  }, []);

  // All targets for the Prints hover (plotter_2, _4, _5, _6, _7)
  const allTargets: Array<{ ref: React.RefObject<HTMLDivElement | null>; color: string; endSocket?: string }> = [
    { ref: cover0Ref, color: "#D5F0C5" },
    { ref: cover1Ref, color: "#F0D5C5" },
    { ref: cover2Ref, color: "#EFEF3B" },
    { ref: cover3Ref, color: "#C5D5F0" },
    { ref: cover4Ref, color: "#C5A0D0" },
  ];

  const handlePrintsEnter = useCallback(() => {
    if (!typingDone || !isHomePage) return;
    leaderLinesRef.current = [];
    drawLines(printsRef, allTargets);
    setHoveredSidebarCategory("prints");
    setBioFade(true);
    setCaption(t.prints + " (2025\u20132026)");
    activeRedrawRef.current = (instant) => { leaderLinesRef.current = []; drawLines(printsRef, allTargets, instant); };
  }, [drawLines, allTargets, t.prints, typingDone, isHomePage]);

  const handlePrintsLeave = useCallback(() => {
    clearLines();
    setHoveredSidebarCategory(null);
    setBioFade(false);
    setCaption("");
    activeRedrawRef.current = null;
  }, [clearLines]);

  // Painting → plotter, plotter431
  const paintingTargets: Array<{ ref: React.RefObject<HTMLDivElement | null>; color: string; endSocket?: string }> = [
    { ref: cover8Ref, color: "#EFEF3B" },
    { ref: cover9Ref, color: "#C5D5F0" },
  ];

  const handlePaintingEnter = useCallback(() => {
    if (!typingDone || !isHomePage) return;
    leaderLinesRef.current = [];
    drawLines(paintingRef, paintingTargets);
    setHoveredSidebarCategory("painting");
    setBioFade(true);
    setCaption(t.painting + " (2025\u20132026)");
    activeRedrawRef.current = (instant) => { leaderLinesRef.current = []; drawLines(paintingRef, paintingTargets, instant); };
  }, [drawLines, paintingTargets, t.painting, typingDone, isHomePage]);

  const handlePaintingLeave = useCallback(() => {
    clearLines();
    setHoveredSidebarCategory(null);
    setBioFade(false);
    setCaption("");
    activeRedrawRef.current = null;
  }, [clearLines]);

  // About/Contact → star gif
  const aboutTargets: Array<{ ref: React.RefObject<HTMLDivElement | null>; color: string; endSocket?: string }> = [
    { ref: cover10Ref, color: "#F0C5D5" },
  ];

  const handleAboutEnter = useCallback(() => {
    if (!typingDone || !isHomePage) return;
    leaderLinesRef.current = [];
    drawLines(aboutRef, aboutTargets);
    setHoveredSidebarCategory("about");
    setBioFade(true);
    setCaption(t.aboutContact);
    activeRedrawRef.current = (instant) => { leaderLinesRef.current = []; drawLines(aboutRef, aboutTargets, instant); };
  }, [drawLines, aboutTargets, t.aboutContact, typingDone, isHomePage]);

  const handleAboutLeave = useCallback(() => {
    clearLines();
    setHoveredSidebarCategory(null);
    setBioFade(false);
    setCaption("");
    activeRedrawRef.current = null;
  }, [clearLines]);

  // Helper: draw a routed line from bio text to a sidebar item, going below the bio area to avoid text collision
  const drawBioToSidebar = useCallback((
    bioRef: React.RefObject<HTMLElement | null>,
    sidebarItemRef: React.RefObject<HTMLDivElement | null>,
    color: string
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const W = window as any;
    if (!bioRef.current || !sidebarItemRef.current || !W.LeaderLine) return;
    if (!document.body.contains(bioRef.current) || !document.body.contains(sidebarItemRef.current)) return;
    const LL = W.LeaderLine;

    suppressDisconnectedError(() => {
      const bioRect = bioRef.current!.getBoundingClientRect();
      const sidebarRect = sidebarItemRef.current!.getBoundingClientRect();

      const containerBottom = bioContainerRef.current
        ? bioContainerRef.current.getBoundingClientRect().bottom + 15
        : bioRect.bottom + 30;

      const bioCenterX = bioRect.left + bioRect.width / 2;
      const corridorY = containerBottom;
      const corridorX = sidebarRect.left - 40;
      const sidebarBorderX = sidebarRect.left - 10;
      const sidebarMidY = sidebarRect.top + sidebarRect.height / 2;

      const wp0 = createWaypoint(bioCenterX, corridorY);
      const wp1 = createWaypoint(corridorX, corridorY);
      const wp2 = createWaypoint(corridorX, sidebarMidY);
      const borderEndWp = createWaypoint(sidebarBorderX, sidebarMidY);

      const seg1 = new LL(bioRef.current, wp0, {
        path: "straight", color, size: 2,
        startPlug: "disc", endPlug: "behind", startPlugSize: 2, startSocket: "bottom",
      });
      const seg2 = new LL(wp0, wp1, {
        path: "straight", color, size: 2,
        startPlug: "behind", endPlug: "behind",
      });
      const seg3 = new LL(wp1, wp2, {
        path: "straight", color, size: 2,
        startPlug: "behind", endPlug: "behind",
      });
      const seg4 = new LL(wp2, borderEndWp, {
        path: "straight", color, size: 2,
        startPlug: "behind", endPlug: "disc", endPlugSize: 2,
      });

      leaderLinesRef.current.push(seg1, seg2, seg3, seg4);
    });
    const svgs = document.querySelectorAll("body > svg");
    svgs.forEach((svg) => {
      const s = svg as HTMLElement;
      s.style.pointerEvents = "none";
      s.style.zIndex = "10000";
    });
  }, [createWaypoint, suppressDisconnectedError]);

  // Bio painting highlight → Painting sidebar + painting covers
  const handleBioPaintingEnter = useCallback(() => {
    if (!typingDone || !isHomePage) return;
    clearLines();
    setBioFade(true);
    drawLines(paintingRef, paintingTargets);
    drawBioToSidebar(bioPaintingRef, paintingRef, "#C5D5F0");
  }, [clearLines, drawLines, paintingTargets, drawBioToSidebar, typingDone, isHomePage]);

  const handleBioPaintingLeave = useCallback(() => {
    setBioFade(false);
    clearLines();
  }, [clearLines]);

  // Bio sculpture highlight → Sculpture sidebar
  const handleBioSculptureEnter = useCallback(() => {
    if (!typingDone || !isHomePage) return;
    clearLines();
    setBioFade(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const W = window as any;
    if (!bioSculptureRef.current || !sculptureRef.current || !W.LeaderLine) return;
    if (!document.body.contains(bioSculptureRef.current) || !document.body.contains(sculptureRef.current)) return;
    const LL = W.LeaderLine;

    suppressDisconnectedError(() => {
    const bioRect = bioSculptureRef.current!.getBoundingClientRect();
    const sidebarRect = sculptureRef.current!.getBoundingClientRect();

    const containerBottom = bioContainerRef.current
      ? bioContainerRef.current.getBoundingClientRect().bottom + 15
      : bioRect.bottom + 30;

    const bioCenterX = bioRect.left + bioRect.width / 2;
    const corridorY = containerBottom;
    const corridorX = sidebarRect.left - 40;
    const sidebarBorderX = sidebarRect.left - 10;
    const sidebarMidY = sidebarRect.top + sidebarRect.height / 2;

    const wp0 = createWaypoint(bioCenterX, corridorY);
    const wp1 = createWaypoint(corridorX, corridorY);
    const wp2 = createWaypoint(corridorX, sidebarMidY);
    const borderEndWp = createWaypoint(sidebarBorderX, sidebarMidY);

    const color = "#C5A0D0";
    const seg1 = new LL(bioSculptureRef.current, wp0, {
      path: "straight", color, size: 2,
      startPlug: "disc", endPlug: "behind", startPlugSize: 2, startSocket: "bottom",
    });
    const seg2 = new LL(wp0, wp1, {
      path: "straight", color, size: 2,
      startPlug: "behind", endPlug: "behind",
    });
    const seg3 = new LL(wp1, wp2, {
      path: "straight", color, size: 2,
      startPlug: "behind", endPlug: "behind",
    });
    const seg4 = new LL(wp2, borderEndWp, {
      path: "straight", color, size: 2,
      startPlug: "behind", endPlug: "disc", endPlugSize: 2,
    });

    leaderLinesRef.current.push(seg1, seg2, seg3, seg4);
    });

    // Raise leader line SVGs above the fade overlay
    document.querySelectorAll("body > svg").forEach((svg) => {
      const s = svg as HTMLElement;
      s.style.pointerEvents = "none";
      s.style.zIndex = "10000";
    });
  }, [clearLines, createWaypoint, suppressDisconnectedError, typingDone, isHomePage]);

  const handleBioSculptureLeave = useCallback(() => {
    setBioFade(false);
    clearLines();
  }, [clearLines]);

  // Bio creating/perceiving/interpreting → Writing + Lectures sidebar
  const handleBioComputationEnter = useCallback(() => {
    if (!typingDone || !isHomePage) return;
    clearLines();
    setBioFade(true);
    if (webUiRef.current) drawBioToSidebar(bioComputationRef, webUiRef, "#EFEF3B");
  }, [clearLines, drawBioToSidebar, typingDone, isHomePage]);

  const handleBioComputationLeave = useCallback(() => {
    setBioFade(false);
    clearLines();
  }, [clearLines]);

  const handleBioProcessEnter = useCallback((bioRef: React.RefObject<HTMLElement | null>) => {
    if (!typingDone || !isHomePage) return;
    clearLines();
    setBioFade(true);
    if (writingRef.current) drawBioToSidebar(bioRef, writingRef, "#C5D5F0");
    if (lecturesRef.current) drawBioToSidebar(bioRef, lecturesRef, "#F0C5D5");
  }, [clearLines, drawBioToSidebar, typingDone, isHomePage]);

  const handleBioProcessLeave = useCallback(() => {
    setBioFade(false);
    clearLines();
  }, [clearLines]);

  // Web + UI/UX → Garden sidebar link (routed outside sidebar)
  const handleWebUiEnter = useCallback(() => {
    if (!typingDone || !isHomePage) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const W = window as any;
    if (!webUiRef.current || !gardenRef.current || !W.LeaderLine) return;
    if (!document.body.contains(webUiRef.current) || !document.body.contains(gardenRef.current)) return;
    const LL = W.LeaderLine;
    leaderLinesRef.current = [];
    suppressDisconnectedError(() => {
    const webRect = webUiRef.current!.getBoundingClientRect();
    const gardenRect = gardenRef.current!.getBoundingClientRect();
    const borderX = webRect.left - 10;
    const outsideX = borderX - 20;
    const color = "#C5F0E8";
    const wp1 = createWaypoint(borderX, webRect.top + webRect.height / 2);
    const wp2 = createWaypoint(outsideX, webRect.top + webRect.height / 2);
    const wp3 = createWaypoint(outsideX, gardenRect.top + gardenRect.height / 2);
    const wp4 = createWaypoint(borderX, gardenRect.top + gardenRect.height / 2);
    const seg1 = new LL(wp1, wp2, { path: "straight", color, size: 2, startPlug: "disc", endPlug: "behind", startPlugSize: 2 });
    const seg2 = new LL(wp2, wp3, { path: "straight", color, size: 2, startPlug: "behind", endPlug: "behind" });
    const seg3 = new LL(wp3, wp4, { path: "straight", color, size: 2, startPlug: "behind", endPlug: "disc", endPlugSize: 2 });
    leaderLinesRef.current.push(seg1, seg2, seg3);
    });
    const svgs = document.querySelectorAll("body > svg");
    svgs.forEach((svg) => {
      (svg as HTMLElement).style.pointerEvents = "none";
      (svg as HTMLElement).style.zIndex = "10000";
    });
  }, [createWaypoint, suppressDisconnectedError, typingDone, isHomePage]);

  const handleWebUiLeave = useCallback(() => {
    clearLines();
  }, [clearLines]);

  // Fotografieren → plotter_10, plotter_8, plotter421
  const pressTargets: Array<{ ref: React.RefObject<HTMLDivElement | null>; color: string; endSocket?: string }> = [
    { ref: cover6Ref, color: "#EFEF3B" },
    { ref: cover7Ref, color: "#C5D5F0" },
    { ref: cover8Ref, color: "#C5A0D0" },
  ];

  const handlePressEnter = useCallback(() => {
    if (!typingDone || !isHomePage) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const W = window as any;
    if (!fotografierenRef.current || !W.LeaderLine) return;
    if (!document.body.contains(fotografierenRef.current)) return;
    const LL = W.LeaderLine;

    leaderLinesRef.current = [];
    const svgsBefore = new Set(document.querySelectorAll("body > svg"));

    suppressDisconnectedError(() => {
    const fotoRect = fotografierenRef.current!.getBoundingClientRect();
    const startX = fotoRect.left + fotoRect.width / 2;
    const startY = fotoRect.top - 8;
    const startWp = createWaypoint(startX, startY);

    for (let i = 0; i < pressTargets.length; i++) {
      const { ref, color } = pressTargets[i];
      if (!ref.current || !document.body.contains(ref.current)) continue;
      const targetRect = ref.current.getBoundingClientRect();
      const targetX = targetRect.left + targetRect.width / 2;

      const corridorY = startY - 12 - i * 10;
      const wp1 = createWaypoint(startX, corridorY);
      const wp2 = createWaypoint(targetX, corridorY);

      const seg1 = new LL(startWp, wp1, {
        path: "straight", color, size: 2,
        startPlug: "disc", endPlug: "behind",
        startPlugSize: 2,
      });
      const seg2 = new LL(wp1, wp2, {
        path: "straight", color, size: 2,
        startPlug: "behind", endPlug: "behind",
      });
      const seg3 = new LL(wp2, ref.current, {
        path: "straight", color, size: 2,
        startPlug: "behind", endPlug: "disc",
        endPlugSize: 2, endSocket: "bottom",
      });
      leaderLinesRef.current.push(seg1, seg2, seg3);
    }
    });

    const newSvgs: SVGSVGElement[] = [];
    document.querySelectorAll("body > svg").forEach((svg) => {
      if (!svgsBefore.has(svg)) newSvgs.push(svg as SVGSVGElement);
    });
    newSvgs.forEach((svg, i) => {
      const el = svg as unknown as HTMLElement;
      el.style.zIndex = "10000";
      el.style.pointerEvents = "none";
      animateDrawIn(svg, i * 200, 600);
    });
    setHoveredSidebarCategory("press");
    activeRedrawRef.current = null; // press uses custom layout, skip scroll-redraw
  }, [pressTargets, animateDrawIn, createWaypoint, suppressDisconnectedError, typingDone, isHomePage]);

  const handlePressLeave = useCallback(() => {
    clearLines();
    setHoveredSidebarCategory(null);
    activeRedrawRef.current = null;
  }, [clearLines]);

  // Writing → all TXT tiles
  const writingTargets: Array<{ ref: React.RefObject<HTMLDivElement | null>; color: string; endSocket?: string }> = [
    { ref: txtRef0, color: "#EFEF3B", endSocket: "top" },
    { ref: txtRef1, color: "#C5D5F0", endSocket: "top" },
    { ref: txtRef2, color: "#C5A0D0", endSocket: "top" },
    { ref: txtRef3, color: "#F0C5D5", endSocket: "top" },
    { ref: txtRef4, color: "#D5F0C5", endSocket: "top" },
    { ref: txtRef5, color: "#F0D5C5", endSocket: "top" },
  ];

  const handleWritingEnter = useCallback(() => {
    if (!typingDone || !isHomePage) return;
    leaderLinesRef.current = [];
    drawLines(writingRef, writingTargets);
    setHoveredSidebarCategory("writing");
    activeRedrawRef.current = (instant) => { leaderLinesRef.current = []; drawLines(writingRef, writingTargets, instant); };
  }, [drawLines, writingTargets, typingDone, isHomePage]);

  const handleWritingLeave = useCallback(() => {
    clearLines();
    setHoveredSidebarCategory(null);
    activeRedrawRef.current = null;
  }, [clearLines]);

  // When hovering a connected cover, draw just that one line back to Prints.
  // Refs populate after BookCovers loads images, so poll until ready.
  // TXT tiles ↔ Writing sidebar (reverse hover)
  useEffect(() => {
    let handlers: Array<{ el: HTMLDivElement; enter: () => void; leave: () => void }> = [];
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const attach = () => {
      const writingEntries: Array<{ el: HTMLDivElement | null; color: string; ref: React.RefObject<HTMLDivElement | null> }> = [
        { el: txtRef0.current, color: "#EFEF3B", ref: txtRef0 },
        { el: txtRef1.current, color: "#C5D5F0", ref: txtRef1 },
        { el: txtRef2.current, color: "#C5A0D0", ref: txtRef2 },
        { el: txtRef3.current, color: "#F0C5D5", ref: txtRef3 },
        { el: txtRef4.current, color: "#D5F0C5", ref: txtRef4 },
        { el: txtRef5.current, color: "#F0D5C5", ref: txtRef5 },
      ];

      if (!writingEntries.every((e) => e.el)) return false;

      for (const { el, color, ref } of writingEntries) {
        if (!el) continue;
        const enter = () => {
          if (!sidebarOpenRef.current) return;
          leaderLinesRef.current = [];
          drawLines(writingRef, [{ ref, color, endSocket: "top" }]);
        };
        const leave = () => clearLines();
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        handlers.push({ el, enter, leave });
      }

      return true;
    };

    if (!attach()) {
      pollTimer = setInterval(() => {
        if (attach() && pollTimer) clearInterval(pollTimer);
      }, 300);
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      for (const { el, enter, leave } of handlers) {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      }
      handlers = [];
    };
  }, [drawLines, clearLines, animateDrawIn]);

  // Cover hover → draw leader line from cover to its sidebar item
  const handleCoverHoverLine = useCallback((idx: number | null) => {
    setActiveCoverIdx(idx);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const W = window as any;

    // Clean up any existing cover/star lines
    if (W._coverLine) { try { W._coverLine.remove(); } catch {} W._coverLine = undefined; }
    if (W._coverWp) { try { W._coverWp.remove(); } catch {} W._coverWp = undefined; }
    if (W._starLine) { try { W._starLine.remove(); } catch {} W._starLine = undefined; }
    if (W._starWp) { try { W._starWp.remove(); } catch {} W._starWp = undefined; }

    if (idx === null || !typingDone || !isHomePage || !W.LeaderLine) return;

    // Determine sidebar ref and color for this cover
    let sidebarRef: React.RefObject<HTMLDivElement | null> | null = null;
    let color = "#ccc";
    if (idx <= 4) { sidebarRef = printsRef; color = "#D5F0C5"; }
    else if (idx <= 7) { sidebarRef = printsRef; color = "#F0D5C5"; } // press items connected to prints sidebar
    else if (idx <= 9) { sidebarRef = paintingRef; color = "#EFEF3B"; }
    else if (idx === 10) { sidebarRef = aboutRef; color = "#F0C5D5"; }

    if (!sidebarRef?.current || !document.body.contains(sidebarRef.current)) return;

    // Get the cover ref
    const coverRefs = [cover0Ref, cover1Ref, cover2Ref, cover3Ref, cover4Ref, cover5Ref, cover6Ref, cover7Ref, cover8Ref, cover9Ref, cover10Ref];
    const coverRef = coverRefs[idx];
    if (!coverRef?.current || !document.body.contains(coverRef.current)) return;

    suppressDisconnectedError(() => {
      const rect = sidebarRef!.current!.getBoundingClientRect();
      const wp = document.createElement("div");
      wp.style.cssText = `position:fixed;left:${rect.left - 10}px;top:${rect.top + rect.height / 2}px;width:0;height:0;pointer-events:none;z-index:10000`;
      document.body.appendChild(wp);

      const lineKey = idx === 10 ? "_starLine" : "_coverLine";
      const wpKey = idx === 10 ? "_starWp" : "_coverWp";
      W[wpKey] = wp;

      const sourceMidY = rect.top + rect.height / 2;
      const targetRect = coverRef!.current!.getBoundingClientRect();
      const targetMidY = targetRect.top + targetRect.height / 2;

      const line = new W.LeaderLine(wp, coverRef!.current, {
        path: "fluid",
        color,
        size: 2,
        endSocket: sourceMidY < targetMidY ? "top" : "bottom",
        startPlug: "disc",
        endPlug: "disc",
        startPlugSize: 2,
        endPlugSize: 2,
      });
      W[lineKey] = line;

      // Animate draw-in
      const svg = document.querySelector("body > svg:last-of-type") as SVGSVGElement | null;
      if (svg) {
        svg.style.zIndex = "10000";
        svg.style.pointerEvents = "none";
        svg.style.opacity = "0";
        setTimeout(() => {
          svg.style.transition = "opacity 0.3s ease";
          svg.style.opacity = "1";
          svg.querySelectorAll("path, line, polyline").forEach((p) => {
            const el = p as SVGGeometryElement;
            if (typeof el.getTotalLength !== "function") return;
            const len = el.getTotalLength();
            el.style.strokeDasharray = `${len}`;
            el.style.strokeDashoffset = `${len}`;
            el.getBoundingClientRect();
            el.style.transition = `stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)`;
            el.style.strokeDashoffset = "0";
          });
        }, 0);
      }
    });
  }, [typingDone, isHomePage, suppressDisconnectedError]);

  useEffect(() => {
    // Choppy staggered reveal of page sections
    const t0 = setTimeout(() => setSidebarRevealed(true), 50);
    const t1 = setTimeout(() => setBioRevealed(true), 250);
    return () => { clearTimeout(t0); clearTimeout(t1); };
  }, [t]);

  // Show quote marquee after 30 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowQuoteMarquee(true), 30000);
    return () => clearTimeout(t);
  }, []);

  // Randomly marquee a sidebar item every 30 seconds
  const SIDEBAR_COUNT = 11; // total sidebar link items
  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * SIDEBAR_COUNT);
      setMarqueeSidebarIdx(idx);
      // Turn it off after 10 seconds so it goes back to normal
      setTimeout(() => setMarqueeSidebarIdx(null), 10000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // No bio typing — trigger reveal cascade on mount
  useEffect(() => {
    setBioRevealed(true);
    const t = setTimeout(() => setTypingDone(true), 500);
    return () => clearTimeout(t);
  }, []);

  // After typingDone: reveal headers, then open sidebar
  useEffect(() => {
    if (!typingDone) return;
    const t1 = setTimeout(() => { setHeaderRevealed(true); setFeaturedRevealed(true); }, 100);
    const t2 = setTimeout(() => setSidebarOpen(true), 300);
    // Mark initial load done after sidebar open animation completes (~700ms transition)
    const t3 = setTimeout(() => setInitialLoadDone(true), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [typingDone]);

  // Sync sidebar nav top with Featured Work line position
  useEffect(() => {
    const measure = () => {
      const fw = featuredWorkRef.current;
      if (!fw || fw.offsetParent === null) return; // skip when hidden
      const rect = fw.getBoundingClientRect();
      if (rect.top === 0 && rect.height === 0) return; // element not laid out
      setSidebarNavTop(rect.top - 15);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (featuredWorkRef.current?.parentElement) ro.observe(featuredWorkRef.current.parentElement);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [typingDone, lang]);

  // Redraw leader lines on scroll so they stay connected to images
  useEffect(() => {
    const el = contentAreaRef.current;
    if (!el) return;
    let rafPending = false;
    const onScroll = () => {
      if (rafPending || !activeRedrawRef.current) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        if (activeRedrawRef.current) {
          clearLines();
          activeRedrawRef.current(true);
        }
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [clearLines]);

  // TXT label + tiles — start after covers finish animating
  useEffect(() => {
    if (!coversReady || txtVisible > 0) return;
    const t = setTimeout(() => { setTxtLabelRevealed(true); setTxtVisible(1); }, 200);
    return () => clearTimeout(t);
  }, [coversReady, txtVisible]);

  // IMG label + tiles — start after covers finish animating
  useEffect(() => {
    if (!coversReady || imgVisible > 0) return;
    const t = setTimeout(() => { setImgLabelRevealed(true); setImgVisible(1); }, 200);
    return () => clearTimeout(t);
  }, [coversReady, imgVisible]);

  // Stagger TXT tiles (skip 0→1 since that's handled above)
  useEffect(() => {
    if (txtVisible < 1 || txtVisible >= txtTiles.length) return;
    const timer = setTimeout(() => setTxtVisible((c) => c + 1), 400);
    return () => clearTimeout(timer);
  }, [txtVisible]);

  // Stagger IMG tiles (skip 0→1 since that's handled above)
  useEffect(() => {
    if (imgVisible < 1 || imgVisible >= imgTiles.length) return;
    const timer = setTimeout(() => setImgVisible((c) => c + 1), 300);
    return () => clearTimeout(timer);
  }, [imgVisible]);

  // Detail view state
  const [activeTile, setActiveTile] = useState<TileData | null>(null);
  const [activeSection, setActiveSection] = useState<"txt" | "img">("txt");
  const [detailTop, setDetailTop] = useState(100); // percentage

  const handleTileClick = useCallback(
    (tile: TileData, section: "txt" | "img") => {
      setActiveTile(tile);
      setActiveSection(section);
      // Start off-screen, then animate in
      setDetailTop(100);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setDetailTop(0);
        });
      });
    },
    []
  );

  const handleHover = useCallback((text: string, title?: string) => {
    if (!typingDone) return;
    setCaption(text);
    setCaptionTitle(title || "");
  }, [typingDone]);

  const handleLeave = useCallback(() => {
    setCaption("");
    setCaptionTitle("");
  }, []);

  const handleClose = useCallback(() => {
    setDetailTop(100);
    // Wait for animation to finish before removing
    setTimeout(() => {
      setActiveTile(null);
    }, 500);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden font-[var(--site-font)] text-[13px] leading-[15px] text-black bg-white md:overflow-hidden overflow-y-auto">
      {/* Single audio element for about page */}
      <audio
        ref={aboutAudioRef}
        src="/reid_audio.mp3"
        preload="auto"
        onPlay={() => setAboutAudioPlaying(true)}
        onPause={() => setAboutAudioPlaying(false)}
        onEnded={() => setAboutAudioPlaying(false)}
      />
      {/* LEFT COLUMN - hidden on mobile, collapsible */}
      <div className="hidden md:block absolute top-0 right-0 h-full pl-[10px] pr-[15px]" style={{ width: sidebarOpen ? 195 : 0, overflow: "hidden", transition: "width 0.7s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.6s ease, border-left 0.7s ease", opacity: sidebarOpen ? 1 : 0, borderLeft: sidebarOpen ? "1px solid #ddd" : "1px solid transparent", color: "#ddd" }}>
        {/* Top border line */}
        <div className="absolute top-[15px]" style={{ borderBottom: "1px solid #eee", width: "calc(100% - 25px)" }} />

        {/* Sidebar navigation — aligned with Featured Work line */}
        <div className="absolute" style={{ top: sidebarNavTop, bottom: 180, display: "flex", flexDirection: "column" }}>
          <div className="text-[11px] leading-[18px]" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ marginBottom: -8 }}>{sidebarOpen && <AnimatedDivider delay={50} />}</div>
            <div onClick={() => scatterAndNavigate("home")}>
              <SidebarLink icons={[{char:"3",shape:"triangle"}]} label={t.homepage} typeDelay={100} hideLabel={!sidebarOpen} marquee={marqueeSidebarIdx === 0} />
            </div>
            <div style={{ marginTop: -8 }}>{sidebarOpen && <AnimatedDivider delay={200} />}</div>
            <div onClick={() => scatterAndNavigate("prints")}>
              <SidebarLink ref={printsRef} icons={[{char:"b",shape:"square"}]} label={t.prints} typeDelay={500} hideLabel={!sidebarOpen} highlighted={highlightedCategory === "prints"} dimmed={activeCoverIdx !== null && highlightedCategory !== "prints"} onMouseEnter={handlePrintsEnter} onMouseLeave={handlePrintsLeave} marquee={marqueeSidebarIdx === 1} />
            </div>
            <div onClick={() => scatterAndNavigate("painting")}>
              <SidebarLink ref={paintingRef} icons={[{char:"C"}]} label={t.painting} typeDelay={800} hideLabel={!sidebarOpen} highlighted={highlightedCategory === "painting"} dimmed={activeCoverIdx !== null && highlightedCategory !== "painting"} onMouseEnter={handlePaintingEnter} onMouseLeave={handlePaintingLeave} marquee={marqueeSidebarIdx === 2} />
            </div>
            <div onClick={() => window.open("https://substack.com/@reidsurmeier/posts", "_blank")}>
              <SidebarLink ref={writingRef} icons={[{char:"L"},{char:"3",shape:"triangle"}]} label={t.writing} typeDelay={1400} hideLabel={!sidebarOpen} onMouseEnter={handleWritingEnter} onMouseLeave={handleWritingLeave} marquee={marqueeSidebarIdx === 4} />
            </div>
            {sidebarOpen && <AnimatedDivider delay={1550} />}
            <div onClick={() => scatterAndNavigate("about")}>
              <SidebarLink ref={aboutRef} icons={[{char:"S",shape:"square"}]} label={t.aboutContact} typeDelay={1700} typeSpeed={5} hideLabel={!sidebarOpen} highlighted={highlightedCategory === "about"} dimmed={activeCoverIdx !== null && highlightedCategory !== "about"} onMouseEnter={handleAboutEnter} onMouseLeave={handleAboutLeave} marquee={marqueeSidebarIdx === 5} />
            </div>
            {/* Keynotes/Workshops — hidden for now */}
            {false && <div onClick={() => scatterAndNavigate("lectures")}>
              <SidebarLink ref={lecturesRef} icons={[{char:"Y"}]} label={t.lectures} typeDelay={2000} hideLabel={!sidebarOpen} marquee={marqueeSidebarIdx === 6} />
            </div>}
            <div style={{ marginTop: 40, paddingTop: 15 }}>
              <div onClick={() => scatterAndNavigate("instagram")}>
                <SidebarLink icons={[{char:"Q"}]} label={t.social} typeDelay={2300} typeSpeed={5} hideLabel={!sidebarOpen} marquee={marqueeSidebarIdx === 6} />
              </div>
              <div onClick={() => scatterAndNavigate("are.na")}>
                <SidebarLink icons={[{char:"A"}]} label="Are.na" typeDelay={2600} typeSpeed={5} hideLabel={!sidebarOpen} marquee={marqueeSidebarIdx === 7} />
              </div>
              <div onClick={() => scatterAndNavigate("garden")}>
                <SidebarLink ref={gardenRef} icons={[{char:"g"}]} label="Garden" typeDelay={2900} typeSpeed={5} hideLabel={!sidebarOpen} marquee={marqueeSidebarIdx === 8} />
              </div>
              {sidebarOpen && <AnimatedDivider delay={3050} />}
              <div onClick={() => scatterAndNavigate("cv")}>
                <SidebarLink icons={[{char:"X"}]} label={t.cv} typeDelay={3200} hideLabel={!sidebarOpen} marquee={marqueeSidebarIdx === 9} />
              </div>
              {sidebarOpen && <AnimatedDivider delay={3350} />}
            </div>
          </div>
        </div>

        {/* Barcode + Headline — bottom of sidebar */}
        <div className="absolute bottom-[8px]" style={{ fontSize: 11, fontFamily: "var(--site-font)", color: "#ddd", left: 15, right: 15 }}>
          <SidebarStats />
          <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
            <span className="marquee-text">
              {"\u00A9 2026 Reid Surmeier\u2003\u2003\u2003HTML last updated \u2192 02/15/2026\u2003\u2003\u2003\u00A9 2026 Reid Surmeier\u2003\u2003\u2003HTML last updated \u2192 02/15/2026"}
            </span>
          </div>
        </div>
      </div>

      {/* === DESKTOP RIGHT AREA === */}
      {/* Left vertical line — 10px from browser edge, full height */}
      <div className="hidden md:block absolute top-0 h-full" style={{ left: 10, width: 1, background: "#eee", zIndex: 1 }} />

      {/* === DESKTOP LEFT AREA (content) === */}
      <div ref={desktopContentRef} className="hidden md:block absolute top-0 h-full" style={{ left: 11, right: initialLoadDone ? (sidebarOpen ? 196 : 0) : 196, transition: initialLoadDone ? "right 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)" : "none" }}>
        {/* Language - sub-pages only */}
        <div className="absolute top-[20px] z-[1000] flex gap-[10px]" style={{ right: sidebarOpen ? 20 : 80, transition: "right 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)", display: showContact || showAbout || showCV || embedUrl || showInstagram || showGallery ? undefined : "none" }}>
          <LangButton label="DE" active={lang === "de"} onClick={() => setLang("de")} />
          <LangButton label="EN" active={lang === "en"} onClick={() => setLang("en")} />
          <LangButton label="FR" active={lang === "fr"} onClick={() => setLang("fr")} />
          <LangButton label="ID" active={lang === "id"} onClick={() => setLang("id")} />
          <LangButton label="JA" active={lang === "ja"} onClick={() => setLang("ja")} />
          <LangButton label="KO" active={lang === "ko"} onClick={() => setLang("ko")} />
          <LangButton label="ZH" active={lang === "zh"} onClick={() => setLang("zh")} />
        </div>

        {/* Contact form view */}
        {showContact && (
          <div key={`contact-${navIndex}`} className="absolute top-[15px] bottom-0 left-0 right-0 overflow-y-auto">
            <ContactForm onClose={() => navigateTo("home")} lang={lang} />
          </div>
        )}

        {/* About page view */}
        {showAbout && (
          <div key={`about-${navIndex}`} className="absolute top-[15px] bottom-0 left-0 right-0 overflow-y-auto">
            <AboutPage onClose={() => navigateTo("home")} lang={lang} onContact={() => navigateTo("contact")} isPlaying={aboutAudioPlaying} onToggleAudio={() => { const a = aboutAudioRef.current; if (!a) return; if (a.paused) { a.volume = 1; a.play().catch(() => {}); } else { a.pause(); } }} />
          </div>
        )}

        {/* Instagram page view */}
        {showInstagram && (
          <div key={`instagram-${navIndex}`} className="absolute top-[15px] bottom-0 left-0 right-0 overflow-y-auto">
            <InstagramPage onClose={() => navigateTo("home")} />
          </div>
        )}

        {/* CV page view */}
        {showCV && (
          <div key={`cv-${navIndex}`} className="absolute top-[15px] bottom-0 left-0 right-0 overflow-y-auto">
            <CVPage onClose={() => navigateTo("home")} lang={lang} />
          </div>
        )}

        {/* Embed page view */}
        {embedUrl && (
          <div key={`embed-${navIndex}`} className="absolute top-[15px] bottom-0 left-0 right-0" style={{ display: "flex", flexDirection: "column" }}>
            <EmbedPage onClose={() => navigateTo("home")} title={embedTitle} url={embedUrl} inputLabel={embedInput} scale={embedScale} iframeMarginLeft={embedML} iframeMarginRight={embedMR} />
          </div>
        )}

        {/* Gallery page view */}
        {showGallery && (
          <div key={`gallery-${navIndex}`} className="absolute top-[15px] bottom-0 left-0 right-0 overflow-y-auto">
            <GalleryPage
              onClose={() => navigateTo("home")}
              title={
                showGallery === "prints" ? t.prints :
                showGallery === "drawings" ? t.drawings :
                showGallery === "painting" ? t.painting :
                showGallery === "sculpture" ? t.sculpture_nav :
                showGallery === "archive" ? t.archive :
                showGallery === "writing_page" ? t.writing :
                showGallery === "webui" ? "Web + UI/UX" :
                t.lectures
              }
              inputLabel={
                showGallery === "prints" ? "Input_008" :
                showGallery === "drawings" ? "Input_009" :
                showGallery === "painting" ? "Input_010" :
                showGallery === "sculpture" ? "Input_011" :
                showGallery === "archive" ? "Input_012" :
                showGallery === "writing_page" ? "Input_013" :
                showGallery === "webui" ? "Input_015" :
                "Input_014"
              }
              lang={lang}
              onContact={() => navigateTo("contact")}
            />
          </div>
        )}

        {/* Bio text + Book covers + TXT/IMG scrollable area */}
        <div ref={contentAreaRef} className="absolute top-[15px] bottom-0 left-0 right-0 overflow-y-auto" style={{ display: showContact || showAbout || showCV || embedUrl || showInstagram || showGallery ? "none" : undefined, paddingLeft: 30, opacity: homeFadeIn ? 0 : 1, transition: "opacity 0.6s ease" }}>
          {/* Top border line */}
          <div style={{ borderBottom: "1px solid #eee", marginRight: -80 }} />
          {/* Input label + languages row below the line */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, paddingBottom: 4, marginRight: -80, paddingRight: 80 }}>
            <span style={{ fontSize: 10, color: "#ddd", opacity: featuredRevealed ? 1 : 0, transition: "opacity 0.4s ease", whiteSpace: "nowrap", flexShrink: 0 }}>
              {featuredRevealed ? <TypewriterText delay={0} speed={40}>{"002"}</TypewriterText> : <span style={{ visibility: "hidden" }}>002</span>}
            </span>
            {showQuoteMarquee && (
              <div className="marquee-quote-container" style={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap", margin: "0 4px" }}>
                <span className="marquee-quote" style={{ fontSize: 10, color: "#ddd" }}>
                  {"\u201CWhat looks good today may not look good tomorrow\u201D \u2192 Michel Majerus"}
                </span>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginRight: sidebarOpen ? 20 : 20, transition: "margin-right 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)", opacity: featuredRevealed ? 1 : 0 }}>
              {featuredRevealed && <>
                <LangButton label="DE" active={lang === "de"} onClick={() => setLang("de")} typeDelay={100} />
                <LangButton label="EN" active={lang === "en"} onClick={() => setLang("en")} typeDelay={250} />
                <LangButton label="FR" active={lang === "fr"} onClick={() => setLang("fr")} typeDelay={400} />
                <LangButton label="ID" active={lang === "id"} onClick={() => setLang("id")} typeDelay={550} />
                <LangButton label="JA" active={lang === "ja"} onClick={() => setLang("ja")} typeDelay={700} />
                <LangButton label="KO" active={lang === "ko"} onClick={() => setLang("ko")} typeDelay={850} />
                <LangButton label="ZH" active={lang === "zh"} onClick={() => setLang("zh")} typeDelay={1000} />
              </>}
            </div>
          </div>

          {/* Bio text / Caption crossfade area — fixed height to prevent layout shift */}
          <div ref={bioContainerRef} style={{ position: "relative", minHeight: 120, marginTop: "clamp(12px, 2vw, 24px)", marginRight: "clamp(60px, 12vw, 200px)", fontFamily: "var(--site-font)", fontSize: "clamp(13px, 1.2vw, 17px)", fontWeight: 500, color: "#bbb", lineHeight: 1.4, overflowWrap: "break-word", wordBreak: "normal" } as React.CSSProperties}>
            {/* White overlay that fades bio text when a highlight is hovered */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255,255,255,0.85)",
              opacity: bioFade ? 1 : 0,
              transition: "opacity 0.3s ease",
              pointerEvents: "none",
              zIndex: 5,
            }} />
            {/* Caption layer */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              opacity: caption ? 1 : 0,
              transition: "opacity 1.2s ease-in-out",
              pointerEvents: caption ? "auto" : "none",
            }}>
              <p>
                {caption && caption.split("\n").map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
            </div>

            {/* Bio layer */}
            <div style={{
              opacity: (!typingDone || caption) ? 0 : 1,
              transition: "opacity 1s ease-in-out",
              pointerEvents: caption ? "none" : "auto",
            }}>
              {lang === "ja" ? (
              <div style={{ display: "flex", gap: "clamp(14px, 2vw, 30px)" }}>
                <div style={{ flex: 6 }}>
                  <p>
                    <strong style={{ color: "#666", fontWeight: 800, whiteSpace: "nowrap" }}><BioText delay={300} typed={typingDone}>{t.bioStrong}</BioText></strong><BioText delay={300 + t.bioStrong.length * 45} typed={typingDone}>{t.bio1a}</BioText><span style={{ whiteSpace: "nowrap" }}><BioText delay={300 + t.bioStrong.length * 45 + t.bio1a.length * 45} typed={typingDone}>{" Reid Surmeier"}</BioText></span><BioText delay={300 + (t.bioStrong + t.bio1a).length * 45 + 14 * 45} typed={typingDone}>{t.bio1b}</BioText>{" "}<sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>1</sub><span ref={bioComputationRef} onMouseEnter={handleBioComputationEnter} onMouseLeave={handleBioComputationLeave} style={{ position: "relative", zIndex: 10 }}><Highlight color="#EFEF3B">{t.computation}</Highlight></span><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b).length * 45 + 14 * 45} typed={typingDone}>{"\u3001"}</BioText><sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>2</sub><span ref={bioPaintingRef} onMouseEnter={handleBioPaintingEnter} onMouseLeave={handleBioPaintingLeave} style={{ position: "relative", zIndex: 10 }}><Highlight color="#C5D5F0">{t.painting_hl}</Highlight></span><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b).length * 45 + 14 * 45 + 60} typed={typingDone}>{"\u3001"}</BioText><sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>3</sub><span ref={bioSculptureRef} onMouseEnter={handleBioSculptureEnter} onMouseLeave={handleBioSculptureLeave} style={{ position: "relative", zIndex: 10 }}><Highlight color="#C5A0D0">{t.sculpture}</Highlight></span><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b).length * 45 + 14 * 45 + 200} typed={typingDone}>{"\u306B\u53CA\u3073\u307E\u3059\u3002"}</BioText>
                  </p>
                </div>
                <div style={{ flex: 4, paddingRight: "clamp(0px, 2vw, 60px)", fontSize: "clamp(11px, 1vw, 14px)" }}>
                  <p>
                    <BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b).length * 45 + 14 * 45 + 250} typed={typingDone}>{t.bio2}</BioText><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b + t.bio2).length * 45 + 14 * 45 + 300} typed={typingDone}>{t.bio3}</BioText>{" "}<sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>4</sub><span ref={bioCreatingRef} onMouseEnter={() => handleBioProcessEnter(bioCreatingRef)} onMouseLeave={handleBioProcessLeave} style={{ position: "relative", zIndex: 10 }}><Highlight color="#C5D5F0">{t.creating}</Highlight></span><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b + t.bio2 + t.bio3).length * 45 + 14 * 45 + 400} typed={typingDone}>{"\u3001"}</BioText><sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>5</sub><span ref={bioPerceivingRef} onMouseEnter={() => handleBioProcessEnter(bioPerceivingRef)} onMouseLeave={handleBioProcessLeave} style={{ position: "relative", zIndex: 10 }}><Highlight color="#F0C5D5">{t.perceiving}</Highlight></span><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b + t.bio2 + t.bio3).length * 45 + 14 * 45 + 500} typed={typingDone}>{"\u3001"}</BioText><sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>6</sub><span ref={bioInterpretingRef} onMouseEnter={() => handleBioProcessEnter(bioInterpretingRef)} onMouseLeave={handleBioProcessLeave} style={{ position: "relative", zIndex: 10 }}><Highlight color="#D5F0C5">{t.interpreting}</Highlight></span><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b + t.bio2 + t.bio3).length * 45 + 14 * 45 + 600} typed={typingDone} onDone={() => setTimeout(() => setTypingDone(true), 400)}>{t.bio4}</BioText>
                  </p>
                </div>
              </div>
              ) : (
              <div style={{ display: "flex", gap: "clamp(14px, 2vw, 30px)" }}>
                <div style={{ flex: 6 }}>
                  <p>
                    <strong style={{ color: "#666", fontWeight: 800, whiteSpace: "nowrap" }}><BioText delay={300} typed={typingDone}>{t.bioStrong}</BioText></strong><BioText delay={300 + t.bioStrong.length * 45} typed={typingDone}>{t.bio1a}</BioText><span style={{ whiteSpace: "nowrap" }}><BioText delay={300 + t.bioStrong.length * 45 + t.bio1a.length * 45} typed={typingDone}>{" Reid Surmeier"}</BioText></span><BioText delay={300 + (t.bioStrong + t.bio1a).length * 45 + 14 * 45} typed={typingDone}>{t.bio1b}</BioText>{" "}<sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>1</sub><span ref={bioComputationRef} onMouseEnter={handleBioComputationEnter} onMouseLeave={handleBioComputationLeave} style={{ position: "relative", zIndex: 10 }}><Highlight color="#EFEF3B">{t.computation}</Highlight></span><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b).length * 45 + 14 * 45} typed={typingDone}>{", "}</BioText><sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>2</sub><span ref={bioPaintingRef} onMouseEnter={handleBioPaintingEnter} onMouseLeave={handleBioPaintingLeave} style={{ position: "relative", zIndex: 10 }}><Highlight color="#C5D5F0">{t.painting_hl}</Highlight></span><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b).length * 45 + 14 * 45 + 60} typed={typingDone}>{", and "}</BioText><sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>3</sub><span ref={bioSculptureRef} onMouseEnter={handleBioSculptureEnter} onMouseLeave={handleBioSculptureLeave} style={{ position: "relative", zIndex: 10 }}><Highlight color="#C5A0D0">{t.sculpture}</Highlight></span><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b).length * 45 + 14 * 45 + 200} typed={typingDone}>{"."}</BioText>
                  </p>
                </div>
                <div style={{ flex: 4, paddingRight: "clamp(0px, 2vw, 60px)", fontSize: "clamp(11px, 1vw, 14px)" }}>
                  <p>
                    <BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b).length * 45 + 14 * 45 + 250} typed={typingDone}>{t.bio2.replace(/^\.\s*/, "")}</BioText><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b + t.bio2).length * 45 + 14 * 45 + 300} typed={typingDone}>{t.bio3}</BioText>{" "}<sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>4</sub><span ref={bioCreatingRef} onMouseEnter={() => handleBioProcessEnter(bioCreatingRef)} onMouseLeave={handleBioProcessLeave} style={{ position: "relative", zIndex: 10 }}><Highlight color="#C5D5F0">{t.creating}</Highlight></span><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b + t.bio2 + t.bio3).length * 45 + 14 * 45 + 400} typed={typingDone}>{", "}</BioText><sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>5</sub><span ref={bioPerceivingRef} onMouseEnter={() => handleBioProcessEnter(bioPerceivingRef)} onMouseLeave={handleBioProcessLeave} style={{ position: "relative", zIndex: 10 }}><Highlight color="#F0C5D5">{t.perceiving}</Highlight></span><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b + t.bio2 + t.bio3).length * 45 + 14 * 45 + 500} typed={typingDone}>{", and "}</BioText><sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>6</sub><span ref={bioInterpretingRef} onMouseEnter={() => handleBioProcessEnter(bioInterpretingRef)} onMouseLeave={handleBioProcessLeave} style={{ position: "relative", zIndex: 10 }}><Highlight color="#D5F0C5">{t.interpreting}</Highlight></span><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b + t.bio2 + t.bio3).length * 45 + 14 * 45 + 600} typed={typingDone} onDone={() => setTimeout(() => setTypingDone(true), 400)}>{t.bio4}</BioText>
                  </p>
                </div>
              </div>
              )}
            </div>
          </div>

          {/* Featured Work header — line always visible, text types after bio */}
          <div ref={featuredWorkRef} style={{ display: "flex", alignItems: "center", gap: 20, fontFamily: "var(--site-font)", fontSize: 11, color: "#bbb", borderTop: "1px solid #eee", marginTop: 30, paddingTop: 4, marginRight: -80, paddingRight: 80 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, opacity: featuredRevealed ? ((activeCoverIdx !== null || effectiveHoverCategory === "writing") ? 0.65 : 1) : 0, transition: (activeCoverIdx !== null || effectiveHoverCategory !== null) ? "opacity 0.8s ease" : "opacity 0.4s ease" }}>
              <span style={{ color: "#888", fontSize: 13, flexShrink: 0 }}>↳</span>
              <span style={{ color: "#888", fontWeight: 700 }}>{featuredRevealed ? <TypewriterText delay={0} speed={40}>{t.featuredWork}</TypewriterText> : <span style={{ visibility: "hidden" }}>{t.featuredWork}</span>}</span>
            </span>
            <span style={{ opacity: featuredRevealed ? ((activeCoverIdx !== null || effectiveHoverCategory === "writing") ? 0.65 : 1) : 0, transition: (activeCoverIdx !== null || effectiveHoverCategory !== null) ? "opacity 0.8s ease" : "opacity 0.4s ease" }}>{featuredRevealed ? <TypewriterText delay={t.featuredWork.length * 40 + 100} speed={40}>{"(2025\u20132026)"}</TypewriterText> : <span style={{ visibility: "hidden" }}>{"(2025\u20132026)"}</span>}</span>
          </div>

          <div style={{ height: 80 }} />
          <div style={{ marginRight: 100 }}>
            <BookCovers onHover={handleHover} onLeave={handleLeave} coverRefs={{ 0: cover0Ref, 1: cover1Ref, 2: cover2Ref, 3: cover3Ref, 4: cover4Ref, 5: cover5Ref, 6: cover6Ref, 7: cover7Ref, 8: cover8Ref, 9: cover9Ref, 10: cover10Ref }} onAllVisible={() => { setCoversReady(true); hasPlayedIntroRef.current = true; }} onCoverHover={handleCoverHoverLine} onCoverClick={(idx) => { if (idx <= 4) navigateTo("prints"); else if (idx <= 7) navigateTo("instagram"); else if (idx <= 9) navigateTo("painting"); else if (idx === 10) navigateTo("about"); }} connectedIndices={connectedCoverIndices} visible={isHomePage} skipIntro={hasPlayedIntroRef.current} onBounceStart={() => { isBouncingRef.current = true; if (activeRedrawRef.current) { clearLines(); activeRedrawRef.current(true); } }} onBounceFrame={() => { suppressDisconnectedError(() => { if (leaderLinesRef.current.length > 0) { leaderLinesRef.current.forEach((line) => { try { line.position?.(); } catch { /* */ } }); } const W = window as any; if (W._starLine) { try { W._starLine.position(); } catch {} } if (W._coverLine) { try { W._coverLine.position(); } catch {} } }); }} captions={{ plotter: t.capPlotter, sketchbook: t.capSketchbook, press: t.capPress, painting: t.capPainting, about: t.capAbout }} />
          </div>

          <div style={{ height: 180 }} />
        </div>

      </div>

      {/* Sidebar toggle — top-right corner, desktop only */}
      <div className="hidden md:flex" style={{
        position: "fixed",
        top: 22,
        right: 16,
        zIndex: 100,
        alignItems: "center",
        gap: 6,
        opacity: coversReady ? 1 : 0,
        transition: "opacity 0.6s ease",
        pointerEvents: coversReady ? "auto" : "none",
      }}>
        <button onClick={() => setSidebarOpen(o => !o)} style={{
          background: "none", border: "none", padding: 0,
          display: "flex", alignItems: "center",
          opacity: 0.6, transition: "opacity 0.2s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: "block" }}>
            {sidebarOpen ? (
              <>
                <rect x="1" y="1" width="12" height="12" rx="2" stroke="#bbb" strokeWidth="1.2" />
                <line x1="9" y1="1" x2="9" y2="13" stroke="#bbb" strokeWidth="1.2" />
                <path d="M4.5 5.5L6.5 7L4.5 8.5" stroke="#bbb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </>
            ) : (
              <>
                <rect x="1" y="1" width="12" height="12" rx="2" stroke="#bbb" strokeWidth="1.2" />
                <line x1="9" y1="1" x2="9" y2="13" stroke="#bbb" strokeWidth="1.2" />
                <path d="M6.5 5.5L4.5 7L6.5 8.5" stroke="#bbb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
          </svg>
        </button>
        <button onClick={navBack} disabled={navIndex <= 0} style={{
          background: "none", border: "none", padding: 0,
          display: "flex", alignItems: "center",
          opacity: navIndex <= 0 ? 0.3 : 0.6, transition: "opacity 0.2s ease",
        }}
        onMouseEnter={(e) => { if (navIndex > 0) e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = navIndex <= 0 ? "0.3" : "0.6"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: "block" }}>
            <path d="M8.5 3L4.5 7L8.5 11" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button onClick={navForward} disabled={navIndex >= navHistory.length - 1} style={{
          background: "none", border: "none", padding: 0,
          display: "flex", alignItems: "center",
          opacity: navIndex >= navHistory.length - 1 ? 0.3 : 0.6, transition: "opacity 0.2s ease",
        }}
        onMouseEnter={(e) => { if (navIndex < navHistory.length - 1) e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = navIndex >= navHistory.length - 1 ? "0.3" : "0.6"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: "block" }}>
            <path d="M5.5 3L9.5 7L5.5 11" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Desktop copyright — bottom-left corner, same marquee as sidebar */}
      <div className="hidden md:block" style={{
        position: "fixed",
        bottom: 14,
        left: 20,
        zIndex: 50,
        fontFamily: "var(--site-font)",
        fontSize: 10,
        color: "#ddd",
        overflow: "hidden",
        whiteSpace: "nowrap",
        maxWidth: 280,
        opacity: isHomePage && coversReady ? 1 : 0,
        transition: "opacity 0.6s ease",
        pointerEvents: isHomePage && coversReady ? "auto" : "none",
      }}>
        <span className="marquee-text">
          {"Code & Graphic Design by Reid Surmeier \u00A9 2026\u2003\u2003\u2003Code & Graphic Design by Reid Surmeier \u00A9 2026"}
        </span>
      </div>

      {/* === MOBILE LAYOUT === */}
      <div className="md:hidden" style={{ minHeight: "100%", background: "#fff" }}>
        {/* Top bar: menu toggle + language */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 15px", borderBottom: "1px solid #eee" }}>
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            style={{ background: "none", border: "1px solid #ddd", borderRadius: 4, padding: "4px 10px", fontSize: 11, fontFamily: "var(--site-font)", color: mobileMenuOpen ? "#000" : "#bbb", transition: "color 0.15s ease" }}
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <LangButton label="DE" active={lang === "de"} onClick={() => setLang("de")} />
            <LangButton label="EN" active={lang === "en"} onClick={() => setLang("en")} />
            <LangButton label="FR" active={lang === "fr"} onClick={() => setLang("fr")} />
            <LangButton label="ID" active={lang === "id"} onClick={() => setLang("id")} />
            <LangButton label="JA" active={lang === "ja"} onClick={() => setLang("ja")} />
            <LangButton label="KO" active={lang === "ko"} onClick={() => setLang("ko")} />
            <LangButton label="ZH" active={lang === "zh"} onClick={() => setLang("zh")} />
          </div>
        </div>

        {/* Dropdown menu */}
        <div style={{
          display: "grid",
          gridTemplateRows: mobileMenuOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          borderBottom: mobileMenuOpen ? "1px solid #eee" : "none",
        }}>
          <div style={{ overflow: "hidden", minHeight: 0 }}>
          <div style={{ padding: "16px 15px", fontFamily: "var(--site-font)", color: "#999", opacity: mobileMenuOpen ? 1 : 0, transition: "opacity 0.3s ease", transitionDelay: mobileMenuOpen ? "0.1s" : "0s" }}>
            <div onClick={() => { scatterAndNavigate("home"); setMobileMenuOpen(false); }}>
              <SidebarLink icons={[{char:"3",shape:"triangle"}]} label={t.homepage} mobileNav />
            </div>
            <div style={{ borderTop: "1px solid #eee", margin: "10px 0", width: "100%" }} />
            <div onClick={() => { scatterAndNavigate("prints"); setMobileMenuOpen(false); }}>
              <SidebarLink icons={[{char:"b",shape:"square"}]} label={t.prints} mobileNav />
            </div>
            <div onClick={() => { scatterAndNavigate("painting"); setMobileMenuOpen(false); }}>
              <SidebarLink icons={[{char:"C"}]} label={t.painting} mobileNav />
            </div>
            <div onClick={() => { window.open("https://substack.com/@reidsurmeier/posts", "_blank"); setMobileMenuOpen(false); }}>
              <SidebarLink icons={[{char:"L"},{char:"3",shape:"triangle"}]} label={t.writing} mobileNav />
            </div>
            <div style={{ borderTop: "1px solid #eee", margin: "10px 0", width: "100%" }} />
            <div onClick={() => { scatterAndNavigate("about"); setMobileMenuOpen(false); }}>
              <SidebarLink icons={[{char:"S",shape:"square"}]} label={t.aboutContact} mobileNav />
            </div>
            {/* Keynotes/Workshops — hidden for now */}
            {false && <div onClick={() => { scatterAndNavigate("lectures"); setMobileMenuOpen(false); }}>
              <SidebarLink icons={[{char:"Y"}]} label={t.lectures} mobileNav />
            </div>}
            <div style={{ borderTop: "1px solid #eee", margin: "10px 0", width: "100%" }} />
            <div onClick={() => { window.open("https://www.instagram.com/reidsurmeier/", "_blank"); setMobileMenuOpen(false); }}>
              <SidebarLink icons={[{char:"Q"}]} label={t.social} mobileNav />
            </div>
            <div onClick={() => { window.open("https://www.are.na/reid-surmeier/channels", "_blank"); setMobileMenuOpen(false); }}>
              <SidebarLink icons={[{char:"A"}]} label="Are.na" mobileNav />
            </div>
            <div onClick={() => { window.open("https://www.reidsurmeier.garden/", "_blank"); setMobileMenuOpen(false); }}>
              <SidebarLink icons={[{char:"g"}]} label="Garden" mobileNav />
            </div>
            <div style={{ borderTop: "1px solid #eee", margin: "10px 0", width: "100%" }} />
            <div onClick={() => { scatterAndNavigate("cv"); setMobileMenuOpen(false); }}>
              <SidebarLink icons={[{char:"X"}]} label={t.cv} mobileNav />
            </div>
            <div style={{ borderTop: "1px solid #eee", margin: "10px 0", width: "100%" }} />
          </div>
          </div>
        </div>

        {/* Mobile Contact Form */}
        {showContact && (
          <div key={`m-contact-${navIndex}`} style={{ minHeight: "60vh" }}>
            <ContactForm onClose={() => navigateTo("home")} lang={lang} />
          </div>
        )}

        {/* Mobile About Page */}
        {showAbout && (
          <div key={`m-about-${navIndex}`} style={{ padding: "20px 15px", minHeight: "60vh" }}>
            <AboutPage onClose={() => navigateTo("home")} lang={lang} onContact={() => navigateTo("contact")} mobile isPlaying={aboutAudioPlaying} onToggleAudio={() => { const a = aboutAudioRef.current; if (!a) return; if (a.paused) { a.volume = 1; a.play().catch(() => {}); } else { a.pause(); } }} />
          </div>
        )}

        {/* Mobile CV Page */}
        {showCV && (
          <div style={{ padding: "20px 15px", minHeight: "60vh" }}>
            <CVPage onClose={() => navigateTo("home")} lang={lang} />
          </div>
        )}

        {/* Mobile Gallery Page */}
        {showGallery && (
          <div style={{ paddingTop: 20, minHeight: "60vh" }}>
            <GalleryPage
              onClose={() => navigateTo("home")}
              title={
                showGallery === "prints" ? t.prints :
                showGallery === "drawings" ? t.drawings :
                showGallery === "painting" ? t.painting :
                showGallery === "sculpture" ? t.sculpture_nav :
                showGallery === "archive" ? t.archive :
                showGallery === "writing_page" ? t.writing :
                showGallery === "webui" ? "Web + UI/UX" :
                t.lectures
              }
              inputLabel={
                showGallery === "prints" ? "Input_008" :
                showGallery === "drawings" ? "Input_009" :
                showGallery === "painting" ? "Input_010" :
                showGallery === "sculpture" ? "Input_011" :
                showGallery === "archive" ? "Input_012" :
                showGallery === "writing_page" ? "Input_013" :
                showGallery === "webui" ? "Input_015" :
                "Input_014"
              }
              lang={lang}
              onContact={() => navigateTo("contact")}
              mobile
            />
          </div>
        )}

        {/* Bio */}
        <div style={{ padding: "20px 15px", fontFamily: "var(--site-font)", fontSize: 14, fontWeight: 500, color: "#bbb", lineHeight: 1.5, overflowWrap: "break-word", display: showContact || showAbout || showCV || showGallery ? "none" : undefined, opacity: typingDone ? 1 : 0, transition: "opacity 1s ease-in-out" }}>
          <p>
            <strong style={{ color: "#666", fontWeight: 800 }}><BioText delay={300} typed={typingDone}>{t.bioStrong}</BioText></strong><BioText delay={300 + t.bioStrong.length * 20} typed={typingDone}>{t.bio1a}</BioText><span style={{ whiteSpace: "nowrap" }}><BioText delay={300 + t.bioStrong.length * 20 + t.bio1a.length * 20} typed={typingDone}>{" Reid Surmeier"}</BioText></span><BioText delay={300 + (t.bioStrong + t.bio1a).length * 20 + 14 * 20} typed={typingDone}>{t.bio1b}</BioText>{" "}<sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>1</sub><span ref={bioComputationRef} onMouseEnter={handleBioComputationEnter} onMouseLeave={handleBioComputationLeave} style={{ position: "relative", zIndex: 10 }}><Highlight color="#EFEF3B">{t.computation}</Highlight></span><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b).length * 20 + 14 * 20} typed={typingDone}>{", "}</BioText><sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>2</sub><Highlight color="#C5D5F0">{t.painting_hl}</Highlight><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b).length * 20 + 14 * 20 + 60} typed={typingDone}>{", and "}</BioText><sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>3</sub><span ref={bioSculptureRef} onMouseEnter={handleBioSculptureEnter} onMouseLeave={handleBioSculptureLeave} style={{ position: "relative", zIndex: 10 }}><Highlight color="#C5A0D0">{t.sculpture}</Highlight></span><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b).length * 20 + 14 * 20 + 200} typed={typingDone}>{t.bio2}</BioText><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b + t.bio2).length * 20 + 14 * 20 + 300} typed={typingDone}>{t.bio3}</BioText><sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>4</sub><Highlight color="#C5D5F0">{t.creating}</Highlight><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b + t.bio2 + t.bio3).length * 20 + 14 * 20 + 400} typed={typingDone}>{", "}</BioText><sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>5</sub><Highlight color="#F0C5D5">{t.perceiving}</Highlight><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b + t.bio2 + t.bio3).length * 20 + 14 * 20 + 500} typed={typingDone}>{", and "}</BioText><sub style={{ fontSize: 9, verticalAlign: "baseline", color: "#bbb" }}>6</sub><Highlight color="#D5F0C5">{t.interpreting}</Highlight><BioText delay={300 + (t.bioStrong + t.bio1a + t.bio1b + t.bio2 + t.bio3).length * 20 + 14 * 20 + 600} typed={typingDone} onDone={() => setTimeout(() => setTypingDone(true), 400)}>{t.bio4}</BioText>
          </p>
        </div>

        {/* Featured Work header */}
        <div style={{ padding: "0 15px", marginTop: 20, marginBottom: 40, display: showContact || showAbout || showCV || showGallery ? "none" : undefined, opacity: featuredRevealed ? 1 : 0, transition: "opacity 0.6s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--site-font)", fontSize: 11, color: "#bbb", borderTop: "1px solid #eee", paddingTop: 4 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#888", fontSize: 13, flexShrink: 0 }}>↳</span>
              <span style={{ color: "#888", fontWeight: 700 }}>{t.featuredWork}</span>
            </span>
            <span>(2025–2026)</span>
          </div>
        </div>

        {/* Book covers */}
        <div style={{ padding: "0 15px", marginBottom: 40, display: showContact || showAbout || showCV || showGallery ? "none" : undefined, opacity: featuredRevealed ? 1 : 0, transition: "opacity 0.8s ease 0.2s" }}>
          <BookCovers onHover={handleHover} onLeave={handleLeave} onAllVisible={() => { setCoversReady(true); hasPlayedIntroRef.current = true; }} onCoverClick={(idx) => { if (idx <= 4) navigateTo("prints"); else if (idx <= 7) window.open("https://www.instagram.com/reidsurmeier/", "_blank"); else if (idx <= 9) navigateTo("painting"); else if (idx === 10) navigateTo("about"); }} visible={isHomePage} skipIntro={hasPlayedIntroRef.current} captions={{ plotter: t.capPlotter, sketchbook: t.capSketchbook, press: t.capPress, painting: t.capPainting, about: t.capAbout }} />
        </div>

        {/* TXT and IMG removed */}

        {/* Mobile copyright — same marquee as sidebar */}
        <div style={{
          padding: "24px 15px 32px",
          fontFamily: "var(--site-font)",
          fontSize: 10,
          color: "#ddd",
          overflow: "hidden",
          whiteSpace: "nowrap",
          display: showContact || showAbout || showCV || showGallery ? "none" : undefined,
          opacity: featuredRevealed ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}>
          <span className="marquee-text">
            {"Code & Graphic Design by Reid Surmeier \u00A9 2026\u2003\u2003\u2003Code & Graphic Design by Reid Surmeier \u00A9 2026"}
          </span>
        </div>
      </div>

      {/* === DETAIL VIEW OVERLAY (slides up from bottom) === */}
      {activeTile && (
        <div
          style={{
            position: "absolute",
            left: 0,
            width: "100%",
            height: "100%",
            top: `${detailTop}%`,
            transition: "top 0.5s ease-in-out",
            zIndex: 3000,
          }}
        >
          <DetailView
            tile={activeTile}
            section={activeSection}
            onClose={handleClose}
          />
        </div>
      )}
    </div>
  );
}
