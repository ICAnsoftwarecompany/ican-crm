import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { PipelineBoard, PipelineCard } from '../../../../shared/components/pipeline-board'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { CASE_BOARD_CATEGORIES } from '../constants/caseViews'
import { findTransitionToCategory } from '../utils/caseStatus'
import { CasePriorityBadge, CaseStatusBadge } from './CaseBadges'
import { SlaBadge } from '../../sla'
import { CaseTypeIcon } from './CaseTypeIcon'

const CATEGORY_COLOR = {
  open: 'var(--status-new)',
  in_progress: 'var(--status-qualified)',
  pending: 'var(--status-contacted)',
  resolved: 'var(--status-won)',
}

/**
 * Board grouped by status CATEGORY — stable across tenants that rename or
 * add statuses. Dropping a card asks for the first allowed status of that
 * category; transitions that need extra fields (resolve) go through
 * `onRequestTransition` so the page can open the resolution dialog.
 */
export function CasesBoard({ cases, setup, onRequestTransition }) {
  const { t, i18n } = useTranslation()

  const stages = useMemo(
    () =>
      CASE_BOARD_CATEGORIES.map((category) => ({
        id: category,
        label: t(`service.cases.categories.${category}`),
        color: CATEGORY_COLOR[category],
      })),
    [t]
  )

  const items = useMemo(() => cases.map((item) => ({ ...item, stage: item.status?.category })), [cases])

  const handleMove = (itemId, _from, toCategory) => {
    const caseItem = cases.find((entry) => entry.id === itemId)
    const target = findTransitionToCategory(setup, caseItem, toCategory)
    if (!target) {
      toast.error(t('service.errors.CASE_TRANSITION_NOT_ALLOWED'))
      return
    }
    onRequestTransition(caseItem, target)
  }

  return (
    <PipelineBoard
      stages={stages}
      items={items}
      itemStageKey="stage"
      onItemMove={handleMove}
      renderEmpty={() => <p className="px-1 py-6 text-center text-xs text-[var(--text-muted)]">{t('service.cases.board.empty')}</p>}
      renderCard={(item) => (
        <PipelineCard>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span dir="ltr" className="font-mono text-[11px] text-[var(--text-muted)]">{item.case_number}</span>
            <span className="flex items-center gap-2">
              <SlaBadge sla={item.sla} />
              <CasePriorityBadge priority={item.priority} showLabel={false} />
            </span>
          </div>
          <Link to={`/service/cases/${item.id}`} className="flex items-start gap-2 text-sm font-medium text-[var(--text)] hover:underline">
            <CaseTypeIcon icon={item.type?.icon} className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
            <span className="line-clamp-2">{item.subject}</span>
          </Link>
          <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{item.customer?.name}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <CaseStatusBadge status={item.status} />
            <span className="text-[11px] text-[var(--text-muted)]">{formatRelativeTime(item.updated_at, i18n.language)}</span>
          </div>
        </PipelineCard>
      )}
    />
  )
}
