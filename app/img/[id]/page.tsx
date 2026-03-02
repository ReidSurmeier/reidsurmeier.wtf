import type { Metadata } from "next";
import Link from "next/link";
import { imgTiles } from "../../data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return imgTiles.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tile = imgTiles.find((t) => t.id === id);
  if (!tile) return {};

  return {
    title: tile.title,
    description: tile.subtitle || undefined,
    alternates: { canonical: `/img/${tile.id}` },
    openGraph: {
      title: tile.title,
      description: tile.subtitle || undefined,
      images: [{ url: tile.thumbnail }],
    },
  };
}

export default async function ImgPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tile = imgTiles.find((t) => t.id === id);
  if (!tile) notFound();

  return (
    <div className="absolute inset-0 bg-white font-[var(--site-font)] text-[13px] leading-[15px]">
      <div className="absolute top-[15px] left-[20px]">
        <Link href="/" className="text-black no-underline hover:border-b hover:border-white">
          H.R.Fricker
        </Link>
      </div>
      <div className="absolute top-[13px] right-[25px] cursor-pointer">
        <Link href="/" className="text-black no-underline">
          &uarr; Back
        </Link>
      </div>
      <div className="absolute top-[60px] left-[20px] right-[20px]">
        <h1 className="text-[13px] font-bold leading-[18px] mb-[4px]">{tile.title}</h1>
        {tile.subtitle && (
          <p className="text-[13px] leading-[18px] text-black/70">
            {tile.subtitle.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        )}
        <p className="mt-[12px] text-[12px] text-black/50">{tile.range}</p>
        <div className="mt-[40px] border border-black p-[20px]">
          <p className="text-[12px] text-black/60">
            Content for this section will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
