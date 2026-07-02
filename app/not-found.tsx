import Link from "next/link";
export default function NotFound() {
  return (
    <div className="px-5 py-24">
      <h1 className="page-title">404</h1>
      <p className="meta mt-4 max-w-[48ch] text-[15px]">
        This page doesn&apos;t exist — it may have been moved or removed.
      </p>
      <Link
        href="/"
        className="label mt-8 inline-block border-b border-black pb-0.5 transition-colors hover:border-accent hover:text-accent"
      >
        Back to projects
      </Link>
    </div>
  );
}
