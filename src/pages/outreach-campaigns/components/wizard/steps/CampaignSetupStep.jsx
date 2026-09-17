import { useTranslation } from 'react-i18next'
import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'
import { CAMPAIGN_OBJECTIVES } from '../../../../../features/outreach-campaigns/constants/campaignObjectives'

/**
 * Step 1 — Campaign Setup.
 *
 * `objective` is captured for the user's own organization only — it is
 * never sent to the backend (see utils/buildCampaignPayload.js), since
 * `/api/tenant/campaigns/create` has no such field today.
 */
export function CampaignSetupStep({ form, onChange, errors = {} }) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input
        label={t('outreachCampaigns.setup.name')}
        value={form.name}
        onChange={(event) => onChange({ name: event.target.value })}
        error={errors.name && t(errors.name)}
        className="md:col-span-2"
      />
      <Select
        label={t('outreachCampaigns.setup.objective')}
        value={form.objective}
        onChange={(value) => onChange({ objective: value })}
        options={CAMPAIGN_OBJECTIVES.map((objective) => ({ value: objective.value, label: t(objective.labelKey) }))}
        placeholder={t('outreachCampaigns.setup.objectivePlaceholder')}
      />
      <p className="md:col-span-2 text-xs text-[var(--text-muted)]">{t('outreachCampaigns.setup.objectiveNote')}</p>
    </div>
  )
}
