import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * robots.txt. Crawling is open for the public site; the Tina admin bundle and
 * the internal design/motion lab routes are kept out of the index, and the
 * `?category=` filter URLs are disallowed so crawl budget goes to real pages
 * rather than re-filtered copies of the blog and project lists.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/design-lab", "/motion-lab", "/demo/", "/*?category="],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
