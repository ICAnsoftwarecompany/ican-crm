import { useTranslation } from 'react-i18next'
import { CalendarClock, ExternalLink, MoreVertical, NotebookPen, PanelRightOpen, Phone, StickyNote, Users } from 'lucide-react'

import { GmailLogoIcon } from '../../../conversations/components/GmailNavbarButton'
import { MessengerLogoIcon } from '../../../conversations/components/MessengerNavbarButton'
import { CustomerSourceBadge } from '../../../../shared/components/Icons/CustomerSourceBadge'
import { DropdownMenu } from '../../../../shared/components/overlays/DropdownMenu'
import { PipelineCard } from '../../../../shared/components/pipeline-board'
import { cn } from '../../../../shared/utils/cn'
import { formatDate, formatTime } from '../../../../shared/utils/dateTime'
import { getNextScheduledActivity, getPipelineLead, getPipelineLeadId } from '../utils/customerPipeline'

function stopDrag(event) {
  event.stopPropagation()
}

function ChannelButton({ icon, unreadCount, label, onClick, className }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={cn('relative inline-flex h-7 w-7 items-center justify-center rounded-full border bg-[var(--surface)] transition', className)}
      title={label}
      aria-label={label}
    >
      {icon}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -end-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-black leading-none text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

/**
 * One lead on the pipeline board. Everything the table row offers is reachable here:
 * click = details drawer, Ctrl/Cmd+click = full lead page, checkbox = bulk selection,
 * menu = meeting / call / follow-up, channel buttons = Messenger / Gmail.
 */
export function CustomerPipelineCard({
  customer,
  selected = false,
  highlighted = false,
  tagLabel = '',
  latestNote = '',
  channels = {},
  actions = {},
  onToggleSelect,
}) {
  const { t, i18n } = useTranslation()
  const lead = getPipelineLead(customer)
  const leadId = getPipelineLeadId(customer)
  const name = lead.name || customer?.name || lead.email || customer?.email || t('customers.table.theCustomer')
  const phone = lead.phone || customer?.phone
  const nextActivity = getNextScheduledActivity(customer)
  const NextActivityIcon = nextActivity?.type === 'call' ? Phone : Users

  const handleOpen = (event) => {
    if (event.ctrlKey || event.metaKey) {
      actions.onOpenLeadPage?.(customer)
      return
    }
    actions.onOpenDetails?.(customer)
  }

  const menuItems = [
    { id: 'details', label: t('customers.pipeline.card.openDetails'), icon: <PanelRightOpen size={14} />, onSelect: () => actions.onOpenDetails?.(customer) },
    { id: 'page', label: t('customers.pipeline.card.openLeadPage'), icon: <ExternalLink size={14} />, onSelect: () => actions.onOpenLeadPage?.(customer) },
    { separator: true },
    { id: 'meeting', label: t('customers.page.actions.addMeeting'), icon: <Users size={14} />, onSelect: () => actions.onAddMeeting?.(customer) },
    { id: 'call', label: t('customers.page.actions.addCall'), icon: <Phone size={14} />, onSelect: () => actions.onAddCall?.(customer) },
    { id: 'follow-up', label: t('customers.page.actions.addFollowUp'), icon: <NotebookPen size={14} />, onSelect: () => actions.onAddFollowUp?.(customer) },
  ]

  return (
    <PipelineCard
      className={cn(
        'space-y-2 p-2.5',
        selected && 'border-[var(--brand-accent)] ring-1 ring-[var(--brand-accent)]',
        highlighted && !selected && 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]'
      )}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect?.(customer)}
          onMouseDown={stopDrag}
          className="mt-1 h-3.5 w-3.5 shrink-0 cursor-pointer accent-[var(--brand-accent)]"
          aria-label={t('customers.page.actions.selectCustomer', { name })}
        />
        <button type="button" onClick={handleOpen} className="min-w-0 flex-1 text-start" title={t('customers.pipeline.card.openHint')}>
          <span className="line-clamp-2 text-sm font-bold text-[var(--text)] hover:underline">{name}</span>
          {phone && <span dir="ltr" className="mt-0.5 block truncate text-xs text-[var(--text-muted)]">{phone}</span>}
        </button>
        <DropdownMenu
          align="end"
          items={menuItems}
          trigger={(
            <button
              type="button"
              onMouseDown={stopDrag}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
              aria-label={t('customers.pipeline.card.actions')}
              title={t('customers.pipeline.card.actions')}
            >
              <MoreVertical size={15} />
            </button>
          )}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <CustomerSourceBadge source={customer?.source || lead.source} iconOnly />
        {leadId && <span dir="ltr" className="text-[11px] font-semibold text-[var(--text-muted)]">#{leadId}</span>}
        {tagLabel && (
          <span className="max-w-full truncate rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-bold text-[var(--text)]">
            {tagLabel}
          </span>
        )}
      </div>

      {latestNote && (
        <p className="flex items-start gap-1 text-xs text-[var(--text-muted)]" title={latestNote}>
          <StickyNote size={12} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">{latestNote}</span>
        </p>
      )}

      {(nextActivity || channels.messenger?.enabled || channels.gmail?.enabled) && (
        <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] pt-2">
          {nextActivity ? (
            <span className="inline-flex min-w-0 items-center gap-1 text-[11px] font-semibold text-[var(--text-muted)]" title={nextActivity.title || ''}>
              <CalendarClock size={12} className="shrink-0" />
              <NextActivityIcon size={12} className="shrink-0" />
              <span className="truncate">
                {formatDate(nextActivity.start_at, i18n.language, { day: 'numeric', month: 'short' })} · {formatTime(nextActivity.start_at, i18n.language)}
              </span>
            </span>
          ) : <span />}
          <span className="flex items-center gap-1.5">
            {channels.messenger?.enabled && (
              <ChannelButton
                icon={<MessengerLogoIcon size={15} />}
                unreadCount={channels.messenger.unreadCount}
                label={t('customers.table.openMessengerChat')}
                onClick={() => actions.onOpenMessenger?.(customer)}
                className="border-[var(--border)] text-[#0A7CFF] hover:bg-[var(--surface-2)]"
              />
            )}
            {channels.gmail?.enabled && (
              <ChannelButton
                icon={<GmailLogoIcon size={15} />}
                unreadCount={channels.gmail.unreadCount}
                label={t('customers.table.openGmailChat')}
                onClick={() => actions.onOpenGmail?.(customer)}
                className="border-[var(--border)] text-[#D93025] hover:bg-[var(--surface-2)]"
              />
            )}
          </span>
        </div>
      )}
    </PipelineCard>
  )
}
