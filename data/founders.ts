export interface Founder {
  name: string;
  role: string;
  bio: string;
  image?: string; // optional /public path; gradient placeholder used when absent
}

// Placeholder content — replace name/role/bio/image with the real co-founders.
export const FOUNDERS: Founder[] = [
  {
    name: "Co-Founder One",
    role: "Founding Partner — Architecture",
    bio: "Placeholder biography. Replace with a short paragraph about this co-founder's background, focus, and notable work.",
  },
  {
    name: "Co-Founder Two",
    role: "Founding Partner — Urban Planning",
    bio: "Placeholder biography. Replace with a short paragraph about this co-founder's background, focus, and notable work.",
  },
];
