"use client";

import { useRef, useEffect } from "react";

export function LogoIcon({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (v) {
      v.muted = true;
      v.play().catch(() => {});
    }
  }, []);

  return (
    <video
      ref={ref}
      autoPlay
      loop
      muted
      playsInline
      className={className}
      style={{ objectFit: "contain" }}
    >
      <source src="/makeover-logo-animation.mp4" type="video/mp4" />
    </video>
  );
}
