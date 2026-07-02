type BrandLogoProps = {
  variant?: "hero" | "sidebar";
};

export default function BrandLogo({
  variant = "hero",
}: BrandLogoProps) {
  return (
    <span
      className={`brand-logo brand-logo--${variant}`}
      aria-hidden="true"
    >
      TC-S
    </span>
  );
}
