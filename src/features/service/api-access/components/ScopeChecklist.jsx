import { useTranslation } from 'react-i18next'

/** Scopes grouped by resource (`records.read` → Records: read). Labels are translated, values are sent as-is. */
export function ScopeChecklist({ scopes, value = [], onChange, error }) {
  const { t } = useTranslation()
  const groups = scopes.reduce((acc, scope) => {
    const [resource] = scope.split('.')
    return { ...acc, [resource]: [...(acc[resource] || []), scope] }
  }, {})
  const toggle = (scope) => onChange(value.includes(scope) ? value.filter((entry) => entry !== scope) : [...value, scope])
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-sm font-medium text-[var(--text)]">{t('service.apiAccess.fields.scopes')}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.entries(groups).map(([resource, list]) => (
          <div key={resource} className="grid gap-1 rounded-lg border border-[var(--border)] p-2">
            <span className="text-xs font-semibold text-[var(--text)]">{t(`service.apiAccess.resources.${resource}`)}</span>
            <div className="flex flex-wrap gap-3">
              {list.map((scope) => (
                <label key={scope} className="inline-flex items-center gap-1.5 text-xs text-[var(--text)]" title={scope}>
                  <input type="checkbox" checked={value.includes(scope)} onChange={() => toggle(scope)} />
                  {t(`service.apiAccess.actions.${scope.split('.')[1]}`)}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-status-lost">{error}</p>}
    </fieldset>
  )
}
