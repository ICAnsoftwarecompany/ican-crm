import { useTranslation } from 'react-i18next'
import { useWizardField } from '../../context/MetaWizardContext'
import { DEVICE_PLATFORMS, PLACEMENT_PLATFORMS, getUnsupportedPlatforms } from '../../config/metaPlacements'
import { ChoiceCard, IssueMessage, ToggleChip } from '../fields'

/** Advantage+ placements (recommended) or a manual platform/position picker. */
export function PlacementsFields({ adSet, onChange }) {
  const { t } = useTranslation()
  const path = `adSets.${adSet.id}.placements`
  const { issue, fieldProps } = useWizardField(path, 'adSet.placements')
  const devicesField = useWizardField(`${path}.devices`, 'adSet.placements')
  const placements = adSet.placements
  const unsupported = getUnsupportedPlatforms(adSet.conversionLocation)
  const update = (patch) => onChange({ ...placements, ...patch })
  const setPositions = (platform, positions) => update({ manual: { ...placements.manual, [platform]: positions } })

  return (
    <div className="grid gap-3" data-wizard-field={path}>
      <div role="radiogroup" className="grid gap-2 md:grid-cols-2">
        {['advantage', 'manual'].map((mode) => (
          <ChoiceCard
            key={mode}
            compact
            title={t(`campaignWizard.placements.${mode}.title`)}
            description={t(`campaignWizard.placements.${mode}.description`)}
            selected={placements.mode === mode}
            onSelect={() => update({ mode })}
            onFocus={fieldProps.onFocus}
          />
        ))}
      </div>

      {placements.mode === 'manual' && (
        <div className="grid gap-3 rounded-lg border border-[var(--border)] p-3">
          <div className="grid gap-1.5">
            <span className="text-xs font-bold text-[var(--text)]">{t('campaignWizard.placements.devices')}</span>
            <div className="flex flex-wrap gap-1.5">
              {DEVICE_PLATFORMS.map((device) => (
                <ToggleChip key={device} selected={placements.devices.includes(device)} onToggle={() => update({ devices: placements.devices.includes(device) ? placements.devices.filter((item) => item !== device) : [...placements.devices, device] })}>
                  {t(`campaignWizard.placements.deviceTypes.${device}`)}
                </ToggleChip>
              ))}
            </div>
            {devicesField.issue && <IssueMessage issue={devicesField.issue} />}
          </div>
          {Object.entries(PLACEMENT_PLATFORMS).map(([platform, config]) => {
            const blocked = unsupported.includes(platform)
            const selected = placements.manual?.[platform] || []
            const allSelected = selected.length === config.positions.length
            return (
              <div key={platform} className="grid gap-1.5 border-t border-[var(--border)] pt-3 first:border-0 first:pt-0">
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                    <input type="checkbox" disabled={blocked} checked={!blocked && selected.length > 0} onChange={() => setPositions(platform, selected.length ? [] : [...config.positions])} className="h-4 w-4 accent-[var(--brand-accent)]" />
                    {t(`campaignWizard.placements.platforms.${platform}`)}
                  </label>
                  {blocked ? (
                    <span className="text-[11px] text-[var(--text-light)]">{t('campaignWizard.placements.notAvailable')}</span>
                  ) : (
                    <button type="button" onClick={() => setPositions(platform, allSelected ? [] : [...config.positions])} className="text-[11px] font-semibold text-[var(--brand-accent)]">
                      {t(allSelected ? 'campaignWizard.placements.clearAll' : 'campaignWizard.placements.selectAll')}
                    </button>
                  )}
                </div>
                {!blocked && (
                  <div className="flex flex-wrap gap-1.5">
                    {config.positions.map((position) => (
                      <ToggleChip key={position} selected={selected.includes(position)} onToggle={() => setPositions(platform, selected.includes(position) ? selected.filter((item) => item !== position) : [...selected, position])}>
                        {t(`campaignWizard.placements.positions.${platform}.${position}`)}
                      </ToggleChip>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {issue && <IssueMessage issue={issue} />}
        </div>
      )}
    </div>
  )
}
