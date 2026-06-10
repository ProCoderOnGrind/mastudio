import contactData from "@/content/contact.json";

export interface Office {
  city: string;
  label: string;
  address: string[];
  email: string;
  phone: string;
}

export const OFFICES: Office[] = (contactData as { offices: Office[] }).offices;

export interface Social {
  label: string;
  href: string;
}

export const SOCIALS: Social[] = (contactData as { socials: Social[] }).socials;

export const SERVICES: string[] = (contactData as { services: string[] }).services;
