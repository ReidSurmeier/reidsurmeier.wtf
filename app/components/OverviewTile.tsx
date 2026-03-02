"use client";

import { useState, forwardRef } from "react";
import type { TileData } from "../data";

const OverviewTile = forwardRef<HTMLDivElement, {
  tile: TileData;
  section: "txt" | "img";
  visible?: boolean;
  mobile?: boolean;
  onHover: (text: string, title?: string) => void;
  onLeave: () => void;
  onClick: (tile: TileData, section: "txt" | "img") => void;
}>(function OverviewTile({
  tile,
  section,
  visible = true,
  mobile,
  onHover,
  onLeave,
  onClick,
}, ref) {
  const [hovered, setHovered] = useState(false);
  const hoverText = tile.subtitle
    ? `${tile.title}\n${tile.subtitle}`
    : tile.title;

  const mobileLink = mobile && tile.pdf;

  return (
    <a
      href={mobileLink ? tile.pdf : "#"}
      target={mobileLink ? "_blank" : undefined}
      rel={mobileLink ? "noopener noreferrer" : undefined}
      onClick={mobileLink ? undefined : (e) => {
        e.preventDefault();
        onClick(tile, section);
      }}
      onMouseEnter={() => {
        setHovered(true);
        onHover(hoverText, tile.title);
      }}
      onMouseLeave={() => {
        setHovered(false);
        onLeave();
      }}
      style={{
        position: "relative",
        float: "left",
        paddingRight: 10,
        paddingBottom: 20,
        paddingTop: 10,
        display: "block",
        textDecoration: "none",
        border: "none",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.6s ease, transform 0.4s ease",
      }}
    >
      <div
        ref={ref}
        style={{
          position: "relative",
          width: 116,
          height: 150,
          overflow: "hidden",
          border: "1px solid #ccc",
          marginLeft: 6,
          marginRight: 6,
          outline: hovered ? "3px solid #aaa" : "none",
          outlineOffset: -3,
          borderRadius: hovered ? 3 : 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tile.thumbnail}
          alt=""
          style={{ height: 150, width: "auto", display: "block" }}
        />
      </div>
      <span
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          textAlign: "center",
          fontSize: 12,
          lineHeight: "15px",
          display: "block",
        }}
      >
        {tile.range}
      </span>
    </a>
  );
});

export default OverviewTile;
