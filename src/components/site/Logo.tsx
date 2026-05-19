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
export function Logo({ className = "", height, alt = "VERATIS" }: Props) {
  return (
    <img
      src={logoUrl}
      alt={alt}
      style={height ? { height } : undefined}
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );
}

export { logoUrl };