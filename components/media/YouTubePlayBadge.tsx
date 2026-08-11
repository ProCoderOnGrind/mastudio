/**
 * The familiar YouTube play button, sized to sit over an editorial image.
 *
 * Purely decorative: the surrounding element owns the link and the accessible
 * name, so this is hidden from assistive tech and transparent to pointer
 * events. Rest state is the muted near-black YouTube uses over artwork; the
 * parent's `group` hover/focus lifts it to full brand red.
 */
export default function YouTubePlayBadge() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
    >
      <svg
        viewBox="0 0 68 48"
        className="h-[38px] w-[54px] drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 md:h-[48px] md:w-[68px]"
      >
        <path
          d="M66.52 7.74a8.03 8.03 0 0 0-5.65-5.7C55.79.9 34 .9 34 .9s-21.79 0-26.87 1.14a8.03 8.03 0 0 0-5.65 5.7A84.1 84.1 0 0 0 .5 24a84.1 84.1 0 0 0 .98 16.26 8.03 8.03 0 0 0 5.65 5.7C12.21 47.1 34 47.1 34 47.1s21.79 0 26.87-1.14a8.03 8.03 0 0 0 5.65-5.7A84.1 84.1 0 0 0 67.5 24a84.1 84.1 0 0 0-.98-16.26Z"
          className="fill-black/75 transition-colors duration-300 group-hover:fill-[#f00] group-focus-visible:fill-[#f00] motion-reduce:transition-none"
        />
        <path d="M27 34V14l18 10-18 10Z" className="fill-white" />
      </svg>
    </span>
  );
}
