import Image from "next/image";

/**
 * The logo running on the WordPress site at makeoverarena.com, so both
 * properties share one identity.
 *
 * <Logo> is the full horizontal lockup (870x273) — cap + arrow mark AND the
 * "Makeoverarena" wordmark. It already contains the wordmark, so never place a
 * "MakeoverArena" text label beside it, and never put it in a square box: size
 * it with a height class plus w-auto (e.g. `h-10 w-auto`).
 *
 * Two artworks, picked by the tone of the background behind it — the wordmark
 * is light on one and dark on the other:
 *   tone="dark"  → light wordmark, for navy/black backgrounds
 *   tone="light" → dark wordmark, for white/cream backgrounds
 *
 * <LogoIcon> is the square mark alone, for slots too tight for the lockup
 * (a round chat avatar, a collapsed sidebar rail).
 */

export function Logo({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <Image
      src={tone === "dark" ? "/makeoverarena-logo-on-dark.png" : "/makeoverarena-logo-on-light.png"}
      alt="MakeoverArena"
      width={870}
      height={273}
      priority
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/makeoverarena-mark.png"
      alt="MakeoverArena"
      width={264}
      height={259}
      priority
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
