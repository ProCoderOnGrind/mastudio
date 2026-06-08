export interface Office {
  city: string;
  label: string;
  address: string[];
  email: string;
  phone: string;
}

export const OFFICES: Office[] = [
  {
    city: "Tirana",
    label: "MA Studio & Partners",
    address: ['Rruga "Sami Frashëri"', "Njësia Nr. 13, Kompleksi TID", "1020 Tirana, Albania"],
    email: "info@mastudio.al",
    phone: "+355 69 209 8818",
  },
];

export interface Social {
  label: string;
  href: string;
}

export const SOCIALS: Social[] = [
  { label: "LinkedIn", href: "https://al.linkedin.com/company/modelling-architecture-studio-partners" },
  { label: "Facebook", href: "https://www.facebook.com/ModellingArchitecture1974/" },
  { label: "Instagram", href: "https://www.instagram.com/modelling_architecture/" },
  { label: "Pinterest", href: "https://www.pinterest.com/mastudiopartners/" },
  { label: "YouTube", href: "https://www.youtube.com/@mastudiopartners" },
  { label: "Twitter", href: "https://twitter.com/MAStudioPartner" },
];

export const SERVICES: string[] = [
  "Urban Planning",
  "Urban Design",
  "Architecture",
  "Landscape Design",
  "Interior Design",
  "Engineering",
  "Energy Efficiency",
  "Energy Auditing",
];
