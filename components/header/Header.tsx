import Link from "next/link";
import Image from "next/image";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";

export default function Header() {
  return (
    <header className="sticky top-0 z-[80] flex items-center justify-between gap-6 bg-white/90 px-5 py-3 backdrop-blur">
      <div className="flex items-center gap-8">
        <Link id="site-logo" href="/" aria-label="MA Studio & Partners — home" className="shrink-0">
          <Image src="/mastudio/logo-dark.png" alt="MA Studio & Partners" width={48} height={48} priority />
        </Link>
        <NavLinks />
      </div>
      <SearchBar />
    </header>
  );
}
