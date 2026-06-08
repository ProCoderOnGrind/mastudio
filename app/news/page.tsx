import PageTitle from "@/components/PageTitle";
import NewsTabs from "@/components/news/NewsTabs";
import NewsArticle from "@/components/news/NewsArticle";
import { newsByCategory } from "@/data/news";

export default function NewsPage() {
  return (
    <div>
      <PageTitle>News</PageTitle>
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <NewsTabs active="news" />
        <div className="px-5">
          {newsByCategory("news").map((n) => <NewsArticle key={n.id} item={n} />)}
        </div>
      </div>
    </div>
  );
}
