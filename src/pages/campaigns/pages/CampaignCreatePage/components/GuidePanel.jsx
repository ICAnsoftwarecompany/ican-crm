import { useTranslation } from 'react-i18next'
import { Lightbulb } from 'lucide-react'
import { STAGE_DEFAULT_GUIDE_FIELD } from './guideContent'

/**
 * Always-visible contextual help — not a dismissible AppDrawer overlay.
 * Content changes with `focusedField` (set by step components on
 * focus/hover) and falls back to a per-stage default tip.
 */
export function GuidePanel({ stage, focusedField }) {
  const { t } = useTranslation()
  const activeField = focusedField || STAGE_DEFAULT_GUIDE_FIELD[stage] || null
  const title = activeField ? t(`campaigns.create.guide.${activeField}.title`, { defaultValue: '' }) : ''
  const body = activeField ? t(`campaigns.create.guide.${activeField}.body`, { defaultValue: '' }) : ''

  return (
    <aside className="h-fit rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 lg:sticky lg:top-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#007A80]">
        <Lightbulb size={16} />
        {t('campaigns.create.guide.title')}
      </div>
      {title || body ? (
        <div>
          {title && <p className="text-sm font-bold text-[var(--text)]">{title}</p>}
          {body && <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{body}</p>}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">{t('campaigns.create.guide.empty')}</p>
      )}
    </aside>
  )
}
