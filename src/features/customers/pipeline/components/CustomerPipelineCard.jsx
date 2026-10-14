import { useTranslation } from 'react-i18next'
import { Briefcase, Clock, ExternalLink, Hash, Mail, MoreVertical, NotebookPen, PanelRightOpen, Phone, UserRound, Users } from 'lucide-react'

import { CustomerSourceBadge } from '../../../../shared/components/Icons/CustomerSourceBadge'
import { DropdownMenu } from '../../../../shared/components/overlays/DropdownMenu'
import { PipelineCard } from '../../../../shared/components/pipeline-board'
import { TruncatedText } from '../../../../shared/components/ui/TruncatedText'
import { cn } from '../../../../shared/utils/cn'
import { formatDate, formatTime } from '../../../../shared/utils/dateTime'
import { getNextScheduledActivity, getPipelineLead, getPipelineLeadId } from '../utils/customerPipeline'
import { CardLine, ChannelButtons, Chip, NextActivityLine, NoteLine } from './CustomerPipelineCardParts'

const CHIP_FIELDS = new Set(['source', 'leadId', 'tag', 'leadType'])

function formatDateTime(value, language) {
  if (!value) return ''
  const date = formatDate(value, language, { day: 'numeric', month: 'short', year: 'numeric' })
  const time = formatTime(value, language)
  return [date, time].filter(Boolean).join(' · ')
}

/**
 * One lead on the pipeline board. Shows only the fields chosen in the pipeline settings
 * (visibleFieldIds, in that order). Long text is cut and shown in full on hover.
 * Click = details drawer, Ctrl/Cmd+click = lead page, long press = drag to another status.
 */
export function CustomerPipelineCard({
  customer,
  visibleFieldIds = [],
  selected = false,
  highlighted = false,
  tagLabel = '',
  assigneeLabel = '',
  latestNote = '',
  channels = {},
  actions = {},
  onToggleSelect,
}) {
  const { t, i18n } = useTranslation()
  const lead = getPipelineLead(customer)
  const leadId = getPipelineLeadId(customer)
  const name = lead.name || customer?.name || lead.email || customer?.email || t('customers.table.theCustomer')
  const language = i18n.language

  const chipFields = visibleFieldIds.filter((id) => CHIP_FIELDS.has(id))
  const nextActivity = visibleFieldIds.includes('nextActivity') ? getNextScheduledActivity(customer) : null
  const showChannels = visibleFieldIds.includes('channels')

  const renderLine = (id) => {
    switch (id) {
      case 'phone': return <CardLine key={id} icon={Phone} text={lead.phone || customer?.phone} dir="ltr" />
      case 'email': return <CardLine key={id} icon={Mail} text={lead.email || customer?.email} dir="ltr" />
      case 'company': return <CardLine key={id} icon={Briefcase} text={customer?.company || lead.company} />
      case 'customerCode': return <CardLine key={id} icon={Hash} text={customer?.customer_code} dir="ltr" />
      case 'assignedTo': return <CardLine key={id} icon={UserRound} text={assigneeLabel} />
      case 'createdAt': return <CardLine key={id} label={t('customers.table.createdAt')} text={formatDateTime(customer?.created_at || lead.created_at, language)} />
      case 'lastActionAt': return <CardLine key={id} icon={Clock} text={formatDateTime(lead.last_action_at, language)} />
      case 'latestNote': return <NoteLine key={id} text={latestNote} />
      default: return null
    }
  }

  const renderChip = (id) => {
    switch (id) {
      case 'source': return <CustomerSourceBadge key={id} source={customer?.source || lead.source} iconOnly />
      case 'leadId': return leadId ? <span key={id} dir="ltr" className="text-[10px] font-semibold text-[var(--text-muted)]">#{leadId}</span> : null
      case 'tag': return <Chip key={id} text={tagLabel} />
      case 'leadType': return <Chip key={id} text={lead.lead_type || customer?.lead_type} />
      default: return null
    }
  }

  const handleOpen = (event) => {
    event.stopPropagation()
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

  const lines = visibleFieldIds.map(renderLine).filter(Boolean)
  const chips = chipFields.map(renderChip).filter(Boolean)
  const hasChannels = Boolean(channels.messenger?.enabled || channels.gmail?.enabled)
  const channelButtons = showChannels && hasChannels ? (
    <ChannelButtons
      channels={channels}
      labels={{ messenger: t('customers.table.openMessengerChat'), gmail: t('customers.table.openGmailChat') }}
      onOpenMessenger={() => actions.onOpenMessenger?.(customer)}
      onOpenGmail={() => actions.onOpenGmail?.(customer)}
    />
  ) : null

  return (
    <PipelineCard
      onClick={(event) => {
        // Ignore clicks coming from portaled menus/tooltips rendered inside this React tree.
        if (event.currentTarget.contains(event.target)) handleOpen(event)
      }}
      className={cn(
        'cursor-pointer space-y-1.5 p-2 active:cursor-grabbing',
        selected && 'border-[var(--brand-accent)] ring-1 ring-[var(--brand-accent)]',
        highlighted && !selected && 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]'
      )}
    >
      <div className="flex items-start gap-1.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect?.(customer)}
          onClick={(event) => event.stopPropagation()}
          className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-[var(--brand-accent)]"
          aria-label={t('customers.page.actions.selectCustomer', { name })}
        />
        <button type="button" onClick={handleOpen} className="min-w-0 flex-1 text-start text-sm font-bold leading-5 text-[var(--text)] hover:underline">
          <TruncatedText text={name} />
        </button>
        {chips.length > 0 && <span className="flex shrink-0 items-center gap-1">{chips.filter((chip) => chip.key === 'source' || chip.key === 'leadId')}</span>}
        <DropdownMenu
          align="end"
          items={menuItems}
          trigger={(
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="-me-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
              aria-label={t('customers.pipeline.card.actions')}
              title={t('customers.pipeline.card.actions')}
            >
              <MoreVertical size={14} />
            </button>
          )}
        />
      </div>

      {chips.some((chip) => chip.key === 'tag' || chip.key === 'leadType') && (
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          {chips.filter((chip) => chip.key === 'tag' || chip.key === 'leadType')}
        </div>
      )}

      {lines.length > 0 && <div className="space-y-1">{lines}</div>}

      {(nextActivity || channelButtons) && (
        <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] pt-1.5">
          <div className="min-w-0 flex-1">
            <NextActivityLine
              activity={nextActivity}
              text={nextActivity ? formatDateTime(nextActivity.start_at, language) : ''}
            />
          </div>
          {channelButtons}
        </div>
      )}
    </PipelineCard>
  )
}
