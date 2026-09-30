import { ResourceState } from '../../../shared/components/data/ResourceState'

/** Page frame for portal screens: title, optional actions, and loading / error / empty handling. */
export function PortalPage({ title, description, actions, query, empty, emptyTitle, emptyDescription, children, level = 1 }) {
  const Heading = level === 1 ? 'h1' : 'h2'
  return (
    <section className="grid gap-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-1">
          <Heading className={level === 1 ? 'text-xl font-bold text-[var(--text)]' : 'text-base font-semibold text-[var(--text)]'}>{title}</Heading>
          {description && <p className="text-sm text-[var(--text-muted)]">{description}</p>}
        </div>
        {actions}
      </header>
      {query ? (
        <ResourceState isLoading={query.isLoading} error={query.error} onRetry={query.refetch} empty={empty} emptyTitle={emptyTitle} emptyDescription={emptyDescription}>
          {children}
        </ResourceState>
      ) : (
        children
      )}
    </section>
  )
}

export function Card({ className = '', children }) {
  return <div className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 ${className}`}>{children}</div>
}

export function StatusPill({ tone = 'muted', children }) {
  const tones = { muted: 'text-[var(--text-muted)]', ok: 'text-sla-on-track', warn: 'text-sla-at-risk', bad: 'text-sla-breached', info: 'text-status-contacted' }
  return <span className={`inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
}

/** Map a pipeline status category to a pill tone. */
export const categoryTone = (category) => ({ open: 'info', in_progress: 'info', pending: 'warn', resolved: 'ok', closed: 'muted', cancelled: 'bad' })[category] || 'muted'
