import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']

/** Weekly working hours: one row per day (enabled, start, end). */
export function WorkingHoursField({ label, value, onChange }) {
  const { t } = useTranslation()
  const rows = DAYS.map((day) => (value || []).find((row) => row.day === day) || { day, enabled: false, start: '09:00', end: '17:00' })
  const update = (day, patch) => onChange(rows.map((row) => (row.day === day ? { ...row, ...patch } : row)))

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{label}</legend>
      {rows.map((row) => (
        <div key={row.day} className="grid grid-cols-[minmax(0,1fr)_8.5rem_8.5rem] items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-[var(--text)]">
            <input type="checkbox" className="accent-[var(--brand-accent)]" checked={row.enabled} onChange={(event) => update(row.day, { enabled: event.target.checked })} />
            {t(`service.settings.days.${row.day}`)}
          </label>
          <Input type="time" dir="ltr" disabled={!row.enabled} value={row.start} aria-label={t('service.settings.fields.start')} onChange={(event) => update(row.day, { start: event.target.value })} />
          <Input type="time" dir="ltr" disabled={!row.enabled} value={row.end} aria-label={t('service.settings.fields.end')} onChange={(event) => update(row.day, { end: event.target.value })} />
        </div>
      ))}
    </fieldset>
  )
}

/** Public holidays: date + name `{ ar, en }`. */
export function HolidaysField({ label, value = [], onChange }) {
  const { t } = useTranslation()
  const list = value || []
  const update = (index, patch) => onChange(list.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)))

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{label}</legend>
      {list.map((row, index) => (
        <div key={index} className="grid grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2">
          <Input type="date" dir="ltr" value={row.date} aria-label={t('service.settings.fields.date')} onChange={(event) => update(index, { date: event.target.value })} />
          <Input dir="auto" lang="ar" value={row.name?.ar || ''} placeholder={t('service.settings.fields.language.ar')} aria-label={t('service.settings.fields.language.ar')} onChange={(event) => update(index, { name: { ...row.name, ar: event.target.value } })} />
          <Input dir="ltr" lang="en" value={row.name?.en || ''} placeholder={t('service.settings.fields.language.en')} aria-label={t('service.settings.fields.language.en')} onChange={(event) => update(index, { name: { ...row.name, en: event.target.value } })} />
          <Button variant="ghost" size="icon" aria-label={t('service.settings.actions.removeRow')} onClick={() => onChange(list.filter((_, rowIndex) => rowIndex !== index))}>
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-fit" onClick={() => onChange([...list, { date: '', name: { ar: '', en: '' } }])}>
        <Plus size={14} aria-hidden="true" />
        {t('service.settings.actions.addHoliday')}
      </Button>
    </fieldset>
  )
}

const ACTIONS = ['notify', 'escalate']
const TARGETS = ['assignee', 'team_leader', 'supervisor', 'manager', 'queue']

/** Escalation triggers: at N% of the SLA (100 = breach) → action → target. */
export function EscalationTriggersField({ label, value = [], onChange, error }) {
  const { t } = useTranslation()
  const list = value || []
  const update = (index, patch) => onChange(list.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)))
  const actionOptions = ACTIONS.map((action) => ({ value: action, label: t(`service.settings.escalation.actions.${action}`) }))
  const targetOptions = TARGETS.map((target) => ({ value: target, label: t(`service.settings.escalation.targets.${target}`) }))

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{label}</legend>
      <p className="text-xs text-[var(--text-muted)]">{t('service.settings.escalation.hint')}</p>
      {list.map((row, index) => (
        <div key={index} className="grid grid-cols-[6rem_minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-2">
          {/* dir wrapper keeps the % suffix after the digits in RTL too */}
          <div dir="ltr">
            <Input type="number" min="0" max="100" value={row.at} endIcon={<span className="text-xs">%</span>} aria-label={t('service.settings.escalation.at')} onChange={(event) => update(index, { at: Number(event.target.value) })} />
          </div>
          <Select options={actionOptions} value={row.action} onChange={(next) => update(index, { action: next })} aria-label={t('service.settings.escalation.action')} />
          <Select options={targetOptions} value={row.target} onChange={(next) => update(index, { target: next })} aria-label={t('service.settings.escalation.target')} />
          <Button variant="ghost" size="icon" aria-label={t('service.settings.actions.removeRow')} onClick={() => onChange(list.filter((_, rowIndex) => rowIndex !== index))}>
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-fit" onClick={() => onChange([...list, { at: 80, action: 'notify', target: 'assignee' }])}>
        <Plus size={14} aria-hidden="true" />
        {t('service.settings.escalation.add')}
      </Button>
      {error && <p className="text-xs text-status-lost">{error}</p>}
    </fieldset>
  )
}
