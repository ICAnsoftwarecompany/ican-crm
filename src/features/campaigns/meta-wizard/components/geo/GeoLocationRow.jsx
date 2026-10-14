import { useTranslation } from 'react-i18next'
import { ExternalLink, MinusCircle, PlusCircle, X } from 'lucide-react'
import { cn } from '../../../../../shared/utils/cn'
import { RADIUS_LIMITS_KM, locationDisplayName } from '../../domain/geoTargeting'
import { IssueMessage } from '../fields'
import { GEO_TYPE_ICONS, geoContextLabel, mapsUrl } from './geoDisplay'

/** One selected location: include/exclude, radius, map link, remove. */
export function GeoLocationRow({ location, minRadiusKm = 0, issue, onChange, onRemove }) {
  const { t, i18n } = useTranslation()
  const Icon = GEO_TYPE_ICONS[location.type] || GEO_TYPE_ICONS.city
  const excluded = location.mode === 'exclude'
  const limits = RADIUS_LIMITS_KM[location.type]
  const showRadius = limits && location.radius !== undefined
  const min = Math.max(limits?.min || 0, minRadiusKm)
  const link = mapsUrl(location)

  return (
    <li className={cn('rounded-lg border p-2.5', excluded ? 'border-dashed border-[var(--notification-danger)]' : 'border-[var(--border)]')}>
      <div className="flex items-start gap-2.5">
        <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md', excluded ? 'bg-[var(--surface-2)] text-[var(--notification-danger)]' : 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]')}>
          <Icon size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate text-sm font-semibold text-[var(--text)]">{locationDisplayName(location, i18n.language)}</span>
            <span className="text-[10px] font-semibold uppercase text-[var(--text-light)]">{t(`campaignWizard.geo.types.${location.type}`)}</span>
            {excluded && <span className="text-[10px] font-bold text-[var(--notification-danger)]">{t('campaignWizard.geo.excludedTag')}</span>}
          </div>
          <p className="truncate text-xs text-[var(--text-muted)]">{geoContextLabel(location, i18n.language)}</p>
          {showRadius && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">{t('campaignWizard.geo.radius')}</span>
              <input
                type="range"
                min={min}
                max={limits.max}
                step={1}
                value={Math.max(min, location.radius)}
                onChange={(event) => onChange({ radius: Number(event.target.value) })}
                aria-label={t('campaignWizard.geo.radius')}
                className="h-1.5 flex-1 cursor-pointer accent-[var(--brand-accent)]"
              />
              <span className="w-16 text-end text-xs font-bold text-[var(--text)]" dir="ltr">+{location.radius} km</span>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)]" title={t('campaignWizard.geo.openMap')} aria-label={t('campaignWizard.geo.openMap')}>
              <ExternalLink size={14} />
            </a>
          )}
          <button type="button" onClick={() => onChange({ mode: excluded ? 'include' : 'exclude' })} className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)]" title={t(excluded ? 'campaignWizard.geo.switchToInclude' : 'campaignWizard.geo.switchToExclude')} aria-label={t(excluded ? 'campaignWizard.geo.switchToInclude' : 'campaignWizard.geo.switchToExclude')}>
            {excluded ? <PlusCircle size={14} /> : <MinusCircle size={14} />}
          </button>
          <button type="button" onClick={onRemove} className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--notification-danger)]" aria-label={t('campaignWizard.common.remove')}>
            <X size={14} />
          </button>
        </div>
      </div>
      {issue && <IssueMessage issue={issue} className="mt-1.5" />}
    </li>
  )
}
