export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function gradientFor(seed: string): string {
  const h = hashString(seed);
  const base = 30 + (h % 50);
  const delta = 12 + ((h >> 4) % 18);
  const angle = h % 180;
  const c1 = `hsl(0 0% ${base}%)`;
  const c2 = `hsl(0 0% ${Math.min(base + delta, 92)}%)`;
  return `linear-gradient(${angle}deg, ${c1}, ${c2})`;
}

export function blurDataURL(seed: string): string {
  const h = hashString(seed);
  const l = 35 + (h % 40);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8">` +
    `<rect width="8" height="8" fill="hsl(0,0%,${l}%)"/></svg>`;
  const b64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${b64}`;
}
