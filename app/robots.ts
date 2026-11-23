import type { MetadataRoute } from "next";
import { APP_URL, BLOG_URL } from "@/lib/site-url";

// The domain root is the one place Google (and every other crawler) will
// ever look for robots.txt — the WordPress blog's own /blog/robots.txt is
// never read by crawlers, even though WordPress happily serves one there.
// Before the rebuild, WordPress was the whole site and served this file
// from the root; since the migration to Next.js, nothing did, so Google
// got a 404 here and lost the pointer to the blog's sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/staff/", "/admin/", "/api/", "/dashboard/"],
    },
    sitemap: [`${APP_URL}/sitemap.xml`, `${BLOG_URL}/blog/sitemap_index.xml`],
  };
}
