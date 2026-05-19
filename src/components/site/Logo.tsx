import logoUrl from "@/assets/veratis-logo.png";

type Props = {
  className?: string;
  /** Pixel height — width auto-scales by image aspect ratio. */
  height?: number;
  alt?: string;
};

/**
 * Master VERATIS wordmark. Always use this component instead of
 * re-typing the brand name in markup so the logo stays consistent
 * across header, footer, age gate, packaging mockups, etc.
 */
export function Logo({ className = "", height = 22, alt = "VERATIS" }: Props) {
  return (
    <img
      src={logoUrl}
      alt={alt}
      style={{ height }}
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );
}

export { logoUrl };