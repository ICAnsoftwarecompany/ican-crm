import { useTranslation } from 'react-i18next'
import { SegmentedControl, SelectField, TextField } from '../fields'
import { useMetaWizard } from '../../context/MetaWizardContext'
import { getSuggestedDailyMinimum } from '../../utils/campaignMoney'

/**
 * Budget amount/type + bid strategy for whichever object owns the budget
 * (the campaign with Advantage campaign budget, or each ad set).
 * `valueGoal` swaps the strategies for value optimization (ROAS).
 */
export function BudgetFields({ owner, pathPrefix, onChange, valueGoal = false }) {
  const { t } = useTranslation()
  const { account } = useMetaWizard()
  const strategies = valueGoal ? ['highest_value', 'minimum_roas'] : ['highest_volume', 'cost_cap', 'bid_cap']
  const strategy = strategies.includes(owner.bidStrategy) ? owner.bidStrategy : strategies[0]
  const minimum = getSuggestedDailyMinimum(account.currency)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-1.5" data-wizard-field={`${pathPrefix}.budgetType`}>
        <span className="text-sm font-medium text-[var(--text)]">{t('campaignWizard.budget.type')}</span>
        <SegmentedControl
          value={owner.budgetType}
          onChange={(budgetType) => onChange({ budgetType })}
          ariaLabel={t('campaignWizard.budget.type')}
          onFocus={() => {}}
          options={[
            { value: 'daily', label: t('campaignWizard.budget.daily') },
            { value: 'lifetime', label: t('campaignWizard.budget.lifetime') },
          ]}
        />
        <p className="text-xs leading-5 text-[var(--text-muted)]">{t(`campaignWizard.budget.${owner.budgetType}Hint`)}</p>
      </div>

      <TextField
        path={`${pathPrefix}.budgetAmount`}
        guideKey="budget.amount"
        label={t(owner.budgetType === 'daily' ? 'campaignWizard.budget.dailyAmount' : 'campaignWizard.budget.lifetimeAmount')}
        required
        type="number"
        inputMode="decimal"
        dir="ltr"
        startAdornment={account.currency}
        value={owner.budgetAmount}
        onChange={(budgetAmount) => onChange({ budgetAmount })}
        hint={owner.budgetType === 'daily' && minimum ? t('campaignWizard.budget.minimumHint', { minimum, currency: account.currency }) : undefined}
      />

      <SelectField
        path={`${pathPrefix}.bidStrategy`}
        guideKey="budget.bidStrategy"
        label={t('campaignWizard.budget.bidStrategy')}
        value={strategy}
        placeholder={false}
        onChange={(bidStrategy) => onChange({ bidStrategy })}
        hint={t(`campaignWizard.budget.strategies.${strategy}.hint`)}
        options={strategies.map((value) => ({ value, label: t(`campaignWizard.budget.strategies.${value}.title`) }))}
      />

      {['cost_cap', 'bid_cap'].includes(strategy) && (
        <TextField
          path={`${pathPrefix}.bidAmount`}
          guideKey={`budget.${strategy}`}
          label={t(`campaignWizard.budget.strategies.${strategy}.amountLabel`)}
          required
          type="number"
          inputMode="decimal"
          dir="ltr"
          startAdornment={account.currency}
          value={owner.bidAmount}
          onChange={(bidAmount) => onChange({ bidAmount })}
        />
      )}
      {strategy === 'minimum_roas' && (
        <TextField
          path={`${pathPrefix}.roasFloor`}
          guideKey="budget.minimum_roas"
          label={t('campaignWizard.budget.strategies.minimum_roas.amountLabel')}
          required
          type="number"
          inputMode="decimal"
          dir="ltr"
          value={owner.roasFloor}
          onChange={(roasFloor) => onChange({ roasFloor })}
          hint={t('campaignWizard.budget.roasHint')}
        />
      )}
    </div>
  )
}
