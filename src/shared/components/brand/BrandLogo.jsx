import { cn } from '../../utils/cn'

/**
 * The single ICAN CRM mark. Every screen (login, sidebar, mobile header)
 * uses this component so the logo can never drift between places again.
 *
 * Colors come from the runtime brand tokens (--brand-primary / --brand-accent),
 * so a tenant that changes its brand colors in Appearance settings sees the
 * mark follow.
 *
 * tone:
 *  - "solid": brand-primary tile, white letters. A hairline inner ring keeps
 *    the tile visible even on a background of the same color.
 *  - "tile":  light app-icon tile with brand-primary letters (used on the
 *    login hero, over the animated background).
 */
export function BrandLogo({ size = 32, tone = 'solid', wordmark = false, wordmarkClassName, className }) {
  const isTile = tone === 'tile'

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        // SVG <text> inherits the page direction; in RTL the letters would
        // anchor from the wrong side and slide out of the tile.
        direction="ltr"
        style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        className="shrink-0"
      >
        <rect
          x="0.5"
          y="0.5"
          width="31"
          height="31"
          rx="8"
          style={{
            fill: isTile ? 'white' : 'var(--brand-primary)',
            stroke: isTile ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.16)',
          }}
        />
        <text
          x="5"
          y="22"
          fontFamily="DM Sans, sans-serif"
          fontWeight="700"
          fontSize="14"
          style={{ fill: isTile ? 'var(--brand-primary)' : 'white' }}
        >
          IC
        </text>
        <circle cx="26.5" cy="5.5" r="3.5" style={{ fill: 'var(--brand-accent)' }} />
      </svg>
      {wordmark && (
        <span className={cn('font-latin font-bold tracking-tight text-[var(--text)]', wordmarkClassName)}>
          ICAN CRM
        </span>
      )}
    </span>
  )
}
