import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'
import { CampaignBudgetFields } from '../components/CampaignBudgetFields'
import { getAdSetOptionsForObjective } from '../config/metaAdSetCompatibility'

export function AdSetsStep({ t, objective, adSets, campaign, onChangeAdSet, onFocusField, onBlurField }) {
  const changeConversionLocation = (adSetId, conversionLocation) => {
    const options = getAdSetOptionsForObjective(objective, conversionLocation)
    onChangeAdSet(adSetId, {
      conversionLocation,
      performanceGoal: options.defaultGoal,
    })
  }

  return (
    <div className="space-y-4">
      {adSets.map((adSet, index) => (
        <AdSetFields key={adSet.id} t={t} objective={objective} adSet={adSet} index={index} campaign={campaign} onChangeAdSet={onChangeAdSet} onChangeConversionLocation={changeConversionLocation} onFocusField={onFocusField} onBlurField={onBlurField} />
      ))}
    </div>
  )
}

function AdSetFields({ t, objective, adSet, index, campaign, onChangeAdSet, onChangeConversionLocation, onFocusField, onBlurField }) {
  const options = getAdSetOptionsForObjective(objective, adSet.conversionLocation)
  const websiteRequiresPixel = adSet.conversionLocation === 'website' && ['OUTCOME_LEADS', 'OUTCOME_SALES'].includes(objective)

  return (
        <section className="space-y-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="text-sm font-bold text-[var(--text)]">{t('campaigns.create.adSets.itemTitle', { count: index + 1 })}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t('campaigns.create.adSets.name')} value={adSet.name} onChange={(event) => onChangeAdSet(adSet.id, { name: event.target.value })} onFocus={() => onFocusField('adSets.name')} onBlur={onBlurField} />
            <Select label={t('campaigns.create.adSets.conversionLocation')} value={adSet.conversionLocation} onChange={(value) => onChangeConversionLocation(adSet.id, value)} options={getAdSetOptionsForObjective(objective).locations.map((value) => ({ value, label: t(`campaigns.create.adSets.locations.${value}`) }))} />
            {options.goals.length > 0 ? <Select label={t('campaigns.create.adSets.optimizationGoal')} value={adSet.performanceGoal} onChange={(value) => onChangeAdSet(adSet.id, { performanceGoal: value })} options={options.goals.map((value) => ({ value, label: value }))} /> : <div className="self-end rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-muted)]">{t('campaigns.create.adSets.optimizationAutomatic')}</div>}
            <Input label={t('campaigns.create.adSets.countries')} value={adSet.audience.countries.join(', ')} onChange={(event) => onChangeAdSet(adSet.id, { audience: { ...adSet.audience, countries: event.target.value.split(',').map((value) => value.trim().toUpperCase()).filter(Boolean) } })} />
            <Input type="number" min="13" max="65" label={t('campaigns.create.adSets.ageMin')} value={adSet.audience.ageMin} onChange={(event) => onChangeAdSet(adSet.id, { audience: { ...adSet.audience, ageMin: Number(event.target.value) } })} />
            <Input type="number" min="13" max="65" label={t('campaigns.create.adSets.ageMax')} value={adSet.audience.ageMax} onChange={(event) => onChangeAdSet(adSet.id, { audience: { ...adSet.audience, ageMax: Number(event.target.value) } })} />
            {websiteRequiresPixel && <><Input label={t('campaigns.create.adSets.pixelId')} value={adSet.pixelId} onChange={(event) => onChangeAdSet(adSet.id, { pixelId: event.target.value })} /><Input label={t('campaigns.create.adSets.customEventType')} value={adSet.customEventType} onChange={(event) => onChangeAdSet(adSet.id, { customEventType: event.target.value })} /></>}
            {adSet.conversionLocation === 'whatsapp' && <Input label={t('campaigns.create.adSets.whatsappPhoneNumber')} value={adSet.whatsappPhoneNumber} onChange={(event) => onChangeAdSet(adSet.id, { whatsappPhoneNumber: event.target.value })} />}
            {adSet.conversionLocation === 'app' && <><Input label={t('campaigns.create.adSets.applicationId')} value={adSet.applicationId} onChange={(event) => onChangeAdSet(adSet.id, { applicationId: event.target.value })} /><Input type="url" label={t('campaigns.create.adSets.objectStoreUrl')} value={adSet.objectStoreUrl} onChange={(event) => onChangeAdSet(adSet.id, { objectStoreUrl: event.target.value })} /></>}
            {objective === 'OUTCOME_AWARENESS' && <><Input type="number" min="1" label={t('campaigns.create.adSets.frequencyMax')} value={adSet.frequencyMax} onChange={(event) => onChangeAdSet(adSet.id, { frequencyMax: Number(event.target.value) })} /><Input type="number" min="1" label={t('campaigns.create.adSets.frequencyIntervalDays')} value={adSet.frequencyIntervalDays} onChange={(event) => onChangeAdSet(adSet.id, { frequencyIntervalDays: Number(event.target.value) })} /></>}
          </div>
          {campaign.budgetLevel === 'adSet' && <CampaignBudgetFields value={adSet} onChange={(patch) => onChangeAdSet(adSet.id, patch)} onFocusField={onFocusField} onBlurField={onBlurField} scope="adSets" />}
        </section>
  )
}
