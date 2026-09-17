import { useTranslation } from 'react-i18next'
import { Input } from '../../../../../shared/components/ui/Input'
import { Button } from '../../../../../shared/components/ui/Button'
import { getTenantTimezoneLabel } from '../../../../../features/outreach-campaigns/utils/campaignDateTime'

/**
 * Step 5 — Schedule.
 *
 * The backend only exposes a single `starts_at` field (no separate
 * "send now" flag/endpoint) — "Send Now" is implemented by filling the
 * exact same field with the current date/time, not by inventing new
 * backend behavior. Whether the backend treats a near-immediate
 * `starts_at` as instant delivery vs. the next scheduler tick is an
 * unconfirmed backend detail — see docs "Backend Gaps".
 */
export function CampaignScheduleStep({ form, onChange, errors = {} }) {
  const { t } = useTranslation()
  const timezone = getTenantTimezoneLabel()

  const setNow = () => {
    const now = new Date()
    const pad = (value) => String(value).padStart(2, '0')
    onChange({
      schedule: {
        date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
      },
    })
  }

  return (
    <div className="max-w-md space-y-4">
      <Button type="button" variant="outline" size="sm" onClick={setNow}>
        {t('outreachCampaigns.schedule.sendNow')}
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="date"
          label={t('outreachCampaigns.schedule.date')}
          value={form.schedule.date}
          onChange={(event) => onChange({ schedule: { ...form.schedule, date: event.target.value } })}
          error={errors.date && t(errors.date)}
        />
        <Input
          type="time"
          label={t('outreachCampaigns.schedule.time')}
          value={form.schedule.time}
          onChange={(event) => onChange({ schedule: { ...form.schedule, time: event.target.value } })}
          error={errors.time && t(errors.time)}
        />
      </div>

      {timezone && (
        <p className="text-xs text-[var(--text-muted)]">{t('outreachCampaigns.schedule.timezoneNote', { timezone })}</p>
      )}
    </div>
  )
}
