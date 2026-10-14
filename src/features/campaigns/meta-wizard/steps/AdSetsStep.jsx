import { useTranslation } from 'react-i18next'
import { CalendarClock, LayoutGrid, MapPinned, Target, UserRound } from 'lucide-react'
import { ItemTabs } from '../components/layout/ItemTabs'
import { SectionCard, Switch, TextField } from '../components/fields'
import { ConversionFields } from '../components/audience/ConversionFields'
import { AudienceFields } from '../components/audience/AudienceFields'
import { PlacementsFields } from '../components/audience/PlacementsFields'
import { ReachEstimateCard } from '../components/audience/ReachEstimateCard'
import { GeoTargetingField } from '../components/geo/GeoTargetingField'
import { BudgetFields } from '../components/budget/BudgetFields'
import { ScheduleFields } from '../components/budget/ScheduleFields'
import { DaypartingField } from '../components/budget/DaypartingField'
import { useMetaWizard } from '../context/MetaWizardContext'
import { hasRestrictedTargeting } from '../config/metaSpecialAdCategories'
import { getEffectiveAdSetName } from '../domain/naming'
import { adSetStatus } from './stepStatus'

/** Stage 3: one tab per ad set — destination, audience, placements, budget/schedule. */
export function AdSetsStep() {
  const { t, i18n } = useTranslation()
  const { state, actions, issues } = useMetaWizard()
  const adSet = state.adSets.find((item) => item.id === state.meta.activeAdSetId) || state.adSets[0]
  const restricted = hasRestrictedTargeting(state.campaign.specialAdCategories)
  const update = (patch) => actions.updateAdSet(adSet.id, patch)
  const updateAudience = (audience) => update({ audience })
  const abo = state.campaign.budgetLevel === 'adSet'
  const lifetime = abo ? adSet.budgetType === 'lifetime' : state.campaign.budgetType === 'lifetime'

  return (
    <div className="grid gap-4">
      <ItemTabs
        ariaLabel={t('campaignWizard.adSets.tabsLabel')}
        items={state.adSets.map((item) => ({ id: item.id, label: getEffectiveAdSetName(item, t, i18n.language), status: adSetStatus(issues, item.id) }))}
        activeId={adSet.id}
        onSelect={actions.setActiveAdSet}
        onAdd={actions.addAdSet}
        onDuplicate={actions.duplicateAdSet}
        onRemove={actions.removeAdSet}
        addLabel={t('campaignWizard.adSets.add')}
      />
      {state.adSets.length === 1 && <p className="text-xs text-[var(--text-muted)]">{t('campaignWizard.adSets.multipleHint')}</p>}

      <SectionCard icon={Target} title={t('campaignWizard.adSets.destinationTitle')} description={t('campaignWizard.adSets.destinationDescription')}>
        <TextField
          path={`adSets.${adSet.id}.name`}
          guideKey="adSet.name"
          label={t('campaignWizard.adSets.name')}
          value={adSet.name}
          placeholder={getEffectiveAdSetName({ ...adSet, name: '' }, t, i18n.language)}
          onChange={(name) => update({ name })}
          hint={t('campaignWizard.adSets.nameHint')}
        />
        <ConversionFields adSet={adSet} onChange={update} />
      </SectionCard>

      <SectionCard icon={MapPinned} title={t('campaignWizard.adSets.locationsTitle')} description={t('campaignWizard.adSets.locationsDescription')} fieldPath={`adSets.${adSet.id}.audience.geo`}>
        <GeoTargetingField adSet={adSet} restricted={restricted} onChange={(geo) => updateAudience({ ...adSet.audience, geo })} />
      </SectionCard>

      <SectionCard icon={UserRound} title={t('campaignWizard.adSets.audienceTitle')} description={t('campaignWizard.adSets.audienceDescription')}>
        <div className="grid gap-4 xl:grid-cols-[1fr_260px]">
          <AudienceFields adSet={adSet} restricted={restricted} onChange={updateAudience} />
          <div className="xl:sticky xl:top-3 xl:self-start"><ReachEstimateCard adSet={adSet} /></div>
        </div>
      </SectionCard>

      <SectionCard icon={LayoutGrid} title={t('campaignWizard.adSets.placementsTitle')} description={t('campaignWizard.adSets.placementsDescription')}>
        <PlacementsFields adSet={adSet} onChange={(placements) => update({ placements })} />
      </SectionCard>

      <SectionCard icon={CalendarClock} title={t(abo ? 'campaignWizard.adSets.budgetTitle' : 'campaignWizard.adSets.scheduleTitle')} description={t(abo ? 'campaignWizard.adSets.budgetDescription' : 'campaignWizard.adSets.scheduleInherited')}>
        {abo && (
          <>
            <BudgetFields owner={adSet} pathPrefix={`adSets.${adSet.id}`} valueGoal={adSet.performanceGoal === 'VALUE'} onChange={(patch) => update(patch.budgetType === 'lifetime' ? { ...patch, useCampaignSchedule: false } : patch)} />
            <Switch
              checked={adSet.useCampaignSchedule}
              onChange={(useCampaignSchedule) => update({ useCampaignSchedule })}
              label={t('campaignWizard.adSets.useCampaignSchedule')}
              description={t('campaignWizard.adSets.useCampaignScheduleHint')}
            />
            {!adSet.useCampaignSchedule && <ScheduleFields schedule={adSet.schedule} pathPrefix={`adSets.${adSet.id}.schedule`} lifetime={adSet.budgetType === 'lifetime'} onChange={update} />}
          </>
        )}
        <DaypartingField dayparting={adSet.dayparting} path={`adSets.${adSet.id}.dayparting`} lifetime={lifetime} onChange={update} />
      </SectionCard>
    </div>
  )
}
