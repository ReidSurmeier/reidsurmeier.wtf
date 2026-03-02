"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

function TypewriterText({ children, delay = 0, speed = 40 }: { children: string; delay?: number; speed?: number }) {
  const [charCount, setCharCount] = useState(0);
  const [started, setStarted] = useState(false);
  const text = children;
  const FADE_WINDOW = 4;
  const totalSteps = Array.from(text).length + FADE_WINDOW;

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started || charCount >= totalSteps) return;
    const timer = setTimeout(() => setCharCount((c) => c + 1), speed);
    return () => clearTimeout(timer);
  }, [started, charCount, totalSteps, speed]);

  const chars = Array.from(text);
  return (
    <span>
      {chars.map((char, i) => {
        let opacity = 0;
        if (i < charCount - FADE_WINDOW) opacity = 1;
        else if (i < charCount) opacity = (charCount - i) / FADE_WINDOW;
        return (
          <span key={i} style={{ opacity, transition: "opacity 0.2s ease", whiteSpace: char === " " ? "pre" : undefined }}>{char}</span>
        );
      })}
    </span>
  );
}

interface CVNode {
  id: string;
  section: "education" | "exhibition" | "award" | "experience";
  tag?: "G" | "S"; // G = Group Show, S = Solo Show
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  label: string;
  sublabel?: string;
  description?: string;
}

interface CVEdge {
  id: string;
  from: string;
  to: string;
}

const nodes: CVNode[] = [
  // Education / Residencies
  { id: "nyaa", section: "education", x: 42, y: 8, label: "New York Academy of Art", sublabel: "Summer Undergraduate\nResidency, 2024", description: "Intensive summer residency program focused on contemporary figurative and conceptual art practices at the New York Academy of Art." },
  { id: "risd", section: "education", x: 68, y: 6, label: "RISD", sublabel: "B.F.A., Art & Computation + Painting\nProvidence, RI", description: "Pursuing a B.F.A. double major in Art & Computation and Painting at the Rhode Island School of Design." },

  // Exhibitions 2023
  { id: "ss", section: "exhibition", tag: "G", x: 16, y: 24, label: "SS", sublabel: "Corvus Gallery, Gordon Parks\nArts Hall, Chicago, IL", description: "Group exhibition at Corvus Gallery in the Gordon Parks Arts Hall, showcasing student and emerging artist work in Chicago." },
  { id: "ihsae-ex", section: "exhibition", tag: "G", x: 16, y: 40, label: "IHSAE Northern Exhibition", sublabel: "Bridgeport Art Center\nChicago, IL", description: "Illinois High School Art Exhibition (Northern Region) held at the Bridgeport Art Center. Awarded Best in Show in the Design category." },

  // Exhibition 2024
  { id: "tech-touch", section: "exhibition", tag: "G", x: 40, y: 26, label: "Technical Touch", sublabel: "111 Franklin Street\nNYC", description: "Group show exploring the intersection of technology and tactile art-making processes, exhibited at 111 Franklin Street in New York City." },

  // Exhibitions 2025 (early)
  { id: "design-auto", section: "exhibition", tag: "G", x: 54, y: 20, label: "From What is Design\nAutonomous?", sublabel: "Waterman Gallery\nProvidence, RI", description: "Exhibition examining the boundaries of design autonomy and computational authorship at RISD\u2019s Waterman Gallery." },
  { id: "efs", section: "exhibition", tag: "G", x: 54, y: 36, label: "EFS Show", sublabel: "Waterman Gallery\nProvidence, RI", description: "Experimental Form Studies group exhibition at Waterman Gallery, Providence, RI." },
  { id: "reframing", section: "exhibition", tag: "G", x: 54, y: 52, label: "Reframing Representation", sublabel: "Center for Integrative\nTechnologies (CIT), RISD", description: "Group show at RISD\u2019s Center for Integrative Technologies exploring new modes of representation through computational and material practices." },

  // Exhibitions 2025 (late)
  { id: "60years", section: "exhibition", tag: "G", x: 78, y: 20, label: "60 Years of Artmaking", sublabel: "Gordon Parks Arts Hall\nCorvus Gallery", description: "Anniversary exhibition celebrating 60 years of artmaking at the Gordon Parks Arts Hall, Corvus Gallery, Chicago." },
  { id: "unthought", section: "exhibition", tag: "S", x: 78, y: 36, label: "Unthought: Somewhere\nand Elsewhere", sublabel: "1719 S. Clinton St, Nowifi.us.com\nChicago, IL (Solo)", description: "Solo exhibition exploring liminality and digital presence through mixed-media installation, hosted online at Nowifi.us.com." },
  { id: "coffee", section: "exhibition", tag: "G", x: 78, y: 52, label: "After Dinner Coffee", sublabel: "Memorial Hall\nProvidence, RI", description: "Intimate group exhibition at Memorial Hall, Providence, featuring works made in response to communal gathering and conversation." },

  // Awards 2023
  { id: "erickson", section: "award", x: 16, y: 62, label: "Robert Erickson Award", sublabel: "High Achievement in Fine Arts\nU of Chicago Lab Schools, 2023", description: "Award for high achievement in the fine arts, presented by the University of Chicago Laboratory Schools." },
  { id: "bestinshow", section: "award", x: 16, y: 76, label: "Best in Show", sublabel: "Design Category\nIHSAE Northern Exhibition, 2023", description: "Best in Show award in the Design category at the Illinois High School Art Exhibition (Northern Region), 2023." },

  // Awards 2024
  { id: "scholastic", section: "award", x: 40, y: 64, label: "Scholastic Art & Writing", sublabel: "American Visions Nominee\nDesign Category, 2024", description: "Nominated for the American Visions award through the Scholastic Art & Writing Awards in the Design category, 2024." },
  { id: "surp", section: "award", x: 40, y: 78, label: "SURP Scholar Award", sublabel: "New York Academy\nof Art, 2024", description: "Summer Undergraduate Residency Program scholarship awarded by the New York Academy of Art for the 2024 residency." },

  // Experience 2026 — SPUR Grant
  { id: "spur", section: "experience", x: 88, y: 70, label: "SPUR Grant", sublabel: "RISD Research\n2026", description: "Currently ongoing grant funded in fall of 2026 relating to constructing a digital scan database of the RISD museum\u2019s sculpture and frame collection for live viewing on the web. Responsible for 3D scanning and coding web interactions, along with compiling research related to the featured sculptures and paintings\u2019 histories." },

  // Experience
  { id: "firebird", section: "experience", x: 4, y: 88, label: "Firebird Community Arts", sublabel: "Volunteer Educator\nMar\u2013May 2022, Chicago, IL", description: "Facilitated group art activities, including pottery and glass blowing for youth injured by gun violence. Helped with teaching and managing equipment." },
  { id: "makerspace", section: "experience", x: 24, y: 88, label: "Student Makerspace Coordinator", sublabel: "UChicago Laboratory Schools\nSep 2022\u2013May 2024", description: "Helped manage day to day operations, passed $5k+ in budgets for new supplies, expanded the community, and helped educate students on emerging technologies including 3D printing and scanning." },
  { id: "bitforms", section: "experience", x: 96, y: 82, label: "Teaching Assistant RISD", sublabel: "Industrial Design\nWintersession 2026, Providence, RI", description: "Helped lead an intensive studio course on electronic circuit board design and production in the Industrial Design department at RISD during Wintersession 2026. Presented lectures and research on a variety of artist studio practices and methodologies, helped with managing facilities and teaching equipment use. Responsible for leading group discussions on the role of technology and impact of electronics on the environment and society." },
  { id: "valla", section: "experience", x: 96, y: 92, label: "Clement Valla Studio", sublabel: "Studio Assistant\n2026, Providence, RI", description: "Helped design an automated circuit for a large LED display art piece for Clement Valla and Bitforms Gallery. Responsible for assembly and scripting power control circuit, along with creating a system for running live code and preventing data corruption due to power loss." },
];

const mobileLabels: Record<string, string> = {
  nyaa: "NYAA",
  risd: "RISD",
  ss: "SS",
  "ihsae-ex": "IHSAE",
  "tech-touch": "Tech Touch",
  "design-auto": "FWDA?",
  efs: "EFS",
  reframing: "Refr. Rep.",
  "60years": "60 Yrs",
  unthought: "Unthought",
  coffee: "ADC",
  erickson: "Erickson",
  bestinshow: "Best in Show",
  scholastic: "Scholastic",
  surp: "SURP",
  spur: "SPUR",
  firebird: "Firebird",
  makerspace: "Makerspace",
  bitforms: "TA RISD",
  valla: "C. Valla",
};

const edges: CVEdge[] = [
  { id: "e1", from: "nyaa", to: "risd" },
  { id: "e2", from: "ss", to: "ihsae-ex" },
  { id: "e3", from: "ss", to: "tech-touch" },
  { id: "e4", from: "tech-touch", to: "design-auto" },
  { id: "e5", from: "tech-touch", to: "efs" },
  { id: "e6", from: "design-auto", to: "efs" },
  { id: "e7", from: "efs", to: "reframing" },
  { id: "e8", from: "design-auto", to: "60years" },
  { id: "e9", from: "reframing", to: "coffee" },
  { id: "e10", from: "60years", to: "unthought" },
  { id: "e11", from: "erickson", to: "bestinshow" },
  { id: "e12", from: "erickson", to: "scholastic" },
  { id: "e13", from: "bestinshow", to: "surp" },
  { id: "e14", from: "scholastic", to: "surp" },
  { id: "e15", from: "scholastic", to: "spur" },
  { id: "e16", from: "firebird", to: "makerspace" },
  { id: "e17", from: "makerspace", to: "bitforms" },
  { id: "e18", from: "bitforms", to: "valla" },
];

const sectionIcon: Record<CVNode["section"], { char: string; shape: "circle" | "square" }> = {
  education: { char: "E", shape: "square" },
  exhibition: { char: "S", shape: "circle" },
  award: { char: "A", shape: "square" },
  experience: { char: "W", shape: "circle" },
};

