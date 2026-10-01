import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'

export function WizardFooter({ isFirst, isLast, stageErrorCount, totalErrorCount, onBack, onContinue, onPublish, publishing, publishLabel }) {
  const { t } = useTranslation()
  return (
    <footer className="sticky bottom-0 z-10 -mx-1 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-2)] px-1 py-3">
      <Button variant="outline" onClick={onBack} disabled={isFirst}>
        <ArrowLeft size={15} className="rtl:rotate-180" />
        {t('campaignWizard.footer.back')}
      </Button>
      <div className="flex flex-wrap items-center gap-3">
        {(isLast ? totalErrorCount : stageErrorCount) > 0 && (
          <span className="text-xs font-semibold text-[var(--notification-danger)]">
            {t(isLast ? 'campaignWizard.footer.blockingTotal' : 'campaignWizard.footer.blockingStage', { count: isLast ? totalErrorCount : stageErrorCount })}
          </span>
        )}
        {isLast ? (
          <Button onClick={onPublish} loading={publishing}>
            <Rocket size={15} />
            {publishLabel}
          </Button>
        ) : (
          <Button onClick={onContinue}>
            {t('campaignWizard.footer.continue')}
            <ArrowRight size={15} className="rtl:rotate-180" />
          </Button>
        )}
      </div>
    </footer>
  )
}
