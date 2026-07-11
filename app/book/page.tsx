import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import BookReader from "@/components/book/BookReader";
import manifest from "@/data/book.json";

export const metadata: Metadata = {
  title: "Book | MA STUDIO & PARTNERS",
  description:
    "Read the MA Studio & Partners book online — selected projects, competitions and research from two decades of practice in architecture, urban planning and design.",
};

export default function BookPage() {
  return (
    <div className="pb-16">
      <PageTitle>Book</PageTitle>
      <div className="px-5">
        <div className="mb-10 grid gap-4 md:grid-cols-2">
          <p className="max-w-[52ch] text-[15px]">
            The studio book collects selected projects, competitions and research
            from two decades of practice in a single volume.
          </p>
          <p className="label meta md:text-right">
            2026 edition · {manifest.pageCount} pages
          </p>
        </div>
        <BookReader />
      </div>
    </div>
  );
}
