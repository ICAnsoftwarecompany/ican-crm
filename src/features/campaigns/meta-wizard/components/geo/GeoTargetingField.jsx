import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ListPlus, MapPin } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { useMetaWizard, useWizardField } from '../../context/MetaWizardContext'
import { LOCATION_TYPES, toTargetedLocation } from '../../domain/geoTargeting'
import { RESTRICTED_TARGETING } from '../../config/metaSpecialAdCategories'
import { IssueMessage, SegmentedControl, SelectField } from '../fields'
import { GeoLocationRow } from './GeoLocationRow'
import { GeoLocationSearch } from './GeoLocationSearch'
import { GeoBulkDialog } from './GeoBulkDialog'
import { GeoPinDialog } from './GeoPinDialog'

/**
 * Meta-style location targeting for one ad set: people living in /
 * recently in, include or exclude countries, governorates, cities (with
 * radius), neighbourhoods and dropped pins; bulk paste.
 */
export function GeoTargetingField({ adSet, restricted, onChange }) {
  const { t } = useTranslation()
  const { tenantId, accountId, issues } = useMetaWizard()
  const path = `adSets.${adSet.id}.audience.geo`
  const { issue, fieldProps } = useWizardField(path, 'audience.geo')
  const [mode, setMode] = useState('include')
  const [bulkOpen, setBulkOpen] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const geo = adSet.audience.geo
  const minRadiusKm = restricted ? RESTRICTED_TARGETING.minRadiusKm : 0
  const selectedKeys = useMemo(() => new Set(geo.locations.map((item) => item.key)), [geo.locations])
  const included = geo.locations.filter((item) => item.mode !== 'exclude')
  const excluded = geo.locations.filter((item) => item.mode === 'exclude')
  const rowIssue = (key) => issues.find((item) => item.path === `${path}.${key}`)

  const setLocations = (locations) => onChange({ ...geo, locations })
  const addLocation = (location, addMode) => {
    if (selectedKeys.has(location.key)) return
    const targeted = location.mode ? { ...location, mode: addMode } : toTargetedLocation(location, { mode: addMode })
    if (targeted.radius !== undefined && targeted.radius < minRadiusKm) targeted.radius = minRadiusKm
    setLocations([...geo.locations, targeted])
  }
  const addMany = (locations, addMode) => {
    const fresh = locations.filter((location) => !selectedKeys.has(location.key)).map((location) => {
      const targeted = toTargetedLocation(location, { mode: addMode })
      if (targeted.radius !== undefined && targeted.radius < minRadiusKm) targeted.radius = minRadiusKm
      return targeted
    })
    setLocations([...geo.locations, ...fresh])
  }
  const updateLocation = (key, patch) => setLocations(geo.locations.map((item) => (item.key === key ? { ...item, ...patch } : item)))
  const removeLocation = (key) => setLocations(geo.locations.filter((item) => item.key !== key))

  return (
    <div className="grid gap-3" data-wizard-field={path}>
      <SelectField
        path={`${path}.locationType`}
        guideKey="audience.locationType"
        label={t('campaignWizard.geo.locationType')}
        value={geo.locationType}
        placeholder={false}
        onChange={(locationType) => onChange({ ...geo, locationType })}
        hint={t(`campaignWizard.geo.locationTypes.${geo.locationType}.hint`)}
        options={LOCATION_TYPES.map((value) => ({ value, label: t(`campaignWizard.geo.locationTypes.${value}.title`) }))}
      />

      <div className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SegmentedControl
            size="sm"
            value={mode}
            onChange={setMode}
            ariaLabel={t('campaignWizard.geo.mode')}
            options={[{ value: 'include', label: t('campaignWizard.geo.include') }, { value: 'exclude', label: t('campaignWizard.geo.exclude') }]}
          />
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => setBulkOpen(true)}><ListPlus size={14} />{t('campaignWizard.geo.bulk')}</Button>
            <Button variant="ghost" size="sm" onClick={() => setPinOpen(true)}><MapPin size={14} />{t('campaignWizard.geo.dropPin')}</Button>
          </div>
        </div>
        <GeoLocationSearch tenantId={tenantId} accountId={accountId} mode={mode} selectedKeys={selectedKeys} onAdd={addLocation} onFocus={fieldProps.onFocus} />
      </div>

      {issue && <IssueMessage issue={issue} />}

      {included.length > 0 && (
        <div className="grid gap-1.5">
          <p className="text-xs font-bold text-[var(--text)]">{t('campaignWizard.geo.includedTitle', { count: included.length })}</p>
          <ul className="grid gap-1.5">
            {included.map((location) => <GeoLocationRow key={location.key} location={location} minRadiusKm={minRadiusKm} issue={rowIssue(location.key)} onChange={(patch) => updateLocation(location.key, patch)} onRemove={() => removeLocation(location.key)} />)}
          </ul>
        </div>
      )}
      {excluded.length > 0 && (
        <div className="grid gap-1.5">
          <p className="text-xs font-bold text-[var(--notification-danger)]">{t('campaignWizard.geo.excludedTitle', { count: excluded.length })}</p>
          <ul className="grid gap-1.5">
            {excluded.map((location) => <GeoLocationRow key={location.key} location={location} minRadiusKm={minRadiusKm} issue={rowIssue(location.key)} onChange={(patch) => updateLocation(location.key, patch)} onRemove={() => removeLocation(location.key)} />)}
          </ul>
        </div>
      )}
      {!geo.locations.length && <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--text-muted)]">{t('campaignWizard.geo.empty')}</p>}

      <GeoBulkDialog isOpen={bulkOpen} onClose={() => setBulkOpen(false)} onAdd={addMany} accountId={accountId} />
      <GeoPinDialog isOpen={pinOpen} onClose={() => setPinOpen(false)} onAdd={(pin) => addLocation(pin, mode)} minRadiusKm={minRadiusKm} />
    </div>
  )
}
