import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/site-url";

// Covers only the Next.js app's own marketing pages. The blog's own
// sitemap (hundreds of posts, served by WordPress at
// /blog/sitemap_index.xml) is declared separately in robots.ts — this file
// just needs to exist so the domain root isn't a 404.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/faq",
    "/services/scholarships",
    "/success-stories",
    "/signup",
    "/terms",
    "/privacy",
    "/cookies",
  ];

  return staticRoutes.map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified: new Date(),
  }));
}
