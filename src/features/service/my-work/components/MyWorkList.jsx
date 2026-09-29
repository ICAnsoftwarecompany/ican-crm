import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckSquare, Clock, Inbox } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'
import { CasePriorityBadge, CaseStatusBadge } from '../../cases/components/CaseBadges'
import { getWorkItemLink, useMyWork } from '../api/myWorkApi'

const SOURCE_ICON = { case: Inbox, task: CheckSquare }

/**
 * Unified list of everything assigned to the current user (cases, tasks,
 * later work orders, approvals, missing documents). `limit` shows a preview.
 */
export function MyWorkList({ limit }) {
  const { t, i18n } = useTranslation()
  const query = useMyWork()
  const items = limit ? (query.data || []).slice(0, limit) : query.data || []

  return (
    <ResourceState
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      empty={!items.length}
      emptyIcon={<CheckSquare size={24} />}
      emptyTitle={t('service.myWork.emptyTitle')}
      emptyDescription={t('service.myWork.emptyDescription')}
    >
      <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        {items.map((item) => {
          const Icon = SOURCE_ICON[item.source_type] || Inbox
          const link = getWorkItemLink(item)
          const overdue = item.due_at && new Date(item.due_at) < new Date()
          const content = (
            <>
              <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text)]">{item.title}</p>
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-[var(--text-muted)]">
                  <span>{t(`service.myWork.sources.${item.source_type}`, { defaultValue: item.source_type })}</span>
                  {item.reference && <span dir="ltr" className="font-mono">{item.reference}</span>}
                  {item.customer?.name && <span>· {item.customer.name}</span>}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {item.status && <CaseStatusBadge status={item.status} />}
                <div className="flex items-center gap-2">
                  {item.priority && <CasePriorityBadge priority={item.priority} showLabel={false} />}
                  {item.due_at ? (
                    <span className={cn('inline-flex items-center gap-1 text-xs', overdue ? 'text-sla-breached' : 'text-[var(--text-muted)]')}>
                      <Clock size={12} aria-hidden="true" />
                      {formatRelativeTime(item.due_at, i18n.language)}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)]">{formatRelativeTime(item.updated_at, i18n.language)}</span>
                  )}
                </div>
              </div>
            </>
          )
          return (
            <li key={item.id}>
              {link ? (
                <Link to={link} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-2)]">
                  {content}
                </Link>
              ) : (
                <div className="flex items-start gap-3 px-4 py-3">{content}</div>
              )}
            </li>
          )
        })}
      </ul>
    </ResourceState>
  )
}
