import { Input } from '../../../../../shared/components/ui/Input'

export const OBJECTIVES = ['OUTCOME_LEADS', 'OUTCOME_TRAFFIC']

export function CampaignStep({ t, form, onChange, pages }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Input
          label={t('campaigns.create.name')}
          value={form.campaign_name}
          onChange={(event) => onChange('campaign_name', event.target.value)}
        />
      </div>
      <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
        <span>{t('campaigns.create.page')}</span>
        <select
          value={form.page_id}
          onChange={(event) => onChange('page_id', event.target.value)}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--text)]"
        >
          <option value="">{t('campaigns.create.selectPage')}</option>
          {pages.map((page) => (
            <option key={page.page_id || page.id} value={page.page_id || page.id}>
              {page.name || page.page_name || page.page_id || page.id}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
        <span>{t('campaigns.create.objective')}</span>
        <select
          value={form.objective}
          onChange={(event) => onChange('objective', event.target.value)}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--text)]"
        >
          {OBJECTIVES.map((objective) => (
            <option key={objective} value={objective}>{t(`campaigns.objectives.${objective}`)}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
