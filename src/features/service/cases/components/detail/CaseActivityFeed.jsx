import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, CirclePlus, Lock, PencilLine, Siren, UserRoundCheck } from 'lucide-react'
import { cn } from '../../../../../shared/utils/cn'
import { formatRelativeTime } from '../../../../../shared/utils/dateTime'
import { localizeLabel } from '../../../core/utils/localizeLabel'

const MESSAGE_TYPES = ['inbound', 'reply', 'internal_note']

function SystemEvent({ activity, language }) {
  const { t } = useTranslation()
  const meta = activity.metadata || {}
  const actor = activity.author?.name || t('service.cases.activity.system')
  const config = {
    created: { icon: CirclePlus, text: t('service.cases.activity.created', { channel: t(`service.cases.channels.${meta.channel}`, { defaultValue: meta.channel || '' }) }) },
    status_change: {
      icon: ArrowLeftRight,
      text: t('service.cases.activity.statusChange', {
        actor,
        from: localizeLabel(meta.from?.label, language, meta.from?.key),
        to: localizeLabel(meta.to?.label, language, meta.to?.key),
      }),
    },
    assignment: {
      icon: UserRoundCheck,
      text: meta.assignee
        ? t('service.cases.activity.assigned', { actor, assignee: meta.assignee.name })
        : t('service.cases.activity.assignmentChanged', { actor }),
    },
    field_change: {
      icon: PencilLine,
      text: t('service.cases.activity.fieldChange', {
        actor,
        fields: new Intl.ListFormat(language, { type: 'conjunction' }).format(
          Object.keys(meta.changes || {}).map((field) => t(`service.cases.fields.${field}`, { defaultValue: field }))
        ),
      }),
    },
    sla_escalated: {
      icon: Siren,
      tone: meta.percent >= 100 ? 'text-sla-breached' : 'text-sla-at-risk',
      text: t('service.sla.activity.escalated', {
        percent: meta.percent,
        action: t(`service.settings.escalation.actions.${meta.action}`, { defaultValue: meta.action }),
        target: t(`service.settings.escalation.targets.${meta.target}`, { defaultValue: meta.target }),
        metric: t(`service.sla.metrics.${meta.metric || 'resolution'}`),
      }),
    },
  }[activity.type] || { icon: CirclePlus, text: activity.type }
  const Icon = config.icon

  return (
    <li className={cn('flex items-center gap-2 px-1 text-xs', config.tone || 'text-[var(--text-muted)]')}>
      <Icon size={14} aria-hidden="true" className="shrink-0" />
      <span className="min-w-0 flex-1">{config.text}</span>
      <time dateTime={activity.occurred_at}>{formatRelativeTime(activity.occurred_at, language)}</time>
    </li>
  )
}

function Message({ activity, language }) {
  const { t } = useTranslation()
  const isCustomer = activity.type === 'inbound'
  const isNote = activity.type === 'internal_note'
  const author = activity.author?.name || (isCustomer ? t('service.cases.activity.customer') : t('service.cases.activity.agent'))

  return (
    <li className={cn('flex', isCustomer ? 'justify-start' : 'justify-end')}>
      <article
        className={cn(
          'max-w-[85%] rounded-lg border px-3 py-2',
          isCustomer && 'border-[var(--border)] bg-[var(--surface-2)]',
          activity.type === 'reply' && 'border-[var(--ai-border)] bg-[var(--brand-accent-soft)]',
          isNote && 'border-dashed border-status-contacted bg-[var(--surface)]'
        )}
      >
        <header className="mb-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
          {isNote && <Lock size={12} aria-hidden="true" />}
          <span className="font-semibold text-[var(--text)]">{author}</span>
          {isNote && <span>· {t('service.cases.activity.internalNote')}</span>}
          {activity.channel && !isNote && <span>· {t(`service.cases.channels.${activity.channel}`, { defaultValue: activity.channel })}</span>}
          <time className="ms-auto" dateTime={activity.occurred_at}>{formatRelativeTime(activity.occurred_at, language)}</time>
        </header>
        <p className="whitespace-pre-wrap break-words text-sm text-[var(--text)]">{activity.body}</p>
      </article>
    </li>
  )
}

/** Case timeline: customer messages, replies, internal notes and system events. */
export function CaseActivityFeed({ activities = [] }) {
  const { t, i18n } = useTranslation()
  if (!activities.length) {
    return <p className="py-8 text-center text-sm text-[var(--text-muted)]">{t('service.cases.activity.empty')}</p>
  }
  return (
    <ol className="grid gap-3" aria-label={t('service.cases.detail.activity')}>
      {activities.map((activity) =>
        MESSAGE_TYPES.includes(activity.type) ? (
          <Message key={activity.id} activity={activity} language={i18n.language} />
        ) : (
          <SystemEvent key={activity.id} activity={activity} language={i18n.language} />
        )
      )}
    </ol>
  )
}
