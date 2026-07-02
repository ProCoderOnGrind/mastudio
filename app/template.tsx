"use client";
// Opacity-only on purpose: animating transform would make this wrapper the
// containing block for fixed-position pages (e.g. ProjectPageView's
// `fixed inset-0`), collapsing them for the duration of the animation.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-[fadein_.4s_cubic-bezier(.4,0,.2,1)]">
      {children}
      <style>{`@keyframes fadein{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}
