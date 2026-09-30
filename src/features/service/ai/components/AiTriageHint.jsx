import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useAiMutations, useAiSettings } from '../api/aiApi'

/** While a case is being created: suggested type + priority from the text, applied only on click. */
export function AiTriageHint({ subject, description, caseTypes = [], current, onApply }) {
  const { t, i18n } = useTranslation()
  const settings = useAiSettings()
  const { triage } = useAiMutations()
  const text = useDebounce(`${subject} ${description}`.trim(), 700)
  const enabled = settings.data?.features?.triage !== false
  useEffect(() => {
    if (enabled && text.length >= 6) triage.mutate({ subject, description })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, enabled])
  const result = triage.data
  if (!enabled || !result?.type_id || text.length < 6) return null
  const type = caseTypes.find((entry) => entry.id === result.type_id)
  if (current.type_id === result.type_id && current.priority === result.priority) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--ai-border)] bg-[var(--ai-bg)] px-3 py-2 text-sm">
      <span className="flex items-center gap-1.5 text-[var(--text)]">
        <Sparkles size={14} className="text-[var(--ai-color)]" aria-hidden="true" />
        {t('service.ai.triage.hint', { type: type ? localizeLabel(type.label, i18n.language, type.key) : '', priority: t(`service.cases.priority.${result.priority}`), value: Math.round(result.confidence * 100) })}
      </span>
      <Button type="button" size="sm" variant="outline" onClick={() => onApply({ type_id: result.type_id, priority: result.priority })}>{t('service.ai.apply')}</Button>
    </div>
  )
}
