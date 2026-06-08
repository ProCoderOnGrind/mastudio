// Downloads MA Studio images + logo into /public/mastudio and writes data/ma-projects.json
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const man = JSON.parse(readFileSync("scripts/ma-content.json", "utf8"));

// Patch the two projects that missed on the first pass (use lighter 1024 variants).
const PATCH = {
  "green-pine-resort": [
    "https://mastudio.al/wp-content/uploads/2023/03/MA-STUDIO-Green-Pine-Resort-13-1-1024x610.jpg",
    "https://mastudio.al/wp-content/uploads/2023/03/MA-STUDIO-Green-Pine-Resort-1-1024x610.jpg",
    "https://mastudio.al/wp-content/uploads/2023/03/MA-STUDIO-Green-Pine-Resort-4.jpg",
    "https://mastudio.al/wp-content/uploads/2023/03/MA-STUDIO-Green-Pine-Resort-2.jpg",
  ],
  "universe-city-masterplan": [
    "https://mastudio.al/wp-content/uploads/2023/03/MA-STUDIO-Univers-City-Master-Plan-kopertina.jpg",
    "https://mastudio.al/wp-content/uploads/2023/03/MA-STUDIO-Univers-City-Master-Plan-1-1-1024x610.jpg",
    "https://mastudio.al/wp-content/uploads/2023/03/MA-STUDIO-Univers-City-Master-Plan-2-1024x576.jpg",
  ],
};

const LOGOS = {
  "logo-white.png": "https://mastudio.al/wp-content/uploads/2022/03/MA-STUDIO-white-web.png",
  "logo-dark.png": "https://mastudio.al/wp-content/uploads/2022/03/MA-STUDIO-jeshjile-web-copy-100.png",
};

// Prefer a lighter variant when the URL is a heavy original that has a known 1024 sibling pattern.
function lighten(url) {
  // already a sized variant -> keep
  if (/-\d{3,4}x\d{3,4}\.\w+$/.test(url)) return url;
  return url; // base original; keep (Next/Image will resize at serve time)
}

async function dl(url, dest) {
  if (existsSync(dest)) return true;
  try {
    const r = await fetch(url, { redirect: "follow" });
    if (!r.ok) return false;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 800) return false; // skip tiny/error images
    writeFileSync(dest, buf);
    return true;
  } catch {
    return false;
  }
}

async function pool(tasks, n = 6) {
  const out = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      out[idx] = await tasks[idx]();
    }
  }
  await Promise.all(Array.from({ length: n }, worker));
  return out;
}

async function main() {
  mkdirSync("public/mastudio", { recursive: true });

  // logos
  for (const [name, url] of Object.entries(LOGOS)) {
    const ok = await dl(url, `public/mastudio/${name}`);
    console.log("logo", name, ok ? "ok" : "FAIL");
  }

  const out = [];
  for (const p of man.projects) {
    let imgs = p.images.length ? p.images : PATCH[p.slug] || [];
    imgs = imgs.map(lighten).slice(0, 5);
    mkdirSync(`public/mastudio/${p.slug}`, { recursive: true });
    const local = [];
    const tasks = imgs.map((url, idx) => async () => {
      const ext = (url.split(".").pop() || "jpg").split("?")[0].toLowerCase();
      const rel = `mastudio/${p.slug}/img-${idx}.${ext}`;
      const ok = await dl(url, `public/${rel}`);
      if (ok) local.push("/" + rel);
    });
    await pool(tasks, 6);
    local.sort();
    out.push({ slug: p.slug, name: p.name, type: p.type, year: p.year, location: p.location, images: local });
    console.log(p.slug, "->", local.length, "downloaded");
  }

  mkdirSync("data", { recursive: true });
  writeFileSync("data/ma-projects.json", JSON.stringify(out, null, 2));
  const totalImgs = out.reduce((s, p) => s + p.images.length, 0);
  const zero = out.filter((p) => p.images.length === 0).map((p) => p.slug);
  console.log("\nDONE. projects:", out.length, "images:", totalImgs, "zero:", zero.join(",") || "none");
}
main();
