import { useTranslation } from 'react-i18next'
import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'

const BID_STRATEGIES = ['highest_volume', 'cost_cap', 'bid_cap']

/**
 * Budget type/amount, schedule, and bid strategy — used at the campaign
 * level (Phase 1, `scope="campaign"`) and, once Phase 2 lands, reused at
 * the ad-set level (`scope="adSet"`) so the field set is never duplicated.
 */
export function CampaignBudgetFields({ value, onChange, onFocusField, onBlurField, scope }) {
  const { t } = useTranslation()
  const showBidAmount = value.bidStrategy !== 'highest_volume'
  const isScheduledStart = value.schedule.startType === 'scheduled'
  const isScheduledEnd = value.schedule.endType === 'scheduled'

  const updateSchedule = (patch) => onChange({ schedule: { ...value.schedule, ...patch } })

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select
        label={t('campaigns.create.campaignSetup.budget.type.label')}
        value={value.budgetType}
        onChange={(next) => onChange({ budgetType: next })}
        onFocus={() => onFocusField(`${scope}.budget.type`)}
        onBlur={onBlurField}
        options={[
          { value: 'daily', label: t('campaigns.create.campaignSetup.budget.type.daily') },
          { value: 'lifetime', label: t('campaigns.create.campaignSetup.budget.type.lifetime') },
        ]}
      />
      <Input
        type="number"
        min="0"
        label={t('campaigns.create.campaignSetup.budget.amount')}
        value={value.budgetAmount}
        onChange={(event) => onChange({ budgetAmount: event.target.value })}
        onFocus={() => onFocusField(`${scope}.budget.amount`)}
        onBlur={onBlurField}
      />

      <Select
        label={t('campaigns.create.campaignSetup.budget.startType.label')}
        value={value.schedule.startType}
        onChange={(next) => updateSchedule({ startType: next })}
        onFocus={() => onFocusField(`${scope}.budget.schedule`)}
        onBlur={onBlurField}
        options={[
          { value: 'now', label: t('campaigns.create.campaignSetup.budget.startType.now') },
          { value: 'scheduled', label: t('campaigns.create.campaignSetup.budget.startType.scheduled') },
        ]}
      />
      {isScheduledStart && (
        <Input
          type="datetime-local"
          label={t('campaigns.create.campaignSetup.budget.startTime')}
          value={value.schedule.startTime}
          onChange={(event) => updateSchedule({ startTime: event.target.value })}
          onFocus={() => onFocusField(`${scope}.budget.schedule`)}
          onBlur={onBlurField}
        />
      )}

      <Select
        label={t('campaigns.create.campaignSetup.budget.endType.label')}
        value={value.schedule.endType}
        onChange={(next) => updateSchedule({ endType: next })}
        onFocus={() => onFocusField(`${scope}.budget.schedule`)}
        onBlur={onBlurField}
        options={[
          { value: 'never', label: t('campaigns.create.campaignSetup.budget.endType.never') },
          { value: 'scheduled', label: t('campaigns.create.campaignSetup.budget.endType.scheduled') },
        ]}
      />
      {isScheduledEnd && (
        <Input
          type="datetime-local"
          label={t('campaigns.create.campaignSetup.budget.endTime')}
          value={value.schedule.endTime}
          onChange={(event) => updateSchedule({ endTime: event.target.value })}
          onFocus={() => onFocusField(`${scope}.budget.schedule`)}
          onBlur={onBlurField}
        />
      )}

      <Select
        label={t('campaigns.create.campaignSetup.budget.bidStrategy.label')}
        value={value.bidStrategy}
        onChange={(next) => onChange({ bidStrategy: next })}
        onFocus={() => onFocusField(`${scope}.budget.bidStrategy`)}
        onBlur={onBlurField}
        options={BID_STRATEGIES.map((strategy) => ({
          value: strategy,
          label: t(`campaigns.create.campaignSetup.budget.bidStrategy.${strategy}`),
        }))}
      />
      {showBidAmount && (
        <Input
          type="number"
          min="0"
          label={t('campaigns.create.campaignSetup.budget.bidAmount')}
          value={value.bidAmount}
          onChange={(event) => onChange({ bidAmount: event.target.value })}
          onFocus={() => onFocusField(`${scope}.budget.bidStrategy`)}
          onBlur={onBlurField}
        />
      )}
    </div>
  )
}
