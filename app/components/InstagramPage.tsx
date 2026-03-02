"use client";

import { useEffect } from "react";

const posts = [
  "https://www.instagram.com/p/DSijcgFjrh7/",
  "https://www.instagram.com/p/DNyrf183DEK/",
  "https://www.instagram.com/p/C-yCGh7SrNf/",
];

export default function InstagramPage({ onClose }: { onClose: () => void }) {
  void onClose;
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).instgrm?.Embeds?.process();
    };
    return () => {
      try { document.body.removeChild(script); } catch { /* already removed */ }
    };
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
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
          <span>Input_005</span>
          <span>Instagram</span>
        </div>
      </div>

      {/* Post embeds */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingTop: "clamp(20px, 4vw, 40px)",
          paddingRight: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          {posts.map((url) => (
            <blockquote
              key={url}
              className="instagram-media"
              data-instgrm-permalink={url}
              data-instgrm-version="14"
              data-instgrm-captioned
              style={{
                background: "#FFF",
                border: "1px solid #eee",
                borderRadius: 0,
                margin: 0,
                padding: 0,
                maxWidth: 400,
                minWidth: 280,
                width: "calc(33% - 14px)",
              }}
            />
          ))}
        </div>

        <p
          style={{
            fontFamily: "var(--site-font)",
            fontSize: 11,
            color: "#bbb",
            marginTop: 30,
            marginBottom: 40,
          }}
        >
          Follow{" "}
          <a
            href="https://www.instagram.com/reidsurmeier/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#666", textDecoration: "none" }}
          >
            @reidsurmeier
          </a>
        </p>
      </div>
    </div>
  );
}
