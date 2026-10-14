import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BriefcaseBusiness, Check, ChevronDown, ChevronUp, Package, Repeat, Layers } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { HelpField } from '../components/HelpTip'
import { TemplateGallery } from '../components/TemplateGallery'

const MAIN_KINDS = [{ kind: 'product', icon: Package }, { kind: 'service', icon: BriefcaseBusiness }]
const OTHER_KINDS = [{ kind: 'plan', icon: Repeat }, { kind: 'bundle', icon: Layers }]

function KindCard({ kind, icon: Icon, selected, compact, onSelect }) {
  const { t } = useTranslation()
  return (
    <HelpField title={t(`catalogSetup.typeWizard.kinds.${kind}.title`)} text={t(`catalogSetup.typeWizard.kinds.${kind}.help`)}>
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={() => onSelect(kind)}
        className={cn(
          'flex w-full items-start gap-3 rounded-lg border text-start transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]',
          compact ? 'p-3' : 'p-4',
          selected ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)]'
        )}
      >
        <span className={cn('flex shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--brand-accent)]', compact ? 'h-9 w-9' : 'h-11 w-11')}>
          <Icon size={compact ? 18 : 22} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 pe-5">
          <span className="flex items-center gap-1 font-semibold text-[var(--text)]">
            {t(`catalogSetup.typeWizard.kinds.${kind}.title`)}
            {selected && <Check size={15} aria-hidden="true" />}
          </span>
          <span className="block text-sm text-[var(--text-muted)]">{t(`catalogSetup.typeWizard.kinds.${kind}.description`)}</span>
          {!compact && <span className="mt-1 block text-xs text-[var(--text-muted)]">{t(`catalogSetup.typeWizard.kinds.${kind}.examples`)}</span>}
        </span>
      </button>
    </HelpField>
  )
}

/** Step 1: what is sold (product / service, or a plan / bundle), then a template or "start manually". */
export function KindStep({ wizard }) {
  const { t } = useTranslation()
  const { form, choice, chooseKind, pickTemplate, startManual, templatesHidden, setTemplatesHidden } = wizard
  const [showOther, setShowOther] = useState(OTHER_KINDS.some((item) => item.kind === form.kind))

  return (
    <div className="space-y-5">
      <div role="radiogroup" aria-label={t('catalogSetup.typeWizard.kinds.label')} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          {MAIN_KINDS.map((item) => <KindCard key={item.kind} {...item} selected={form.kind === item.kind} onSelect={chooseKind} />)}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
          aria-expanded={showOther}
          onClick={() => setShowOther((value) => !value)}
        >
          {showOther ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {t('catalogSetup.typeWizard.kinds.other')}
        </button>
        {showOther && (
          <div className="grid gap-3 md:grid-cols-2">
            {OTHER_KINDS.map((item) => <KindCard key={item.kind} {...item} compact selected={form.kind === item.kind} onSelect={chooseKind} />)}
          </div>
        )}
      </div>

      <TemplateGallery
        kind={form.kind}
        selectedId={choice}
        hidden={templatesHidden}
        onToggleHidden={() => setTemplatesHidden(!templatesHidden)}
        onPick={pickTemplate}
        onManual={startManual}
      />
    </div>
  )
}