const sectionLabelsAll: Record<Lang, Record<CVNode["section"], string>> = {
  en: { education: "Education/Residencies", exhibition: "Shows", award: "Awards", experience: "Experience" },
  de: { education: "Bildung/Residenzen", exhibition: "Ausstellungen", award: "Auszeichnungen", experience: "Erfahrung" },
  fr: { education: "\u00C9ducation/R\u00E9sidences", exhibition: "Expositions", award: "Prix", experience: "Exp\u00E9rience" },
  ko: { education: "\uAD50\uC721/\uB808\uC9C0\uB358\uC2DC", exhibition: "\uC804\uC2DC", award: "\uC218\uC0C1", experience: "\uACBD\uD5D8" },
  id: { education: "Pendidikan/Residensi", exhibition: "Pameran", award: "Penghargaan", experience: "Pengalaman" },
  zh: { education: "\u6559\u80B2/\u9A7B\u7559", exhibition: "\u5C55\u89C8", award: "\u5956\u9879", experience: "\u7ECF\u9A8C" },
  ja: { education: "\u6559\u80B2/\u30EC\u30B8\u30C7\u30F3\u30B7\u30FC", exhibition: "\u5C55\u89A7\u4F1A", award: "\u53D7\u8CDE", experience: "\u7D4C\u9A13" },
};

const cvTitleAll: Record<Lang, string> = {
  en: "Curriculum Vitae",
  de: "Lebenslauf",
  fr: "Curriculum Vitae",
  ko: "\uC774\uB825\uC11C",
  id: "Curriculum Vitae",
  zh: "\u7B80\u5386",
  ja: "\u5C65\u6B74\u66F8",
};

const groupShowAll: Record<Lang, string> = {
  en: "Group Show",
  de: "Gruppenausstellung",
  fr: "Exposition collective",
  ko: "\uADF8\uB8F9\uC804",
  id: "Pameran Grup",
  zh: "\u7FA4\u5C55",
  ja: "\u30B0\u30EB\u30FC\u30D7\u5C55",
};

const soloShowAll: Record<Lang, string> = {
  en: "Solo Show",
  de: "Einzelausstellung",
  fr: "Exposition solo",
  ko: "\uAC1C\uC778\uC804",
  id: "Pameran Solo",
  zh: "\u4E2A\u5C55",
  ja: "\u500B\u5C55",
};

const downloadCvAll: Record<Lang, { title: string; desc: string }> = {
  en: { title: "Download Full CV", desc: "Professional curriculum vitae with complete exhibition history, education, and experience." },
  de: { title: "Vollst\u00E4ndigen Lebenslauf herunterladen", desc: "Professioneller Lebenslauf mit vollst\u00E4ndiger Ausstellungsgeschichte, Bildung und Erfahrung." },
  fr: { title: "T\u00E9l\u00E9charger le CV complet", desc: "Curriculum vitae professionnel avec historique complet des expositions, formation et exp\u00E9rience." },
  ko: { title: "\uC774\uB825\uC11C \uB2E4\uC6B4\uB85C\uB4DC", desc: "\uC804\uC2DC \uC774\uB825, \uAD50\uC721 \uBC0F \uACBD\uD5D8\uC744 \uD3EC\uD568\uD55C \uC804\uBB38 \uC774\uB825\uC11C." },
  id: { title: "Unduh CV Lengkap", desc: "Curriculum vitae profesional dengan riwayat pameran, pendidikan, dan pengalaman lengkap." },
  zh: { title: "\u4E0B\u8F7D\u5B8C\u6574\u7B80\u5386", desc: "\u5305\u542B\u5B8C\u6574\u5C55\u89C8\u5386\u53F2\u3001\u6559\u80B2\u548C\u7ECF\u9A8C\u7684\u4E13\u4E1A\u7B80\u5386\u3002" },
  ja: { title: "\u5C65\u6B74\u66F8\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9", desc: "\u5C55\u89A7\u4F1A\u6B74\u3001\u6559\u80B2\u3001\u7D4C\u9A13\u3092\u542B\u3080\u5C65\u6B74\u66F8\u3002" },
};

const sectionColors: Record<CVNode["section"], string> = {
  education: "#C5D5F0",
  exhibition: "#C5F0E8",
  award: "#EFEF3B",
  experience: "#F0C5D5",
};

const ICON_SIZE = 14;

// Character-level hover animation (matching homepage style)
function AnimatedText({ children }: { children: string }) {
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

  const segments = children.split(/(\s+)/);
  let globalIdx = 0;
  return (
    <span>
      {segments.map((seg, si) => {
        const isSpace = /^\s+$/.test(seg);
        const chars = Array.from(seg).map((char) => {
          const i = globalIdx++;
          return (
            <span
              key={i}
              onMouseEnter={isSpace ? undefined : handleCharEnter}
              style={{
                display: "inline-block",
                transition: "transform 0.6s cubic-bezier(.6,0,.1,1), font-size 0.6s cubic-bezier(.6,0,.1,1)",
                whiteSpace: char === " " ? "pre" : undefined,
              }}
            >
              {char}
            </span>
          );
        });
        if (isSpace) return <span key={`s${si}`}>{chars}</span>;
        return <span key={`s${si}`} style={{ whiteSpace: "nowrap" }}>{chars}</span>;
      })}
    </span>
  );
}

function NodeIcon({ section, light }: { section: CVNode["section"]; light?: boolean }) {
  const { char, shape } = sectionIcon[section];
  const c = light ? "#ccc" : "#000";
  return (
    <div
      style={{
        width: ICON_SIZE,
        height: ICON_SIZE,
        border: `1px solid ${c}`,
        borderRadius: shape === "circle" ? "50%" : 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 7,
        fontWeight: 700,
        color: c,
        background: "#fff",
        flexShrink: 0,
      }}
    >
      {char}
    </div>
  );
}

function TagIcon({ char, light }: { char: string; light?: boolean }) {
  const c = light ? "#ccc" : "#000";
  return (
    <div
      style={{
        width: ICON_SIZE,
        height: ICON_SIZE,
        border: `1px solid ${c}`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 7,
        fontWeight: 700,
        color: c,
        background: "#fff",
        flexShrink: 0,
      }}
    >
      {char}
    </div>
  );
}

const FLIP_THRESHOLD = 72;
const TIMELINE_YEARS = [2022, 2023, 2024, 2025, 2026];

type Lang = "en" | "de" | "fr" | "ko" | "id" | "zh" | "ja";

