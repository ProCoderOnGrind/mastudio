"use client";
export default function BackToTop() {
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="label mt-8 hover:text-big-gray transition-colors">
      Back to top ↑
    </button>
  );
}
