import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { hasTransition, pipelineProblems, toggleTransition } from '../utils/pipelineEditing'

/**
 * Allowed moves as a from × to matrix. Transitions that require fields
 * (e.g. resolution code) keep them; they are marked with an asterisk.
 */
export function TransitionsField({ label, value = [], onChange, values, error }) {
  const { t, i18n } = useTranslation()
  const statuses = values?.statuses || []
  const transitions = value || []
  const name = (status) => localizeLabel(status.label, i18n.language, status.key || '—')
  const problems = pipelineProblems({ statuses, transitions })

  if (!statuses.length) return null
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{label}</legend>
      <p className="text-xs text-[var(--text-muted)]">{t('service.pipelines.transitionsHint')}</p>
      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="w-full text-xs">
          <thead className="bg-[var(--surface-2)] text-[var(--text-muted)]">
            <tr>
              <th className="px-2 py-2 text-start font-medium">{t('service.pipelines.fromTo')}</th>
              {statuses.map((status) => (
                <th key={status.id} className="px-2 py-2 text-center font-medium">{name(status)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statuses.map((from) => (
              <tr key={from.id} className="border-t border-[var(--border)]">
                <th scope="row" className="px-2 py-1.5 text-start font-medium text-[var(--text)]">{name(from)}</th>
                {statuses.map((to) => {
                  const existing = transitions.find((transition) => transition.from === from.id && transition.to === to.id)
                  const required = existing?.required_fields?.length
                  return (
                    <td key={to.id} className="px-2 py-1.5 text-center">
                      {from.id === to.id ? (
                        <span className="text-[var(--text-muted)]" aria-hidden="true">·</span>
                      ) : (
                        <label className="inline-flex items-center gap-0.5" title={required ? t('service.pipelines.requiresFields', { fields: existing.required_fields.join(', ') }) : undefined}>
                          <input
                            type="checkbox"
                            className="accent-[var(--brand-accent)]"
                            checked={hasTransition(transitions, from.id, to.id)}
                            aria-label={t('service.pipelines.transitionAria', { from: name(from), to: name(to) })}
                            onChange={(event) => onChange(toggleTransition(transitions, from.id, to.id, event.target.checked))}
                          />
                          {required ? <span className="text-status-contacted">*</span> : null}
                        </label>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {problems.map((problem) => (
        <p key={problem} className="flex items-center gap-1.5 text-xs text-sla-at-risk">
          <AlertTriangle size={12} aria-hidden="true" />
          {t(`service.pipelines.problems.${problem}`)}
        </p>
      ))}
      {error && <p className="text-xs text-status-lost">{error}</p>}
    </fieldset>
  )
}
