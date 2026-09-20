import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'

export function CreateWizardHeader({ t, i18n, platform, onBack, onSaveDraft, savingDraft }) {
  const isRtl = i18n.dir() === 'rtl'
  const BackIcon = isRtl ? ChevronRight : ChevronLeft

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('actions.back')}
          className="flex items-center gap-1.5 text-sm font-bold text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
        >
          <BackIcon size={16} />
          {t(platform.labelKey)}
        </button>
        <Button variant="outline" size="sm" onClick={onSaveDraft} loading={savingDraft}>
          {t('campaigns.create.saveDraft')}
        </Button>
      </div>
      <h2 className="mt-2 text-xl font-bold text-[var(--text)]">{t('campaigns.create.title')}</h2>
    </div>
  )
}
