import { useTranslation } from 'react-i18next'
import { CalendarClock, Layers, Scale, ShieldAlert, Wallet, Wand2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Callout, ChoiceCard, SectionCard, SelectField, TextField, ToggleChip } from '../components/fields'
import { BudgetFields } from '../components/budget/BudgetFields'
import { ScheduleFields } from '../components/budget/ScheduleFields'
import { CountryMultiSelect } from '../components/geo/CountryMultiSelect'
import { useMetaWizard } from '../context/MetaWizardContext'
import { SPECIAL_AD_CATEGORIES, hasRestrictedTargeting } from '../config/metaSpecialAdCategories'
import { getEffectiveCampaignName } from '../domain/naming'

/** Stage 2: identity, special ad categories, budget strategy, budget and schedule. */
export function CampaignSetupStep() {
  const { t } = useTranslation()
  const { state, actions, pages } = useMetaWizard()
  const campaign = state.campaign
  const suggestedName = getEffectiveCampaignName({ ...state, campaign: { ...campaign, name: '' } }, t)
  const valueGoal = state.adSets.some((adSet) => adSet.performanceGoal === 'VALUE')
  const toggleCategory = (category) => actions.updateCampaign({
    specialAdCategories: campaign.specialAdCategories.includes(category) ? campaign.specialAdCategories.filter((item) => item !== category) : [...campaign.specialAdCategories, category],
  })

  return (
    <div className="grid gap-4">
      <SectionCard icon={Layers} title={t('campaignWizard.campaignSetup.basicsTitle')} description={t('campaignWizard.campaignSetup.basicsDescription')}>
        <TextField
          path="campaign.name"
          guideKey="campaign.name"
          label={t('campaignWizard.campaignSetup.name')}
          value={campaign.name}
          maxLength={250}
          placeholder={suggestedName}
          onChange={(name) => actions.updateCampaign({ name })}
          hint={t('campaignWizard.campaignSetup.nameHint')}
          action={!campaign.name && (
            <Button variant="ghost" size="sm" onClick={() => actions.updateCampaign({ name: suggestedName })}><Wand2 size={13} />{t('campaignWizard.campaignSetup.useSuggestedName')}</Button>
          )}
        />
        {pages.length ? (
          <SelectField
            path="campaign.pageId"
            guideKey="campaign.pageId"
            label={t('campaignWizard.campaignSetup.page')}
            required
            value={campaign.pageId}
            placeholder={t('campaignWizard.campaignSetup.selectPage')}
            onChange={(pageId) => actions.updateCampaign({ pageId })}
            hint={t('campaignWizard.campaignSetup.pageHint')}
            options={pages.map((page) => ({ value: String(page.page_id || page.id), label: page.name || page.page_name || String(page.page_id || page.id) }))}
          />
        ) : (
          <Callout tone="danger" title={t('campaignWizard.campaignSetup.noPagesTitle')}>{t('campaignWizard.campaignSetup.noPagesBody')}</Callout>
        )}
      </SectionCard>

      <SectionCard icon={ShieldAlert} title={t('campaignWizard.campaignSetup.specialTitle')} description={t('campaignWizard.campaignSetup.specialDescription')} fieldPath="campaign.specialAdCategories">
        <div className="flex flex-wrap gap-2" onMouseEnter={() => actions.setFocusedField('campaign.specialAdCategories')}>
          {SPECIAL_AD_CATEGORIES.map((category) => (
            <ToggleChip key={category} selected={campaign.specialAdCategories.includes(category)} onToggle={() => toggleCategory(category)}>
              {t(`campaignWizard.specialCategories.${category}.title`)}
            </ToggleChip>
          ))}
        </div>
        {!campaign.specialAdCategories.length && <p className="text-xs text-[var(--text-muted)]">{t('campaignWizard.campaignSetup.specialNone')}</p>}
        {campaign.specialAdCategories.length > 0 && (
          <>
            <CountryMultiSelect
              path="campaign.specialAdCategoryCountries"
              guideKey="campaign.specialAdCategoryCountries"
              label={t('campaignWizard.campaignSetup.specialCountries')}
              hint={t('campaignWizard.campaignSetup.specialCountriesHint')}
              required
              value={campaign.specialAdCategoryCountries}
              onChange={(specialAdCategoryCountries) => actions.updateCampaign({ specialAdCategoryCountries })}
            />
            {hasRestrictedTargeting(campaign.specialAdCategories) && <Callout tone="warning" title={t('campaignWizard.campaignSetup.restrictedTitle')}>{t('campaignWizard.campaignSetup.restrictedBody')}</Callout>}
          </>
        )}
      </SectionCard>

      <SectionCard icon={Scale} title={t('campaignWizard.campaignSetup.budgetStrategyTitle')} description={t('campaignWizard.campaignSetup.budgetStrategyDescription')} fieldPath="campaign.budgetLevel">
        <div role="radiogroup" className="grid gap-3 md:grid-cols-2">
          {['campaign', 'adSet'].map((level) => (
            <ChoiceCard
              key={level}
              title={t(`campaignWizard.campaignSetup.budgetLevels.${level}.title`)}
              description={t(`campaignWizard.campaignSetup.budgetLevels.${level}.description`)}
              badge={level === 'campaign' ? <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted)]">{t('campaignWizard.common.recommended')}</span> : null}
              selected={campaign.budgetLevel === level}
              onSelect={() => actions.updateCampaign({ budgetLevel: level })}
              onFocus={() => actions.setFocusedField('campaign.budgetLevel')}
            />
          ))}
        </div>
      </SectionCard>

      {campaign.budgetLevel === 'campaign' ? (
        <SectionCard icon={Wallet} title={t('campaignWizard.campaignSetup.budgetTitle')} description={t('campaignWizard.campaignSetup.budgetDescription')}>
          <BudgetFields owner={campaign} pathPrefix="campaign" valueGoal={valueGoal} onChange={actions.updateCampaign} />
          <TextField
            path="campaign.spendCap"
            guideKey="campaign.spendCap"
            label={t('campaignWizard.campaignSetup.spendCap')}
            optional
            type="number"
            dir="ltr"
            inputMode="decimal"
            value={campaign.spendCap}
            onChange={(spendCap) => actions.updateCampaign({ spendCap })}
            hint={t('campaignWizard.campaignSetup.spendCapHint')}
          />
        </SectionCard>
      ) : (
        <Callout tone="info" title={t('campaignWizard.campaignSetup.adSetBudgetTitle')}>{t('campaignWizard.campaignSetup.adSetBudgetBody')}</Callout>
      )}

      <SectionCard icon={CalendarClock} title={t('campaignWizard.campaignSetup.scheduleTitle')} description={t(campaign.budgetLevel === 'campaign' ? 'campaignWizard.campaignSetup.scheduleDescription' : 'campaignWizard.campaignSetup.scheduleDefaultDescription')}>
        <ScheduleFields
          schedule={campaign.schedule}
          pathPrefix="campaign.schedule"
          lifetime={campaign.budgetLevel === 'campaign' && campaign.budgetType === 'lifetime'}
          onChange={actions.updateCampaign}
        />
      </SectionCard>
    </div>
  )
}
