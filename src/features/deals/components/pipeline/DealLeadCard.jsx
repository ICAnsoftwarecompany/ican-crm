import { useTranslation } from 'react-i18next'
import { CalendarClock, CircleCheckBig, CircleX, Clock, MoreVertical, PanelRightOpen, Phone, PhoneCall, UserRound } from 'lucide-react'
import { DropdownMenu } from '../../../../shared/components/overlays/DropdownMenu'
import { PipelineCard } from '../../../../shared/components/pipeline-board'
import { TruncatedText } from '../../../../shared/components/ui/TruncatedText'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { isDealLeadStale } from '../../utils/dealLeads'
import { formatMoney } from '../../utils/dealMoney'
import { LeadStatusBadge } from '../common/DealStatusBadge'

/**
 * One deal lead on the board. Click = details drawer. Won / lost are explicit actions (never inferred from
 * the column the card sits in); closed leads show their status and cannot be won/lost again.
 */
export function DealLeadCard({ lead, ownerName, actions }) {
  const { t, i18n } = useTranslation()
  const open = lead.status === 'open'
  const stale = isDealLeadStale(lead)
  const menuItems = [
    { id: 'open', label: t('dealWorkspace.leads.actions.open'), icon: <PanelRightOpen size={14} />, onSelect: () => actions.onOpen(lead) },
    { id: 'call', label: t('dealWorkspace.leads.actions.call'), icon: <PhoneCall size={14} />, onSelect: () => actions.onSchedule(lead, 'call') },
    { id: 'meeting', label: t('dealWorkspace.leads.actions.meeting'), icon: <CalendarClock size={14} />, onSelect: () => actions.onSchedule(lead, 'meeting') },
    { separator: true },
    { id: 'won', label: t('dealWorkspace.leads.actions.won'), icon: <CircleCheckBig size={14} />, disabled: !open, onSelect: () => actions.onWon(lead) },
    { id: 'lost', label: t('dealWorkspace.leads.actions.lost'), icon: <CircleX size={14} />, disabled: !open, onSelect: () => actions.onLost(lead) },
  ]

  return (
    <PipelineCard className="space-y-2" onClick={() => actions.onOpen(lead)}>
      <div className="flex items-start justify-between gap-2">
        <TruncatedText text={lead.name || `#${lead.id}`} className="min-w-0 flex-1 text-sm font-bold" />
        <DropdownMenu
          align="end"
          items={menuItems}
          trigger={(
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="-me-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
              aria-label={t('dealWorkspace.leads.actions.menu')}
              title={t('dealWorkspace.leads.actions.menu')}
            >
              <MoreVertical size={14} />
            </button>
          )}
        />
      </div>
      {lead.phone && <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><Phone size={12} /><span dir="ltr">{lead.phone}</span></div>}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-1"><UserRound size={12} />{ownerName || t('dealWorkspace.leads.unassigned')}</span>
        {lead.lastActivityAt && (
          <span className={`inline-flex items-center gap-1 ${stale ? 'font-semibold text-amber-700 dark:text-amber-300' : ''}`} title={stale ? t('dealWorkspace.leads.staleHint') : undefined}>
            <Clock size={12} />{formatRelativeTime(lead.lastActivityAt, i18n.language)}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        {lead.estimatedValue > 0
          ? <span className="text-xs font-semibold text-[var(--text)]" dir="ltr">{formatMoney(lead.estimatedValue, i18n.language)}</span>
          : <span className="text-xs text-[var(--text-muted)]">{lead.source ? t(`dealWorkspace.sources.${lead.source}`, lead.source) : ''}</span>}
        {!open && <LeadStatusBadge status={lead.status} />}
      </div>
    </PipelineCard>
  )
}
