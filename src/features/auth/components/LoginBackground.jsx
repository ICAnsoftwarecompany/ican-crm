import './loginBackground.css'

/**
 * Animated, brand-colored background for the login page.
 * Pure CSS + two inline SVG filters (no canvas, no JS loop), so it costs
 * almost nothing and freezes automatically under prefers-reduced-motion.
 */
export function LoginBackground() {
  return (
    <div className="login-aurora" aria-hidden="true">
      <div className="login-aurora__blob login-aurora__blob--a" />
      <div className="login-aurora__blob login-aurora__blob--b" />
      <div className="login-aurora__blob login-aurora__blob--c" />
      <div className="login-aurora__blob login-aurora__blob--d" />

      <svg className="login-aurora__streaks" width="100%" height="100%" preserveAspectRatio="none">
        <filter id="login-streak-filter">
          {/* Very low X frequency + higher Y frequency = long brush strokes. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.0016 0.06" numOctaves="3" seed="7" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -0.35" />
        </filter>
        <rect width="100%" height="100%" filter="url(#login-streak-filter)" />
      </svg>

      <div className="login-aurora__veil" />

      <svg className="login-aurora__grain" width="100%" height="100%">
        <filter id="login-grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#login-grain-filter)" />
      </svg>
    </div>
  )
}
