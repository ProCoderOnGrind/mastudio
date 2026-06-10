import cofoundersData from "@/content/cofounders.json";

export interface Founder {
  name: string;
  role: string;
  bio: string[]; // paragraphs
  image?: string; // optional /public path; gradient placeholder used when absent
}

export const FOUNDERS: Founder[] = (cofoundersData as { founders: Founder[] }).founders;
