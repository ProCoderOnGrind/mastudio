import aboutData from "@/content/about.json";

export interface AboutSubsection {
  title: string;
  body: string[];
}

export interface AboutSection {
  title: string;
  body?: string[];
  items?: string[];
  subsections?: AboutSubsection[];
}

export const ABOUT_SECTIONS: AboutSection[] = (aboutData as { sections: AboutSection[] }).sections;
