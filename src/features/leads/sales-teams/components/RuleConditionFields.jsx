import { useTranslation } from 'react-i18next'
import { Select } from '../../../../shared/components/ui/Select'
import { RULE_SOURCES } from '../utils/ruleModel'
import { useRuleConditionOptions } from '../hooks/useRuleConditionOptions'

/** "Which leads": source, campaign, ad and lead form. Empty = any. */
export function RuleConditionFields({ form, setField }) {
  const { t } = useTranslation()
  const options = useRuleConditionOptions(form)
  const any = t('salesTeams.rules.anyValue')
  const loadingOr = (text) => (options.isLoading ? t('salesTeams.common.loading') : text)
  const sources = RULE_SOURCES.includes(form.source) || !form.source ? RULE_SOURCES : [...RULE_SOURCES, form.source]

  return (
    <fieldset className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <legend className="px-1 text-sm font-semibold text-[var(--text)]">{t('salesTeams.rules.conditionsTitle')}</legend>
      <p className="text-xs leading-5 text-[var(--text-muted)]">{t('salesTeams.rules.conditionsHint')}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label={t('salesTeams.conditions.source')}
          value={form.source}
          onChange={(value) => setField('source', value)}
          placeholder={any}
          options={sources.map((source) => ({ value: source, label: t(`salesTeams.sources.${source}`, { defaultValue: source }) }))}
        />
        <Select
          label={t('salesTeams.conditions.campaign_id')}
          value={form.campaign_id}
          onChange={(value) => setField('campaign_id', value)}
          placeholder={loadingOr(any)}
          options={options.campaigns}
        />
        <Select
          label={t('salesTeams.conditions.ad_id')}
          value={form.ad_id}
          onChange={(value) => setField('ad_id', value)}
          placeholder={loadingOr(any)}
          options={options.ads}
        />
        <Select
          label={t('salesTeams.conditions.form_id')}
          value={form.form_id}
          onChange={(value) => setField('form_id', value)}
          placeholder={loadingOr(any)}
          options={options.forms}
        />
      </div>
    </fieldset>
  )
}
