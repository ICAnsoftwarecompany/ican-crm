import { useTranslation } from 'react-i18next'

const groupOf = (event) => (event.startsWith('service.') ? event.split('.').slice(0, 2).join('.') : event.split('.')[0])

/** Event subscriptions grouped by area; the event name (the contract) is shown next to its label. */
export function EventChecklist({ events, value = [], onChange, error }) {
  const { t } = useTranslation()
  const groups = events.reduce((acc, event) => ({ ...acc, [groupOf(event)]: [...(acc[groupOf(event)] || []), event] }), {})
  const toggle = (event) => onChange(value.includes(event) ? value.filter((entry) => entry !== event) : [...value, event])
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-sm font-medium text-[var(--text)]">{t('service.apiAccess.fields.events')}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.entries(groups).map(([group, list]) => (
          <div key={group} className="grid gap-1.5 rounded-lg border border-[var(--border)] p-2">
            <span className="text-xs font-semibold text-[var(--text)]">{t(`service.apiAccess.eventGroups.${group.replace('.', '_')}`)}</span>
            {list.map((event) => (
              <label key={event} className="flex items-start gap-1.5 text-xs text-[var(--text)]">
                <input type="checkbox" className="mt-0.5" checked={value.includes(event)} onChange={() => toggle(event)} />
                <span className="grid">
                  <span>{t(`service.apiAccess.events.${event.replaceAll('.', '_')}`)}</span>
                  <code dir="ltr" className="text-start font-mono text-[0.65rem] text-[var(--text-muted)]">{event}</code>
                </span>
              </label>
            ))}
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-status-lost">{error}</p>}
    </fieldset>
  )
}
