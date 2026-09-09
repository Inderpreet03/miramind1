type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  return (
    <span
      className={`brand-logo ${compact ? "brand-logo-compact" : ""} ${className}`}
      role="img"
      aria-label="MiraMind"
    />
  );
}
