import { useTranslation } from 'react-i18next'
import { Select } from '../../../../../../shared/components/ui/Select'
import { ModuleNotice } from '../../../../../../shared/components/module-pages'
import { RULE_SOURCES } from '../../../utils/ruleModel'
import { useRuleConditionOptions } from '../../../hooks/useRuleConditionOptions'
import { formConditions } from '../../utils/ruleBuilder'
import { ConditionPicker } from '../ConditionPicker'

/**
 * Step 2: which leads — source, then campaign, ad and lead form picked from the CRM and Meta lists (names, page,
 * status). The ads list follows the chosen campaign. Empty = any; all empty = every lead.
 */
export function ConditionsStep({ builder }) {
  const { t } = useTranslation()
  const { form, setField } = builder
  const options = useRuleConditionOptions(form)
  const sources = RULE_SOURCES.includes(form.source) || !form.source ? RULE_SOURCES : [...RULE_SOURCES, form.source]
  const count = formConditions(form).length

  return (
    <div className="grid gap-5">
      <div className="grid gap-1 sm:max-w-sm">
        <Select
          label={t('salesTeams.conditions.source')}
          value={form.source}
          onChange={(value) => setField('source', value)}
          placeholder={t('salesTeams.rules.anyValue')}
          options={sources.map((source) => ({ value: source, label: t(`salesTeams.sources.${source}`, { defaultValue: source }) }))}
        />
        <p className="text-xs leading-5 text-[var(--text-muted)]">{t('salesTeams.builder.conditions.hints.source')}</p>
      </div>

      <ConditionPicker
        id="rule-campaign"
        label={t('salesTeams.conditions.campaign_id')}
        hint={t('salesTeams.builder.conditions.hints.campaign_id')}
        value={form.campaign_id}
        onChange={(value) => setField('campaign_id', value)}
        source={options.campaigns}
        emptyText={t('salesTeams.picker.noCampaigns')}
        notice={options.campaigns.metaUnavailable ? t('salesTeams.picker.metaUnavailable') : ''}
      />

      <ConditionPicker
        id="rule-ad"
        label={t('salesTeams.conditions.ad_id')}
        hint={form.campaign_id ? t('salesTeams.picker.adsOfCampaign', { count: options.ads.adSetCount }) : t('salesTeams.builder.conditions.hints.ad_id')}
        value={form.ad_id}
        onChange={(value) => setField('ad_id', value)}
        source={options.ads}
        emptyText={form.campaign_id ? t('salesTeams.picker.noAdsForCampaign') : t('salesTeams.picker.noAds')}
      />

      <ConditionPicker
        id="rule-form"
        label={t('salesTeams.conditions.form_id')}
        hint={t('salesTeams.builder.conditions.hints.form_id')}
        value={form.form_id}
        onChange={(value) => setField('form_id', value)}
        source={options.forms}
        emptyText={t('salesTeams.picker.noForms')}
      />

      <ModuleNotice tone={count ? 'info' : 'warning'}>
        {count ? t('salesTeams.builder.conditions.narrowed', { count }) : t('salesTeams.builder.conditions.catchAll')}
      </ModuleNotice>
    </div>
  )
}
