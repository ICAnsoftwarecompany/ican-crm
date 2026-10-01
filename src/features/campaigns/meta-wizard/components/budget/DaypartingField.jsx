import { useTranslation } from 'react-i18next'
import { Switch, ToggleChip } from '../fields'
import { IssueMessage } from '../fields/FieldFrame'
import { useWizardField } from '../../context/MetaWizardContext'
import { inputClassName } from '../fields/FieldFrame'

const DAYS = [0, 1, 2, 3, 4, 5, 6]
const HOURS = Array.from({ length: 25 }, (_, hour) => hour)

/** Ad scheduling (Meta "run ads on a schedule") — lifetime budgets only. */
export function DaypartingField({ dayparting, path, lifetime, onChange }) {
  const { t } = useTranslation()
  const { issue, fieldProps } = useWizardField(path, 'schedule.dayparting')
  const update = (patch) => onChange({ dayparting: { ...dayparting, ...patch } })
  const toggleDay = (day) => update({ days: dayparting.days.includes(day) ? dayparting.days.filter((item) => item !== day) : [...dayparting.days, day].sort() })
  const hourLabel = (hour) => `${String(hour).padStart(2, '0')}:00`

  return (
    <div className="grid gap-3 rounded-lg border border-dashed border-[var(--border)] p-3" data-wizard-field={path}>
      <Switch
        checked={Boolean(dayparting.enabled)}
        disabled={!lifetime}
        onFocus={fieldProps.onFocus}
        onChange={(enabled) => update({ enabled })}
        label={t('campaignWizard.schedule.dayparting')}
        description={lifetime ? t('campaignWizard.schedule.daypartingHint') : t('campaignWizard.schedule.daypartingNeedsLifetime')}
      />
      {dayparting.enabled && lifetime && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((day) => (
              <ToggleChip key={day} selected={dayparting.days.includes(day)} onToggle={() => toggleDay(day)}>{t(`campaignWizard.schedule.days.${day}`)}</ToggleChip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text)]">
            <span>{t('campaignWizard.schedule.from')}</span>
            <select dir="ltr" value={dayparting.startHour} onChange={(event) => update({ startHour: Number(event.target.value) })} className={`${inputClassName(false)} w-28`} aria-label={t('campaignWizard.schedule.from')}>
              {HOURS.slice(0, 24).map((hour) => <option key={hour} value={hour}>{hourLabel(hour)}</option>)}
            </select>
            <span>{t('campaignWizard.schedule.to')}</span>
            <select dir="ltr" value={dayparting.endHour} onChange={(event) => update({ endHour: Number(event.target.value) })} className={`${inputClassName(false)} w-28`} aria-label={t('campaignWizard.schedule.to')}>
              {HOURS.slice(1).map((hour) => <option key={hour} value={hour}>{hourLabel(hour)}</option>)}
            </select>
            <span className="text-xs text-[var(--text-muted)]">{t('campaignWizard.schedule.viewerTimezone')}</span>
          </div>
        </>
      )}
      {issue && <IssueMessage issue={issue} />}
    </div>
  )
}
