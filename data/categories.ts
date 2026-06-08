export type CategoryKey =
  | "residential" | "hospitality" | "culture" | "masterplan" | "commercial";

export interface Category {
  key: CategoryKey;
  label: string;
  subcategories: string[];
}

export const CATEGORIES: Category[] = [
  { key: "residential", label: "Residential", subcategories: [] },
  { key: "hospitality", label: "Hospitality", subcategories: [] },
  { key: "culture", label: "Culture", subcategories: [] },
  { key: "masterplan", label: "Masterplan", subcategories: [] },
  { key: "commercial", label: "Commercial", subcategories: [] },
];

// Map a MA Studio project "type" string to one of our grouped categories.
export function categoryForType(type: string): CategoryKey {
  const t = type.toLowerCase();
  if (/resid|villa/.test(t)) return "residential";
  if (/resort|hotel|hospitality/.test(t)) return "hospitality";
  if (/museum|concert|music|institute|arena/.test(t)) return "culture";
  if (/master ?plan|park|waterfront|smart|city/.test(t)) return "masterplan";
  if (/center/.test(t) && /civic/.test(t)) return "masterplan";
  return "commercial";
}

export function isCategoryKey(value: string): value is CategoryKey {
  return CATEGORIES.some((c) => c.key === value);
}

export function categoryLabel(key: CategoryKey): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}
