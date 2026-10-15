import { useTranslation } from 'react-i18next'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { useNumberFormat } from '../../../products'
import { unitPrice } from '../utils/interestForm'
import { InterestUnitsPicker } from './InterestUnitsPicker'

/**
 * The fields the chosen item needs, from its profile: unit of measure + quantity (products), quantity (services,
 * bundles), wanted units (one-of-a-kind items), preferred date (scheduling / on-site), number of people.
 */
export function InterestDetailsFields({ state }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  const { form, errors, update, toggleIn, product, profile, units, instances, resources } = state
  const error = (field) => (errors[field] ? t(`leads.interestDialog.errors.${errors[field]}`, profile?.participants || {}) : undefined)

  const baseUnitName = product.baseUnit?.name || t('leads.interestDialog.fields.baseUnit')
  const unitOptions = units.map((unit) => ({
    value: String(unit.id),
    label: `${unit.unitName || `#${unit.id}`} (×${formatNumber(unit.factor)}) — ${formatNumber(unitPrice(product, unit))}`,
  }))
  const showGrid = profile.units || profile.quantity || profile.schedule || profile.participants

  return (
    <div className="space-y-3">
      {showGrid && (
        <div className="grid gap-3 sm:grid-cols-2">
          {profile.units && (
            resources.unitsLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : unitOptions.length > 0 ? (
              <Select
                label={t('leads.interestDialog.fields.unit')}
                value={form.productUnitId}
                onChange={(value) => update({ productUnitId: value })}
                options={unitOptions}
                placeholder={`${baseUnitName} — ${formatNumber(product.price)}`}
              />
            ) : null
          )}
          {profile.quantity && (
            <Input
              type="number"
              min="1"
              step="any"
              dir="ltr"
              label={profile.kind === 'service' ? t('leads.interestDialog.fields.serviceQuantity') : t('leads.interestDialog.fields.quantity')}
              value={form.quantity}
              onChange={(event) => update({ quantity: event.target.value })}
              error={error('quantity')}
            />
          )}
          {profile.participants && (
            <Input
              type="number"
              min={profile.participants.min ?? 1}
              max={profile.participants.max ?? undefined}
              dir="ltr"
              label={t('leads.interestDialog.fields.participants')}
              hint={profile.participants.max ? t('leads.interestDialog.fields.participantsRange', { min: profile.participants.min ?? 1, max: profile.participants.max }) : undefined}
              value={form.participants}
              onChange={(event) => update({ participants: event.target.value })}
              error={error('participants')}
            />
          )}
          {profile.schedule && (
            <Input
              type="date"
              dir="ltr"
              label={t('leads.interestDialog.fields.preferredDate')}
              value={form.preferredDate}
              onChange={(event) => update({ preferredDate: event.target.value })}
            />
          )}
        </div>
      )}

      {profile.candidates && (
        <InterestUnitsPicker
          instances={instances}
          selectedIds={form.instanceIds}
          onToggle={(id) => toggleIn('instanceIds', id)}
          loading={resources.instancesLoading}
          error={resources.instancesError}
          holdDays={profile.holdDays}
        />
      )}

      {profile.serial && (
        <p className="text-xs text-[var(--text-muted)]">{t('leads.interestDialog.serialHint')}</p>
      )}
    </div>
  )
}
