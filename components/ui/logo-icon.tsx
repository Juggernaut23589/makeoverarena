import Image from "next/image";

/**
 * The square brand mark (graduation cap + growth arrow), matching the logo
 * running on the WordPress site at makeoverarena.com so both properties share
 * one identity.
 *
 * Every call site sizes this as a square (w-8 h-8 … w-16 h-16), so the mark is
 * used rather than the full horizontal lockup — the lockup already contains the
 * "Makeoverarena" wordmark and would both squash in a square box and duplicate
 * the wordmark text that sits beside it in the navbar and footer.
 *
 * For the full lockup use /makeoverarena-logo-on-dark.png (light wordmark) or
 * /makeoverarena-logo-on-light.png (dark wordmark), both 870x273.
 */
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
