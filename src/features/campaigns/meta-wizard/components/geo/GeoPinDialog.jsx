import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppModal } from '../../../../../shared/components/overlays/AppModal'
import { Button } from '../../../../../shared/components/ui/Button'
import { RADIUS_LIMITS_KM, createPinLocation, parseCoordinates } from '../../domain/geoTargeting'
import { inputClassName } from '../fields/FieldFrame'

/**
 * "Drop pin": target a radius around an exact point (a branch, a
 * compound, a mall). Accepts "lat, lng" or a pasted Google Maps link.
 */
export function GeoPinDialog({ isOpen, onClose, onAdd, minRadiusKm = 0 }) {
  const { t } = useTranslation()
  const limits = RADIUS_LIMITS_KM.custom_location
  const min = Math.max(limits.min, minRadiusKm)
  const [coordinates, setCoordinates] = useState('')
  const [label, setLabel] = useState('')
  const [radius, setRadius] = useState(Math.max(limits.default, min))
  const parsed = parseCoordinates(coordinates)

  const close = () => {
    setCoordinates('')
    setLabel('')
    onClose()
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={close}
      title={t('campaignWizard.geo.pinTitle')}
      description={t('campaignWizard.geo.pinDescription')}
      footer={(
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={close}>{t('campaignWizard.common.cancel')}</Button>
          <Button disabled={!parsed} onClick={() => { onAdd(createPinLocation({ ...parsed, label: label.trim(), radius })); close() }}>{t('campaignWizard.geo.pinAdd')}</Button>
        </div>
      )}
    >
      <div className="grid gap-3">
        <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
          {t('campaignWizard.geo.pinCoordinates')}
          <input dir="ltr" value={coordinates} onChange={(event) => setCoordinates(event.target.value)} placeholder="30.0444, 31.2357" className={inputClassName(Boolean(coordinates) && !parsed)} />
          <span className="text-xs font-normal text-[var(--text-muted)]">{coordinates && !parsed ? t('campaignWizard.geo.pinInvalid') : t('campaignWizard.geo.pinHint')}</span>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
          {t('campaignWizard.geo.pinLabel')}
          <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder={t('campaignWizard.geo.pinLabelPlaceholder')} className={inputClassName(false)} />
        </label>
        <div className="grid gap-1.5">
          <span className="text-sm font-medium text-[var(--text)]">{t('campaignWizard.geo.radius')}</span>
          <div className="flex items-center gap-3">
            <input type="range" min={min} max={limits.max} value={radius} onChange={(event) => setRadius(Number(event.target.value))} className="flex-1 accent-[var(--brand-accent)]" aria-label={t('campaignWizard.geo.radius')} />
            <span className="w-16 text-end text-sm font-bold" dir="ltr">{radius} km</span>
          </div>
        </div>
      </div>
    </AppModal>
  )
}