// Translations for sublabels (locations/dates) and descriptions
const cvTranslations: Record<Lang, Record<string, { sublabel?: string; description?: string }>> = {
  en: {}, // English is the default in the node data
  de: {
    nyaa: { sublabel: "Sommerunterrichts-\nResidenz, 2024", description: "Intensives Sommerresidenzprogramm f\u00FCr zeitgen\u00F6ssische figurative und konzeptuelle Kunstpraktiken an der New York Academy of Art." },
    risd: { sublabel: "B.F.A., Kunst & Computation + Malerei\nProvidence, RI", description: "Doppelhauptfach B.F.A. in Kunst & Computation und Malerei an der Rhode Island School of Design." },
    ss: { sublabel: "Corvus Gallery, Gordon Parks\nArts Hall, Chicago, IL", description: "Gruppenausstellung in der Corvus Gallery in der Gordon Parks Arts Hall, Chicago." },
    "ihsae-ex": { sublabel: "Bridgeport Art Center\nChicago, IL", description: "Illinois High School Art Exhibition (N\u00F6rdliche Region) im Bridgeport Art Center. Ausgezeichnet mit Best in Show in der Kategorie Design." },
    "tech-touch": { sublabel: "111 Franklin Street\nNew York", description: "Gruppenausstellung \u00FCber die Schnittstelle von Technologie und taktilen Kunstprozessen, 111 Franklin Street, New York." },
    "design-auto": { sublabel: "Waterman Gallery\nProvidence, RI", description: "Ausstellung \u00FCber die Grenzen der Designautonomie und computergest\u00FCtzten Urheberschaft in der Waterman Gallery der RISD." },
    efs: { sublabel: "Waterman Gallery\nProvidence, RI", description: "Experimental Form Studies Gruppenausstellung in der Waterman Gallery, Providence, RI." },
    reframing: { sublabel: "Zentrum f\u00FCr Integrative\nTechnologien (CIT), RISD", description: "Gruppenausstellung am Zentrum f\u00FCr Integrative Technologien der RISD \u00FCber neue Repr\u00E4sentationsformen." },
    "60years": { sublabel: "Gordon Parks Arts Hall\nCorvus Gallery", description: "Jubil\u00E4umsausstellung zum 60-j\u00E4hrigen Kunstschaffen in der Gordon Parks Arts Hall, Corvus Gallery, Chicago." },
    unthought: { sublabel: "1719 S. Clinton St, Nowifi.us.com\nChicago, IL (Einzelausstellung)", description: "Einzelausstellung \u00FCber Liminalit\u00E4t und digitale Pr\u00E4senz durch Mixed-Media-Installation, online auf Nowifi.us.com." },
    coffee: { sublabel: "Memorial Hall\nProvidence, RI", description: "Intime Gruppenausstellung in der Memorial Hall, Providence, mit Werken als Reaktion auf Gemeinschaft und Gespr\u00E4ch." },
    erickson: { sublabel: "Hohe Leistung in Bildender Kunst\nU of Chicago Lab Schools, 2023", description: "Auszeichnung f\u00FCr hohe Leistungen in der bildenden Kunst, verliehen von den University of Chicago Laboratory Schools." },
    bestinshow: { sublabel: "Kategorie Design\nIHSAE N\u00F6rdliche Ausstellung, 2023", description: "Best in Show in der Kategorie Design bei der Illinois High School Art Exhibition (N\u00F6rdliche Region), 2023." },
    scholastic: { sublabel: "American Visions Nominierung\nKategorie Design, 2024", description: "Nominiert f\u00FCr den American Visions Award bei den Scholastic Art & Writing Awards in der Kategorie Design, 2024." },
    surp: { sublabel: "New York Academy\nof Art, 2024", description: "SURP-Stipendium der New York Academy of Art f\u00FCr die Sommerresidenz 2024." },
    spur: { sublabel: "RISD Forschung\n2026", description: "Laufendes Stipendium, finanziert im Herbst 2026, zum Aufbau einer digitalen Scan-Datenbank der Skulpturen- und Rahmensammlung des RISD-Museums zur Online-Betrachtung. Verantwortlich f\u00FCr 3D-Scanning und Web-Interaktionen sowie Recherche zur Geschichte der vorgestellten Skulpturen und Gem\u00E4lde." },
    firebird: { sublabel: "Ehrenamtlicher P\u00E4dagoge\nM\u00E4r\u2013Mai 2022, Chicago, IL", description: "Durchf\u00FChrung von Gruppenkunstaktivit\u00E4ten, einschlie\u00DFlich T\u00F6pfern und Glasblasen f\u00FCr durch Waffengewalt verletzte Jugendliche. Unterst\u00FCtzung beim Unterrichten und der Verwaltung von Ausr\u00FCstung." },
    makerspace: { sublabel: "UChicago Laboratory Schools\nSep 2022\u2013Mai 2024", description: "Mithilfe bei der t\u00E4glichen Betriebsf\u00FChrung, Budgets von \u00FCber $5k f\u00FCr neue Materialien bewilligt, die Gemeinschaft erweitert und Sch\u00FCler in neuen Technologien wie 3D-Druck und -Scanning geschult." },
    bitforms: { sublabel: "Industriedesign\nWintersession 2026, Providence, RI", description: "Mithilfe bei der Leitung eines intensiven Studienkurses \u00FCber elektronisches Platinen-Design und Produktion in der Abteilung Industriedesign an der RISD. Vorlesungen und Forschung zu verschiedenen k\u00FCnstlerischen Studiopraktiken, Einrichtungsverwaltung und Leitung von Gruppendiskussionen \u00FCber die Rolle der Technologie und die Auswirkungen von Elektronik auf Umwelt und Gesellschaft." },
    valla: { sublabel: "Studioassistent\n2026, Providence, RI", description: "Entwurf einer automatisierten Schaltung f\u00FCr ein gro\u00DFes LED-Display-Kunstwerk f\u00FCr Clement Valla und Bitforms Gallery. Verantwortlich f\u00FCr Montage und Programmierung der Stromsteuerung sowie Erstellung eines Systems f\u00FCr Live-Code und Verhinderung von Datenverlust bei Stromausfall." },
  },
  fr: {
    nyaa: { sublabel: "R\u00E9sidence d\u2019\u00E9t\u00E9\n2024", description: "Programme intensif de r\u00E9sidence d\u2019\u00E9t\u00E9 \u00E0 la New York Academy of Art." },
    risd: { sublabel: "B.F.A., Art & Computation + Peinture\nProvidence, RI", description: "Double sp\u00E9cialisation B.F.A. en Art & Computation et Peinture \u00E0 la Rhode Island School of Design." },
    ss: { sublabel: "Corvus Gallery, Gordon Parks\nArts Hall, Chicago, IL", description: "Exposition collective \u00E0 la Corvus Gallery dans le Gordon Parks Arts Hall, Chicago." },
    "ihsae-ex": { sublabel: "Bridgeport Art Center\nChicago, IL", description: "Illinois High School Art Exhibition (r\u00E9gion nord) au Bridgeport Art Center. Meilleur de l\u2019exposition en Design." },
    "tech-touch": { sublabel: "111 Franklin Street\nNew York", description: "Exposition collective explorant l\u2019intersection de la technologie et des processus artistiques tactiles, 111 Franklin Street, New York." },
    "design-auto": { sublabel: "Waterman Gallery\nProvidence, RI", description: "Exposition sur les limites de l\u2019autonomie du design et de la cr\u00E9ation assist\u00E9e par ordinateur \u00E0 la Waterman Gallery de RISD." },
    efs: { sublabel: "Waterman Gallery\nProvidence, RI", description: "Exposition collective Experimental Form Studies \u00E0 la Waterman Gallery, Providence, RI." },
    reframing: { sublabel: "Centre des Technologies\nInt\u00E9gratives (CIT), RISD", description: "Exposition collective au Centre des Technologies Int\u00E9gratives de RISD explorant de nouveaux modes de repr\u00E9sentation." },
    "60years": { sublabel: "Gordon Parks Arts Hall\nCorvus Gallery", description: "Exposition anniversaire c\u00E9l\u00E9brant 60 ans de cr\u00E9ation artistique au Gordon Parks Arts Hall, Corvus Gallery, Chicago." },
    unthought: { sublabel: "1719 S. Clinton St, Nowifi.us.com\nChicago, IL (Solo)", description: "Exposition solo explorant la liminalit\u00E9 et la pr\u00E9sence num\u00E9rique, en ligne sur Nowifi.us.com." },
    coffee: { sublabel: "Memorial Hall\nProvidence, RI", description: "Exposition collective intimiste \u00E0 Memorial Hall, Providence, avec des \u0153uvres en r\u00E9ponse au rassemblement et \u00E0 la conversation." },
    erickson: { sublabel: "Excellence en Beaux-Arts\nU of Chicago Lab Schools, 2023", description: "Prix pour l\u2019excellence en beaux-arts, d\u00E9cern\u00E9 par les University of Chicago Laboratory Schools." },
    bestinshow: { sublabel: "Cat\u00E9gorie Design\nIHSAE Exposition Nord, 2023", description: "Meilleur de l\u2019exposition dans la cat\u00E9gorie Design \u00E0 l\u2019Illinois High School Art Exhibition, 2023." },
    scholastic: { sublabel: "Nomin\u00E9 American Visions\nCat\u00E9gorie Design, 2024", description: "Nomin\u00E9 pour le prix American Visions aux Scholastic Art & Writing Awards, cat\u00E9gorie Design, 2024." },
    surp: { sublabel: "New York Academy\nof Art, 2024", description: "Bourse SURP de la New York Academy of Art pour la r\u00E9sidence 2024." },
    spur: { sublabel: "Recherche RISD\n2026", description: "Bourse en cours financ\u00E9e \u00E0 l\u2019automne 2026 pour la construction d\u2019une base de donn\u00E9es de scans num\u00E9riques de la collection de sculptures et de cadres du mus\u00E9e RISD. Responsable du scan 3D, du codage des interactions web et de la recherche sur l\u2019histoire des sculptures et peintures pr\u00E9sent\u00E9es." },
    firebird: { sublabel: "\u00C9ducateur b\u00E9n\u00E9vole\nMars\u2013Mai 2022, Chicago, IL", description: "Animation d\u2019activit\u00E9s artistiques de groupe, incluant poterie et soufflage de verre pour des jeunes bless\u00E9s par la violence arm\u00E9e. Aide \u00E0 l\u2019enseignement et \u00E0 la gestion du mat\u00E9riel." },
    makerspace: { sublabel: "UChicago Laboratory Schools\nSep 2022\u2013Mai 2024", description: "Gestion des op\u00E9rations quotidiennes, budgets de plus de 5\u202Fk$ pour de nouvelles fournitures, d\u00E9veloppement de la communaut\u00E9 et formation des \u00E9l\u00E8ves aux technologies \u00E9mergentes dont l\u2019impression et le scan 3D." },
    bitforms: { sublabel: "Design Industriel\nWintersession 2026, Providence, RI", description: "Co-direction d\u2019un cours intensif sur la conception et la production de circuits \u00E9lectroniques au d\u00E9partement de Design Industriel de RISD. Pr\u00E9sentations de recherche sur les pratiques d\u2019atelier, gestion des installations et animation de discussions sur le r\u00F4le de la technologie et l\u2019impact de l\u2019\u00E9lectronique sur l\u2019environnement et la soci\u00E9t\u00E9." },
    valla: { sublabel: "Assistant de studio\n2026, Providence, RI", description: "Conception d\u2019un circuit automatis\u00E9 pour une grande pi\u00E8ce d\u2019art \u00E0 affichage LED pour Clement Valla et Bitforms Gallery. Responsable de l\u2019assemblage et de la programmation du circuit de contr\u00F4le d\u2019alimentation, ainsi que de la cr\u00E9ation d\u2019un syst\u00E8me pour le code en direct et la pr\u00E9vention de la corruption des donn\u00E9es." },
  },
  ko: {
    nyaa: { sublabel: "\uC5EC\uB984 \uB808\uC9C0\uB358\uC2DC\n2024", description: "\uB274\uC695 \uC544\uCE74\uB370\uBBF8 \uC624\uBE0C \uC544\uD2B8\uC758 \uC9D1\uC911 \uC5EC\uB984 \uB808\uC9C0\uB358\uC2DC \uD504\uB85C\uADF8\uB7A8." },
    risd: { sublabel: "B.F.A., \uC608\uC220 & \uCEF4\uD4E8\uD14C\uC774\uC158 + \uD68C\uD654\nProvidence, RI", description: "\uB85C\uB4DC\uC544\uC77C\uB79C\uB4DC \uC2A4\uCFE8 \uC624\uBE0C \uB514\uC790\uC778\uC5D0\uC11C \uC608\uC220 & \uCEF4\uD4E8\uD14C\uC774\uC158\uACFC \uD68C\uD654 \uBCF5\uC218\uC804\uACF5 B.F.A. \uACFC\uC815." },
    ss: { sublabel: "Corvus Gallery, Gordon Parks\nArts Hall, \uC2DC\uCE74\uACE0", description: "Gordon Parks Arts Hall\uC758 Corvus Gallery\uC5D0\uC11C \uC5F4\uB9B0 \uADF8\uB8F9\uC804." },
    "ihsae-ex": { sublabel: "Bridgeport Art Center\n\uC2DC\uCE74\uACE0", description: "Bridgeport Art Center\uC5D0\uC11C \uC5F4\uB9B0 \uC77C\uB9AC\uB178\uC774 \uACE0\uB4F1\uD559\uAD50 \uBBF8\uC220 \uC804\uC2DC\uD68C(\uBD81\uBD80 \uC9C0\uC5ED). \uB514\uC790\uC778 \uBD80\uBB38 \uCD5C\uC6B0\uC218\uC0C1 \uC218\uC0C1." },
    "tech-touch": { sublabel: "111 Franklin Street\n\uB274\uC695", description: "\uAE30\uC220\uACFC \uCD09\uAC01\uC801 \uC608\uC220 \uC81C\uC791 \uACFC\uC815\uC758 \uAD50\uCC28\uC810\uC744 \uD0D0\uAD6C\uD558\uB294 \uADF8\uB8F9\uC804, \uB274\uC695 111 Franklin Street." },
    "design-auto": { sublabel: "Waterman Gallery\nProvidence, RI", description: "RISD Waterman Gallery\uC5D0\uC11C \uB514\uC790\uC778 \uC790\uC728\uC131\uACFC \uCEF4\uD4E8\uD130 \uC800\uC791\uAD8C\uC758 \uACBD\uACC4\uB97C \uD0D0\uAD6C\uD558\uB294 \uC804\uC2DC." },
    efs: { sublabel: "Waterman Gallery\nProvidence, RI", description: "Waterman Gallery\uC5D0\uC11C \uC5F4\uB9B0 \uC2E4\uD5D8\uC801 \uD615\uD0DC \uC5F0\uAD6C \uADF8\uB8F9\uC804." },
    reframing: { sublabel: "\uD1B5\uD569 \uAE30\uC220 \uC13C\uD130\n(CIT), RISD", description: "RISD \uD1B5\uD569 \uAE30\uC220 \uC13C\uD130\uC5D0\uC11C \uC0C8\uB85C\uC6B4 \uC7AC\uD604 \uBC29\uC2DD\uC744 \uD0D0\uAD6C\uD558\uB294 \uADF8\uB8F9\uC804." },
    "60years": { sublabel: "Gordon Parks Arts Hall\nCorvus Gallery", description: "Gordon Parks Arts Hall, Corvus Gallery\uC5D0\uC11C 60\uB144\uAC04\uC758 \uC608\uC220 \uCC3D\uC791\uC744 \uAE30\uB150\uD558\uB294 \uC804\uC2DC." },
    unthought: { sublabel: "1719 S. Clinton St, Nowifi.us.com\n\uC2DC\uCE74\uACE0 (\uAC1C\uC778\uC804)", description: "\uD63C\uD569 \uBBF8\uB514\uC5B4 \uC124\uCE58\uB97C \uD1B5\uD574 \uB9AC\uBBF8\uB110\uB9AC\uD2F0\uC640 \uB514\uC9C0\uD138 \uC874\uC7AC\uB97C \uD0D0\uAD6C\uD558\uB294 \uAC1C\uC778\uC804, Nowifi.us.com." },
    coffee: { sublabel: "Memorial Hall\nProvidence, RI", description: "\uACF5\uB3D9\uCCB4\uC801 \uBAA8\uC784\uACFC \uB300\uD654\uC5D0 \uB300\uD55C \uC751\uB2F5\uC73C\uB85C \uC81C\uC791\uB41C \uC791\uD488\uC744 \uC120\uBCF4\uC774\uB294 \uCE5C\uBC00\uD55C \uADF8\uB8F9\uC804." },
    erickson: { sublabel: "\uBBF8\uC220 \uC6B0\uC218 \uC131\uCDE8\uC0C1\nU of Chicago Lab Schools, 2023", description: "\uC2DC\uCE74\uACE0 \uB300\uD559\uAD50 \uB7A9 \uC2A4\uCFE8\uC5D0\uC11C \uBBF8\uC220 \uBD84\uC57C \uC6B0\uC218 \uC131\uCDE8\uB85C \uC218\uC5EC\uB41C \uC0C1." },
    bestinshow: { sublabel: "\uB514\uC790\uC778 \uBD80\uBB38\nIHSAE \uBD81\uBD80 \uC804\uC2DC, 2023", description: "2023\uB144 \uC77C\uB9AC\uB178\uC774 \uACE0\uB4F1\uD559\uAD50 \uBBF8\uC220 \uC804\uC2DC\uD68C \uB514\uC790\uC778 \uBD80\uBB38 \uCD5C\uC6B0\uC218\uC0C1." },
    scholastic: { sublabel: "American Visions \uD6C4\uBCF4\n\uB514\uC790\uC778 \uBD80\uBB38, 2024", description: "2024\uB144 Scholastic Art & Writing Awards \uB514\uC790\uC778 \uBD80\uBB38 American Visions \uD6C4\uBCF4 \uC9C0\uBA85." },
    surp: { sublabel: "New York Academy\nof Art, 2024", description: "2024\uB144 \uC5EC\uB984 \uB808\uC9C0\uB358\uC2DC\uB97C \uC704\uD55C New York Academy of Art SURP \uC7A5\uD559\uAE08." },
    spur: { sublabel: "RISD \uC5F0\uAD6C\n2026", description: "2026\uB144 \uAC00\uC744\uC5D0 \uC790\uAE08\uC744 \uBC1B\uC544 RISD \uBC15\uBB3C\uAD00\uC758 \uC870\uAC01 \uBC0F \uC561\uC790 \uCEEC\uB809\uC158\uC758 \uB514\uC9C0\uD138 \uC2A4\uCE94 \uB370\uC774\uD130\uBCA0\uC774\uC2A4\uB97C \uAD6C\uCD95\uD558\uB294 \uC9C4\uD589 \uC911\uC778 \uBCF4\uC870\uAE08. 3D \uC2A4\uCE90\uB2DD\uACFC \uC6F9 \uC778\uD130\uB799\uC158 \uCF54\uB529, \uC870\uAC01 \uBC0F \uD68C\uD654 \uC5ED\uC0AC \uC5F0\uAD6C \uB2F4\uB2F9." },
    firebird: { sublabel: "\uC790\uC6D0\uBD09\uC0AC \uAD50\uC721\uC790\n2022\uB144 3\uC6D4\u20135\uC6D4, \uC2DC\uCE74\uACE0", description: "\uCD1D\uAE30 \uD3ED\uB825\uC73C\uB85C \uBD80\uC0C1\uB2F9\uD55C \uCCAD\uC18C\uB144\uC744 \uC704\uD55C \uB3C4\uC608 \uBC0F \uC720\uB9AC \uBD88\uAE30 \uB4F1 \uADF8\uB8F9 \uBBF8\uC220 \uD65C\uB3D9 \uC9C4\uD589. \uAD50\uC721 \uBC0F \uC7A5\uBE44 \uAD00\uB9AC \uC9C0\uC6D0." },
    makerspace: { sublabel: "UChicago Laboratory Schools\n2022\uB144 9\uC6D4\u20132024\uB144 5\uC6D4", description: "\uC77C\uC0C1 \uC6B4\uC601 \uAD00\uB9AC, \uC0C8 \uBB3C\uD488\uC744 \uC704\uD55C $5k \uC774\uC0C1\uC758 \uC608\uC0B0 \uC2B9\uC778, \uCEE4\uBBA4\uB2C8\uD2F0 \uD655\uC7A5, 3D \uD504\uB9B0\uD305 \uBC0F \uC2A4\uCE90\uB2DD \uB4F1 \uC2E0\uAE30\uC220 \uAD50\uC721." },
    bitforms: { sublabel: "\uC0B0\uC5C5 \uB514\uC790\uC778\nWintersession 2026, Providence, RI", description: "RISD \uC0B0\uC5C5 \uB514\uC790\uC778\uACFC\uC5D0\uC11C \uC804\uC790 \uD68C\uB85C \uAE30\uD310 \uC124\uACC4 \uBC0F \uC81C\uC791\uC5D0 \uAD00\uD55C \uC9D1\uC911 \uC2A4\uD29C\uB514\uC624 \uACFC\uC815 \uACF5\uB3D9 \uC9C0\uB3C4. \uB2E4\uC591\uD55C \uC608\uC220\uAC00 \uC2A4\uD29C\uB514\uC624 \uC2E4\uCC9C\uC5D0 \uB300\uD55C \uAC15\uC758\uC640 \uC5F0\uAD6C, \uC2DC\uC124 \uAD00\uB9AC, \uAE30\uC220\uACFC \uC804\uC790\uAE30\uAE30\uAC00 \uD658\uACBD\uACFC \uC0AC\uD68C\uC5D0 \uBBF8\uCE58\uB294 \uC601\uD5A5\uC5D0 \uB300\uD55C \uADF8\uB8F9 \uD1A0\uB860 \uC9C4\uD589." },
    valla: { sublabel: "\uC2A4\uD29C\uB514\uC624 \uC5B4\uC2DC\uC2A4\uD134\uD2B8\n2026, Providence, RI", description: "Clement Valla\uC640 Bitforms Gallery\uB97C \uC704\uD55C \uB300\uD615 LED \uB514\uC2A4\uD50C\uB808\uC774 \uC608\uC220 \uC791\uD488\uC758 \uC790\uB3D9\uD654 \uD68C\uB85C \uC124\uACC4. \uC870\uB9BD \uBC0F \uC804\uC6D0 \uC81C\uC5B4 \uD68C\uB85C \uD504\uB85C\uADF8\uB798\uBC0D, \uB77C\uC774\uBE0C \uCF54\uB4DC \uC2E4\uD589 \uBC0F \uC815\uC804 \uC2DC \uB370\uC774\uD130 \uC190\uC0C1 \uBC29\uC9C0 \uC2DC\uC2A4\uD15C \uAD6C\uCD95 \uB2F4\uB2F9." },
  },
  id: {
    nyaa: { sublabel: "Residensi Musim Panas\n2024", description: "Program residensi musim panas intensif di New York Academy of Art." },
    risd: { sublabel: "B.F.A., Seni & Komputasi + Lukisan\nProvidence, RI", description: "Menempuh B.F.A. jurusan ganda Seni & Komputasi dan Lukisan di Rhode Island School of Design." },
    ss: { sublabel: "Corvus Gallery, Gordon Parks\nArts Hall, Chicago, IL", description: "Pameran grup di Corvus Gallery di Gordon Parks Arts Hall, Chicago." },
    "ihsae-ex": { sublabel: "Bridgeport Art Center\nChicago, IL", description: "Pameran Seni Sekolah Menengah Illinois (Wilayah Utara) di Bridgeport Art Center. Penghargaan Best in Show kategori Desain." },
    "tech-touch": { sublabel: "111 Franklin Street\nNew York", description: "Pameran grup mengeksplorasi persimpangan teknologi dan proses seni taktil, 111 Franklin Street, New York." },
    "design-auto": { sublabel: "Waterman Gallery\nProvidence, RI", description: "Pameran yang mengkaji batas otonomi desain dan kepengarangan komputasional di Waterman Gallery RISD." },
    efs: { sublabel: "Waterman Gallery\nProvidence, RI", description: "Pameran grup Experimental Form Studies di Waterman Gallery, Providence, RI." },
    reframing: { sublabel: "Pusat Teknologi\nIntegratif (CIT), RISD", description: "Pameran grup di Pusat Teknologi Integratif RISD mengeksplorasi mode representasi baru." },
    "60years": { sublabel: "Gordon Parks Arts Hall\nCorvus Gallery", description: "Pameran peringatan merayakan 60 tahun berkarya seni di Gordon Parks Arts Hall, Corvus Gallery, Chicago." },
    unthought: { sublabel: "1719 S. Clinton St, Nowifi.us.com\nChicago, IL (Solo)", description: "Pameran solo mengeksplorasi liminalitas dan kehadiran digital melalui instalasi media campuran, di Nowifi.us.com." },
    coffee: { sublabel: "Memorial Hall\nProvidence, RI", description: "Pameran grup intim di Memorial Hall, Providence, menampilkan karya sebagai respons terhadap perkumpulan dan percakapan." },
    erickson: { sublabel: "Prestasi Tinggi Seni Rupa\nU of Chicago Lab Schools, 2023", description: "Penghargaan untuk prestasi tinggi dalam seni rupa dari University of Chicago Laboratory Schools." },
    bestinshow: { sublabel: "Kategori Desain\nIHSAE Pameran Utara, 2023", description: "Best in Show kategori Desain di Pameran Seni Sekolah Menengah Illinois (Wilayah Utara), 2023." },
    scholastic: { sublabel: "Nominasi American Visions\nKategori Desain, 2024", description: "Dinominasikan untuk penghargaan American Visions di Scholastic Art & Writing Awards kategori Desain, 2024." },
    surp: { sublabel: "New York Academy\nof Art, 2024", description: "Beasiswa SURP dari New York Academy of Art untuk residensi musim panas 2024." },
    spur: { sublabel: "Riset RISD\n2026", description: "Hibah yang sedang berlangsung, didanai pada musim gugur 2026 untuk membangun database scan digital koleksi patung dan bingkai museum RISD untuk dilihat secara langsung di web. Bertanggung jawab atas pemindaian 3D, pengkodean interaksi web, dan riset sejarah patung dan lukisan." },
    firebird: { sublabel: "Pendidik Sukarelawan\nMar\u2013Mei 2022, Chicago, IL", description: "Memfasilitasi kegiatan seni kelompok, termasuk tembikar dan peniupan kaca untuk remaja yang terluka akibat kekerasan senjata. Membantu pengajaran dan pengelolaan peralatan." },
    makerspace: { sublabel: "UChicago Laboratory Schools\nSep 2022\u2013Mei 2024", description: "Membantu mengelola operasi harian, mengajukan anggaran $5k+ untuk persediaan baru, memperluas komunitas, dan membantu mendidik siswa tentang teknologi baru termasuk pencetakan dan pemindaian 3D." },
    bitforms: { sublabel: "Desain Industri\nWintersession 2026, Providence, RI", description: "Membantu memimpin kursus studio intensif tentang desain dan produksi papan sirkuit elektronik di departemen Desain Industri RISD. Mempresentasikan kuliah dan riset tentang berbagai praktik studio seniman, mengelola fasilitas, dan memimpin diskusi kelompok tentang peran teknologi dan dampak elektronik terhadap lingkungan dan masyarakat." },
    valla: { sublabel: "Asisten Studio\n2026, Providence, RI", description: "Membantu merancang sirkuit otomatis untuk karya seni display LED besar untuk Clement Valla dan Bitforms Gallery. Bertanggung jawab atas perakitan dan pemrograman sirkuit kontrol daya, serta membuat sistem untuk menjalankan kode langsung dan mencegah kerusakan data akibat kehilangan daya." },
  },
  zh: {
    nyaa: { sublabel: "\u590F\u5B63\u9A7B\u7559\n2024", description: "\u7EBD\u7EA6\u827A\u672F\u5B66\u9662\u5F3A\u5316\u590F\u5B63\u9A7B\u7559\u9879\u76EE\u3002" },
    risd: { sublabel: "B.F.A., \u827A\u672F\u4E0E\u8BA1\u7B97 + \u7ED8\u753B\nProvidence, RI", description: "\u5728\u7F57\u5FB7\u5C9B\u8BBE\u8BA1\u5B66\u9662\u653B\u8BFB\u827A\u672F\u4E0E\u8BA1\u7B97\u548C\u7ED8\u753B\u53CC\u4E13\u4E1AB.F.A.\u5B66\u4F4D\u3002" },
    ss: { sublabel: "Corvus Gallery, Gordon Parks\nArts Hall, \u829D\u52A0\u54E5", description: "Gordon Parks Arts Hall\u7684Corvus Gallery\u7FA4\u5C55\u3002" },
    "ihsae-ex": { sublabel: "Bridgeport Art Center\n\u829D\u52A0\u54E5", description: "Bridgeport Art Center\u4E3E\u529E\u7684\u4F0A\u5229\u8BFA\u4F0A\u5DDE\u9AD8\u4E2D\u827A\u672F\u5C55(\u5317\u90E8\u5730\u533A)\u3002\u83B7\u5F97\u8BBE\u8BA1\u7C7B\u522B\u6700\u4F73\u5C55\u54C1\u5956\u3002" },
    "tech-touch": { sublabel: "111 Franklin Street\n\u7EBD\u7EA6", description: "\u63A2\u7D22\u6280\u672F\u4E0E\u89E6\u89C9\u827A\u672F\u521B\u4F5C\u8FC7\u7A0B\u4EA4\u53C9\u70B9\u7684\u7FA4\u5C55\uFF0C\u7EBD\u7EA6111 Franklin Street\u3002" },
    "design-auto": { sublabel: "Waterman Gallery\nProvidence, RI", description: "RISD Waterman Gallery\u63A2\u8BA8\u8BBE\u8BA1\u81EA\u4E3B\u6027\u548C\u8BA1\u7B97\u673A\u8457\u4F5C\u6743\u8FB9\u754C\u7684\u5C55\u89C8\u3002" },
    efs: { sublabel: "Waterman Gallery\nProvidence, RI", description: "Waterman Gallery\u5B9E\u9A8C\u5F62\u5F0F\u7814\u7A76\u7FA4\u5C55\u3002" },
    reframing: { sublabel: "\u7EFC\u5408\u6280\u672F\u4E2D\u5FC3\n(CIT), RISD", description: "RISD\u7EFC\u5408\u6280\u672F\u4E2D\u5FC3\u7FA4\u5C55\uFF0C\u63A2\u7D22\u65B0\u7684\u8868\u73B0\u65B9\u5F0F\u3002" },
    "60years": { sublabel: "Gordon Parks Arts Hall\nCorvus Gallery", description: "Gordon Parks Arts Hall, Corvus Gallery\u5E86\u795D60\u5E74\u827A\u672F\u521B\u4F5C\u7684\u7EAA\u5FF5\u5C55\u3002" },
    unthought: { sublabel: "1719 S. Clinton St, Nowifi.us.com\n\u829D\u52A0\u54E5 (\u4E2A\u5C55)", description: "\u901A\u8FC7\u6DF7\u5408\u5A92\u4F53\u88C5\u7F6E\u63A2\u7D22\u9608\u9650\u6027\u548C\u6570\u5B57\u5B58\u5728\u7684\u4E2A\u5C55\uFF0CNowifi.us.com\u3002" },
    coffee: { sublabel: "Memorial Hall\nProvidence, RI", description: "Memorial Hall\u4EB2\u5BC6\u7FA4\u5C55\uFF0C\u5C55\u793A\u56DE\u5E94\u793E\u533A\u805A\u4F1A\u548C\u5BF9\u8BDD\u7684\u4F5C\u54C1\u3002" },
    erickson: { sublabel: "\u7F8E\u672F\u4F18\u79C0\u6210\u5C31\u5956\nU of Chicago Lab Schools, 2023", description: "\u829D\u52A0\u54E5\u5927\u5B66\u5B9E\u9A8C\u5B66\u6821\u9881\u53D1\u7684\u7F8E\u672F\u4F18\u79C0\u6210\u5C31\u5956\u3002" },
    bestinshow: { sublabel: "\u8BBE\u8BA1\u7C7B\u522B\nIHSAE\u5317\u90E8\u5C55\u89C8, 2023", description: "2023\u5E74\u4F0A\u5229\u8BFA\u4F0A\u5DDE\u9AD8\u4E2D\u827A\u672F\u5C55\u8BBE\u8BA1\u7C7B\u522B\u6700\u4F73\u5C55\u54C1\u5956\u3002" },
    scholastic: { sublabel: "American Visions\u63D0\u540D\n\u8BBE\u8BA1\u7C7B\u522B, 2024", description: "2024\u5E74Scholastic Art & Writing Awards\u8BBE\u8BA1\u7C7B\u522BAmerican Visions\u63D0\u540D\u3002" },
    surp: { sublabel: "New York Academy\nof Art, 2024", description: "\u7EBD\u7EA6\u827A\u672F\u5B66\u9662SURP\u590F\u5B63\u9A7B\u7559\u5956\u5B66\u91D1\uFF0C2024\u3002" },
    spur: { sublabel: "RISD\u7814\u7A76\n2026", description: "2026\u5E74\u79CB\u5B63\u8D44\u52A9\u7684\u8FDB\u884C\u4E2D\u9879\u76EE\uFF0C\u6784\u5EFARISD\u535A\u7269\u9986\u96D5\u5851\u548C\u753B\u6846\u6536\u85CF\u7684\u6570\u5B57\u626B\u63CF\u6570\u636E\u5E93\uFF0C\u7528\u4E8E\u5728\u7EBF\u89C2\u770B\u3002\u8D1F\u8D233D\u626B\u63CF\u548C\u7F16\u7801\u7F51\u9875\u4EA4\u4E92\uFF0C\u4EE5\u53CA\u7814\u7A76\u76F8\u5173\u96D5\u5851\u548C\u7ED8\u753B\u7684\u5386\u53F2\u3002" },
    makerspace: { sublabel: "UChicago Laboratory Schools\n2022\u5E749\u6708\u20132024\u5E745\u6708", description: "\u534F\u52A9\u7BA1\u7406\u65E5\u5E38\u8FD0\u8425\uFF0C\u901A\u8FC7\u8D85\u8FC75\u5343\u7F8E\u5143\u7684\u65B0\u7269\u8D44\u9884\u7B97\uFF0C\u6269\u5927\u793E\u533A\uFF0C\u5E2E\u52A9\u5B66\u751F\u5B66\u4E60\u65B0\u5174\u6280\u672F\uFF0C\u5305\u62EC3D\u6253\u5370\u548C\u626B\u63CF\u3002" },
    firebird: { sublabel: "\u5FD7\u613F\u6559\u80B2\u8005\n2022\u5E743\u6708\u20135\u6708, \u829D\u52A0\u54E5", description: "\u7EC4\u7EC7\u56E2\u4F53\u827A\u672F\u6D3B\u52A8\uFF0C\u5305\u62EC\u4E3A\u56E0\u67AA\u652F\u66B4\u529B\u53D7\u4F24\u7684\u9752\u5C11\u5E74\u63D0\u4F9B\u9676\u827A\u548C\u5439\u73BB\u7483\u8BFE\u7A0B\u3002\u534F\u52A9\u6559\u5B66\u548C\u8BBE\u5907\u7BA1\u7406\u3002" },
    bitforms: { sublabel: "\u5DE5\u4E1A\u8BBE\u8BA1\nWintersession 2026, Providence, RI", description: "\u534F\u52A9\u4E3B\u5BFCRISD\u5DE5\u4E1A\u8BBE\u8BA1\u7CFB\u7535\u5B50\u7535\u8DEF\u677F\u8BBE\u8BA1\u4E0E\u5236\u4F5C\u7684\u5BC6\u96C6\u5DE5\u4F5C\u5BA4\u8BFE\u7A0B\u3002\u5C55\u793A\u827A\u672F\u5BB6\u5DE5\u4F5C\u5BA4\u5B9E\u8DF5\u7684\u8BB2\u5EA7\u548C\u7814\u7A76\uFF0C\u7BA1\u7406\u8BBE\u65BD\uFF0C\u4E3B\u6301\u5173\u4E8E\u6280\u672F\u89D2\u8272\u548C\u7535\u5B50\u4EA7\u54C1\u5BF9\u73AF\u5883\u548C\u793E\u4F1A\u5F71\u54CD\u7684\u5C0F\u7EC4\u8BA8\u8BBA\u3002" },
    valla: { sublabel: "\u5DE5\u4F5C\u5BA4\u52A9\u7406\n2026, Providence, RI", description: "\u4E3AClement Valla\u548CBitforms Gallery\u8BBE\u8BA1\u5927\u578BLED\u663E\u793A\u5C4F\u827A\u672F\u4F5C\u54C1\u7684\u81EA\u52A8\u5316\u7535\u8DEF\u3002\u8D1F\u8D23\u7EC4\u88C5\u548C\u7F16\u7A0B\u7535\u6E90\u63A7\u5236\u7535\u8DEF\uFF0C\u4EE5\u53CA\u521B\u5EFA\u8FD0\u884C\u5B9E\u65F6\u4EE3\u7801\u548C\u9632\u6B62\u65AD\u7535\u6570\u636E\u635F\u574F\u7684\u7CFB\u7EDF\u3002" },
  },
  ja: {
    nyaa: { sublabel: "\u590F\u5B63\u30EC\u30B8\u30C7\u30F3\u30B7\u30FC\n2024", description: "\u30CB\u30E5\u30FC\u30E8\u30FC\u30AF\u30FB\u30A2\u30AB\u30C7\u30DF\u30FC\u30FB\u30AA\u30D6\u30FB\u30A2\u30FC\u30C8\u306E\u96C6\u4E2D\u590F\u5B63\u30EC\u30B8\u30C7\u30F3\u30B7\u30FC\u30D7\u30ED\u30B0\u30E9\u30E0\u3002" },
    risd: { sublabel: "B.F.A., \u30A2\u30FC\u30C8&\u30B3\u30F3\u30D4\u30E5\u30C6\u30FC\u30B7\u30E7\u30F3 + \u7D75\u753B\nProvidence, RI", description: "\u30ED\u30FC\u30C9\u30A2\u30A4\u30E9\u30F3\u30C9\u30FB\u30B9\u30AF\u30FC\u30EB\u30FB\u30AA\u30D6\u30FB\u30C7\u30B6\u30A4\u30F3\u3067\u30A2\u30FC\u30C8&\u30B3\u30F3\u30D4\u30E5\u30C6\u30FC\u30B7\u30E7\u30F3\u3068\u7D75\u753B\u306E\u30C0\u30D6\u30EB\u30E1\u30B8\u30E3\u30FC B.F.A.\u3092\u53D6\u5F97\u4E2D\u3002" },
    ss: { sublabel: "Corvus Gallery, Gordon Parks\nArts Hall, \u30B7\u30AB\u30B4", description: "Gordon Parks Arts Hall\u306ECorvus Gallery\u3067\u306E\u30B0\u30EB\u30FC\u30D7\u5C55\u3002" },
    "ihsae-ex": { sublabel: "Bridgeport Art Center\n\u30B7\u30AB\u30B4", description: "Bridgeport Art Center\u3067\u958B\u50AC\u3055\u308C\u305F\u30A4\u30EA\u30CE\u30A4\u5DDE\u9AD8\u6821\u7F8E\u8853\u5C55(\u5317\u90E8\u5730\u533A)\u3002\u30C7\u30B6\u30A4\u30F3\u90E8\u9580\u30D9\u30B9\u30C8\u30A4\u30F3\u30B7\u30E7\u30FC\u53D7\u8CDE\u3002" },
    "tech-touch": { sublabel: "111 Franklin Street\n\u30CB\u30E5\u30FC\u30E8\u30FC\u30AF", description: "\u30C6\u30AF\u30CE\u30ED\u30B8\u30FC\u3068\u89E6\u899A\u7684\u306A\u30A2\u30FC\u30C8\u5236\u4F5C\u30D7\u30ED\u30BB\u30B9\u306E\u4EA4\u5DEE\u70B9\u3092\u63A2\u308B\u30B0\u30EB\u30FC\u30D7\u5C55\u3002" },
    "design-auto": { sublabel: "Waterman Gallery\nProvidence, RI", description: "RISD Waterman Gallery\u3067\u30C7\u30B6\u30A4\u30F3\u306E\u81EA\u5F8B\u6027\u3068\u30B3\u30F3\u30D4\u30E5\u30FC\u30BF\u8457\u4F5C\u6A29\u306E\u5883\u754C\u3092\u63A2\u308B\u5C55\u89A7\u4F1A\u3002" },
    efs: { sublabel: "Waterman Gallery\nProvidence, RI", description: "Waterman Gallery\u3067\u306E\u5B9F\u9A13\u7684\u5F62\u614B\u7814\u7A76\u30B0\u30EB\u30FC\u30D7\u5C55\u3002" },
    reframing: { sublabel: "\u7D71\u5408\u6280\u8853\u30BB\u30F3\u30BF\u30FC\n(CIT), RISD", description: "RISD\u7D71\u5408\u6280\u8853\u30BB\u30F3\u30BF\u30FC\u3067\u65B0\u3057\u3044\u8868\u73FE\u65B9\u6CD5\u3092\u63A2\u308B\u30B0\u30EB\u30FC\u30D7\u5C55\u3002" },
    "60years": { sublabel: "Gordon Parks Arts Hall\nCorvus Gallery", description: "Gordon Parks Arts Hall, Corvus Gallery\u306760\u5E74\u9593\u306E\u82B8\u8853\u5275\u4F5C\u3092\u795D\u3046\u8A18\u5FF5\u5C55\u3002" },
    unthought: { sublabel: "1719 S. Clinton St, Nowifi.us.com\n\u30B7\u30AB\u30B4 (\u500B\u5C55)", description: "\u30DF\u30AF\u30B9\u30C8\u30E1\u30C7\u30A3\u30A2\u30A4\u30F3\u30B9\u30BF\u30EC\u30FC\u30B7\u30E7\u30F3\u3092\u901A\u3058\u3066\u95BE\u6027\u3068\u30C7\u30B8\u30BF\u30EB\u5B58\u5728\u3092\u63A2\u308B\u500B\u5C55\u3002" },
    coffee: { sublabel: "Memorial Hall\nProvidence, RI", description: "\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3\u306E\u96C6\u3044\u3068\u5BFE\u8A71\u306B\u5FDC\u3048\u305F\u4F5C\u54C1\u3092\u5C55\u793A\u3059\u308B\u89AA\u5BC6\u306A\u30B0\u30EB\u30FC\u30D7\u5C55\u3002" },
    erickson: { sublabel: "\u7F8E\u8853\u512A\u79C0\u8CDE\nU of Chicago Lab Schools, 2023", description: "\u30B7\u30AB\u30B4\u5927\u5B66\u5B9F\u9A13\u5B66\u6821\u304B\u3089\u306E\u7F8E\u8853\u5206\u91CE\u512A\u79C0\u6210\u7E3E\u8CDE\u3002" },
    bestinshow: { sublabel: "\u30C7\u30B6\u30A4\u30F3\u90E8\u9580\nIHSAE\u5317\u90E8\u5C55, 2023", description: "2023\u5E74\u30A4\u30EA\u30CE\u30A4\u5DDE\u9AD8\u6821\u7F8E\u8853\u5C55\u30C7\u30B6\u30A4\u30F3\u90E8\u9580\u30D9\u30B9\u30C8\u30A4\u30F3\u30B7\u30E7\u30FC\u8CDE\u3002" },
    scholastic: { sublabel: "American Visions\u30CE\u30DF\u30CD\u30FC\u30C8\n\u30C7\u30B6\u30A4\u30F3\u90E8\u9580, 2024", description: "2024\u5E74Scholastic Art & Writing Awards\u30C7\u30B6\u30A4\u30F3\u90E8\u9580American Visions\u30CE\u30DF\u30CD\u30FC\u30C8\u3002" },
    surp: { sublabel: "New York Academy\nof Art, 2024", description: "\u30CB\u30E5\u30FC\u30E8\u30FC\u30AF\u30FB\u30A2\u30AB\u30C7\u30DF\u30FC\u30FB\u30AA\u30D6\u30FB\u30A2\u30FC\u30C8SURP\u590F\u5B63\u30EC\u30B8\u30C7\u30F3\u30B7\u30FC\u5968\u5B66\u91D1\u30022024\u5E74\u3002" },
    spur: { sublabel: "RISD\u7814\u7A76\n2026", description: "2026\u5E74\u79CB\u306B\u8CC7\u91D1\u63D0\u4F9B\u3055\u308C\u305F\u9032\u884C\u4E2D\u306E\u52A9\u6210\u91D1\u3002RISD\u7F8E\u8853\u9928\u306E\u5F6B\u523B\u304A\u3088\u3073\u984D\u7E01\u30B3\u30EC\u30AF\u30B7\u30E7\u30F3\u306E\u30C7\u30B8\u30BF\u30EB\u30B9\u30AD\u30E3\u30F3\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u3092\u69CB\u7BC9\u3057\u3001\u30A6\u30A7\u30D6\u4E0A\u3067\u30E9\u30A4\u30D6\u95B2\u89A7\u53EF\u80FD\u306B\u30023D\u30B9\u30AD\u30E3\u30F3\u3068\u30A6\u30A7\u30D6\u30A4\u30F3\u30BF\u30E9\u30AF\u30B7\u30E7\u30F3\u306E\u30B3\u30FC\u30C7\u30A3\u30F3\u30B0\u3001\u5F6B\u523B\u3068\u7D75\u753B\u306E\u6B74\u53F2\u7814\u7A76\u3092\u62C5\u5F53\u3002" },
    makerspace: { sublabel: "UChicago Laboratory Schools\n2022\u5E749\u6708\u20132024\u5E745\u6708", description: "\u65E5\u5E38\u904B\u55B6\u306E\u7BA1\u7406\u3001\u65B0\u3057\u3044\u8CC7\u6750\u306E\u305F\u3081\u306E5\u5343\u30C9\u30EB\u4EE5\u4E0A\u306E\u4E88\u7B97\u627F\u8A8D\u3001\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3\u306E\u62E1\u5927\u30013D\u30D7\u30EA\u30F3\u30C8\u3084\u30B9\u30AD\u30E3\u30F3\u306A\u3069\u306E\u65B0\u6280\u8853\u306B\u3064\u3044\u3066\u751F\u5F92\u3092\u6559\u80B2\u3002" },
    firebird: { sublabel: "\u30DC\u30E9\u30F3\u30C6\u30A3\u30A2\u6559\u80B2\u8005\n2022\u5E743\u6708\u20135\u6708, \u30B7\u30AB\u30B4", description: "\u9283\u306B\u3088\u308B\u66B4\u529B\u3067\u8CA0\u50B7\u3057\u305F\u9752\u5C11\u5E74\u306E\u305F\u3081\u306E\u9676\u82B8\u3084\u30AC\u30E9\u30B9\u5439\u304D\u306A\u3069\u306E\u30B0\u30EB\u30FC\u30D7\u30A2\u30FC\u30C8\u6D3B\u52D5\u3092\u4FC3\u9032\u3002\u6559\u80B2\u3068\u6A5F\u6750\u7BA1\u7406\u3092\u652F\u63F4\u3002" },
    bitforms: { sublabel: "\u30A4\u30F3\u30C0\u30B9\u30C8\u30EA\u30A2\u30EB\u30C7\u30B6\u30A4\u30F3\nWintersession 2026, Providence, RI", description: "RISD\u30A4\u30F3\u30C0\u30B9\u30C8\u30EA\u30A2\u30EB\u30C7\u30B6\u30A4\u30F3\u5B66\u79D1\u3067\u96FB\u5B50\u56DE\u8DEF\u57FA\u677F\u306E\u8A2D\u8A08\u3068\u88FD\u9020\u306B\u95A2\u3059\u308B\u96C6\u4E2D\u30B9\u30BF\u30B8\u30AA\u30B3\u30FC\u30B9\u3092\u5171\u540C\u6307\u5C0E\u3002\u30A2\u30FC\u30C6\u30A3\u30B9\u30C8\u306E\u30B9\u30BF\u30B8\u30AA\u5B9F\u8DF5\u306B\u95A2\u3059\u308B\u8B1B\u7FA9\u3068\u7814\u7A76\u3001\u65BD\u8A2D\u7BA1\u7406\u3001\u6280\u8853\u306E\u5F79\u5272\u3068\u96FB\u5B50\u6A5F\u5668\u304C\u74B0\u5883\u3068\u793E\u4F1A\u306B\u4E0E\u3048\u308B\u5F71\u97FF\u306B\u3064\u3044\u3066\u306E\u30B0\u30EB\u30FC\u30D7\u30C7\u30A3\u30B9\u30AB\u30C3\u30B7\u30E7\u30F3\u3092\u4E3B\u5C0E\u3002" },
    valla: { sublabel: "\u30B9\u30BF\u30B8\u30AA\u30A2\u30B7\u30B9\u30BF\u30F3\u30C8\n2026, Providence, RI", description: "Clement Valla\u3068Bitforms Gallery\u306E\u305F\u3081\u306E\u5927\u578BLED\u30C7\u30A3\u30B9\u30D7\u30EC\u30A4\u30A2\u30FC\u30C8\u4F5C\u54C1\u306E\u81EA\u52D5\u5316\u56DE\u8DEF\u3092\u8A2D\u8A08\u3002\u7D44\u307F\u7ACB\u3066\u3068\u96FB\u6E90\u5236\u5FA1\u56DE\u8DEF\u306E\u30B9\u30AF\u30EA\u30D7\u30C8\u4F5C\u6210\u3001\u30E9\u30A4\u30D6\u30B3\u30FC\u30C9\u5B9F\u884C\u3068\u505C\u96FB\u6642\u306E\u30C7\u30FC\u30BF\u7834\u640D\u9632\u6B62\u30B7\u30B9\u30C6\u30E0\u306E\u69CB\u7BC9\u3092\u62C5\u5F53\u3002" },
  },
};

