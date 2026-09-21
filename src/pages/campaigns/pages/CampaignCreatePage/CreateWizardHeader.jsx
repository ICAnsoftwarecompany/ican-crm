import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { formatDate } from '../../utils/campaignFormatters'

export function CreateWizardHeader({ t, i18n, platform, onBack, onSaveDraft, lastSavedAt }) {
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
        <div className="flex items-center gap-2">
          {lastSavedAt && (
            <span className="text-xs text-[var(--text-muted)]">
              {t('campaigns.create.draft.savedAt', { time: formatDate(lastSavedAt, i18n.language) })}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={onSaveDraft}>
            {t('campaigns.create.saveDraft')}
          </Button>
        </div>
      </div>
      <h2 className="mt-2 text-xl font-bold text-[var(--text)]">{t('campaigns.create.title')}</h2>
    </div>
  )
}
