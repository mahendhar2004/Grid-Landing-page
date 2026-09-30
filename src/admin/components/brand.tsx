/**
 * The Grid wordmark: "Grid" and its blue full stop, as the app's own logo draws
 * it. Live text rather than the PNG, because the PNG has a white background
 * that would show as a box on the dark sidebar; the letters follow the current
 * text colour, so the same mark works on light and dark, and the dot is always
 * the brand blue.
 */
const BRAND_BLUE = '#3B82F6'

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <span
      role="img"
      aria-label="Grid"
      className="inline-flex items-baseline font-[family-name:var(--font-ui)] font-extrabold leading-none tracking-tight"
      style={{ fontSize: size }}
    >
      Grid
      <span aria-hidden="true" style={{ color: BRAND_BLUE }}>
        .
      </span>
    </span>
  )
}
