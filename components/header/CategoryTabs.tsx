import { CATEGORIES } from "@/data/categories";
import Flyout from "./Flyout";

export default function CategoryTabs() {
  return (
    <div className="hidden items-center gap-8 md:flex">
      {CATEGORIES.map((c) => <Flyout key={c.key} category={c} />)}
    </div>
  );
}
