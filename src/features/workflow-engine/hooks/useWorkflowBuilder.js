import { useCallback, useState } from 'react'

/**
 * Lets a module open the shared Workflow Builder without importing its
 * internal implementation — see docs section "Optional Hook". Most call
 * sites should prefer <WorkflowLauncher> (components/WorkflowLauncher.jsx),
 * which wraps this exact hook plus the modal; use this hook directly only
 * when a module needs a custom trigger element/placement.
 *
 * @param {import('../core/workflowDomainModel').WorkflowContext} context
 */
export function useWorkflowBuilder(context) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  return { isOpen, open, close, context }
}
