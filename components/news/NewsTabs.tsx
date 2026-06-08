import Link from "next/link";

const TABS = [
  { label: "News", href: "/news" },
  { label: "Events", href: "/news/events" },
  { label: "Awards", href: "/news/awards" },
  { label: "Lectures", href: "/news/lectures" },
];

export default function NewsTabs({ active }: { active: string }) {
  return (
    <div className="flex flex-col gap-1 px-5">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href}
          className={`label ${active === t.label.toLowerCase() ? "text-black" : "meta"} hover:text-black`}>
          {active === t.label.toLowerCase() ? "■ " : ""}{t.label}
        </Link>
      ))}
    </div>
  );
}
