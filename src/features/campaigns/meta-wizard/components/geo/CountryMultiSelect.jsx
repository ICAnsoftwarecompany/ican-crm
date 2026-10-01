import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { MOCK_GEO_LOCATIONS } from '../../data/mock/metaGeoLocations'
import { locationDisplayName } from '../../domain/geoTargeting'
import { SelectField } from '../fields'

// Countries are real ISO codes, so this list is valid in live mode too.
const COUNTRIES = MOCK_GEO_LOCATIONS.filter((item) => item.type === 'country')

export function CountryMultiSelect({ path, guideKey, label, hint, value = [], onChange, required }) {
  const { t, i18n } = useTranslation()
  const options = useMemo(
    () => COUNTRIES.filter((country) => !value.includes(country.countryCode)).map((country) => ({ value: country.countryCode, label: locationDisplayName(country, i18n.language) })),
    [value, i18n.language]
  )
  const nameOf = (code) => locationDisplayName(COUNTRIES.find((country) => country.countryCode === code), i18n.language) || code

  return (
    <div className="grid gap-2">
      <SelectField path={path} guideKey={guideKey} label={label} hint={hint} required={required} value="" placeholder={t('campaignWizard.common.addCountry')} options={options} onChange={(code) => code && onChange([...value, code])} />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((code) => (
            <span key={code} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] py-0.5 ps-2.5 pe-1 text-xs text-[var(--text)]">
              {nameOf(code)}
              <button type="button" onClick={() => onChange(value.filter((item) => item !== code))} className="rounded-full p-0.5 text-[var(--text-muted)] hover:bg-[var(--surface)]" aria-label={t('campaignWizard.common.remove')}><X size={12} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
