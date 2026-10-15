import { useTranslation } from 'react-i18next'
import { Select } from '../../../../../../shared/components/ui/Select'
import { ModuleNotice } from '../../../../../../shared/components/module-pages'
import { RULE_SOURCES } from '../../../utils/ruleModel'
import { useRuleConditionOptions } from '../../../hooks/useRuleConditionOptions'
import { formConditions } from '../../utils/ruleBuilder'

const FIELDS = ['source', 'campaign_id', 'ad_id', 'form_id']

/** Step 2: which leads — source, campaign, ad, lead form. Empty = any; all empty = every lead. */
export function ConditionsStep({ builder }) {
  const { t } = useTranslation()
  const { form, setField } = builder
  const options = useRuleConditionOptions(form)
  const any = options.isLoading ? t('salesTeams.common.loading') : t('salesTeams.rules.anyValue')
  const sources = RULE_SOURCES.includes(form.source) || !form.source ? RULE_SOURCES : [...RULE_SOURCES, form.source]
  const optionsFor = {
    source: sources.map((source) => ({ value: source, label: t(`salesTeams.sources.${source}`, { defaultValue: source }) })),
    campaign_id: options.campaigns,
    ad_id: options.ads,
    form_id: options.forms,
  }
  const count = formConditions(form).length

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((key) => (
          <div key={key} className="grid gap-1">
            <Select
              label={t(`salesTeams.conditions.${key}`)}
              value={form[key]}
              onChange={(value) => setField(key, value)}
              placeholder={key === 'source' ? t('salesTeams.rules.anyValue') : any}
              options={optionsFor[key]}
            />
            <p className="text-xs leading-5 text-[var(--text-muted)]">{t(`salesTeams.builder.conditions.hints.${key}`)}</p>
          </div>
        ))}
      </div>
      <ModuleNotice tone={count ? 'info' : 'warning'}>
        {count ? t('salesTeams.builder.conditions.narrowed', { count }) : t('salesTeams.builder.conditions.catchAll')}
      </ModuleNotice>
    </div>
  )
}
