import { useTranslation } from 'react-i18next'
import { DateTimeField, SegmentedControl } from '../fields'
import { useMetaWizard } from '../../context/MetaWizardContext'
import { accountLocalInput, formatAccountOffset } from '../../domain/accountTime'

/**
 * Start/end schedule. Times are entered in the ad account's timezone
 * (shown next to the field), exactly like Ads Manager.
 */
export function ScheduleFields({ schedule, pathPrefix, onChange, lifetime = false }) {
  const { t } = useTranslation()
  const { account } = useMetaWizard()
  const update = (patch) => onChange({ schedule: { ...schedule, ...patch } })
  const tzLabel = `${account.timezone} · ${formatAccountOffset(account.timezone)}`
  const minStart = accountLocalInput(account.timezone, 0)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid content-start gap-2">
        <span className="text-sm font-medium text-[var(--text)]">{t('campaignWizard.schedule.start')}</span>
        <SegmentedControl
          value={schedule.startType}
          ariaLabel={t('campaignWizard.schedule.start')}
          onChange={(startType) => update({ startType, startTime: startType === 'scheduled' ? schedule.startTime || accountLocalInput(account.timezone, 60) : '' })}
          options={[
            { value: 'now', label: t('campaignWizard.schedule.startNow') },
            { value: 'scheduled', label: t('campaignWizard.schedule.startLater') },
          ]}
        />
        {schedule.startType === 'scheduled' && (
          <DateTimeField path={`${pathPrefix}.startTime`} guideKey="schedule.start" required value={schedule.startTime} min={minStart} timezoneLabel={tzLabel} onChange={(startTime) => update({ startTime })} />
        )}
      </div>

      <div className="grid content-start gap-2">
        <span className="text-sm font-medium text-[var(--text)]">{t('campaignWizard.schedule.end')}</span>
        <SegmentedControl
          value={lifetime ? 'scheduled' : schedule.endType}
          ariaLabel={t('campaignWizard.schedule.end')}
          onChange={(endType) => update({ endType, endTime: endType === 'never' ? '' : schedule.endTime })}
          options={[
            { value: 'never', label: t('campaignWizard.schedule.endNever'), disabled: lifetime },
            { value: 'scheduled', label: t('campaignWizard.schedule.endOn') },
          ]}
        />
        {(lifetime || schedule.endType === 'scheduled') && (
          <DateTimeField path={`${pathPrefix}.endTime`} guideKey="schedule.end" required value={schedule.endTime} min={schedule.startTime || minStart} timezoneLabel={tzLabel} onChange={(endTime) => update({ endTime })} />
        )}
        {lifetime && <p className="text-xs leading-5 text-[var(--text-muted)]">{t('campaignWizard.schedule.lifetimeNeedsEnd')}</p>}
      </div>
    </div>
  )
}
