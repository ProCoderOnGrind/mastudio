export type CategoryKey =
  | "architecture" | "interiors" | "landscape" | "planning" | "products";

export interface Category {
  key: CategoryKey;
  label: string;
  subcategories: string[];
}

export const CATEGORIES: Category[] = [
  { key: "architecture", label: "Architecture", subcategories: ["culture","education","work","hospitality","residential","infrastructure","space","sports","health"] },
  { key: "interiors", label: "Interiors", subcategories: [] },
  { key: "landscape", label: "Landscape", subcategories: ["civic-spaces","parks","gardens","balconies-and-terraces"] },
  { key: "planning", label: "Planning", subcategories: ["campus","city","region"] },
  { key: "products", label: "Products", subcategories: ["lighting","furniture","consumer-products","mobility","installations"] },
];
