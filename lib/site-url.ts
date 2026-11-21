/**
 * Canonical public origin for this app.
 *
 * Self-hosted on the VM as of the Vercel migration — www.makeoverarena.com
 * is now the single consolidated host for the whole app, including the
 * in-app /blog route that replaced the old standalone WordPress blog.
 * hub.makeoverarena.com was the prior Vercel-era host and is retired.
 * Always build outbound links from APP_URL.
 *
 * NEXT_PUBLIC_APP_URL is inlined at build time — changing it requires a
 * rebuild/redeploy to take effect.
 */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://www.makeoverarena.com";

/** The WordPress blog, deliberately a different host. */
export const BLOG_URL = "https://www.makeoverarena.com";
