"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ── About-page bouncing images (DVD screensaver style) ── */
const ABOUT_IMAGES = [
  "/about-img/img-1.webp",
  "/about-img/img-2.webp",
  "/about-img/img-3.webp",
  "/about-img/img-4.webp",
  "/about-img/img-5.webp",
  "/about-img/img-6.webp",
  "/about-img/img-7.webp",
  "/about-img/img-8.gif",
  "/about-img/img-9.png",
  "/about-img/img-10.png",
];

const PROX_CONNECT = 180;   // form connection when closer than this
const PROX_BREAK = 280;     // only break connection when farther than this (hysteresis)
const IMG_SIZE = 48;
const MAX_CONNECTIONS = Math.floor(ABOUT_IMAGES.length / 2); // 5
const PLUG_R = 3; // disc radius at line endpoints

function BouncingImages({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const statesRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const dotStartRefs = useRef<(SVGCircleElement | null)[]>([]);
  const dotEndRefs = useRef<(SVGCircleElement | null)[]>([]);
  const groupRefs = useRef<(SVGGElement | null)[]>([]);
  // Per-slot state: which pair it shows, and whether it's fading out
  const slotState = useRef<{ imgA: number; imgB: number; fadingOut: boolean; fadeStart: number }[]>(
    Array.from({ length: MAX_CONNECTIONS }, () => ({ imgA: -1, imgB: -1, fadingOut: false, fadeStart: 0 }))
  );
  const FADE_MS = 1200; // matches CSS transition duration

  const init = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    statesRef.current = ABOUT_IMAGES.map((_, i) => ({
      x: 20 + Math.random() * Math.max(0, w - IMG_SIZE - 20),
      y: Math.random() * Math.max(0, h - IMG_SIZE),
      vx: (0.15 + Math.random() * 0.25) * (i % 2 === 0 ? 1 : -1),
      vy: (0.12 + Math.random() * 0.22) * (i % 3 === 0 ? 1 : -1),
    }));
  }, [containerRef]);

  useEffect(() => {
    init();
    let cachedW = 0, cachedH = 0, frameCount = 0;
    const tick = () => {
      const el = containerRef.current;
      if (!el) { rafRef.current = requestAnimationFrame(tick); return; }
      // Only read layout dimensions every 30 frames to avoid forced reflow
      if (frameCount % 30 === 0 || cachedW === 0) {
        cachedW = el.offsetWidth;
        cachedH = el.offsetHeight;
      }
      frameCount++;
      const w = cachedW;
      const h = cachedH;
      const states = statesRef.current;

      // Move + wall bounce
      for (let i = 0; i < states.length; i++) {
        const s = states[i];
        s.x += s.vx;
        s.y += s.vy;
        if (s.x <= 0) { s.vx = Math.abs(s.vx); s.x = 0; }
        if (s.x >= w - IMG_SIZE) { s.vx = -Math.abs(s.vx); s.x = w - IMG_SIZE; }
        if (s.y <= 0) { s.vy = Math.abs(s.vy); s.y = 0; }
        if (s.y >= h - IMG_SIZE) { s.vy = -Math.abs(s.vy); s.y = h - IMG_SIZE; }
      }

      // Image-to-image collision
      for (let i = 0; i < states.length; i++) {
        for (let j = i + 1; j < states.length; j++) {
          const a = states[i];
          const b = states[j];
          const dx = (a.x + IMG_SIZE / 2) - (b.x + IMG_SIZE / 2);
          const dy = (a.y + IMG_SIZE / 2) - (b.y + IMG_SIZE / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = IMG_SIZE;
          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (minDist - dist) / 2;
            a.x += nx * overlap;
            a.y += ny * overlap;
            b.x -= nx * overlap;
            b.y -= ny * overlap;
            const dvx = a.vx - b.vx;
            const dvy = a.vy - b.vy;
            const dot = dvx * nx + dvy * ny;
            a.vx -= dot * nx;
            a.vy -= dot * ny;
            b.vx += dot * nx;
            b.vy += dot * ny;
          }
        }
      }

      // Update DOM — images
      for (let i = 0; i < states.length; i++) {
        const img = imgRefs.current[i];
        if (img) img.style.transform = `translate(${states[i].x}px, ${states[i].y}px)`;
      }

      // ── Stable proximity connections with hysteresis & fade ──
      const now = performance.now();
      const imgDist = (i: number, j: number) => {
        const dx = (states[i].x + IMG_SIZE / 2) - (states[j].x + IMG_SIZE / 2);
        const dy = (states[i].y + IMG_SIZE / 2) - (states[j].y + IMG_SIZE / 2);
        return Math.sqrt(dx * dx + dy * dy);
      };

      // Helper: render a connection into a slot
      const renderSlot = (si: number, iA: number, iB: number) => {
        const a = states[iA];
        const b = states[iB];
        const aIsLeft = a.x < b.x;
        const x1 = aIsLeft ? a.x + IMG_SIZE : a.x;
        const y1 = a.y + IMG_SIZE / 2;
        const x2 = aIsLeft ? b.x : b.x + IMG_SIZE;
        const y2 = b.y + IMG_SIZE / 2;
        const cpOff = Math.abs(x2 - x1) * 0.4;
        const d = `M${x1},${y1} C${x1 + (aIsLeft ? cpOff : -cpOff)},${y1} ${x2 + (aIsLeft ? -cpOff : cpOff)},${y2} ${x2},${y2}`;
        const path = pathRefs.current[si];
        const ds = dotStartRefs.current[si];
        const de = dotEndRefs.current[si];
        if (path) path.setAttribute("d", d);
        if (ds) { ds.setAttribute("cx", String(x1)); ds.setAttribute("cy", String(y1)); }
        if (de) { de.setAttribute("cx", String(x2)); de.setAttribute("cy", String(y2)); }
      };

      // Determine which pairs should be active
      const wantedPairs: { imgA: number; imgB: number }[] = [];
      const wantedUsed = new Set<number>();

      // Keep existing active (non-fading) slots that are within break threshold
      for (const slot of slotState.current) {
        if (slot.imgA < 0 || slot.fadingOut) continue;
        if (imgDist(slot.imgA, slot.imgB) < PROX_BREAK) {
          wantedPairs.push({ imgA: slot.imgA, imgB: slot.imgB });
          wantedUsed.add(slot.imgA);
          wantedUsed.add(slot.imgB);
        }
      }

      // Find new candidates
      const candidates: { i: number; j: number; dist: number }[] = [];
      for (let i = 0; i < states.length; i++) {
        if (wantedUsed.has(i)) continue;
        for (let j = i + 1; j < states.length; j++) {
          if (wantedUsed.has(j)) continue;
          const d = imgDist(i, j);
          if (d < PROX_CONNECT) candidates.push({ i, j, dist: d });
        }
      }
      candidates.sort((a, b) => a.dist - b.dist);
      for (const c of candidates) {
        if (wantedPairs.length >= MAX_CONNECTIONS) break;
        if (wantedUsed.has(c.i) || wantedUsed.has(c.j)) continue;
        wantedUsed.add(c.i);
        wantedUsed.add(c.j);
        wantedPairs.push({ imgA: c.i, imgB: c.j });
      }

      // Build a set of wanted pair keys for quick lookup
      const wantedSet = new Set(wantedPairs.map(p => `${Math.min(p.imgA, p.imgB)}-${Math.max(p.imgA, p.imgB)}`));

      // Update each slot
      for (let si = 0; si < MAX_CONNECTIONS; si++) {
        const slot = slotState.current[si];
        const g = groupRefs.current[si];
        const key = slot.imgA >= 0 ? `${Math.min(slot.imgA, slot.imgB)}-${Math.max(slot.imgA, slot.imgB)}` : "";

        if (slot.fadingOut) {
          // Still fading out — keep rendering last position, check if fade is done
          if (slot.imgA >= 0) renderSlot(si, slot.imgA, slot.imgB);
          if (now - slot.fadeStart > FADE_MS) {
            // Fade complete — slot is now free
            slot.imgA = -1;
            slot.imgB = -1;
            slot.fadingOut = false;
          }
          continue;
        }

        if (slot.imgA >= 0 && wantedSet.has(key)) {
          // Still wanted — update position, stay visible
          renderSlot(si, slot.imgA, slot.imgB);
          if (g) g.style.opacity = "1";
          wantedSet.delete(key);
        } else if (slot.imgA >= 0) {
          // No longer wanted — start fading out
          slot.fadingOut = true;
          slot.fadeStart = now;
          if (g) g.style.opacity = "0";
        } else {
          // Empty slot — try to assign a new pair
          // (handled below)
        }
      }

      // Assign remaining wanted pairs to empty (non-fading) slots
      const remaining = wantedPairs.filter(p => {
        const k = `${Math.min(p.imgA, p.imgB)}-${Math.max(p.imgA, p.imgB)}`;
        return wantedSet.has(k);
      });

      for (const p of remaining) {
        // Find a free slot (not active, not fading)
        const freeIdx = slotState.current.findIndex(s => s.imgA < 0 && !s.fadingOut);
        if (freeIdx < 0) break;
        const slot = slotState.current[freeIdx];
        slot.imgA = p.imgA;
        slot.imgB = p.imgB;
        slot.fadingOut = false;
        renderSlot(freeIdx, p.imgA, p.imgB);
        const g = groupRefs.current[freeIdx];
        if (g) g.style.opacity = "1";
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [containerRef, init]);

  return (
    <>
      {/* Fluid connection lines SVG */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
        {Array.from({ length: MAX_CONNECTIONS }, (_, i) => (
          <g
            key={i}
            ref={(el) => { groupRefs.current[i] = el; }}
            style={{ opacity: 0, transition: "opacity 1.2s ease" }}
          >
            <path
              ref={(el) => { pathRefs.current[i] = el; }}
              d="M0,0 C0,0 0,0 0,0"
              fill="none"
              stroke="#ddd"
              strokeWidth={2}
            />
            <circle ref={(el) => { dotStartRefs.current[i] = el; }} cx={0} cy={0} r={PLUG_R} fill="#ddd" />
            <circle ref={(el) => { dotEndRefs.current[i] = el; }} cx={0} cy={0} r={PLUG_R} fill="#ddd" />
          </g>
        ))}
      </svg>
      {/* Bouncing images */}
      {ABOUT_IMAGES.map((src, i) => (
        <img
          key={i}
          ref={(el) => { imgRefs.current[i] = el; }}
          src={src}
          alt=""
          draggable={false}
          loading="eager"
          decoding="async"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: IMG_SIZE,
            height: IMG_SIZE,
            objectFit: "contain",
            willChange: "transform",
          }}
        />
      ))}
    </>
  );
}



export default function AboutPage({ onClose, lang, onContact }: { onClose: () => void; lang: "en" | "de" | "fr" | "ko" | "id" | "zh" | "ja"; onContact?: () => void }) {
  void onClose;

  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRafRef = useRef<number>(0);
  const userPausedRef = useRef(false);
  const chartSectionRef = useRef<HTMLDivElement>(null);
  const bouncingContainerRef = useRef<HTMLDivElement>(null);
  const bioLeftRef = useRef<HTMLDivElement>(null);
  const bioRightRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Hard stop: cancel any fade animation AND pause the audio element
  const stopAudio = () => {
    userPausedRef.current = true;
    cancelAnimationFrame(fadeRafRef.current);
    fadeRafRef.current = 0;
    const a = audioRef.current;
    if (a) { a.pause(); a.currentTime = a.currentTime; } // force stop
    setIsPlaying(false);
  };

  // Auto-play with fade-in on mount, fade-out on unmount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    userPausedRef.current = false;
    audio.volume = 0;

    const doFadeIn = () => {
      const step = () => {
        if (userPausedRef.current || audio.paused) { fadeRafRef.current = 0; return; }
        const next = Math.min(1, audio.volume + 0.01);
        audio.volume = next;
        if (next < 1) { fadeRafRef.current = requestAnimationFrame(step); }
        else { fadeRafRef.current = 0; }
      };
      fadeRafRef.current = requestAnimationFrame(step);
    };

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => {
        if (userPausedRef.current) return; // user already clicked pause
        setIsPlaying(true);
        doFadeIn();
      }).catch(() => { /* autoplay blocked */ });
    }

    return () => {
      cancelAnimationFrame(fadeRafRef.current);
      // Fade out on unmount
      const a = audioRef.current;
      if (!a || a.paused) return;
      let v = a.volume;
      const fadeOut = setInterval(() => {
        v = Math.max(0, v - 0.03);
        if (a) a.volume = v;
        if (v <= 0) { clearInterval(fadeOut); if (a) a.pause(); }
      }, 40);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [subscribed, setSubscribed] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);

  // Fade in chart on scroll into view
  useEffect(() => {
    const el = chartSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setChartVisible(true); },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);



  const biosByLang: Record<string, string[]> = {
    en: [
      "Spending much of my childhood on a computer made me deeply curious about technology and its impact on culture and society. A lot of my work now is an attempt to make sense of what it means to be living in this hyper digital world, to understand what art can do in the present moment.",
      "Over the past few years, I\u2019ve grown disappointed and disillusioned with the current internet, specifically with social media and algorithmic consumption. Growing up with early YouTube and pre 2016 Instagram, I saw the potential these tools had, spaces that felt alive with meaning and thoughtfulness. That promise has since hollowed out.",
      "At their best, digital tools allow us to perceive parts of reality we were never meant to see. Technology broadens our understanding of what is real and gives us the ability to construct new realities entirely. There is an immense, almost utopian potential in these technologies. But that utopian vision has been steadily displaced by capitalism and the commercialization of digital space, by algorithmic flattening, by inauthenticity, by the all consuming desire to go viral, to reshape ourselves and our self presentation in service of metrics.",
      "Perhaps the most fundamental fact about any lived experience is that it depends on a way of looking. No way of looking reveals an objective reality. We are usually not aware of this, but Instagram feeds, stock market graphs, IQ scores, ratings, what Neil Postman called \u201Csoft technologies,\u201D have quietly replaced direct perception entirely. Furthermore, so much of the internet now cultivates hatred, bigotry, outrage, constant self judgment, and the anxious maintenance of meaningless social status games. All along, we are inevitably engaged in these mediated ways of relating to experience, and we are almost never aware of it.",
      "We\u2019ve arrived at a point where reality is dominated by models: algorithmic models, visual models, representations that have come to supersede the thing itself. We end up in a dark room with a video, and a video is an attack on the senses, transporting us into a world that shouldn\u2019t exist, making us see reality in a profoundly illusory way.",
      "This is the heart of my research: how do computers shape the most fundamental things, human relations, self understanding, and how have we displaced ourselves into this strange rut?",
      "My art practice has become a way to decouple from my own fabricated reality, to inquire more deeply into how appearances arise, to break down and question my habitual ways of looking. It is a development measured not in terms of goals, or achievement, pursuits I\u2019ve found deeply self alienating, but in terms of a genuine appreciation for life itself.",
      "There is little wonder that at the end of a session sitting before a painting, we feel more connected to ourselves. To make a painting meaningful, we must fill it with meaning; we must listen inward and channel the felt sense it evokes into the gaps the art leaves open. We must attune to ourselves. And so, when we step away, we feel closer to who we are.",
      "This is what art and writing offer me: a way to become more conscious of the world, to investigate and become less ignorant, to notice things and perhaps help others do the same, to piece these divergent fragments together into some kind of cohesiveness, and to contribute to a shared resource of attention and thoughtfulness.",
    ],
    de: [
      "Da ich einen Gro\u00DFteil meiner Kindheit am Computer verbracht habe, wurde ich zutiefst neugierig auf Technologie und ihre Auswirkungen auf Kultur und Gesellschaft. Ein Gro\u00DFteil meiner Arbeit ist heute der Versuch zu verstehen, was es bedeutet, in dieser hyperdigitalen Welt zu leben, und zu begreifen, was Kunst im gegenw\u00E4rtigen Moment leisten kann.",
      "In den letzten Jahren bin ich entt\u00E4uscht und desillusioniert vom aktuellen Internet, insbesondere von sozialen Medien und algorithmischem Konsum. Aufgewachsen mit dem fr\u00FChen YouTube und Instagram vor 2016, sah ich das Potenzial dieser Werkzeuge \u2013 R\u00E4ume, die sich lebendig anf\u00FChlten, voller Bedeutung und Nachdenklichkeit. Dieses Versprechen ist seither ausgehohlt worden.",
      "Im besten Fall erm\u00F6glichen uns digitale Werkzeuge, Teile der Realit\u00E4t wahrzunehmen, die wir nie sehen sollten. Technologie erweitert unser Verst\u00E4ndnis dessen, was real ist, und gibt uns die F\u00E4higkeit, v\u00F6llig neue Realit\u00E4ten zu konstruieren. Es gibt ein immenses, fast utopisches Potenzial in diesen Technologien. Aber diese utopische Vision wurde stetig verdr\u00E4ngt durch Kapitalismus und die Kommerzialisierung des digitalen Raums, durch algorithmische Verflachung, durch Unauthentizit\u00E4t, durch den alles verzehrenden Wunsch, viral zu gehen, uns selbst und unsere Selbstdarstellung in den Dienst von Metriken zu stellen.",
      "Vielleicht ist die grundlegendste Tatsache jeder gelebten Erfahrung, dass sie von einer Art des Schauens abh\u00E4ngt. Keine Art des Schauens enth\u00FCllt eine objektive Realit\u00E4t. Wir sind uns dessen normalerweise nicht bewusst, aber Instagram-Feeds, B\u00F6rsengrafiken, IQ-Werte, Bewertungen \u2013 was Neil Postman \u201Eweiche Technologien\u201C nannte \u2013 haben die direkte Wahrnehmung stillschweigend vollst\u00E4ndig ersetzt. Dar\u00FCber hinaus kultiviert so viel des Internets heute Hass, Bigotterie, Emp\u00F6rung, st\u00E4ndige Selbstverurteilung und die \u00E4ngstliche Aufrechterhaltung bedeutungsloser sozialer Statusspiele. Die ganze Zeit \u00FCber sind wir unvermeidlich in diese vermittelten Beziehungsweisen zur Erfahrung verstrickt, und wir sind uns dessen fast nie bewusst.",
      "Wir sind an einem Punkt angelangt, an dem die Realit\u00E4t von Modellen dominiert wird: algorithmischen Modellen, visuellen Modellen, Repr\u00E4sentationen, die das Ding selbst \u00FCberholt haben. Wir landen in einem dunklen Raum mit einem Video, und ein Video ist ein Angriff auf die Sinne, der uns in eine Welt transportiert, die nicht existieren sollte, und uns die Realit\u00E4t auf zutiefst illusorische Weise sehen l\u00E4sst.",
      "Dies ist der Kern meiner Forschung: Wie formen Computer die grundlegendsten Dinge \u2013 menschliche Beziehungen, Selbstverst\u00E4ndnis \u2013 und wie haben wir uns in diese seltsame Sackgasse man\u00F6vriert?",
      "Meine k\u00FCnstlerische Praxis ist zu einer M\u00F6glichkeit geworden, mich von meiner eigenen fabrizierten Realit\u00E4t zu l\u00F6sen, tiefer zu erforschen, wie Erscheinungen entstehen, und meine gewohnten Arten des Schauens aufzubrechen und zu hinterfragen. Es ist eine Entwicklung, die nicht in Bezug auf Ziele oder Leistung gemessen wird \u2013 Bestrebungen, die ich als zutiefst selbstentfremdend empfunden habe \u2013 sondern in Bezug auf eine echte Wertsch\u00E4tzung f\u00FCr das Leben selbst.",
      "Es ist kaum verwunderlich, dass wir uns am Ende einer Sitzung vor einem Gem\u00E4lde verbundener mit uns selbst f\u00FChlen. Um ein Gem\u00E4lde bedeutungsvoll zu machen, m\u00FCssen wir es mit Bedeutung f\u00FCllen; wir m\u00FCssen nach innen h\u00F6ren und das gef\u00FChlte Empfinden, das es hervorruft, in die L\u00FCcken lenken, die die Kunst offenl\u00E4sst. Wir m\u00FCssen uns auf uns selbst einstimmen. Und so f\u00FChlen wir uns, wenn wir zur\u00FCcktreten, n\u00E4her an dem, wer wir sind.",
      "Das ist es, was mir Kunst und Schreiben bieten: eine M\u00F6glichkeit, bewusster f\u00FCr die Welt zu werden, zu forschen und weniger unwissend zu werden, Dinge zu bemerken und vielleicht anderen zu helfen, dasselbe zu tun, diese divergierenden Fragmente zu einer Art Koh\u00E4renz zusammenzuf\u00FCgen und zu einer gemeinsamen Ressource der Aufmerksamkeit und Nachdenklichkeit beizutragen.",
    ],
    fr: [
      "Ayant pass\u00E9 une grande partie de mon enfance devant un ordinateur, j\u2019ai d\u00E9velopp\u00E9 une profonde curiosit\u00E9 pour la technologie et son impact sur la culture et la soci\u00E9t\u00E9. Une grande partie de mon travail est aujourd\u2019hui une tentative de comprendre ce que signifie vivre dans ce monde hyper num\u00E9rique, de saisir ce que l\u2019art peut faire dans le moment pr\u00E9sent.",
      "Au cours des derni\u00E8res ann\u00E9es, j\u2019ai \u00E9t\u00E9 de\u00E7u et d\u00E9sillusionn\u00E9 par l\u2019internet actuel, en particulier par les r\u00E9seaux sociaux et la consommation algorithmique. En grandissant avec le YouTube des d\u00E9buts et Instagram d\u2019avant 2016, j\u2019ai vu le potentiel de ces outils \u2013 des espaces qui semblaient vibrants de sens et de r\u00E9flexion. Cette promesse s\u2019est depuis vid\u00E9e de sa substance.",
      "Au mieux, les outils num\u00E9riques nous permettent de percevoir des parties de la r\u00E9alit\u00E9 que nous n\u2019\u00E9tions jamais cens\u00E9s voir. La technologie \u00E9largit notre compr\u00E9hension de ce qui est r\u00E9el et nous donne la capacit\u00E9 de construire des r\u00E9alit\u00E9s enti\u00E8rement nouvelles. Il y a un potentiel immense, presque utopique dans ces technologies. Mais cette vision utopique a \u00E9t\u00E9 progressivement d\u00E9plac\u00E9e par le capitalisme et la commercialisation de l\u2019espace num\u00E9rique, par l\u2019aplatissement algorithmique, par l\u2019inauthenticit\u00E9, par le d\u00E9sir d\u00E9vorant de devenir viral, de nous remodeler et de mettre notre pr\u00E9sentation de soi au service des m\u00E9triques.",
      "Le fait le plus fondamental de toute exp\u00E9rience v\u00E9cue est peut-\u00EAtre qu\u2019elle d\u00E9pend d\u2019une mani\u00E8re de regarder. Aucune mani\u00E8re de regarder ne r\u00E9v\u00E8le une r\u00E9alit\u00E9 objective. Nous n\u2019en sommes g\u00E9n\u00E9ralement pas conscients, mais les fils Instagram, les graphiques boursiers, les scores de QI, les notes \u2013 ce que Neil Postman appelait les \u00AB technologies douces \u00BB \u2013 ont silencieusement remplac\u00E9 enti\u00E8rement la perception directe. De plus, une grande partie d\u2019internet cultive d\u00E9sormais la haine, le fanatisme, l\u2019indignation, le jugement de soi constant et le maintien anxieux de jeux de statut social d\u00E9nu\u00E9s de sens. Tout du long, nous sommes in\u00E9vitablement engag\u00E9s dans ces modes m\u00E9diatis\u00E9s de relation \u00E0 l\u2019exp\u00E9rience, et nous n\u2019en sommes presque jamais conscients.",
      "Nous sommes arriv\u00E9s \u00E0 un point o\u00F9 la r\u00E9alit\u00E9 est domin\u00E9e par des mod\u00E8les : mod\u00E8les algorithmiques, mod\u00E8les visuels, repr\u00E9sentations qui ont fini par supplanter la chose elle-m\u00EAme. Nous nous retrouvons dans une pi\u00E8ce sombre avec une vid\u00E9o, et une vid\u00E9o est une attaque des sens, nous transportant dans un monde qui ne devrait pas exister, nous faisant voir la r\u00E9alit\u00E9 de mani\u00E8re profond\u00E9ment illusoire.",
      "C\u2019est le c\u0153ur de ma recherche : comment les ordinateurs fa\u00E7onnent-ils les choses les plus fondamentales \u2013 les relations humaines, la compr\u00E9hension de soi \u2013 et comment nous sommes-nous d\u00E9plac\u00E9s dans cette \u00E9trange impasse ?",
      "Ma pratique artistique est devenue un moyen de me d\u00E9coupler de ma propre r\u00E9alit\u00E9 fabriqu\u00E9e, d\u2019explorer plus profond\u00E9ment comment les apparences naissent, de d\u00E9construire et questionner mes mani\u00E8res habituelles de regarder. C\u2019est un d\u00E9veloppement mesur\u00E9 non pas en termes d\u2019objectifs ou de r\u00E9alisations \u2013 des pursuits que j\u2019ai trouv\u00E9es profond\u00E9ment ali\u00E9nantes \u2013 mais en termes d\u2019une v\u00E9ritable appr\u00E9ciation de la vie elle-m\u00EAme.",
      "Il n\u2019est gu\u00E8re \u00E9tonnant qu\u2019\u00E0 la fin d\u2019une s\u00E9ance devant une peinture, nous nous sentions plus connect\u00E9s \u00E0 nous-m\u00EAmes. Pour rendre une peinture significative, nous devons la remplir de sens ; nous devons \u00E9couter en nous-m\u00EAmes et canaliser le ressenti qu\u2019elle \u00E9voque dans les espaces que l\u2019art laisse ouverts. Nous devons nous accorder \u00E0 nous-m\u00EAmes. Et ainsi, quand nous nous \u00E9loignons, nous nous sentons plus proches de qui nous sommes.",
      "Voici ce que l\u2019art et l\u2019\u00E9criture m\u2019offrent : un moyen de devenir plus conscient du monde, d\u2019investiguer et de devenir moins ignorant, de remarquer les choses et peut-\u00EAtre d\u2019aider les autres \u00E0 faire de m\u00EAme, de rassembler ces fragments divergents en une sorte de coh\u00E9rence, et de contribuer \u00E0 une ressource partag\u00E9e d\u2019attention et de r\u00E9flexion.",
    ],
    ko: [
      "\uc5b4\ub9b0 \uc2dc\uc808 \ub300\ubd80\ubd84\uc744 \ucef4\ud4e8\ud130 \uc55e\uc5d0\uc11c \ubcf4\ub0b4\uba74\uc11c, \uae30\uc220\uacfc \uadf8\uac83\uc774 \ubb38\ud654\uc640 \uc0ac\ud68c\uc5d0 \ubbf8\uce58\ub294 \uc601\ud5a5\uc5d0 \ub300\ud574 \uae4a\uc740 \ud638\uae30\uc2ec\uc744 \uac16\uac8c \ub418\uc5c8\uc2b5\ub2c8\ub2e4. \uc9c0\uae08 \uc81c \uc791\uc5c5\uc758 \ub9ce\uc740 \ubd80\ubd84\uc740 \uc774 \ucd08\ub514\uc9c0\ud138 \uc138\uacc4\uc5d0\uc11c \uc0b0\ub2e4\ub294 \uac83\uc774 \ubb34\uc5c7\uc744 \uc758\ubbf8\ud558\ub294\uc9c0, \ud604\uc7ac\uc758 \uc21c\uac04\uc5d0 \uc608\uc220\uc774 \ubb34\uc5c7\uc744 \ud560 \uc218 \uc788\ub294\uc9c0\ub97c \uc774\ud574\ud558\ub824\ub294 \uc2dc\ub3c4\uc785\ub2c8\ub2e4.",
      "\uc9c0\ub09c \uba87 \ub144\uac04 \uc800\ub294 \ud604\uc7ac\uc758 \uc778\ud130\ub137, \ud2b9\ud788 \uc18c\uc15c \ubbf8\ub514\uc5b4\uc640 \uc54c\uace0\ub9ac\uc998 \uc18c\ube44\uc5d0 \ub300\ud574 \uc2e4\ub9dd\ud558\uace0 \ud658\uba78\uc744 \ub290\uaf08\uc2b5\ub2c8\ub2e4. \ucd08\uae30 YouTube\uc640 2016\ub144 \uc774\uc804\uc758 Instagram\uacfc \ud568\uaed8 \uc131\uc7a5\ud558\uba74\uc11c, \uc800\ub294 \uc774 \ub3c4\uad6c\ub4e4\uc774 \uac00\uc9c4 \uc7a0\uc7ac\ub825\uc744 \ubcf4\uc558\uc2b5\ub2c8\ub2e4 \u2013 \uc758\ubbf8\uc640 \uc0ac\ub824 \uae4a\uc74c\uc73c\ub85c \uc0b4\uc544 \uc788\ub294 \ub290\ub08c\uc758 \uacf5\uac04\ub4e4. \uadf8 \uc57d\uc18d\uc740 \uc774\ud6c4\ub85c \ud150 \ube44\uc5b4\ubc84\ub838\uc2b5\ub2c8\ub2e4.",
      "\ub514\uc9c0\ud138 \ub3c4\uad6c\ub294 \ucd5c\uc120\uc758 \uacbd\uc6b0, \uc6b0\ub9ac\uac00 \uacb0\ucf54 \ubcfc \uc218 \uc5c6\uc5c8\ub358 \ud604\uc2e4\uc758 \ubd80\ubd84\ub4e4\uc744 \uc778\uc2dd\ud560 \uc218 \uc788\uac8c \ud574\uc90d\ub2c8\ub2e4. \uae30\uc220\uc740 \uc2e4\uc7ac\ud558\ub294 \uac83\uc5d0 \ub300\ud55c \uc6b0\ub9ac\uc758 \uc774\ud574\ub97c \ub113\ud788\uace0 \uc644\uc804\ud788 \uc0c8\ub85c\uc6b4 \ud604\uc2e4\uc744 \uad6c\ucd95\ud560 \uc218 \uc788\ub294 \ub2a5\ub825\uc744 \uc90d\ub2c8\ub2e4. \uc774 \uae30\uc220\ub4e4\uc5d0\ub294 \uac70\ub300\ud558\uace0 \uac70\uc758 \uc720\ud1a0\ud53c\uc801\uc778 \uc7a0\uc7ac\ub825\uc774 \uc788\uc2b5\ub2c8\ub2e4. \ud558\uc9c0\ub9cc \uadf8 \uc720\ud1a0\ud53c\uc801 \ube44\uc804\uc740 \uc790\ubcf8\uc8fc\uc758\uc640 \ub514\uc9c0\ud138 \uacf5\uac04\uc758 \uc0c1\uc5c5\ud654, \uc54c\uace0\ub9ac\uc998\uc801 \ud3c9\ud0c4\ud654, \ube44\uc9c4\uc815\uc131, \ubc14\uc774\ub7f4\uc774 \ub418\ub824\ub294 \ubaa8\ub4e0 \uac83\uc744 \uc9d1\uc5b4\uc0bc\ud0a4\ub294 \uc695\ub9dd\uc5d0 \uc758\ud574 \uafb8\uc900\ud788 \ub300\uccb4\ub418\uc5c8\uc2b5\ub2c8\ub2e4.",
      "\uc5b4\ub5a4 \uc0b6\uc758 \uacbd\ud5d8\uc5d0 \ub300\ud55c \uac00\uc7a5 \uadfc\ubcf8\uc801\uc778 \uc0ac\uc2e4\uc740 \uc544\ub9c8\ub3c4 \uadf8\uac83\uc774 \ubcf4\ub294 \ubc29\uc2dd\uc5d0 \ub2ec\ub824 \uc788\ub2e4\ub294 \uac83\uc785\ub2c8\ub2e4. \uc5b4\ub5a4 \ubcf4\ub294 \ubc29\uc2dd\ub3c4 \uac1d\uad00\uc801 \ud604\uc2e4\uc744 \ub4dc\ub7ec\ub0b4\uc9c0 \ubabb\ud569\ub2c8\ub2e4. \uc6b0\ub9ac\ub294 \ubcf4\ud1b5 \uc774\uac83\uc744 \uc758\uc2dd\ud558\uc9c0 \ubabb\ud558\uc9c0\ub9cc, \uc778\uc2a4\ud0c0\uadf8\ub7a8 \ud53c\ub4dc, \uc8fc\uc2dd \uadf8\ub798\ud504, IQ \uc810\uc218, \ud3c9\uc810 \u2013 \ub2d0 \ud3ec\uc2a4\ud2b8\ub9cc\uc774 \u201C\uc18c\ud504\ud2b8 \ud14c\ud06c\ub180\ub85c\uc9c0\u201D\ub77c\uace0 \ubd80\ub978 \uac83\ub4e4\uc774 \uc870\uc6a9\ud788 \uc9c1\uc811\uc801 \uc778\uc2dd\uc744 \uc644\uc804\ud788 \ub300\uccb4\ud588\uc2b5\ub2c8\ub2e4. \ub354\uc6b1\uc774, \uc9c0\uae08\uc758 \uc778\ud130\ub137 \ub9ce\uc740 \ubd80\ubd84\uc740 \uc99d\uc624, \ud3b8\uacac, \ubd84\ub178, \ub04a\uc784\uc5c6\ub294 \uc790\uae30 \ud310\ub2e8, \uadf8\ub9ac\uace0 \ubb34\uc758\ubbf8\ud55c \uc0ac\ud68c\uc801 \uc9c0\uc704 \uac8c\uc784\uc758 \ubd88\uc548\ud55c \uc720\uc9c0\ub97c \uae30\ub974\uace0 \uc788\uc2b5\ub2c8\ub2e4. \uacc4\uc18d\ud574\uc11c \uc6b0\ub9ac\ub294 \ud544\uc5f0\uc801\uc73c\ub85c \uc774\ub7ec\ud55c \ub9e4\uac1c\ub41c \uacbd\ud5d8 \uad00\uacc4 \ubc29\uc2dd\uc5d0 \uad00\uc5ec\ud558\uace0 \uc788\uc73c\uba70, \uac70\uc758 \uc758\uc2dd\ud558\uc9c0 \ubabb\ud569\ub2c8\ub2e4.",
      "\uc6b0\ub9ac\ub294 \ud604\uc2e4\uc774 \ubaa8\ub378\uc5d0 \uc758\ud574 \uc9c0\ubc30\ub418\ub294 \uc9c0\uc810\uc5d0 \ub3c4\ub2ec\ud588\uc2b5\ub2c8\ub2e4: \uc54c\uace0\ub9ac\uc998 \ubaa8\ub378, \uc2dc\uac01\uc801 \ubaa8\ub378, \uadf8 \uc790\uccb4\ub97c \ub300\uccb4\ud558\uac8c \ub41c \ud45c\ud604\ub4e4. \uc6b0\ub9ac\ub294 \uc5b4\ub450\uc6b4 \ubc29\uc5d0\uc11c \ube44\ub514\uc624\uc640 \ud568\uaed8 \ub05d\ub098\uace0, \ube44\ub514\uc624\ub294 \uac10\uac01\uc5d0 \ub300\ud55c \uacf5\uaca9\uc774\uba70, \uc874\uc7ac\ud574\uc11c\ub294 \uc548 \ub420 \uc138\uacc4\ub85c \uc6b0\ub9ac\ub97c \uc6b4\ubc18\ud558\uc5ec \ud604\uc2e4\uc744 \uae4a\uc774 \ud658\uc0c1\uc801\uc778 \ubc29\uc2dd\uc73c\ub85c \ubcf4\uac8c \ud569\ub2c8\ub2e4.",
      "\uc774\uac83\uc774 \uc81c \uc5f0\uad6c\uc758 \ud575\uc2ec\uc785\ub2c8\ub2e4: \ucef4\ud4e8\ud130\ub294 \uac00\uc7a5 \uadfc\ubcf8\uc801\uc778 \uac83\ub4e4 \u2013 \uc778\uac04 \uad00\uacc4, \uc790\uae30 \uc774\ud574 \u2013 \uc744 \uc5b4\ub5bb\uac8c \ud615\uc131\ud558\ub294\uac00, \uadf8\ub9ac\uace0 \uc6b0\ub9ac\ub294 \uc5b4\ub5bb\uac8c \uc774 \uc774\uc0c1\ud55c \uad6c\ub835\uc73c\ub85c \uc6b0\ub9ac \uc790\uc2e0\uc744 \ub0b4\ubab0\uc558\ub294\uac00?",
      "\uc81c \uc608\uc220 \uc2e4\ucc9c\uc740 \uc81c \uc790\uc2e0\uc758 \ub9cc\ub4e4\uc5b4\uc9c4 \ud604\uc2e4\ub85c\ubd80\ud130 \ubd84\ub9ac\ub418\ub294 \ubc29\ubc95, \uc678\uad00\uc774 \uc5b4\ub5bb\uac8c \ub098\ud0c0\ub098\ub294\uc9c0 \ub354 \uae4a\uc774 \ud0d0\uad6c\ud558\ub294 \ubc29\ubc95, \uc2b5\uad00\uc801\uc778 \ubcf4\ub294 \ubc29\uc2dd\uc744 \ud574\uccb4\ud558\uace0 \uc758\ubb38\uc744 \uc81c\uae30\ud558\ub294 \ubc29\ubc95\uc774 \ub418\uc5c8\uc2b5\ub2c8\ub2e4. \uc774\uac83\uc740 \ubaa9\ud45c\ub098 \uc131\ucde8 \u2013 \uc81c\uac00 \uae4a\uc774 \uc790\uae30 \uc18c\uc678\uc801\uc774\ub77c\uace0 \ub290\ub080 \ucd94\uad6c\ub4e4 \u2013 \uc758 \uad00\uc810\uc774 \uc544\ub2c8\ub77c \uc0b6 \uc790\uccb4\uc5d0 \ub300\ud55c \uc9c4\uc815\ud55c \uac10\uc0ac\uc758 \uad00\uc810\uc5d0\uc11c \uce21\uc815\ub418\ub294 \ubc1c\uc804\uc785\ub2c8\ub2e4.",
      "\uadf8\ub9bc \uc55e\uc5d0 \uc55e\uc544 \uc788\ub294 \uc2dc\uac04\uc774 \ub05d\ub098\uba74 \uc6b0\ub9ac\uac00 \uc6b0\ub9ac \uc790\uc2e0\uacfc \ub354 \uc5f0\uacb0\ub418\uc5b4 \uc788\ub2e4\uace0 \ub290\ub07c\ub294 \uac83\uc740 \ub180\ub77c\uc6b4 \uc77c\uc774 \uc544\ub2d9\ub2c8\ub2e4. \uadf8\ub9bc\uc744 \uc758\ubbf8 \uc788\uac8c \ub9cc\ub4e4\ub824\uba74, \uc6b0\ub9ac\ub294 \uadf8\uac83\uc744 \uc758\ubbf8\ub85c \ucc44\uc6cc\uc57c \ud569\ub2c8\ub2e4; \ub0b4\uba74\uc744 \uacbd\uccad\ud558\uace0 \uc608\uc220\uc774 \uc5f4\uc5b4\ub193\ub294 \ud2c8\uc0c8\ub85c \uadf8\uac83\uc774 \ud658\uae30\ud558\ub294 \ub290\ub08c\uc758 \uac10\uac01\uc744 \uc804\ub2ec\ud574\uc57c \ud569\ub2c8\ub2e4. \uc6b0\ub9ac\ub294 \uc6b0\ub9ac \uc790\uc2e0\uc5d0\uac8c \uc870\uc728\ud574\uc57c \ud569\ub2c8\ub2e4. \uadf8\ub798\uc11c \ub5a0\ub0a0 \ub54c, \uc6b0\ub9ac\ub294 \uc6b0\ub9ac\uac00 \ub204\uad6c\uc778\uc9c0\uc5d0 \ub354 \uac00\uae4c\uc6cc\uc9c4 \ub290\ub08c\uc744 \ubc1b\uc2b5\ub2c8\ub2e4.",
      "\uc774\uac83\uc774 \uc608\uc220\uacfc \uae00\uc4f0\uae30\uac00 \uc81c\uac8c \uc81c\uacf5\ud558\ub294 \uac83\uc785\ub2c8\ub2e4: \uc138\uc0c1\uc744 \ub354 \uc758\uc2dd\ud558\uac8c \ub418\ub294 \ubc29\ubc95, \ud0d0\uad6c\ud558\uace0 \ub35c \ubb34\uc9c0\ud574\uc9c0\ub294 \ubc29\ubc95, \uac83\ub4e4\uc744 \uc54c\uc544\ucc28\ub9ac\uace0 \uc544\ub9c8\ub3c4 \ub2e4\ub978 \uc0ac\ub78c\ub4e4\ub3c4 \uadf8\ub807\uac8c \ud558\ub3c4\ub85d \ub3d5\ub294 \ubc29\ubc95, \uc774 \ub2e4\uc591\ud55c \ub2e8\ud3b8\ub4e4\uc744 \uc77c\uc885\uc758 \uc751\uc9d1\ub825\uc73c\ub85c \uc5ee\uc5b4\ub0b4\ub294 \ubc29\ubc95, \uadf8\ub9ac\uace0 \uad00\uc2ec\uacfc \uc0ac\ub824 \uae4a\uc74c\uc758 \uacf5\uc720 \uc790\uc6d0\uc5d0 \uae30\uc5ec\ud558\ub294 \ubc29\ubc95.",
    ],
    id: [
      "Menghabiskan sebagian besar masa kecil saya di depan komputer membuat saya sangat penasaran tentang teknologi dan dampaknya terhadap budaya dan masyarakat. Banyak dari karya saya sekarang adalah upaya untuk memahami apa artinya hidup di dunia hyper digital ini, untuk memahami apa yang bisa dilakukan seni di saat ini.",
      "Selama beberapa tahun terakhir, saya semakin kecewa dan kehilangan ilusi terhadap internet saat ini, khususnya media sosial dan konsumsi algoritmik. Tumbuh besar dengan YouTube awal dan Instagram sebelum 2016, saya melihat potensi yang dimiliki alat-alat ini \u2013 ruang-ruang yang terasa hidup dengan makna dan kedalaman pikiran. Janji itu sejak saat itu telah memudar.",
      "Pada kondisi terbaiknya, alat digital memungkinkan kita memahami bagian-bagian realitas yang tidak pernah seharusnya kita lihat. Teknologi memperluas pemahaman kita tentang apa yang nyata dan memberi kita kemampuan untuk membangun realitas baru sepenuhnya. Ada potensi besar, hampir utopis dalam teknologi-teknologi ini. Tetapi visi utopis itu terus digeser oleh kapitalisme dan komersialisasi ruang digital, oleh penyamarataan algoritmik, oleh ketidakotentikan, oleh keinginan yang melahap segalanya untuk menjadi viral, untuk membentuk ulang diri kita dan presentasi diri kita demi metrik.",
      "Mungkin fakta paling mendasar tentang pengalaman hidup apa pun adalah bahwa ia bergantung pada cara melihat. Tidak ada cara melihat yang mengungkapkan realitas objektif. Kita biasanya tidak menyadari ini, tetapi feed Instagram, grafik pasar saham, skor IQ, penilaian \u2013 apa yang Neil Postman sebut \u201Cteknologi lunak\u201D \u2013 telah diam-diam menggantikan persepsi langsung sepenuhnya. Lebih jauh lagi, begitu banyak dari internet sekarang membudidayakan kebencian, kefanatikan, kemarahan, penilaian diri yang konstan, dan pemeliharaan cemas permainan status sosial yang tidak bermakna. Sepanjang waktu, kita tak terhindarkan terlibat dalam cara-cara bermediasi ini dalam berhubungan dengan pengalaman, dan kita hampir tidak pernah menyadarinya.",
      "Kita telah tiba di titik di mana realitas didominasi oleh model: model algoritmik, model visual, representasi yang telah menggantikan hal itu sendiri. Kita berakhir di ruangan gelap dengan video, dan video adalah serangan terhadap indera, membawa kita ke dunia yang seharusnya tidak ada, membuat kita melihat realitas dengan cara yang sangat ilusif.",
      "Inilah inti penelitian saya: bagaimana komputer membentuk hal-hal paling mendasar \u2013 hubungan manusia, pemahaman diri \u2013 dan bagaimana kita telah mendorong diri kita ke dalam kebuntuan aneh ini?",
      "Praktik seni saya telah menjadi cara untuk memisahkan diri dari realitas buatan saya sendiri, untuk menyelidiki lebih dalam bagaimana penampilan muncul, untuk membongkar dan mempertanyakan cara-cara kebiasaan saya dalam melihat. Ini adalah perkembangan yang diukur bukan dari segi tujuan, atau pencapaian \u2013 pengejaran yang saya temukan sangat mengasingkan diri \u2013 tetapi dari segi penghargaan yang tulus terhadap kehidupan itu sendiri.",
      "Tidak heran bahwa di akhir sesi duduk di depan lukisan, kita merasa lebih terhubung dengan diri kita sendiri. Untuk membuat lukisan bermakna, kita harus mengisinya dengan makna; kita harus mendengarkan ke dalam dan menyalurkan perasaan yang ditimbulkannya ke dalam celah-celah yang dibiarkan terbuka oleh seni. Kita harus menyelaraskan diri kita sendiri. Dan jadi, ketika kita melangkah pergi, kita merasa lebih dekat dengan siapa kita sebenarnya.",
      "Inilah yang ditawarkan seni dan tulisan kepada saya: cara untuk menjadi lebih sadar akan dunia, untuk menyelidiki dan menjadi kurang bodoh, untuk memperhatikan hal-hal dan mungkin membantu orang lain melakukan hal yang sama, untuk menyatukan fragmen-fragmen yang berbeda ini menjadi semacam kepaduan, dan untuk berkontribusi pada sumber daya bersama perhatian dan kedalaman pikiran.",
    ],
    zh: [
      "\u7ae5\u5e74\u65f6\u5149\u5927\u90e8\u5206\u82b1\u5728\u7535\u8111\u524d\uff0c\u8ba9\u6211\u5bf9\u6280\u672f\u53ca\u5176\u5bf9\u6587\u5316\u548c\u793e\u4f1a\u7684\u5f71\u54cd\u4ea7\u751f\u4e86\u6df1\u6df1\u7684\u597d\u5947\u3002\u6211\u73b0\u5728\u7684\u8bb8\u591a\u5de5\u4f5c\u662f\u8bd5\u56fe\u7406\u89e3\u751f\u6d3b\u5728\u8fd9\u4e2a\u8d85\u7ea7\u6570\u5b57\u4e16\u754c\u4e2d\u610f\u5473\u7740\u4ec0\u4e48\uff0c\u7406\u89e3\u827a\u672f\u5728\u5f53\u4e0b\u80fd\u505a\u4ec0\u4e48\u3002",
      "\u5728\u8fc7\u53bb\u51e0\u5e74\u91cc\uff0c\u6211\u5bf9\u5f53\u524d\u7684\u4e92\u8054\u7f51\u8d8a\u6765\u8d8a\u5931\u671b\u548c\u5e7b\u706d\uff0c\u5c24\u5176\u662f\u793e\u4ea4\u5a92\u4f53\u548c\u7b97\u6cd5\u6d88\u8d39\u3002\u4f34\u968f\u7740\u65e9\u671fYouTube\u548c2016\u5e74\u4ee5\u524d\u7684Instagram\u6210\u957f\uff0c\u6211\u770b\u5230\u4e86\u8fd9\u4e9b\u5de5\u5177\u7684\u6f5c\u529b\u2014\u2014\u90a3\u4e9b\u5145\u6ee1\u610f\u4e49\u548c\u6df1\u601d\u7684\u6d3b\u8dc3\u7a7a\u95f4\u3002\u90a3\u4e2a\u627f\u8bfa\u6b64\u540e\u5df2\u7ecf\u7a7a\u6d1e\u5316\u4e86\u3002",
      "\u6570\u5b57\u5de5\u5177\u5728\u6700\u597d\u7684\u60c5\u51b5\u4e0b\uff0c\u8ba9\u6211\u4eec\u80fd\u591f\u611f\u77e5\u6211\u4eec\u672c\u4e0d\u5e94\u8be5\u770b\u5230\u7684\u73b0\u5b9e\u90e8\u5206\u3002\u6280\u672f\u62d3\u5bbd\u4e86\u6211\u4eec\u5bf9\u73b0\u5b9e\u7684\u7406\u89e3\uff0c\u5e76\u8d4b\u4e88\u6211\u4eec\u6784\u5efa\u5168\u65b0\u73b0\u5b9e\u7684\u80fd\u529b\u3002\u8fd9\u4e9b\u6280\u672f\u4e2d\u6709\u7740\u5de8\u5927\u7684\u3001\u51e0\u4e4e\u4e4e\u4e4e\u4e4e\u4e4e\u662f\u4e4c\u6258\u90a6\u5f0f\u7684\u6f5c\u529b\u3002\u4f46\u8fd9\u79cd\u4e4c\u6258\u90a6\u613f\u666f\u5df2\u7ecf\u88ab\u8d44\u672c\u4e3b\u4e49\u548c\u6570\u5b57\u7a7a\u95f4\u7684\u5546\u4e1a\u5316\u3001\u7b97\u6cd5\u5316\u7684\u5e73\u5766\u5316\u3001\u4e0d\u771f\u5b9e\u6027\u3001\u4ee5\u53ca\u60f3\u8981\u8d70\u7ea2\u7684\u541e\u566c\u4e00\u5207\u7684\u6b32\u671b\u6240\u7a33\u6b65\u53d6\u4ee3\u3002",
      "\u4efb\u4f55\u751f\u6d3b\u7ecf\u9a8c\u6700\u6839\u672c\u7684\u4e8b\u5b9e\u4e5f\u8bb8\u662f\uff0c\u5b83\u53d6\u51b3\u4e8e\u4e00\u79cd\u770b\u7684\u65b9\u5f0f\u3002\u6ca1\u6709\u4efb\u4f55\u4e00\u79cd\u770b\u7684\u65b9\u5f0f\u80fd\u63ed\u793a\u5ba2\u89c2\u73b0\u5b9e\u3002\u6211\u4eec\u901a\u5e38\u610f\u8bc6\u4e0d\u5230\u8fd9\u4e00\u70b9\uff0c\u4f46Instagram\u52a8\u6001\u3001\u80a1\u5e02\u56fe\u8868\u3001\u667a\u5546\u5206\u6570\u3001\u8bc4\u5206\u2014\u2014\u5c3c\u5c14\u00b7\u6ce2\u65af\u66fc\u6240\u8bf4\u7684\u201c\u8f6f\u6280\u672f\u201d\u2014\u2014\u5df2\u7ecf\u6084\u7136\u5b8c\u5168\u53d6\u4ee3\u4e86\u76f4\u63a5\u611f\u77e5\u3002\u6b64\u5916\uff0c\u73b0\u5728\u4e92\u8054\u7f51\u7684\u5f88\u5927\u4e00\u90e8\u5206\u5728\u57f9\u517b\u4ec7\u6068\u3001\u504f\u6267\u3001\u6124\u6012\u3001\u6301\u7eed\u7684\u81ea\u6211\u8bc4\u5224\uff0c\u4ee5\u53ca\u5bf9\u6beb\u65e0\u610f\u4e49\u7684\u793e\u4f1a\u5730\u4f4d\u6e38\u620f\u7684\u7126\u8651\u7ef4\u62a4\u3002\u59cb\u7ec8\uff0c\u6211\u4eec\u4e0d\u53ef\u907f\u514d\u5730\u53c2\u4e0e\u8fd9\u4e9b\u5a92\u4ecb\u5316\u7684\u4e0e\u7ecf\u9a8c\u5173\u8054\u7684\u65b9\u5f0f\uff0c\u800c\u6211\u4eec\u51e0\u4e4e\u4ece\u672a\u610f\u8bc6\u5230\u8fd9\u4e00\u70b9\u3002",
      "\u6211\u4eec\u5df2\u7ecf\u5230\u8fbe\u4e86\u4e00\u4e2a\u73b0\u5b9e\u88ab\u6a21\u578b\u4e3b\u5bfc\u7684\u5730\u6b65\uff1a\u7b97\u6cd5\u6a21\u578b\u3001\u89c6\u89c9\u6a21\u578b\u3001\u5df2\u7ecf\u53d6\u4ee3\u4e86\u4e8b\u7269\u672c\u8eab\u7684\u8868\u5f81\u3002\u6211\u4eec\u6700\u7ec8\u5728\u4e00\u4e2a\u9ed1\u6697\u7684\u623f\u95f4\u91cc\u770b\u89c6\u9891\uff0c\u89c6\u9891\u662f\u5bf9\u611f\u5b98\u7684\u653b\u51fb\uff0c\u5c06\u6211\u4eec\u4f20\u9001\u5230\u4e00\u4e2a\u4e0d\u5e94\u5b58\u5728\u7684\u4e16\u754c\uff0c\u8ba9\u6211\u4eec\u4ee5\u6df1\u523b\u7684\u5e7b\u89c9\u65b9\u5f0f\u770b\u5f85\u73b0\u5b9e\u3002",
      "\u8fd9\u662f\u6211\u7814\u7a76\u7684\u6838\u5fc3\uff1a\u7535\u8111\u5982\u4f55\u5851\u9020\u6700\u57fa\u672c\u7684\u4e1c\u897f\u2014\u2014\u4eba\u9645\u5173\u7cfb\u3001\u81ea\u6211\u7406\u89e3\u2014\u2014\u4ee5\u53ca\u6211\u4eec\u662f\u5982\u4f55\u628a\u81ea\u5df1\u7f6e\u4e8e\u8fd9\u4e2a\u5947\u602a\u7684\u56f0\u5883\u4e2d\u7684\uff1f",
      "\u6211\u7684\u827a\u672f\u5b9e\u8df5\u5df2\u7ecf\u6210\u4e3a\u4e00\u79cd\u4ece\u6211\u81ea\u5df1\u5236\u9020\u7684\u73b0\u5b9e\u4e2d\u8131\u79bb\u7684\u65b9\u5f0f\uff0c\u66f4\u6df1\u5165\u5730\u63a2\u7a76\u8868\u8c61\u5982\u4f55\u4ea7\u751f\uff0c\u6253\u7834\u548c\u8d28\u7591\u6211\u4e60\u60ef\u6027\u7684\u770b\u7684\u65b9\u5f0f\u3002\u8fd9\u662f\u4e00\u79cd\u4e0d\u662f\u4ee5\u76ee\u6807\u6216\u6210\u5c31\u6765\u8861\u91cf\u7684\u53d1\u5c55\u2014\u2014\u90a3\u4e9b\u8ffd\u6c42\u6211\u53d1\u73b0\u662f\u6df1\u5ea6\u81ea\u6211\u5f02\u5316\u7684\u2014\u2014\u800c\u662f\u4ee5\u5bf9\u751f\u6d3b\u672c\u8eab\u771f\u6b63\u7684\u611f\u6fc0\u6765\u8861\u91cf\u7684\u3002",
      "\u5728\u4e00\u5e45\u753b\u524d\u5750\u5b8c\u4e00\u573a\u4f1a\u8bae\u540e\uff0c\u6211\u4eec\u611f\u5230\u4e0e\u81ea\u5df1\u66f4\u52a0\u8fde\u63a5\uff0c\u8fd9\u4e00\u70b9\u4e5f\u4e0d\u5947\u602a\u3002\u8981\u8ba9\u4e00\u5e45\u753b\u6709\u610f\u4e49\uff0c\u6211\u4eec\u5fc5\u987b\u7528\u610f\u4e49\u586b\u5145\u5b83\uff1b\u6211\u4eec\u5fc5\u987b\u5411\u5185\u503e\u542c\uff0c\u5c06\u5b83\u5524\u8d77\u7684\u611f\u89c9\u5f15\u5bfc\u5230\u827a\u672f\u7559\u4e0b\u7684\u7a7a\u9699\u4e2d\u3002\u6211\u4eec\u5fc5\u987b\u8c03\u9891\u5230\u81ea\u5df1\u3002\u56e0\u6b64\uff0c\u5f53\u6211\u4eec\u79bb\u5f00\u65f6\uff0c\u6211\u4eec\u611f\u89c9\u66f4\u63a5\u8fd1\u771f\u5b9e\u7684\u81ea\u5df1\u3002",
      "\u8fd9\u5c31\u662f\u827a\u672f\u548c\u5199\u4f5c\u7ed9\u6211\u7684\uff1a\u4e00\u79cd\u66f4\u52a0\u610f\u8bc6\u5230\u4e16\u754c\u7684\u65b9\u5f0f\uff0c\u4e00\u79cd\u63a2\u7d22\u548c\u51cf\u5c11\u65e0\u77e5\u7684\u65b9\u5f0f\uff0c\u4e00\u79cd\u6ce8\u610f\u4e8b\u7269\u5e76\u4e5f\u8bb8\u5e2e\u52a9\u4ed6\u4eba\u505a\u540c\u6837\u4e8b\u60c5\u7684\u65b9\u5f0f\uff0c\u4e00\u79cd\u5c06\u8fd9\u4e9b\u4e0d\u540c\u7684\u7247\u6bb5\u62fc\u51d1\u6210\u67d0\u79cd\u8fde\u8d2f\u6027\u7684\u65b9\u5f0f\uff0c\u4ee5\u53ca\u4e3a\u6ce8\u610f\u529b\u548c\u6df1\u601d\u7684\u5171\u4eab\u8d44\u6e90\u505a\u51fa\u8d21\u732e\u7684\u65b9\u5f0f\u3002",
    ],
    ja: [
      "\u5b50\u4f9b\u6642\u4ee3\u306e\u591a\u304f\u3092\u30b3\u30f3\u30d4\u30e5\u30fc\u30bf\u306e\u524d\u3067\u904e\u3054\u3057\u305f\u3053\u3068\u3067\u3001\u30c6\u30af\u30ce\u30ed\u30b8\u30fc\u3068\u305d\u308c\u304c\u6587\u5316\u3084\u793e\u4f1a\u306b\u4e0e\u3048\u308b\u5f71\u97ff\u306b\u6df1\u3044\u8208\u5473\u3092\u6301\u3064\u3088\u3046\u306b\u306a\u308a\u307e\u3057\u305f\u3002\u79c1\u306e\u4eca\u306e\u4ed5\u4e8b\u306e\u591a\u304f\u306f\u3001\u3053\u306e\u30cf\u30a4\u30d1\u30fc\u30c7\u30b8\u30bf\u30eb\u306e\u4e16\u754c\u3067\u751f\u304d\u308b\u3068\u306f\u3069\u3046\u3044\u3046\u3053\u3068\u304b\u3001\u73fe\u5728\u306e\u77ac\u9593\u306b\u30a2\u30fc\u30c8\u304c\u4f55\u304c\u3067\u304d\u308b\u304b\u3092\u7406\u89e3\u3057\u3088\u3046\u3068\u3059\u308b\u8a66\u307f\u3067\u3059\u3002",
      "\u3053\u3053\u6570\u5e74\u3001\u73fe\u5728\u306e\u30a4\u30f3\u30bf\u30fc\u30cd\u30c3\u30c8\u3001\u7279\u306b\u30bd\u30fc\u30b7\u30e3\u30eb\u30e1\u30c7\u30a3\u30a2\u3068\u30a2\u30eb\u30b4\u30ea\u30ba\u30e0\u6d88\u8cbb\u306b\u5931\u671b\u3068\u5e7b\u6ec5\u3092\u611f\u3058\u3066\u3044\u307e\u3059\u3002\u521d\u671fYouTube\u30682016\u5e74\u4ee5\u524d\u306eInstagram\u3068\u5171\u306b\u80b2\u3061\u3001\u3053\u308c\u3089\u306e\u30c4\u30fc\u30eb\u304c\u6301\u3064\u53ef\u80fd\u6027\u2014\u2014\u610f\u5473\u3068\u6df1\u3044\u601d\u8003\u306b\u6e80\u3061\u305f\u751f\u304d\u751f\u304d\u3068\u3057\u305f\u7a7a\u9593\u2014\u2014\u3092\u898b\u307e\u3057\u305f\u3002\u305d\u306e\u7d04\u675f\u306f\u305d\u308c\u4ee5\u6765\u7a7a\u6d1e\u5316\u3057\u3066\u3057\u307e\u3044\u307e\u3057\u305f\u3002",
      "\u30c7\u30b8\u30bf\u30eb\u30c4\u30fc\u30eb\u306f\u6700\u826f\u306e\u5834\u5408\u3001\u79c1\u305f\u3061\u304c\u6c7a\u3057\u3066\u898b\u308b\u3079\u304d\u3067\u306f\u306a\u304b\u3063\u305f\u73fe\u5b9f\u306e\u90e8\u5206\u3092\u77e5\u899a\u3059\u308b\u3053\u3068\u3092\u53ef\u80fd\u306b\u3057\u307e\u3059\u3002\u30c6\u30af\u30ce\u30ed\u30b8\u30fc\u306f\u73fe\u5b9f\u306b\u3064\u3044\u3066\u306e\u7406\u89e3\u3092\u5e83\u3052\u3001\u5168\u304f\u65b0\u3057\u3044\u73fe\u5b9f\u3092\u69cb\u7bc9\u3059\u308b\u80fd\u529b\u3092\u4e0e\u3048\u307e\u3059\u3002\u3053\u308c\u3089\u306e\u30c6\u30af\u30ce\u30ed\u30b8\u30fc\u306b\u306f\u5de8\u5927\u306a\u3001\u307b\u307c\u30e6\u30fc\u30c8\u30d4\u30a2\u7684\u306a\u53ef\u80fd\u6027\u304c\u3042\u308a\u307e\u3059\u3002\u3057\u304b\u3057\u305d\u306e\u30e6\u30fc\u30c8\u30d4\u30a2\u7684\u30d3\u30b8\u30e7\u30f3\u306f\u3001\u8cc7\u672c\u4e3b\u7fa9\u3068\u30c7\u30b8\u30bf\u30eb\u7a7a\u9593\u306e\u5546\u696d\u5316\u3001\u30a2\u30eb\u30b4\u30ea\u30ba\u30e0\u306b\u3088\u308b\u5e73\u5766\u5316\u3001\u4e0d\u771f\u6b63\u3055\u3001\u30d0\u30a4\u30e9\u30eb\u306b\u306a\u308a\u305f\u3044\u3068\u3044\u3046\u3059\u3079\u3066\u3092\u98f2\u307f\u8fbc\u3080\u6b32\u671b\u306b\u3088\u3063\u3066\u7740\u5b9f\u306b\u7f6e\u304d\u63db\u3048\u3089\u308c\u3066\u304d\u307e\u3057\u305f\u3002",
      "\u3042\u3089\u3086\u308b\u751f\u304d\u305f\u7d4c\u9a13\u306b\u3064\u3044\u3066\u306e\u6700\u3082\u6839\u672c\u7684\u306a\u4e8b\u5b9f\u306f\u3001\u305d\u308c\u304c\u898b\u65b9\u306b\u4f9d\u5b58\u3059\u308b\u3068\u3044\u3046\u3053\u3068\u3067\u3057\u3087\u3046\u3002\u3069\u306e\u898b\u65b9\u3082\u5ba2\u89b3\u7684\u73fe\u5b9f\u3092\u660e\u3089\u304b\u306b\u306f\u3057\u307e\u305b\u3093\u3002\u79c1\u305f\u3061\u306f\u901a\u5e38\u3053\u308c\u3092\u610f\u8b58\u3057\u3066\u3044\u307e\u305b\u3093\u304c\u3001Instagram\u306e\u30d5\u30a3\u30fc\u30c9\u3001\u682a\u5f0f\u5e02\u5834\u306e\u30b0\u30e9\u30d5\u3001IQ\u30b9\u30b3\u30a2\u3001\u8a55\u4fa1\u2014\u2014\u30cb\u30fc\u30eb\u30fb\u30dd\u30b9\u30c8\u30de\u30f3\u304c\u300c\u30bd\u30d5\u30c8\u30c6\u30af\u30ce\u30ed\u30b8\u30fc\u300d\u3068\u547c\u3093\u3060\u3082\u306e\u2014\u2014\u304c\u9759\u304b\u306b\u76f4\u63a5\u77e5\u899a\u3092\u5b8c\u5168\u306b\u7f6e\u304d\u63db\u3048\u3066\u3057\u307e\u3044\u307e\u3057\u305f\u3002\u3055\u3089\u306b\u3001\u73fe\u5728\u306e\u30a4\u30f3\u30bf\u30fc\u30cd\u30c3\u30c8\u306e\u591a\u304f\u306f\u61a7\u308c\u3001\u504f\u898b\u3001\u61a4\u6012\u3001\u7d76\u3048\u9593\u306a\u3044\u81ea\u5df1\u5224\u65ad\u3001\u305d\u3057\u3066\u610f\u5473\u306e\u306a\u3044\u793e\u4f1a\u7684\u5730\u4f4d\u30b2\u30fc\u30e0\u306e\u4e0d\u5b89\u306a\u7dad\u6301\u3092\u57f9\u990a\u3057\u3066\u3044\u307e\u3059\u3002\u305a\u3063\u3068\u3001\u79c1\u305f\u3061\u306f\u5fc5\u7136\u7684\u306b\u3053\u308c\u3089\u306e\u5a92\u4ecb\u3055\u308c\u305f\u7d4c\u9a13\u3068\u306e\u95a2\u308f\u308a\u65b9\u306b\u5f93\u4e8b\u3057\u3066\u304a\u308a\u3001\u307b\u3068\u3093\u3069\u610f\u8b58\u3059\u308b\u3053\u3068\u306f\u3042\u308a\u307e\u305b\u3093\u3002",
      "\u79c1\u305f\u3061\u306f\u73fe\u5b9f\u304c\u30e2\u30c7\u30eb\u306b\u652f\u914d\u3055\u308c\u308b\u5730\u70b9\u306b\u5230\u9054\u3057\u307e\u3057\u305f\uff1a\u30a2\u30eb\u30b4\u30ea\u30ba\u30e0\u30e2\u30c7\u30eb\u3001\u8996\u899a\u30e2\u30c7\u30eb\u3001\u7269\u4e8b\u305d\u306e\u3082\u306e\u3092\u8d85\u3048\u305f\u8868\u8c61\u3002\u79c1\u305f\u3061\u306f\u6697\u3044\u90e8\u5c4b\u3067\u30d3\u30c7\u30aa\u3068\u5171\u306b\u7d42\u308f\u308a\u3001\u30d3\u30c7\u30aa\u306f\u611f\u899a\u3078\u306e\u653b\u6483\u3067\u3042\u308a\u3001\u5b58\u5728\u3059\u3079\u304d\u3067\u306a\u3044\u4e16\u754c\u3078\u79c1\u305f\u3061\u3092\u904b\u3073\u3001\u6df1\u304f\u5e7b\u60f3\u7684\u306a\u65b9\u6cd5\u3067\u73fe\u5b9e\u3092\u898b\u3055\u305b\u307e\u3059\u3002",
      "\u3053\u308c\u304c\u79c1\u306e\u7814\u7a76\u306e\u6838\u5fc3\u3067\u3059\uff1a\u30b3\u30f3\u30d4\u30e5\u30fc\u30bf\u306f\u6700\u3082\u6839\u672c\u7684\u306a\u3082\u306e\u2014\u2014\u4eba\u9593\u95a2\u4fc2\u3001\u81ea\u5df1\u7406\u89e3\u2014\u2014\u3092\u3069\u306e\u3088\u3046\u306b\u5f62\u4f5c\u308a\u3001\u79c1\u305f\u3061\u306f\u3069\u306e\u3088\u3046\u306b\u3057\u3066\u3053\u306e\u5947\u5999\u306a\u884c\u304d\u8a70\u307e\u308a\u306b\u81ea\u3089\u3092\u8ffd\u3044\u8fbc\u3093\u3060\u306e\u304b\uff1f",
      "\u79c1\u306e\u82b8\u8853\u5b9f\u8df5\u306f\u3001\u81ea\u5206\u81ea\u8eab\u304c\u4f5c\u308a\u4e0a\u3052\u305f\u73fe\u5b9e\u304b\u3089\u5207\u308a\u96e2\u308c\u3001\u5916\u898b\u304c\u3069\u306e\u3088\u3046\u306b\u751f\u3058\u308b\u304b\u3092\u3088\u308a\u6df1\u304f\u63a2\u6c42\u3057\u3001\u7fd2\u6163\u7684\u306a\u898b\u65b9\u3092\u89e3\u4f53\u3057\u554f\u3044\u76f4\u3059\u65b9\u6cd5\u306b\u306a\u308a\u307e\u3057\u305f\u3002\u3053\u308c\u306f\u76ee\u6a19\u3084\u9054\u6210\u2014\u2014\u6df1\u304f\u81ea\u5df1\u758e\u5916\u7684\u3060\u3068\u611f\u3058\u305f\u8ffd\u6c42\u2014\u2014\u3067\u306f\u306a\u304f\u3001\u4eba\u751f\u305d\u306e\u3082\u306e\u3078\u306e\u771f\u306e\u611f\u8b1d\u3068\u3044\u3046\u89b3\u70b9\u304b\u3089\u6e2c\u3089\u308c\u308b\u767a\u5c55\u3067\u3059\u3002",
      "\u7d75\u306e\u524d\u306b\u5ea7\u3063\u3066\u904e\u3054\u3059\u30bb\u30c3\u30b7\u30e7\u30f3\u306e\u7d42\u308f\u308a\u306b\u3001\u79c1\u305f\u3061\u304c\u81ea\u5206\u81ea\u8eab\u3068\u3088\u308a\u3064\u306a\u304c\u3063\u3066\u3044\u308b\u3068\u611f\u3058\u308b\u306e\u306f\u4e0d\u601d\u8b70\u3067\u306f\u3042\u308a\u307e\u305b\u3093\u3002\u7d75\u3092\u610f\u5473\u306e\u3042\u308b\u3082\u306e\u306b\u3059\u308b\u306b\u306f\u3001\u610f\u5473\u3067\u6e80\u305f\u3055\u306a\u3051\u308c\u3070\u306a\u308a\u307e\u305b\u3093\u3002\u5185\u5074\u306b\u8033\u3092\u50be\u3051\u3001\u30a2\u30fc\u30c8\u304c\u958b\u3051\u305f\u307e\u307e\u306b\u3057\u3066\u304a\u304f\u96d9\u9593\u306b\u3001\u305d\u308c\u304c\u547c\u3073\u8d77\u3053\u3059\u611f\u89a6\u3092\u6d41\u3057\u8fbc\u307e\u306a\u3051\u308c\u3070\u306a\u308a\u307e\u305b\u3093\u3002\u81ea\u5206\u81ea\u8eab\u306b\u540c\u8abf\u3057\u306a\u3051\u308c\u3070\u306a\u308a\u307e\u305b\u3093\u3002\u305d\u3057\u3066\u3001\u96e2\u308c\u308b\u3068\u304d\u3001\u79c1\u305f\u3061\u306f\u81ea\u5206\u304c\u8ab0\u3067\u3042\u308b\u304b\u306b\u3088\u308a\u8fd1\u3044\u3068\u611f\u3058\u307e\u3059\u3002",
      "\u3053\u308c\u304c\u30a2\u30fc\u30c8\u3068\u57f7\u7b46\u304c\u79c1\u306b\u63d0\u4f9b\u3059\u308b\u3082\u306e\u3067\u3059\uff1a\u4e16\u754c\u3092\u3088\u308a\u610f\u8b58\u3059\u308b\u65b9\u6cd5\u3001\u63a2\u6c42\u3057\u7121\u77e5\u3092\u6e1b\u3089\u3059\u65b9\u6cd5\u3001\u7269\u4e8b\u306b\u6c17\u3065\u304d\u4ed6\u306e\u4eba\u3005\u3082\u540c\u69d8\u306b\u3059\u308b\u306e\u3092\u52a9\u3051\u308b\u65b9\u6cd5\u3001\u3053\u308c\u3089\u306e\u7570\u306a\u308b\u65ad\u7247\u3092\u3042\u308b\u7a2e\u306e\u4e00\u8cab\u6027\u306b\u307e\u3068\u3081\u308b\u65b9\u6cd5\u3001\u305d\u3057\u3066\u6ce8\u610f\u3068\u601d\u3044\u3084\u308a\u306e\u5171\u6709\u8cc7\u6e90\u306b\u8ca2\u732e\u3059\u308b\u65b9\u6cd5\u3002",
    ],
  };
  const bioParagraphs = biosByLang[lang] || biosByLang.en;


  const ui: Record<string, { about: string; printing: string; guestbook: string; name: string; date: string; message: string; contact: string; email: string; send: string; mailing: string; subscribed: string; pressEnter: string }> = {
    en: { about: "About", printing: "Printing", guestbook: "Sign my guestbook", name: "Name", date: "Date", message: "Message", contact: "Contact", email: "Email", send: "Send", mailing: "Mailing list", subscribed: "Subscribed", pressEnter: "press enter to subscribe" },
    de: { about: "\u00DCber", printing: "Druck", guestbook: "G\u00e4stebuch unterschreiben", name: "Name", date: "Datum", message: "Nachricht", contact: "Kontakt", email: "E-Mail", send: "Senden", mailing: "Mailingliste", subscribed: "Abonniert", pressEnter: "Enter dr\u00fccken zum Abonnieren" },
    fr: { about: "\u00C0 propos", printing: "Impression", guestbook: "Signer mon livre d\u2019or", name: "Nom", date: "Date", message: "Message", contact: "Contact", email: "E-mail", send: "Envoyer", mailing: "Liste de diffusion", subscribed: "Abonn\u00e9", pressEnter: "appuyez sur Entr\u00e9e pour vous abonner" },
    ko: { about: "\uc18c\uac1c", printing: "\uc778\uc1c4", guestbook: "\uBC29\uBA85\uB85D \uC11C\uBA85", name: "\uC774\uB984", date: "\uB0A0\uC9DC", message: "\uBA54\uC2DC\uC9C0", contact: "\uC5F0\uB77D\uCC98", email: "\uC774\uBA54\uC77C", send: "\uBCF4\uB0B4\uAE30", mailing: "\uBA54\uC77C\uB9C1 \uB9AC\uC2A4\uD2B8", subscribed: "\uAD6C\uB3C5\uB428", pressEnter: "Enter\uB97C \uB20C\uB7EC \uAD6C\uB3C5" },
    id: { about: "Tentang", printing: "Cetak", guestbook: "Tanda tangani buku tamu", name: "Nama", date: "Tanggal", message: "Pesan", contact: "Kontak", email: "Email", send: "Kirim", mailing: "Milis", subscribed: "Berlangganan", pressEnter: "tekan Enter untuk berlangganan" },
    zh: { about: "\u5173\u4e8e", printing: "\u5370\u5237", guestbook: "\u7B7E\u540D\u7559\u8A00\u7C3F", name: "\u59D3\u540D", date: "\u65E5\u671F", message: "\u7559\u8A00", contact: "\u8054\u7CFB", email: "\u7535\u5B50\u90AE\u4EF6", send: "\u53D1\u9001", mailing: "\u90AE\u4EF6\u5217\u8868", subscribed: "\u5DF2\u8BA2\u9605", pressEnter: "\u6309 Enter \u8BA2\u9605" },
    ja: { about: "\u6982\u8981", printing: "\u5370\u5237", guestbook: "\u30B2\u30B9\u30C8\u30D6\u30C3\u30AF\u306B\u7F72\u540D", name: "\u540D\u524D", date: "\u65E5\u4ED8", message: "\u30E1\u30C3\u30BB\u30FC\u30B8", contact: "\u304A\u554F\u3044\u5408\u308F\u305B", email: "\u30E1\u30FC\u30EB", send: "\u9001\u4FE1", mailing: "\u30E1\u30FC\u30EA\u30F3\u30B0\u30EA\u30B9\u30C8", subscribed: "\u767B\u9332\u6E08\u307F", pressEnter: "Enter\u3067\u767B\u9332" },
  };
  const t = ui[lang] || ui.en;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <style>{`
        @media (max-width: 767px) {
          .martens-data-row { flex-direction: column !important; gap: 20px !important; padding-left: 0 !important; padding-right: 0 !important; }
          .martens-data-row > div { max-width: 100% !important; min-width: 100% !important; margin-left: 0 !important; flex: 1 1 100% !important; }
          .about-contact-form { max-width: 100% !important; margin-left: 0 !important; }
          .about-bio-text { grid-template-columns: 1fr !important; }
          .about-bio-left { max-width: 100% !important; justify-content: flex-start !important; gap: 16px !important; }
          .about-bio-right { font-size: 13px !important; line-height: 1.8 !important; justify-content: flex-start !important; gap: 16px !important; }
        }
        @keyframes marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes mailing-fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
      `}</style>

      {/* ─── Section A: Header Bar ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "var(--site-font)",
          fontSize: 11,
          color: "#bbb",
          borderBottom: "1px solid #eee",
          paddingTop: 20,
          paddingBottom: 4,
          paddingLeft: 20,
          marginRight: 20,
        }}
      >
        <span style={{ fontSize: 10, whiteSpace: "nowrap" }}>312-344-0906</span>
        <span style={{ color: "#ddd", fontSize: 10 }}>|</span>
        <a href="mailto:rsurmeie@risd.edu" style={{ color: "#bbb", textDecoration: "none", fontSize: 10, whiteSpace: "nowrap" }}>rsurmeie@risd.edu</a>
        <span style={{ color: "#ddd", fontSize: 10 }}>|</span>
        <a href="https://reidsurmeier.wtf" style={{ color: "#bbb", textDecoration: "none", fontSize: 10, whiteSpace: "nowrap" }}>reidsurmeier.wtf</a>
      </div>

      {/* ─── Scrollable content ─── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          fontFamily: "var(--site-font)",
          color: "#999",
          fontSize: 13,
        }}
      >
        {/* ─── Section B: Bio ─── */}
        <div
          style={{
            padding: "clamp(16px, 3vw, 32px) 20px",
          }}
        >
          <div style={{ maxWidth: "100%" }}>
            {/* Audio player inline */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span
                onClick={() => {
                  const audio = audioRef.current;
                  if (!audio) return;
                  if (!audio.paused || isPlaying) {
                    stopAudio();
                  } else {
                    userPausedRef.current = false;
                    audio.volume = 1;
                    audio.play().catch(() => {});
                    setIsPlaying(true);
                  }
                }}
                style={{
                  fontSize: 16,
                  cursor: "pointer",
                  color: "#999",
                  userSelect: "none",
                  fontFamily: "var(--site-font)",
                }}
              >
                {isPlaying ? "\u275A\u275A" : "\u25BA"}
              </span>
              <span style={{ fontSize: 15, color: "#bbb", fontFamily: "var(--site-font)" }}>
                {"\u266B"} {t.about}
              </span>
              <audio ref={audioRef} src="/reid_audio.mp3" onEnded={() => setIsPlaying(false)} />
            </div>

            {/* Bio text — 70/30 two-column grid */}
            <div className="about-bio-text" style={{ lineHeight: 1.8, fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 400, color: "#bbb", maxWidth: "100%", display: "grid", gridTemplateColumns: "7fr 3fr", gap: "0 40px", alignItems: "stretch" }}>
              <div ref={bioLeftRef} className="about-bio-left" style={{ display: "flex", flexDirection: "column" as const, justifyContent: "space-between", gap: 14 }}>{bioParagraphs.slice(0, 5).map((text, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 14, height: 14, minWidth: 14,
                    border: "1px solid #ddd", borderRadius: "50%",
                    fontSize: 8, color: "#ddd", marginTop: 3, flexShrink: 0,
                  }}>{i + 1}</span>
                  <span>{text}</span>
                </div>
              ))}</div>
              <div ref={bioRightRef} className="about-bio-right" style={{ fontSize: 11, lineHeight: 1.6, display: "flex", flexDirection: "column" as const, justifyContent: "space-between", gap: 10 }}>{bioParagraphs.slice(5).map((text, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 14, height: 14, minWidth: 14,
                    border: "1px solid #ddd", borderRadius: "50%",
                    fontSize: 8, color: "#ddd", marginTop: 2, flexShrink: 0,
                  }}>{i + 6}</span>
                  <span>{text}</span>
                </div>
              ))}
              <a
                href="mailto:reid@reidsurmeier.com?subject=Hi!"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  marginTop: 8, marginLeft: 22, fontSize: 11, fontFamily: "var(--site-font)",
                  color: "#bbb", border: "1px solid #ddd", borderRadius: 3,
                  padding: "5px 12px", textDecoration: "none",
                  transition: "color 0.15s ease, border-color 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#000"; e.currentTarget.style.borderColor = "#000"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.borderColor = "#ddd"; }}
              >
                Get In Touch
              </a>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Section C: Bouncing Images ─── */}
        <div
          ref={chartSectionRef}
          style={{
            padding: "24px 20px 24px",
            borderTop: "1px solid #eee",
            borderBottom: "1px solid #eee",
            opacity: chartVisible ? 1 : 0,
            transition: "opacity 0.8s ease",
          }}
        >
          <div
            ref={bouncingContainerRef}
            style={{
              position: "relative",
              overflow: "hidden",
              minHeight: 300,
              width: "100%",
            }}
          >
            {chartVisible && <BouncingImages containerRef={bouncingContainerRef} />}
          </div>
        </div>

        {/* ─── Section D: Data Table + Contact ─── */}
        <div
          className="martens-data-row"
          style={{
            display: "flex",
            gap: "clamp(20px, 5vw, 60px)",
            padding: "clamp(20px, 4vw, 40px) 20px 60px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* Left: Stats + guestbook + mailing list */}
          <div style={{ flex: "1 1 280px", maxWidth: 500 }}>
            {/* Guestbook link */}
            <div style={{ marginBottom: 30 }}>
              <a
                href="https://github.com/ReidSurmeier/ReidSurmeier/issues/1#issuecomment-new"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--site-font)",
                  fontSize: 11,
                  color: "#999",
                  textDecoration: "none",
                  borderBottom: "1px solid #ddd",
                  paddingBottom: 2,
                }}
              >
                {t.guestbook}
              </a>
            </div>

            {/* Guestbook table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 40, fontSize: 11, color: "#bbb" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eee" }}>
                  <th style={{ padding: "6px 12px", textAlign: "left", fontWeight: 600 }}>{t.name}</th>
                  <th style={{ padding: "6px 12px", textAlign: "left", fontWeight: 600 }}>{t.date}</th>
                  <th style={{ padding: "6px 12px", textAlign: "left", fontWeight: 600 }}>{t.message}</th>
                </tr>
              </thead>
              <tbody />
            </table>

            {/* Mailing list signup */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontFamily: "var(--site-font)", fontSize: 11, fontWeight: 600, color: "#ccc", marginBottom: 12, letterSpacing: "0.5px", textTransform: "uppercase" as const }}>
                {t.mailing}
              </div>
              {subscribed ? (
                <div style={{ fontFamily: "var(--site-font)", fontSize: 11, color: "#ccc" }}>
                  {t.subscribed}
                </div>
              ) : (
                <>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSubscribed(true);
                    }}
                  >
                    <input
                      name="mailing_email"
                      type="email"
                      placeholder={t.email}
                      required
                      onChange={(e) => setEmailValid(e.target.validity.valid && e.target.value.length > 0)}
                      style={{
                        fontFamily: "var(--site-font)",
                        fontSize: 11,
                        padding: "8px 10px",
                        border: "1px solid #ddd",
                        borderRadius: 0,
                        outline: "none",
                        color: "#666",
                        background: "none",
                        width: "100%",
                      }}
                    />
                  </form>
                  {emailValid && (
                    <div style={{ overflow: "hidden", marginTop: 6, height: 14, animation: "mailing-fade-in 2s ease forwards", opacity: 0 }}>
                      <div style={{ fontFamily: "var(--site-font)", fontSize: 10, color: "#ccc", whiteSpace: "nowrap", animation: "marquee-scroll 20s linear infinite" }}>
                        {t.pressEnter}{"\u2003\u2003\u2003"}{t.pressEnter}{"\u2003\u2003\u2003"}{t.pressEnter}{"\u2003\u2003\u2003"}{t.pressEnter}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right: Contact form */}
          <div
            className="about-contact-form"
            style={{
              flex: "1 1 250px",
              maxWidth: 250,
              marginLeft: "auto",
              fontFamily: "var(--site-font)",
              fontSize: 11,
              color: "#999",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 16, letterSpacing: "0.5px", textTransform: "uppercase" as const }}>
              {t.contact}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem("name") as HTMLInputElement).value;
                const email = (form.elements.namedItem("email") as HTMLInputElement).value;
                const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
                window.location.href = `mailto:reid@reidsurmeier.com?subject=Contact from ${name}&body=${encodeURIComponent(message)}%0A%0AFrom: ${encodeURIComponent(name)} (${encodeURIComponent(email)})`;
              }}
              style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, height: "100%" }}
            >
              <input
                name="name"
                placeholder={t.name}
                required
                style={{
                  fontFamily: "var(--site-font)",
                  fontSize: 11,
                  padding: "8px 10px",
                  border: "1px solid #ddd",
                  borderRadius: 0,
                  outline: "none",
                  color: "#666",
                  background: "none",
                }}
              />
              <input
                name="email"
                type="email"
                placeholder={t.email}
                required
                style={{
                  fontFamily: "var(--site-font)",
                  fontSize: 11,
                  padding: "8px 10px",
                  border: "1px solid #ddd",
                  borderRadius: 0,
                  outline: "none",
                  color: "#666",
                  background: "none",
                }}
              />
              <textarea
                name="message"
                placeholder={t.message}
                required
                style={{
                  fontFamily: "var(--site-font)",
                  fontSize: 11,
                  padding: "8px 10px",
                  border: "1px solid #ddd",
                  borderRadius: 0,
                  outline: "none",
                  color: "#666",
                  background: "none",
                  resize: "vertical",
                  flex: 0.65,
                  minHeight: 60,
                }}
              />
              <button
                type="submit"
                style={{
                  fontFamily: "var(--site-font)",
                  fontSize: 11,
                  padding: "8px 16px",
                  border: "1px solid #ccc",
                  borderRadius: 0,
                  background: "none",
                  color: "#888",
                  cursor: "pointer",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase" as const,
                  alignSelf: "flex-start",
                  marginTop: -8,
                }}
              >
                {t.send}
              </button>
            </form>
          </div>
        </div>

        {/* ─── Section E: Footer ─── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderTop: "1px solid #eee",
          }}
        >
          <span style={{ fontSize: 11, color: "#bbb", fontFamily: "var(--site-font)", letterSpacing: "0.5px" }}>
            {"2026 \u00A9 \u2027\u208A\u02DA"}
          </span>
          <button
            onClick={() => onContact?.()}
            style={{
              border: "1px solid #ccc",
              borderRadius: 0,
              padding: "4px 16px",
              fontSize: 11,
              fontFamily: "var(--site-font)",
              background: "none",
              color: "#888",
              cursor: "pointer",
              letterSpacing: "1.5px",
              textTransform: "uppercase" as const,
            }}
          >
            {"EMAIL ME"}
          </button>
        </div>
      </div>
    </div>
  );
}
