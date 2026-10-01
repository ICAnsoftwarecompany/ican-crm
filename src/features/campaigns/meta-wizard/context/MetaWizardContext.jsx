import { createContext, useCallback, useContext, useMemo } from 'react'

const MetaWizardContext = createContext(null)

/**
 * Everything the steps need (state, actions, validation, account settings,
 * integrations) without prop-drilling through five levels of sections.
 */
export function MetaWizardProvider({ value, children }) {
  return <MetaWizardContext.Provider value={value}>{children}</MetaWizardContext.Provider>
}

export function useMetaWizard() {
  const value = useContext(MetaWizardContext)
  if (!value) throw new Error('useMetaWizard must be used inside MetaWizardProvider')
  return value
}

const SEVERITY_ORDER = { error: 0, warning: 1, info: 2 }

/**
 * Wires one field into the wizard: guide focus, "touched" tracking and the
 * issue to show under it. Errors appear after the user leaves the field or
 * tries to continue — never while typing into an empty form.
 */
export function useWizardField(path, guideKey = path) {
  const { state, actions, issues } = useMetaWizard()
  const fieldIssues = useMemo(() => issues.filter((issue) => issue.path === path).sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]), [issues, path])
  const visible = state.meta.showAllErrors || state.meta.touched?.[path]
  const issue = fieldIssues.find((item) => item.severity !== 'info')
  const onFocus = useCallback(() => actions.setFocusedField(guideKey), [actions, guideKey])
  const onBlur = useCallback(() => actions.touchField(path), [actions, path])
  return {
    issue: visible ? issue : undefined,
    hasError: Boolean(visible && issue?.severity === 'error'),
    fieldProps: { onFocus, onBlur, 'data-wizard-field': path },
  }
}

/** Scrolls to and focuses the field an issue points at (guide checklist, review list). */
export function focusWizardField(path) {
  if (typeof document === 'undefined') return
  window.requestAnimationFrame(() => {
    const candidates = [...document.querySelectorAll('[data-wizard-field]')]
    const target = candidates.find((node) => node.getAttribute('data-wizard-field') === path)
      || candidates
        .filter((node) => path.startsWith(`${node.getAttribute('data-wizard-field')}.`))
        .sort((a, b) => b.getAttribute('data-wizard-field').length - a.getAttribute('data-wizard-field').length)[0]
    if (!target) return
    target.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    const focusable = target.matches('input,select,textarea,button') ? target : target.querySelector('input,select,textarea,button')
    focusable?.focus({ preventScroll: true })
  })
}
