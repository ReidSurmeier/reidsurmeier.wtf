import type { MetadataRoute } from "next";
import { imgTiles, txtTiles } from "./data";

export const dynamic = "force-static";

const BASE = "https://reidsurmeier.wtf";

export default function sitemap(): MetadataRoute.Sitemap {
  const img = imgTiles.map((t) => ({
    url: `${BASE}/img/${t.id}`,
    lastModified: new Date(),
  }));

  const txt = txtTiles.map((t) => ({
    url: `${BASE}/txt/${t.id}`,
    lastModified: new Date(),
  }));

  return [{ url: BASE, lastModified: new Date() }, ...img, ...txt];
}
