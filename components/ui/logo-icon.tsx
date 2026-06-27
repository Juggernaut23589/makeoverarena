export function LogoIcon({ className }: { className?: string }) {
  return (
    <video
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
