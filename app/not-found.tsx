import Link from "next/link";

export default function NotFound() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white font-[var(--site-font)] text-[13px] leading-[15px]">
      <h1 className="text-[48px] font-bold leading-none">404</h1>
      <p className="mt-[8px] text-black/60">Page not found</p>
      <Link
        href="/"
        className="mt-[24px] text-black underline underline-offset-2 hover:no-underline"
      >
        &larr; Back to home
      </Link>
    </div>
  );
}
