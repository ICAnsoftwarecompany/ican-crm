import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, ChevronUp, PencilLine } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'
import { templatesForKind } from '../constants/itemTypeTemplates'
import { useCapabilityName } from '../../components/common/catalogUi'

const MAX_CHIPS = 3

/**
 * Ready item types for the chosen kind, as small cards next to "start manually" (2026-10-14). The gallery can be
 * collapsed; the choice is remembered in this browser by the caller.
 */
export function TemplateGallery({ kind, selectedId, hidden, onToggleHidden, onPick, onManual }) {
  const { t } = useTranslation()
  const capabilityName = useCapabilityName()
  const templates = templatesForKind(kind)

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3" aria-labelledby="type-templates-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 id="type-templates-title" className="text-sm font-semibold text-[var(--text)]">{t('catalogSetup.typeWizard.templates.title')}</h3>
          <p className="text-xs text-[var(--text-muted)]">{t('catalogSetup.typeWizard.templates.hint', { count: templates.length })}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleHidden} aria-expanded={!hidden}>
          {hidden ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          {hidden ? t('catalogSetup.typeWizard.templates.show') : t('catalogSetup.typeWizard.templates.hide')}
        </Button>
      </div>

      {!hidden && (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <li>
            <button
              type="button"
              onClick={onManual}
              className={cn(
                'flex h-full w-full items-start gap-3 rounded-lg border border-dashed p-3 text-start transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]',
                selectedId === 'manual' ? 'border-[var(--brand-accent)]' : 'border-[var(--border)]'
              )}
            >
              <PencilLine size={20} className="mt-0.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--text)]">{t('catalogSetup.typeWizard.templates.manual')}</span>
                <span className="block text-xs text-[var(--text-muted)]">{t('catalogSetup.typeWizard.templates.manualHint')}</span>
              </span>
            </button>
          </li>
          {templates.map((template) => {
            const Icon = template.icon
            const selected = selectedId === template.id
            const extra = template.capabilities.length - MAX_CHIPS
            return (
              <li key={template.id}>
                <button
                  type="button"
                  onClick={() => onPick(template)}
                  aria-pressed={selected}
                  className={cn(
                    'flex h-full w-full items-start gap-3 rounded-lg border p-3 text-start transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]',
                    selected ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)]'
                  )}
                >
                  <Icon size={20} className="mt-0.5 shrink-0 text-[var(--brand-accent)]" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1 text-sm font-semibold text-[var(--text)]">
                      {t(`catalogSetup.templates.${template.id}.name`)}
                      {selected && <Check size={14} aria-hidden="true" />}
                    </span>
                    <span className="block text-xs text-[var(--text-muted)]">{t(`catalogSetup.templates.${template.id}.description`)}</span>
                    {template.capabilities.length > 0 && (
                      <span className="mt-1.5 flex flex-wrap gap-1">
                        {template.capabilities.slice(0, MAX_CHIPS).map((capability) => (
                          <span key={capability.code} className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
                            {capabilityName(capability.code)}
                          </span>
                        ))}
                        {extra > 0 && <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">+{extra}</span>}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
