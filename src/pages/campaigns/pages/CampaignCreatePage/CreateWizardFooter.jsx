import { Button } from '../../../../shared/components/ui/Button'

export function CreateWizardFooter({ t, isLastStep, onCancel, onSaveDraft, onContinue, submitting }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-4">
      <Button variant="outline" onClick={onCancel}>{t('actions.cancel')}</Button>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onSaveDraft}>{t('campaigns.create.saveDraft')}</Button>
        <Button onClick={onContinue} loading={submitting}>
          {isLastStep ? t('campaigns.create.submit') : t('campaigns.create.continue')}
        </Button>
      </div>
    </div>
  )
}
