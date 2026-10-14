import { createContext, useContext, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'

/**
 * Explanations for the catalog wizards (2026-10-14).
 * - `HelpTip`: ⓘ button; its text shows on hover or keyboard focus (always available).
 * - `HelpScope` + `HelpField`: hovering or focusing anything inside a `HelpField` makes it the "active" help, which
 *   the tutorial panel shows next to the step (see TutorialPanel). Outside a scope, `HelpField` just renders the tip.
 */
const HelpContext = createContext(null)

export function HelpScope({ children }) {
  const [active, setActive] = useState(null)
  const value = useMemo(() => ({ active, setActive }), [active])
  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>
}

export function useActiveHelp() {
  return useContext(HelpContext)?.active || null
}

export function HelpTip({ title, text, className }) {
  const { t } = useTranslation()
  const id = useId()
  if (!text) return null
  return (
    <span className={cn('group relative inline-flex align-middle', className)}>
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--brand-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
        aria-label={title ? t('catalogSetup.help.explain', { title }) : t('catalogSetup.help.more')}
        aria-describedby={id}
        onClick={(event) => event.preventDefault()}
      >
        <Info size={14} aria-hidden="true" />
      </button>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none invisible absolute end-0 top-full z-30 mt-1 w-64 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-start text-xs font-normal leading-5 text-[var(--text)] opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {title && <span className="mb-0.5 block font-semibold">{title}</span>}
        {text}
      </span>
    </span>
  )
}

/** Wraps a field: registers its explanation as the active help on hover / focus and shows a tip in the corner. */
export function HelpField({ title, text, children, className }) {
  const scope = useContext(HelpContext)
  const activate = () => scope?.setActive({ title, text })
  return (
    <div className={cn('relative', className)} onMouseEnter={activate} onFocusCapture={activate}>
      {children}
      <HelpTip title={title} text={text} className="absolute end-0 top-0" />
    </div>
  )
}
