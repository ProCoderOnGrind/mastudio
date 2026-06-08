import Link from "next/link";
export default function NotFound() {
  return (
    <div className="px-5 py-24">
      <h1 className="page-title">404</h1>
      <Link href="/" className="label hover:text-big-gray">Back to projects</Link>
    </div>
  );
}
