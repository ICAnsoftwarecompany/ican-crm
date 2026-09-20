import { Badge } from '../../../../../shared/components/ui/Badge'
import { displayValue } from '../../../../../shared/utils/apiResponse'

export function ReviewStep({ t, form, pages }) {
  const page = pages.find((item) => String(item.page_id || item.id) === String(form.page_id))

  return (
    <div className="grid gap-4">
      <p className="text-sm text-[var(--text-muted)]">{t('campaigns.create.review.intro')}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="text-xs text-[var(--text-muted)]">{t('campaigns.create.name')}</div>
          <div className="mt-1 text-sm font-bold text-[var(--text)]">{displayValue(form.campaign_name)}</div>
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="text-xs text-[var(--text-muted)]">{t('campaigns.create.page')}</div>
          <div className="mt-1 text-sm font-bold text-[var(--text)]">{displayValue(page?.name || page?.page_name)}</div>
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="text-xs text-[var(--text-muted)]">{t('campaigns.create.objective')}</div>
          <div className="mt-1"><Badge variant="info">{t(`campaigns.objectives.${form.objective}`)}</Badge></div>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)]">{t('campaigns.create.review.note')}</p>
    </div>
  )
}