// Map x-coordinate ranges to years for mobile grouping
function nodeYear(node: CVNode): number {
  if (node.x <= 16) return node.x <= 8 ? 2022 : 2023;
  if (node.x <= 42) return 2024;
  if (node.x <= 68) return 2025;
  return 2026;
}

export default function CVPage({ onClose, lang = "en" }: { onClose: () => void; lang?: Lang }) {
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());
  const [animatedEdges, setAnimatedEdges] = useState<Set<string>>(new Set());
  const [showIntro, setShowIntro] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<CVNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<CVNode | null>(null);
  const animTimers = useRef<number[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Use window width only (not canvas size) to avoid oscillation between layouts
    const check = () => setIsMobile(window.innerWidth < 1200);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // suppress unused onClose warning
  void onClose;

  const sectionLabels = sectionLabelsAll[lang] || sectionLabelsAll.en;
  const cvTitle = cvTitleAll[lang] || cvTitleAll.en;
  const groupShowLabel = groupShowAll[lang] || groupShowAll.en;
  const soloShowLabel = soloShowAll[lang] || soloShowAll.en;
  const downloadCv = downloadCvAll[lang] || downloadCvAll.en;

  const getNodeSublabel = (node: CVNode) =>
    cvTranslations[lang]?.[node.id]?.sublabel ?? node.sublabel;

  const getNodeDescription = (node: CVNode) =>
    cvTranslations[lang]?.[node.id]?.description ?? node.description;

  const sortedNodes = useMemo(
    () => [...nodes].sort((a, b) => a.x - b.x),
    []
  );

  const nodeMap = useMemo(() => {
    const m = new Map<string, CVNode>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setCanvasSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const t0 = window.setTimeout(() => setShowIntro(true), 100);
    animTimers.current.push(t0);

    sortedNodes.forEach((node, i) => {
      const t = window.setTimeout(() => {
        setVisibleNodes((prev) => new Set(prev).add(node.id));
      }, 400 + i * 120);
      animTimers.current.push(t);
    });

    edges.forEach((edge) => {
      const fromNode = nodeMap.get(edge.from);
      const toNode = nodeMap.get(edge.to);
      if (!fromNode || !toNode) return;
      const fromIdx = sortedNodes.findIndex((n) => n.id === edge.from);
      const toIdx = sortedNodes.findIndex((n) => n.id === edge.to);
      const laterIdx = Math.max(fromIdx, toIdx);
      const delay = 400 + laterIdx * 120 + 200;
      const t = window.setTimeout(() => {
        setAnimatedEdges((prev) => new Set(prev).add(edge.id));
      }, delay);
      animTimers.current.push(t);
    });

    const totalNodeTime = 400 + sortedNodes.length * 120;
    const tTimeline = window.setTimeout(
      () => setShowTimeline(true),
      totalNodeTime + 300
    );
    animTimers.current.push(tTimeline);

    return () => {
      animTimers.current.forEach((t) => clearTimeout(t));
      animTimers.current = [];
    };
  }, [sortedNodes, nodeMap]);

  const nodePosPx = (n: CVNode) => ({
    x: (n.x / 100) * canvasSize.w,
    y: (n.y / 100) * canvasSize.h,
  });

  const lineLength = (from: CVNode, to: CVNode) => {
    const p1 = nodePosPx(from);
    const p2 = nodePosPx(to);
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  };

  const labelOffset = ICON_SIZE + 5;

  // Edges connected to the hovered node
  const connectedEdges = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const s = new Set<string>();
    for (const e of edges) {
      if (e.from === hoveredNode.id || e.to === hoveredNode.id) s.add(e.id);
    }
    return s;
  }, [hoveredNode]);

  // Only the hovered node itself is highlighted
  const highlightedNodeId = hoveredNode?.id ?? null;

  // The node to display in the description panel (sticky)
  const displayNode = hoveredNode || selectedNode;

  // Sort nodes by x for mobile chronological list
  const mobileNodes = useMemo(() => [...nodes].sort((a, b) => a.x - b.x || a.y - b.y), []);

  // Group by year for mobile
  const mobileGroups = useMemo(() => {
    const groups: { year: number; items: CVNode[] }[] = [];
    let currentYear = -1;
    for (const n of mobileNodes) {
      const yr = nodeYear(n);
      if (yr !== currentYear) {
        groups.push({ year: yr, items: [n] });
        currentYear = yr;
      } else {
        groups[groups.length - 1].items.push(n);
      }
    }
    return groups;
  }, [mobileNodes]);

  // Mobile: tapped node for description
  const [tappedNode, setTappedNode] = useState<string | null>(null);

  return (
    <div style={{ height: isMobile ? "auto" : "100%", display: "flex", flexDirection: "column", paddingRight: isMobile ? 0 : 30 }}>
      {/* Title + Key row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: isMobile ? 8 : 24,
          marginTop: isMobile ? 10 : 40,
          marginBottom: 8,
          paddingLeft: isMobile ? 0 : 30,

          opacity: showIntro ? 1 : 0,
          transform: showIntro ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
          flexWrap: "wrap",
        }}
      >
        {!isMobile && (
          <div style={{ minWidth: 120 }}>
            <div style={{ fontSize: 13, fontWeight: 400, color: "#bbb", marginBottom: 2 }}>
              <AnimatedText>{cvTitle}</AnimatedText>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: isMobile ? 8 : 12, paddingTop: 2, flexWrap: "wrap" }}>
          {(["education", "exhibition", "award", "experience"] as const).map((sec) => (
            <div
              key={sec}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: isMobile ? 9 : 11,
                color: "#ccc",
                whiteSpace: "nowrap",
              }}
            >
              <NodeIcon section={sec} light />
              {isMobile ? sectionLabels[sec] : <AnimatedText>{sectionLabels[sec]}</AnimatedText>}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: isMobile ? 9 : 11, color: "#ccc", whiteSpace: "nowrap" }}>
            <TagIcon char="G" light />
            {isMobile ? groupShowLabel : <AnimatedText>{groupShowLabel}</AnimatedText>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: isMobile ? 9 : 11, color: "#ccc", whiteSpace: "nowrap" }}>
            <TagIcon char="S" light />
            {isMobile ? soloShowLabel : <AnimatedText>{soloShowLabel}</AnimatedText>}
          </div>
        </div>
      </div>

      {/* Network diagram canvas */}
      <div
        ref={canvasRef}
        style={{
          position: "relative",
          flex: isMobile ? undefined : 1,
          minHeight: isMobile ? 500 : 250,
          maxHeight: isMobile ? undefined : 480,
          height: isMobile ? 500 : undefined,
          marginTop: isMobile ? 0 : 50,
          overflow: "visible",
        }}
      >
        <svg
          width={canvasSize.w}
          height={canvasSize.h}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 0,
            overflow: "visible",
          }}
        >
          {edges.map((edge) => {
            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            if (!fromNode || !toNode) return null;
            const p1 = nodePosPx(fromNode);
            const p2 = nodePosPx(toNode);
            const len = lineLength(fromNode, toNode);
            const isAnimated = animatedEdges.has(edge.id);
            const dimmed = hoveredNode && !connectedEdges.has(edge.id);
            const lineColor = sectionColors[fromNode.section];
            return (
              <line
                key={edge.id}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={lineColor}
                strokeWidth={1.5}
                strokeDasharray={len}
                strokeDashoffset={isAnimated ? 0 : len}
                style={{
                  opacity: dimmed ? 0.15 : isMobile ? 0.3 : 0.6,
                  transition: isAnimated
                    ? "stroke-dashoffset 600ms ease-out, opacity 0.4s ease"
                    : "opacity 0.4s ease",
                }}
              />
            );
          })}
        </svg>

        {nodes.map((node) => {
          const isVisible = visibleNodes.has(node.id);
          const flipLabel = node.x >= FLIP_THRESHOLD;
          const dimmed = hoveredNode && node.id !== highlightedNodeId;
          return (
            <div
              key={node.id}
              onMouseEnter={() => { setHoveredNode(node); setSelectedNode(node); }}
              onMouseLeave={() => setHoveredNode(null)}
              style={{
                position: "absolute",
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: isVisible
                  ? `translate(-50%, -50%)${isMobile ? " scale(0.7)" : ""}`
                  : `translate(-50%, calc(-50% + 6px))${isMobile ? " scale(0.7)" : ""}`,
                opacity: !isVisible ? 0 : dimmed ? 0.15 : isMobile ? 0.4 : 1,
                transition: "opacity 0.4s ease, transform 0.35s ease",

                zIndex: 1,
                overflow: "visible",
                cursor: "default",
                transformOrigin: "center center",
              }}
            >
              <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                {node.tag ? <TagIcon char={node.tag} /> : <NodeIcon section={node.section} />}
              </div>
              <div
                style={{
                  position: "absolute",
                  ...(flipLabel
                    ? { right: labelOffset, textAlign: "right" as const }
                    : { left: labelOffset }),
                  top: 0,
                  whiteSpace: isMobile ? "nowrap" : "pre-line",
                  width: "max-content",
                  fontSize: isMobile ? 8 : 10,
                  fontWeight: 600,
                  color: isMobile ? "#bbb" : "#666",
                  lineHeight: 1.3,
                  background: "#fff",
                  padding: "0 2px",
                }}
              >
                {isMobile ? (mobileLabels[node.id] || node.label.replace(/\n/g, " ")) : node.label}
              </div>
              {!isMobile && getNodeSublabel(node) && (
                <div
                  style={{
                    position: "absolute",
                    ...(flipLabel
                      ? { right: labelOffset, textAlign: "right" as const }
                      : { left: labelOffset }),
                    top: node.label.includes("\n") ? 28 : 15,
                    whiteSpace: "pre-line",
                    width: "max-content",
                    fontSize: 9,
                    color: "#999",
                    lineHeight: 1.4,
                    background: "#fff",
                    padding: "0 2px",
                  }}
                >
                  {getNodeSublabel(node)}
                </div>
              )}
            </div>
          );
        })}

        {/* Timeline years */}
        <div
          style={{
            position: "absolute",
            bottom: -20,
            left: 0,
            right: 0,
            opacity: showTimeline ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
      
              fontSize: 10,
              color: "#bbb",
              paddingLeft: "4%",
              paddingRight: "4%",
            }}
          >
            {TIMELINE_YEARS.map((year) => (
              <span key={year}>{year}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Hover description + Download CV below timeline */}
      {!isMobile && (
        <div
          style={{
            marginTop: 55,
            paddingLeft: 30,
          }}
        >
          {/* Node description (shown on hover) */}
          <div
            key={displayNode?.id || "empty"}
            style={{
              maxWidth: 500,
              minHeight: displayNode ? undefined : 0,
              marginBottom: displayNode ? 16 : 0,
              ...(displayNode
                ? { animation: "cvDescFadeIn 0.6s ease forwards" }
                : { opacity: 0 }),
            }}
          >
            {displayNode && (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: sectionColors[displayNode.section], flexShrink: 0 }} />
                  {displayNode.label.replace(/\n/g, " ")}
                  <span style={{ fontWeight: 400, color: "#999", marginLeft: 4 }}>
                    {sectionLabels[displayNode.section]}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: "#bbb", lineHeight: 1.5, margin: 0 }}>
                  {getNodeDescription(displayNode)}
                </p>
              </>
            )}
          </div>
          {/* Download CV (always visible, finishes with graph) */}
          {(() => {
            const FADE_WIN = 4;
            const graphEnd = 400 + sortedNodes.length * 120 + 300;
            const dlStart = 600;
            const gap = 100;
            const totalChars = downloadCv.title.length + downloadCv.desc.length + FADE_WIN * 2;
            const charSpeed = Math.max(10, Math.floor((graphEnd - dlStart - gap) / totalChars));
            const titleEnd = dlStart + (downloadCv.title.length + FADE_WIN) * charSpeed;
            const descStart = titleEnd + gap;
            return (
              <div style={{ maxWidth: 500 }}>
                <a
                  href="/Reid_Surmeier_CV.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, transition: "opacity 0.3s ease", opacity: hoveredNode ? 0.5 : 1 }}>
                    <path d="M6 2v6M3.5 6L6 8.5 8.5 6" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2.5 10.5h7" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 600, color: hoveredNode ? "#bbb" : "#666", transition: "color 0.3s ease" }}>
                    <TypewriterText delay={dlStart} speed={charSpeed}>{downloadCv.title}</TypewriterText>
                  </span>
                </a>
                <p style={{ fontSize: 11, color: "#bbb", lineHeight: 1.5, margin: 0, opacity: hoveredNode ? 0.5 : 1, transition: "opacity 0.3s ease" }}>
                  <TypewriterText delay={descStart} speed={charSpeed}>{downloadCv.desc}</TypewriterText>
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Mobile: Tappable list below graph */}
      {isMobile && (
        <div style={{ marginTop: 40, paddingBottom: 40 }}>
          {mobileGroups.map((group) => (
            <div key={group.year} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 10,
                color: "#bbb",
                marginBottom: 6,
                paddingBottom: 3,
                borderBottom: "1px solid #eee",
              }}>
                {group.year}
              </div>
              {group.items.map((node) => {
                const isOpen = tappedNode === node.id;
                const color = sectionColors[node.section];
                return (
                  <div
                    key={node.id}
                    onClick={() => setTappedNode(isOpen ? null : node.id)}
                    style={{ marginBottom: 10 }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <div style={{
                        width: 3,
                        minHeight: 24,
                        borderRadius: 2,
                        background: color,
                        opacity: 0.6,
                        flexShrink: 0,
                        marginTop: 1,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                          {node.tag ? <TagIcon char={node.tag} /> : <NodeIcon section={node.section} />}
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#666", lineHeight: 1.3 }}>
                            {node.label.replace(/\n/g, " ")}
                          </span>
                        </div>
                        {getNodeSublabel(node) && (
                          <div style={{ fontSize: 9, color: "#999", lineHeight: 1.4, marginLeft: 19 }}>
                            {getNodeSublabel(node)?.replace(/\n/g, " · ")}
                          </div>
                        )}
                        {isOpen && getNodeDescription(node) && (
                          <div style={{
                            fontSize: 10,
                            color: "#bbb",
                            lineHeight: 1.5,
                            marginTop: 6,
                            marginLeft: 19,
                            paddingLeft: 8,
                            borderLeft: `2px solid ${color}`,
                          }}>
                            {getNodeDescription(node)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {/* Download Full CV */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #eee" }}>
            <a
              href="/Reid_Surmeier_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                <path d="M6 2v6M3.5 6L6 8.5 8.5 6" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.5 10.5h7" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#666" }}>
                {downloadCv.title}
              </span>
            </a>
            <p style={{ fontSize: 11, color: "#bbb", lineHeight: 1.5, margin: 0 }}>
              {downloadCv.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
