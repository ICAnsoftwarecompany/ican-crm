import { useTranslation } from 'react-i18next'
import { AppModal } from '../../../../../shared/components/overlays/AppModal'
import { Button } from '../../../../../shared/components/ui/Button'
import { useMetaWizard } from '../../context/MetaWizardContext'
import { Callout } from '../fields'
import { PublishPlanList } from '../review/PublishPlanList'

/** Live publish progress, with retry-from-failure and the next actions when done. */
export function PublishDialog({ isOpen, running, onClose, onRetry, onOpenCampaign, onStartNew }) {
  const { t } = useTranslation()
  const { state } = useMetaWizard()
  const { status, lastError, campaignRemoteId, pendingAdIds } = state.publish
  const finished = status === 'done' || status === 'partial'

  return (
    <AppModal
      isOpen={isOpen}
      onClose={running ? () => {} : onClose}
      closeOnBackdrop={!running}
      size="lg"
      title={t(`campaignWizard.publish.dialogTitle.${running ? 'running' : status}`, { defaultValue: t('campaignWizard.publish.dialogTitle.running') })}
      footer={(
        <div className="flex flex-wrap justify-end gap-2">
          {status === 'failed' && !running && <Button variant="outline" onClick={onClose}>{t('campaignWizard.publish.backToEdit')}</Button>}
          {status === 'failed' && !running && <Button onClick={onRetry}>{t('campaignWizard.publish.retry')}</Button>}
          {finished && <Button variant="outline" onClick={onStartNew}>{t('campaignWizard.publish.startNew')}</Button>}
          {finished && campaignRemoteId && <Button onClick={onOpenCampaign}>{t('campaignWizard.publish.openCampaign')}</Button>}
        </div>
      )}
    >
      <div className="grid gap-4">
        {status === 'failed' && !running && (
          <Callout tone="danger" title={t('campaignWizard.publish.failedTitle')}>
            {lastError?.code ? t(`campaignWizard.publish.errors.${lastError.code}`, { defaultValue: lastError.message }) : lastError?.message || t('campaignWizard.publish.failedBody')}
            {lastError?.details?.length > 0 && <ul className="mt-1 list-disc ps-4">{lastError.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>}
            <p className="mt-1">{t('campaignWizard.publish.retryHint')}</p>
          </Callout>
        )}
        {status === 'done' && <Callout tone="tip" title={t('campaignWizard.publish.doneTitle')}>{t(state.campaign.publishStatus === 'ACTIVE' ? 'campaignWizard.publish.doneActive' : 'campaignWizard.publish.donePaused')}</Callout>}
        {status === 'partial' && <Callout tone="warning" title={t('campaignWizard.publish.partialTitle')}>{t('campaignWizard.publish.partialBody', { count: pendingAdIds?.length || 0 })}</Callout>}
        <PublishPlanList />
      </div>
    </AppModal>
  )
}
