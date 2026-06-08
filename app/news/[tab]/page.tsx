import { notFound } from "next/navigation";
import PageTitle from "@/components/PageTitle";
import NewsTabs from "@/components/news/NewsTabs";
import NewsArticle from "@/components/news/NewsArticle";
import { newsByCategory, type NewsCategory } from "@/data/news";

const VALID: NewsCategory[] = ["events", "awards", "lectures"];

export function generateStaticParams() {
  return VALID.map((tab) => ({ tab }));
}

export default async function NewsTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  if (!VALID.includes(tab as NewsCategory)) notFound();
  const title = tab.charAt(0).toUpperCase() + tab.slice(1);
  return (
    <div>
      <PageTitle>{title}</PageTitle>
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <NewsTabs active={tab} />
        <div className="px-5">
          {newsByCategory(tab as NewsCategory).map((n) => <NewsArticle key={n.id} item={n} />)}
        </div>
      </div>
    </div>
  );
}
