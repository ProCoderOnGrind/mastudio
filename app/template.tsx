"use client";
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-[fadein_.4s_cubic-bezier(.4,0,.2,1)]">
      {children}
      <style>{`@keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
