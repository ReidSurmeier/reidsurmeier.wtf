"use client";

import { useState, useRef, useEffect } from "react";
import TextScatterLoader from "./TextScatterLoader";

const highlightColors = [
  "#EFEF3B", "#C5D5F0", "#C5A0D0", "#F0C5D5",
  "#D5F0C5", "#F0D5C5", "#C5F0E8", "#E8C5F0",
];

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

function Highlight({ children, color }: { children: React.ReactNode; color: string }) {
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

type Lang = "en" | "de" | "fr" | "ko" | "id" | "zh" | "ja";

const contactTranslations: Record<Lang, {
  title: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  send: string;
  sending: string;
  sent: string;
  sentMsg: string;
  error: string;
  intro: (hl: typeof Highlight) => React.ReactNode;
}> = {
  en: {
    title: "Contact",
    name: "Name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    send: "Send",
    sending: "Sending...",
    sent: "Sent",
    sentMsg: "Thank you! Your message has been sent. I\u2019ll get back to you soon.",
    error: "Something went wrong. Please email me directly at",
    intro: (Hl) => <>
      <strong style={{ color: "#666", fontWeight: 800 }}>Hi!</strong> Please don&apos;t hesitate to <a href="mailto:Rsurmeier@risd.edu?subject=Hi!" style={{ textDecoration: "none" }}><Hl color="#C5D5F0">email me</Hl></a> or use the <Hl color="#D5F0C5">contact form</Hl> below. I would be happy to answer any questions! My email is <a href="mailto:Rsurmeier@risd.edu?subject=Hi!" style={{ textDecoration: "none" }}><Hl color="#EFEF3B">Rsurmeier@risd.edu</Hl></a>. I don&apos;t check <Hl color="#F0C5D5">Instagram DM&apos;s</Hl> so please send me email.
    </>,
  },
  de: {
    title: "Kontakt",
    name: "Name",
    email: "E-Mail",
    subject: "Betreff",
    message: "Nachricht",
    send: "Senden",
    sending: "Sende...",
    sent: "Gesendet",
    sentMsg: "Vielen Dank! Ihre Nachricht wurde gesendet. Ich melde mich bald.",
    error: "Etwas ist schiefgelaufen. Bitte schreiben Sie mir direkt an",
    intro: (Hl) => <>
      <strong style={{ color: "#666", fontWeight: 800 }}>Hallo!</strong> Z\u00F6gern Sie nicht, mir eine <a href="mailto:Rsurmeier@risd.edu?subject=Hallo!" style={{ textDecoration: "none" }}><Hl color="#C5D5F0">E-Mail zu schreiben</Hl></a> oder das <Hl color="#D5F0C5">Kontaktformular</Hl> unten zu nutzen. Ich beantworte gerne Ihre Fragen! Meine E-Mail ist <a href="mailto:Rsurmeier@risd.edu?subject=Hallo!" style={{ textDecoration: "none" }}><Hl color="#EFEF3B">Rsurmeier@risd.edu</Hl></a>. Ich lese keine <Hl color="#F0C5D5">Instagram-DMs</Hl>, bitte senden Sie mir eine E-Mail.
    </>,
  },
  fr: {
    title: "Contact",
    name: "Nom",
    email: "E-mail",
    subject: "Objet",
    message: "Message",
    send: "Envoyer",
    sending: "Envoi...",
    sent: "Envoy\u00E9",
    sentMsg: "Merci ! Votre message a \u00E9t\u00E9 envoy\u00E9. Je vous r\u00E9pondrai bient\u00F4t.",
    error: "Une erreur s\u2019est produite. Veuillez m\u2019\u00E9crire directement \u00E0",
    intro: (Hl) => <>
      <strong style={{ color: "#666", fontWeight: 800 }}>Bonjour !</strong> N&apos;h\u00E9sitez pas \u00E0 m&apos;<a href="mailto:Rsurmeier@risd.edu?subject=Bonjour!" style={{ textDecoration: "none" }}><Hl color="#C5D5F0">envoyer un email</Hl></a> ou \u00E0 utiliser le <Hl color="#D5F0C5">formulaire de contact</Hl> ci-dessous. Je serai ravi de r\u00E9pondre \u00E0 vos questions ! Mon email est <a href="mailto:Rsurmeier@risd.edu?subject=Bonjour!" style={{ textDecoration: "none" }}><Hl color="#EFEF3B">Rsurmeier@risd.edu</Hl></a>. Je ne consulte pas les <Hl color="#F0C5D5">DMs Instagram</Hl>, veuillez m&apos;envoyer un email.
    </>,
  },
  ko: {
    title: "\uC5F0\uB77D\uCC98",
    name: "\uC774\uB984",
    email: "\uC774\uBA54\uC77C",
    subject: "\uC81C\uBAA9",
    message: "\uBA54\uC2DC\uC9C0",
    send: "\uBCF4\uB0B4\uAE30",
    sending: "\uBCF4\uB0B4\uB294 \uC911...",
    sent: "\uC804\uC1A1\uB428",
    sentMsg: "\uAC10\uC0AC\uD569\uB2C8\uB2E4! \uBA54\uC2DC\uC9C0\uAC00 \uC804\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uACE7 \uB2F5\uBCC0\uB4DC\uB9AC\uACA0\uC2B5\uB2C8\uB2E4.",
    error: "\uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC9C1\uC811 \uC774\uBA54\uC77C\uC744 \uBCF4\uB0B4\uC8FC\uC138\uC694",
    intro: (Hl) => <>
      <strong style={{ color: "#666", fontWeight: 800 }}>\uC548\uB155\uD558\uC138\uC694!</strong> <a href="mailto:Rsurmeier@risd.edu?subject=\uC548\uB155\uD558\uC138\uC694!" style={{ textDecoration: "none" }}><Hl color="#C5D5F0">\uC774\uBA54\uC77C</Hl></a>\uC744 \uBCF4\uB0B4\uAC70\uB098 \uC544\uB798 <Hl color="#D5F0C5">\uC5F0\uB77D \uC591\uC2DD</Hl>\uC744 \uC0AC\uC6A9\uD574 \uC8FC\uC138\uC694. \uC81C \uC774\uBA54\uC77C\uC740 <a href="mailto:Rsurmeier@risd.edu?subject=\uC548\uB155\uD558\uC138\uC694!" style={{ textDecoration: "none" }}><Hl color="#EFEF3B">Rsurmeier@risd.edu</Hl></a>\uC785\uB2C8\uB2E4. <Hl color="#F0C5D5">Instagram DM</Hl>\uC740 \uD655\uC778\uD558\uC9C0 \uC54A\uC73C\uB2C8 \uC774\uBA54\uC77C\uC744 \uBCF4\uB0B4 \uC8FC\uC138\uC694.
    </>,
  },
  id: {
    title: "Kontak",
    name: "Nama",
    email: "Email",
    subject: "Subjek",
    message: "Pesan",
    send: "Kirim",
    sending: "Mengirim...",
    sent: "Terkirim",
    sentMsg: "Terima kasih! Pesan Anda telah terkirim. Saya akan segera membalas.",
    error: "Terjadi kesalahan. Silakan kirim email langsung ke",
    intro: (Hl) => <>
      <strong style={{ color: "#666", fontWeight: 800 }}>Halo!</strong> Jangan ragu untuk <a href="mailto:Rsurmeier@risd.edu?subject=Halo!" style={{ textDecoration: "none" }}><Hl color="#C5D5F0">mengirim email</Hl></a> atau gunakan <Hl color="#D5F0C5">formulir kontak</Hl> di bawah. Email saya adalah <a href="mailto:Rsurmeier@risd.edu?subject=Halo!" style={{ textDecoration: "none" }}><Hl color="#EFEF3B">Rsurmeier@risd.edu</Hl></a>. Saya tidak mengecek <Hl color="#F0C5D5">DM Instagram</Hl>, silakan kirim email.
    </>,
  },
  zh: {
    title: "\u8054\u7CFB",
    name: "\u59D3\u540D",
    email: "\u7535\u5B50\u90AE\u4EF6",
    subject: "\u4E3B\u9898",
    message: "\u6D88\u606F",
    send: "\u53D1\u9001",
    sending: "\u53D1\u9001\u4E2D...",
    sent: "\u5DF2\u53D1\u9001",
    sentMsg: "\u8C22\u8C22\uFF01\u60A8\u7684\u6D88\u606F\u5DF2\u53D1\u9001\u3002\u6211\u4F1A\u5C3D\u5FEB\u56DE\u590D\u3002",
    error: "\u51FA\u9519\u4E86\u3002\u8BF7\u76F4\u63A5\u53D1\u90AE\u4EF6\u81F3",
    intro: (Hl) => <>
      <strong style={{ color: "#666", fontWeight: 800 }}>\u4F60\u597D\uFF01</strong>\u8BF7\u968F\u65F6<a href="mailto:Rsurmeier@risd.edu?subject=\u4F60\u597D!" style={{ textDecoration: "none" }}><Hl color="#C5D5F0">\u7ED9\u6211\u53D1\u90AE\u4EF6</Hl></a>\u6216\u4F7F\u7528\u4E0B\u9762\u7684<Hl color="#D5F0C5">\u8054\u7CFB\u8868\u5355</Hl>\u3002\u6211\u7684\u90AE\u7BB1\u662F <a href="mailto:Rsurmeier@risd.edu?subject=\u4F60\u597D!" style={{ textDecoration: "none" }}><Hl color="#EFEF3B">Rsurmeier@risd.edu</Hl></a>\u3002\u6211\u4E0D\u67E5\u770B <Hl color="#F0C5D5">Instagram \u79C1\u4FE1</Hl>\uFF0C\u8BF7\u53D1\u90AE\u4EF6\u3002
    </>,
  },
  ja: {
    title: "\u304A\u554F\u3044\u5408\u308F\u305B",
    name: "\u540D\u524D",
    email: "\u30E1\u30FC\u30EB",
    subject: "\u4EF6\u540D",
    message: "\u30E1\u30C3\u30BB\u30FC\u30B8",
    send: "\u9001\u4FE1",
    sending: "\u9001\u4FE1\u4E2D...",
    sent: "\u9001\u4FE1\u6E08\u307F",
    sentMsg: "\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\uFF01\u30E1\u30C3\u30BB\u30FC\u30B8\u304C\u9001\u4FE1\u3055\u308C\u307E\u3057\u305F\u3002\u8FD1\u3044\u3046\u3061\u306B\u304A\u8FD4\u4E8B\u3057\u307E\u3059\u3002",
    error: "\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u76F4\u63A5\u30E1\u30FC\u30EB\u3092\u304A\u9001\u308A\u304F\u3060\u3055\u3044",
    intro: (Hl) => <>
      <strong style={{ color: "#666", fontWeight: 800 }}>\u3053\u3093\u306B\u3061\u306F\uFF01</strong><a href="mailto:Rsurmeier@risd.edu?subject=\u3053\u3093\u306B\u3061\u306F!" style={{ textDecoration: "none" }}><Hl color="#C5D5F0">\u30E1\u30FC\u30EB</Hl></a>\u3092\u9001\u308B\u304B\u3001\u4E0B\u306E<Hl color="#D5F0C5">\u304A\u554F\u3044\u5408\u308F\u305B\u30D5\u30A9\u30FC\u30E0</Hl>\u3092\u3054\u5229\u7528\u304F\u3060\u3055\u3044\u3002\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u306F <a href="mailto:Rsurmeier@risd.edu?subject=\u3053\u3093\u306B\u3061\u306F!" style={{ textDecoration: "none" }}><Hl color="#EFEF3B">Rsurmeier@risd.edu</Hl></a>\u3067\u3059\u3002<Hl color="#F0C5D5">Instagram DM</Hl>\u306F\u78BA\u8A8D\u3057\u3066\u3044\u307E\u305B\u3093\u306E\u3067\u3001\u30E1\u30FC\u30EB\u3092\u304A\u9001\u308A\u304F\u3060\u3055\u3044\u3002
    </>,
  },
};

export default function ContactForm({ onClose, lang = "en" }: { onClose: () => void; lang?: Lang }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  void onClose;
  const [contentVisible, setContentVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setContentVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const ct = contactTranslations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("https://formspree.io/f/xpwzgkwa", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name,
          _replyto: email,
          _subject: subject || "Contact from reidsurmeier.wtf",
          message,
        }),
      });
      if (res.ok) {
        setStatus("sent");
        setName(""); setEmail(""); setSubject(""); setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 0",
    border: "none",
    borderBottom: "1px solid #ddd",
    outline: "none",
    fontFamily: "var(--site-font)",
    fontSize: 13,
    color: "#333",
    background: "transparent",
    transition: "border-color 0.2s ease",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--site-font)",
    fontSize: 10,
    color: "#bbb",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 4,
    display: "block",
  };

  const [loaderDone, setLoaderDone] = useState(false);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      {!loaderDone && (
        <TextScatterLoader
          text="Contact"
          amount={3}
          fontSize={2.5}
          interval={20}
          windowSize={7}
          duration={1200}
          onDone={() => setLoaderDone(true)}
        />
      )}
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--site-font)",
          fontSize: 11,
          color: "#bbb",
          borderBottom: "1px solid #eee",
          paddingBottom: 4,
          marginRight: 20,
        }}
      >
        <div style={{ display: "flex", gap: 20 }}>
          <TypewriterText delay={100} speed={50}>{"003"}</TypewriterText>
          <TypewriterText delay={300} speed={40}>{ct.title}</TypewriterText>
        </div>
      </div>

      {/* Form area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingTop: "clamp(30px, 6vw, 80px)",
          paddingRight: "clamp(40px, 8vw, 160px)",
          paddingLeft: 30,
          opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          style={{ width: "100%", maxWidth: 520 }}
        >
          {/* Intro text — bio style */}
          <p style={{
            fontFamily: "var(--site-font)",
            fontSize: "clamp(13px, 1.2vw, 17px)",
            fontWeight: 500,
            color: "#bbb",
            lineHeight: 1.4,
            textAlign: "justify",
            hyphens: "auto",
            overflowWrap: "break-word",
            marginBottom: 36,
          } as React.CSSProperties}>
            {ct.intro(Highlight)}
          </p>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>{ct.name}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#000")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#ddd")}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>{ct.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#000")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#ddd")}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>{ct.subject}</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#000")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#ddd")}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>{ct.message}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: 100,
              }}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#000")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#ddd")}
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              background: "transparent",
              border: "1px solid #ddd",
              padding: "8px 28px",
              fontFamily: "var(--site-font)",
              fontSize: 11,
              color: "#bbb",

              transition: "color 0.15s ease, border-color 0.15s ease",
              letterSpacing: "0.05em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#000";
              e.currentTarget.style.borderColor = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#bbb";
              e.currentTarget.style.borderColor = "#ddd";
            }}
          >
            {status === "sending" ? ct.sending : status === "sent" ? ct.sent : status === "error" ? ct.send : ct.send}
          </button>

          {status === "sent" && (
            <p
              style={{
                marginTop: 16,
                fontFamily: "var(--site-font)",
                fontSize: 11,
                color: "#bbb",
              }}
            >
              {ct.sentMsg}
            </p>
          )}
          {status === "error" && (
            <p
              style={{
                marginTop: 16,
                fontFamily: "var(--site-font)",
                fontSize: 11,
                color: "#bbb",
              }}
            >
              {ct.error}{" "}
              <a href="mailto:rsurmeie@risd.edu" style={{ color: "#666", textDecoration: "none" }}>rsurmeie@risd.edu</a>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
