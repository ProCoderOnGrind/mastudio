import Link from "next/link";
import Image from "next/image";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";

/**
 * Height is pinned to `--header-h` (app/globals.css) rather than left to the
 * content, because the homepage sizes its hero photo against that number.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-[80] flex h-[var(--header-h)] items-center justify-between gap-4 bg-white/90 px-4 backdrop-blur md:gap-6 md:px-5">
      <div className="flex items-center gap-6 md:gap-8 lg:gap-7 xl:gap-10">
        <Link id="site-logo" href="/" aria-label="MA Studio & Partners — home" className="shrink-0">
          <Image
            src="/mastudio/logo-seal.png"
            alt="MA Studio & Partners — architecture studio in Tirana, Albania"
            width={65}
            height={65}
            priority
            className="h-11 w-11 md:h-[65px] md:w-[65px]"
          />
        </Link>
        <NavLinks />
      </div>
      <SearchBar />
    </header>
  );
}
