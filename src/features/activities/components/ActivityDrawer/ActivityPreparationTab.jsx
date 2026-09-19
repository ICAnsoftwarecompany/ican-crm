import { useTranslation } from 'react-i18next'

function InfoLine({ label, value }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3 border-b border-[var(--border)] py-2 last:border-0">
      <span className="shrink-0 text-xs font-black text-[var(--text-muted)]">{label}</span>
      <span className="min-w-0 whitespace-normal break-words text-end text-sm font-bold text-[var(--text)]">{value || '-'}</span>
    </div>
  )
}

export function ActivityPreparationTab({ activity }) {
  const { t } = useTranslation()
  const related = activity.relatedEntity || {}

  return (
    <div className="space-y-3">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <h4 className="mb-2 text-sm font-black text-[var(--text)]">{t('activities.drawer.customerBeforeContactTitle')}</h4>
        <InfoLine label={t('customers.name')} value={related.name} />
        <InfoLine label={t('activities.table.customerCompany')} value={related.company} />
        <InfoLine label={t('activities.table.status')} value={related.status} />
        <InfoLine label={t('activities.meetingDrawer.fields.source')} value={related.source} />
        <InfoLine label={t('customers.phone')} value={related.phone || activity.phone} />
        <InfoLine label={t('activities.table.customerEmail')} value={related.email} />
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <h4 className="mb-2 text-sm font-black text-[var(--text)]">{t('activities.drawer.preparationNotesTitle')}</h4>
        <p className="whitespace-normal break-words text-sm font-semibold text-[var(--text-muted)]">
          {t('activities.drawer.preparationHint')}
        </p>
      </section>
    </div>
  )
}
