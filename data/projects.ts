import { slugToTitle } from "@/lib/slug";
import type { CategoryKey } from "@/data/categories";

export type Status = "Completed" | "In Progress" | "Competition";

export interface Project {
  slug: string;
  name: string;
  location: string;
  category: CategoryKey;
  typology: string;
  year: number;
  client: string;
  size: string;
  status: Status;
  ratio: string;
  description: string[];
  gallery: string[];
}

const SLUGS = [
  "eve-music-hall","not-a-hotel-setouchi","gastronomy-open-ecosystem","citywave",
  "tennessee-performing-arts-center","east-side-coastal-resiliency","the-plus",
  "bloomberg-student-center-at-johns-hopkins-university","suzhou-museum-of-contemporary-art",
  "hamburg-state-opera","sankt-lukas-hospice-and-lukashuset","claremont-mckenna-college",
  "manresa-island","big-hq","gelephu-international-airport","the-impact",
  "gowanus-175-third-street","jinji-lake-pavilion","athletics-las-vegas-ballpark","the-drop",
  "gelephu-mindfulness-city","solar-one-environmental-education-center",
  "hungarian-natural-history-museum","new-dubai-masterplan",
  "ancient-future-bridging-bhutanese-tradition-and-innovation","fira-barcelona-business-hub",
  "opera-and-ballet-theatre-of-kosovo","copenhill","one-high-line","joint-research-center",
  "musee-atelier-audemars-piguet","the-spiral","lego-brand-house","noma-2-0",
];

const LOCATIONS = [
  "Čepin, Croatia","Sagishima, Japan","San Sebastián, Spain","Milan, Italy","Nashville, USA",
  "New York, USA","Hokksund, Norway","Baltimore, USA","Suzhou, China","Hamburg, Germany",
  "Hellerup, Denmark","Claremont, USA","Norwalk, USA","Copenhagen, Denmark","Gelephu, Bhutan",
  "Quito, Ecuador","New York, USA","Suzhou, China","Las Vegas, USA","Riva, Turkey",
  "Gelephu, Bhutan","New York, USA","Budapest, Hungary","Dubai, UAE","Thimphu, Bhutan",
  "Barcelona, Spain","Pristina, Kosovo","Copenhagen, Denmark","New York, USA","Brussels, Belgium",
  "Le Brassus, Switzerland","New York, USA","Billund, Denmark","Copenhagen, Denmark",
];

const CATS: CategoryKey[] = [
  "architecture","architecture","architecture","architecture","architecture",
  "landscape","architecture","architecture","architecture","architecture",
  "architecture","architecture","planning","interiors","architecture",
  "architecture","architecture","architecture","architecture","architecture",
  "planning","architecture","architecture","planning","architecture",
  "architecture","architecture","architecture","architecture","architecture",
  "architecture","architecture","architecture","interiors",
];

const TYPOLOGIES = [
  "Culture","Hospitality","Culture","Residential","Culture","Infrastructure","Sports",
  "Education","Culture","Culture","Health","Education","Region","Work","Infrastructure",
  "Residential","Residential","Culture","Sports","Hospitality","City","Education",
  "Culture","City","Culture","Work","Culture","Infrastructure","Residential","Work",
  "Culture","Work","Culture","Hospitality",
];

const STATUSES: Status[] = SLUGS.map((_, i) =>
  i % 3 === 0 ? "Completed" : i % 3 === 1 ? "In Progress" : "Competition"
);

const RATIOS = ["16 / 9","3 / 2","4 / 3","2 / 3","1 / 1","21 / 9","5 / 4","3 / 4"];

function lorem(seed: number, paras = 3): string[] {
  const BANK = [
    "The project reframes its site as a continuous public landscape, folding program and circulation into a single legible gesture.",
    "A clear structural logic lets the building read as one form while accommodating a wide range of uses within.",
    "Materials are kept honest and few, allowing daylight, texture, and the surrounding context to carry the experience.",
    "Sustainability is treated as a design driver rather than an add-on, shaping massing, envelope, and energy strategy.",
    "The result is an architecture that feels both inevitable and surprising — pragmatic in plan, generous in section.",
  ];
  return Array.from({ length: paras }, (_, i) => BANK[(seed + i) % BANK.length]);
}

export const PROJECTS: Project[] = SLUGS.map((slug, i) => ({
  slug,
  name: slugToTitle(slug),
  location: LOCATIONS[i],
  category: CATS[i],
  typology: TYPOLOGIES[i],
  year: 2017 + (i % 9),
  client: `Client ${String.fromCharCode(65 + (i % 26))}`,
  size: `${5 + ((i * 7) % 90)},000 m²`,
  status: STATUSES[i],
  ratio: RATIOS[i % RATIOS.length],
  description: lorem(i),
  gallery: Array.from({ length: 4 + (i % 4) }, (_, g) => RATIOS[(i + g) % RATIOS.length]),
}));

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function projectsByCategory(cat: string): Project[] {
  return PROJECTS.filter((p) => p.category === cat);
}
