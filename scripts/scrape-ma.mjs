// Scrapes mastudio.al portfolio pages + about into a manifest used to populate the replica.
import { writeFileSync, mkdirSync } from "node:fs";

const META = [
  ["online-retail-services", "ONLINE RETAIL SERVICES project Retail Year: 2023 Location: Vora, Albania"],
  ["cornelian-residence", "Cornelian Residence project Retail Year: 2023 Location: Vora, Albania"],
  ["voxel-residence", "VOXEL RESIDENCE project Residence Year: 2025 Location: Tirana, Albania"],
  ["seina-residence", "SENIA RESIDENCE project Residence Year: 2024 Location: Dhermi, Albania"],
  ["koi-residence", "Koi RESIDENCE project Residence Year: 2024 Location: Tirana, Albania"],
  ["vila-axh", "Villa AXH project Residence Year: 2024 Location: Tirana, Albania"],
  ["perla-garden", "Perla Garden project Residence Year: 2024 Location: Tirana, Albania"],
  ["private-villas-2", "Private villas project Residence Year: 2024 Location: Tirana, Albania"],
  ["belvedere-korca", "BELVEDERE KORÇA project Residence Year: 2024 Location: Korça, Albania"],
  ["ebolowa-master-plan", "EBOLOWA MASTER PLAN project Master Plan YEAR: 2021 Location: Ebolowa, Cameroon"],
  ["vocational-training-center", "VOCATIONAL TRAINING CENTER project Training Center YEAR: 2021 Location: Ebolowa, Cameroon"],
  ["music-faculty-chantal-biya", "MUSIC FACULTY CHANTAL BIYA project Music Faculty YEAR: 2021 Location: Ebolowa, Cameroon"],
  ["institute-of-art-culture-dritero-agolli", "INSTITUTE OF ART & CULTURE DRITERO AGOLLI project Institute YEAR: 2021 Location: Ebolowa, Cameroon"],
  ["bantu-museum", "BANTU MUSEUM project Museum YEAR: 2021 Location: Ebolowa, Cameroon"],
  ["hospitality", "Hospitality project Hotel year: 2021 Location: Ebolowa, Cameroon"],
  ["alem-aga-farm", "ALEM AGA FARM project Farm year: 2020 Location: Tragjas, Albania"],
  ["tulipan-residence", "TULIPAN RESIDENCE project Residence year: 2020 Location: Tirana, Albania"],
  ["sunflower-residences", "SUNFLOWER RESIDENCES project Residence year: 2022 Location: Tirana, Albania"],
  ["civic-center", "Civic Center project Center year: 2022 Location: Falconara, Italy"],
  ["germia-concert-hall", "Germia Concert Hall project Concert Hall year: 2022 Location: Prishtina, Kosovo"],
  ["prishtina-arena", "PRISHTINA ARENA project Arena year: 2022 Location: Prishtina, Kosovo"],
  ["london-busines-park", "LONDON BUSINESS PARK project Business Park year: 2022 Location: Rinas, Albania"],
  ["livadh-waterfront", "LIVADH WATERFRONT project Waterfront year: 2021 Location: Livadh, Albania"],
  ["pearl-resort", "AQUAMARINE project Resort YEAR: 2021 Location: Qeparo, Albania"],
  ["green-pine-resort", "GREEN PINE RESORT project Resort YEAR: 2022 Location: Durres, Albania"],
  ["altavista", "GREEN AMPHITHEATER project Residence YEAR: 2022 Location: Durres, Albania"],
  ["residence-126", "SEREN VILLAS project Villa YEAR: 2022 Location: Tirana, Albania"],
  ["ales", "ALES project Residence Year: 2022 Location: Tirana, Albania"],
  ["universe-city-masterplan", "UNIVERSE CITY MASTERPLAN project Masterplan YEAR: 2022 Location: Tirana, Albania"],
  ["qtu-park-smart-city", "QTU PARK SMART CITY project Park YEAR: 2022 Location: Tirana, Albania"],
  ["univers-school", "UNIVERS SCHOOL project School year: 2022 Location: Tirana, Albania"],
  ["startek", "STARTEK project Residence year: 2022 Location: Tirana, Albania"],
  ["olive-sunshine-residence", "OLIVE SUNSHINE RESIDENCE project Residence Year: 2022 Location: Tirana, Albania"],
];

function parseMeta(raw) {
  // "<NAME> project <TYPE> <Year:> <YEAR> Location: <LOC> Explore"
  const name = raw.split(/\s+project\s+/i)[0].trim();
  const yearM = raw.match(/year:\s*(\d{4})/i);
  const year = yearM ? parseInt(yearM[1], 10) : 2022;
  const typeM = raw.match(/\s+project\s+(.+?)\s+year:/i);
  const type = typeM ? typeM[1].trim() : "Architecture";
  const locM = raw.match(/location:\s*(.+?)\s*(?:Explore\s*)?$/i);
  const location = locM ? locM[1].trim() : "Tirana, Albania";
  return { name, type, year, location };
}

const CHROME = /MA-STUDIO-white|MA-STUDIO-jeshjile|MA-STUDIO-green|cropped-MA|Vula|Drawing-2|favicon|-32x32|-150x150|-192x192|-180x180|-270x270/i;

function pickImages(html) {
  const all = [...(html.match(/https:\/\/mastudio\.al\/wp-content\/uploads\/[^"'\\) ]+?\.(?:jpg|jpeg|png|webp)/gi) || [])];
  // group by base (strip -WIDTHxHEIGHT), prefer a ~1024 variant for size
  const bases = new Map(); // base -> { variants:Set }
  for (const url of all) {
    if (CHROME.test(url)) continue;
    const base = url.replace(/-\d{2,4}x\d{2,4}(?=\.\w+$)/, "");
    if (!bases.has(base)) bases.set(base, new Set());
    bases.get(base).add(url);
  }
  const chosen = [];
  for (const [base, variants] of bases) {
    const arr = [...variants];
    // prefer a 1024-wide variant, else 1536, else original base
    const v1024 = arr.find((u) => /-1024x/.test(u));
    const v1536 = arr.find((u) => /-1536x/.test(u));
    chosen.push(v1024 || v1536 || base);
  }
  return chosen.slice(0, 6); // cap per project
}

async function main() {
  const projects = [];
  for (const [slug, raw] of META) {
    const meta = parseMeta(raw);
    let images = [];
    try {
      const r = await fetch(`https://mastudio.al/portfolio/${slug}/`, { redirect: "follow" });
      const html = await r.text();
      images = pickImages(html);
    } catch (e) {
      console.error("FAIL", slug, e.message);
    }
    projects.push({ slug, ...meta, images });
    console.log(slug, "->", images.length, "imgs |", meta.name, "|", meta.type, meta.year, meta.location);
  }

  // About page
  let about = "";
  let aboutImages = [];
  try {
    const r = await fetch("https://mastudio.al/about/");
    const html = await r.text();
    aboutImages = pickImages(html);
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#8217;/g, "'")
      .replace(/\s+/g, " ").trim();
    about = text.slice(0, 4000);
  } catch (e) { console.error("about fail", e.message); }

  mkdirSync("scripts", { recursive: true });
  writeFileSync("scripts/ma-content.json", JSON.stringify({ projects, about, aboutImages }, null, 2));
  console.log("\nWROTE scripts/ma-content.json with", projects.length, "projects");
  console.log("ABOUT (first 600):", about.slice(0, 600));
}
main();
