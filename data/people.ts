export type PeopleGroup =
  | "Partners" | "Associates/Directors"
  | "BIG Copenhagen" | "BIG Barcelona" | "BIG London" | "BIG New York"
  | "BIG Shanghai" | "BIG Los Angeles" | "BIG Zürich" | "BIG Bhutan";

export interface Person { name: string; role: string; group: PeopleGroup; }

const FIRST = ["Bjarke","Sheela","Agustin","Andreas","Andy","Beat","Brian","Catherine","Daniel","Daria","David","Finn","Frederik","Giulia","Hanna","Jakob","Kai-Uwe","Leon","Maria","Nanna","Oliver","Pauline","Qing","Ravi","Sofia","Tomas","Ulla","Viktor","Wei","Ximena"];
const LAST = ["Ingels","Søgaard","Perez-Torres","Pedersen","Young","Schenk","Yang","Huang","Sundlin","Stark","Zahle","Nørkjær","Lyng","Frittoli","Johansson","Lange","Bauer","Costa","Rossi","Holm","Park","Lavie","Chen","Patel","Marin","Minör","Berg","Novak","Zhang","Reyes"];
const OFFICE_CODES = ["CPH","BCN","LON","NYC","SHA","LA","ZUR","BHU"];

function mk(group: PeopleGroup, count: number, roleFor: (i: number) => string): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`,
    role: roleFor(i),
    group,
  }));
}

export const PARTNERS: Person[] = [
  { name: "Bjarke Ingels", role: "Founder", group: "Partners" },
  { name: "Sheela Maini Søgaard", role: "CEO, Partner, CPH", group: "Partners" },
  ...mk("Partners", 16, (i) => `Partner, ${OFFICE_CODES[i % OFFICE_CODES.length]}`),
];

export const PEOPLE: Person[] = [
  ...PARTNERS,
  ...mk("Associates/Directors", 24, (i) => `Associate, ${OFFICE_CODES[i % OFFICE_CODES.length]}`),
];

export const PEOPLE_GROUPS: PeopleGroup[] = [
  "Partners","Associates/Directors","BIG Copenhagen","BIG Barcelona","BIG London",
  "BIG New York","BIG Shanghai","BIG Los Angeles","BIG Zürich","BIG Bhutan",
];
