import Link from "next/link";
import Menu from "./Menu";
import CategoryTabs from "./CategoryTabs";
import CommandMenu from "./CommandMenu";

export default function Header() {
  return (
    <header className="sticky top-0 z-[80] flex items-center justify-between gap-6 bg-white/90 px-5 py-4 backdrop-blur">
      <div className="flex items-center gap-5">
        <Link href="/" className="text-xl font-bold tracking-tight">BIG</Link>
        <Menu />
      </div>
      <CategoryTabs />
      <CommandMenu />
    </header>
  );
}
