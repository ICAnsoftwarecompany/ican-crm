import { ErrorBoundary } from '../feedback/ErrorBoundary'

/**
 * Catches unexpected render-time exceptions from the canvas/panels (e.g. a
 * feature-provided custom property renderer throwing). Reuses the shared
 * ErrorBoundary rather than inventing a new one — see docs "No Duplicate
 * Infrastructure". This is a belt-and-suspenders safety net; the primary
 * defense against bad data is UnknownNode.jsx, which prevents an
 * unregistered node type from ever reaching a broken render in the first
 * place.
 */
export function VisualFlowErrorBoundary({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}
