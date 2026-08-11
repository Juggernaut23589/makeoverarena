/**
 * Canonical public origin for this app.
 *
 * This app lives at hub.makeoverarena.com. The apex (makeoverarena.com) and
 * www serve the separate WordPress blog, so any link built here that points at
 * the apex will 404 for the user. Always build outbound links from APP_URL.
 *
 * NEXT_PUBLIC_APP_URL is inlined at build time — changing it in Vercel requires
 * a redeploy to take effect.
 */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://hub.makeoverarena.com";

/** The WordPress blog, deliberately a different host. */
export const BLOG_URL = "https://www.makeoverarena.com";
