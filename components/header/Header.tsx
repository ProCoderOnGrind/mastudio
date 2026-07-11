import Link from "next/link";
import Image from "next/image";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";

export default function Header() {
  return (
    <header className="sticky top-0 z-[80] flex items-center justify-between gap-4 bg-white/90 px-4 py-3 backdrop-blur md:gap-6 md:px-5">
      <div className="flex items-center gap-5 md:gap-8">
        <Link id="site-logo" href="/" aria-label="MA Studio & Partners — home" className="shrink-0">
          <Image src="/mastudio/logo-seal.png" alt="MA Studio & Partners" width={48} height={48} priority className="h-8 w-8 md:h-12 md:w-12" />
        </Link>
        <NavLinks />
      </div>
      <SearchBar />
    </header>
  );
}
