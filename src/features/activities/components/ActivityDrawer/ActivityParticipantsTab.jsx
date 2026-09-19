import { useTranslation } from 'react-i18next'

export function ActivityParticipantsTab({ activity }) {
  const { t } = useTranslation()
  const participants = activity.participants || []

  if (!participants.length) {
    return <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm font-semibold text-[var(--text-muted)]">{t('activities.drawer.noParticipantsRegistered')}</p>
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {participants.map((participant) => (
        <article key={participant.id || participant.user_id || participant.email} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          <p className="whitespace-normal break-words text-sm font-black text-[var(--text)]">{participant.name || participant.user?.name || participant.email || '-'}</p>
          <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">{participant.email || participant.phone || participant.role || '-'}</p>
          <span className="mt-2 inline-flex rounded-full bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-600">{participant.status || participant.pivot?.status || t('activities.drawer.invitedStatus')}</span>
        </article>
      ))}
    </div>
  )
}
