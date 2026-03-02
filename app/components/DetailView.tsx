"use client";

import { useState } from "react";
import type { TileData } from "../data";

export default function DetailView({
  tile,
  section,
  onClose,
}: {
  tile: TileData;
  section: "txt" | "img";
  onClose: () => void;
}) {
  const [stripeHover, setStripeHover] = useState("");
  const [stripeHovered, setStripeHovered] = useState(false);

  const caption = tile.subtitle
    ? `${tile.title} – ${tile.subtitle.replace(/\n/g, " ")}   [${tile.range}]`
    : `${tile.title}   [${tile.range}]`;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#fff",
        fontFamily: "var(--site-font)",
        fontSize: 13,
        lineHeight: "15px",
      }}
    >
      {/* Header left - H.R.Fricker */}
      <div style={{ position: "absolute", top: 15, left: 20 }}>
        <span style={{ color: "#000" }}>H.R.Fricker</span>
      </div>

      {/* Back button - top right */}
      <div
        style={{
          position: "absolute",
          top: 13,
          right: 25,
          cursor: "pointer",
          zIndex: 1001,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            fontSize: 16,
            color: "#000",
            padding: 0,
          }}
        >
          &uarr; Back
        </button>
      </div>

      {/* Caption area */}
      <div
        style={{
          position: "absolute",
          top: 15,
          left: 130,
          right: 100,
          fontSize: 13,
          lineHeight: "15px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {stripeHover || caption}
      </div>

      {/* Book stripe - horizontal scrolling timeline */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          width: "100%",
          height: 185,
          overflowX: "auto",
          overflowY: "hidden",
          zIndex: 1000,
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            paddingLeft: 130,
            paddingRight: 55,
            height: "100%",
            alignItems: "flex-start",
          }}
        >
          {/* Overview image as the timeline strip element */}
          <div
            style={{
              float: "left",
              margin: stripeHovered ? 3 : 6,
              border: stripeHovered ? "3px solid #999" : "none",
              borderRadius: stripeHovered ? 3 : 0,
            }}
            onMouseEnter={() => {
              setStripeHovered(true);
              setStripeHover(caption);
            }}
            onMouseLeave={() => {
              setStripeHovered(false);
              setStripeHover("");
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tile.stripeImage || tile.thumbnail}
              alt=""
              style={{ height: 150, width: "auto", display: "block" }}
            />
          </div>
        </div>
      </div>

      {/* Range label below stripe */}
      <div
        style={{
          position: "absolute",
          top: 195,
          left: 130,
          fontSize: 12,
          lineHeight: "15px",
          color: "#000",
        }}
      >
        {tile.range}
      </div>

      {/* PDF viewer */}
      <div
        style={{
          position: "absolute",
          top: 230,
          left: 0,
          right: 0,
          bottom: 0,
          background: "#fff",
        }}
      >
        {tile.pdf ? (
          <iframe
            src={tile.pdf}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title={`${tile.title} PDF`}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "rgba(0,0,0,0.4)",
              fontSize: 13,
            }}
          >
            PDF not available for this section.
          </div>
        )}
      </div>
    </div>
  );
}
