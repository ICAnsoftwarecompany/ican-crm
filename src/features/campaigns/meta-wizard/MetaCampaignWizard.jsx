import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'
import { SubSidebarMobileDrawer } from '../../../shared/components/sub-sidebar'
import { useLocalStorage } from '../../../shared/components/data-table/hooks/useLocalStorage'
import { Button } from '../../../shared/components/ui/Button'
import { MetaWizardProvider, focusWizardField } from './context/MetaWizardContext'
import { useCampaignWizard } from './hooks/useCampaignWizard'
import { usePublishCampaign } from './hooks/usePublishCampaign'
import { validateWizard, blockingIssues, completionPercent, issuesForStage } from './domain/validateWizard'
import { getAccountSettings } from './domain/accountTime'
import { getEffectiveCampaignName } from './domain/naming'
import { STAGES } from './state/wizardStages'
import { DraftsPanel } from './components/layout/DraftsPanel'
import { WizardHeader } from './components/layout/WizardHeader'
import { WizardStepper } from './components/layout/WizardStepper'
import { WizardFooter } from './components/layout/WizardFooter'
import { GuidePanel } from './components/layout/GuidePanel'
import { StageIntro } from './components/layout/StageIntro'
import { Callout } from './components/fields'
import { PublishDialog } from './components/publish/PublishDialog'
import { ObjectiveStep } from './steps/ObjectiveStep'
import { CampaignSetupStep } from './steps/CampaignSetupStep'
import { AdSetsStep } from './steps/AdSetsStep'
import { AdsStep } from './steps/AdsStep'
import { ReviewStep } from './steps/ReviewStep'

/**
 * Guided Meta campaign builder (objective → campaign → ad sets → ads →
 * review) with multi-draft autosave, live validation and resumable publish.
 * `center` is the Campaign Center context (tenant, account, integrations).
 */
export function MetaCampaignWizard({ center }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const account = useMemo(() => getAccountSettings(center.accounts, center.accountId), [center.accounts, center.accountId])
  const pages = useMemo(() => center.integrations?.facebook_pages || [], [center.integrations])
  const wizard = useCampaignWizard({ tenantId: center.tenantId, platformId: center.platform.id, accountId: center.accountId, copySuffix: t('campaignWizard.drafts.copySuffix') })
  const { state, actions } = wizard
  const stateRef = useRef(state)
  stateRef.current = state
  const [draftsCollapsed, setDraftsCollapsed] = useLocalStorage('campaign-wizard-drafts-collapsed', false)
  const [draftsDrawerOpen, setDraftsDrawerOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const topRef = useRef(null)

  const issues = useMemo(() => validateWizard(state, { pages, currency: account.currency, timezone: account.timezone }), [state, pages, account])
  const publishContext = useMemo(() => ({ tenantId: center.tenantId, accountId: center.accountId, currency: account.currency, timezone: account.timezone, t, language: i18n.language }), [center.tenantId, center.accountId, account, t, i18n.language])
  const publisher = usePublishCampaign({ getState: () => stateRef.current, actions, persist: wizard.persist, context: publishContext })

  const stage = state.meta.currentStage
  const stageIndex = STAGES.indexOf(stage)
  const stageErrors = issuesForStage(issues, stage).filter((issue) => issue.severity === 'error')
  const allErrors = blockingIssues(issues)

  const contextValue = useMemo(() => ({
    state, actions, issues, account, pages,
    integrations: center.integrations || {},
    tenantId: center.tenantId,
    accountId: center.accountId,
  }), [state, actions, issues, account, pages, center.integrations, center.tenantId, center.accountId])

  const goToStage = useCallback((next) => {
    actions.setStage(next)
    topRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }, [actions])

  const jumpToIssue = useCallback((issue) => {
    if (issue.stage !== stateRef.current.meta.currentStage) actions.setStage(issue.stage)
    if (issue.adSetId) actions.setActiveAdSet(issue.adSetId)
    if (issue.adId) actions.setActiveAd(issue.adSetId, issue.adId)
    actions.touchField(issue.path)
    setTimeout(() => focusWizardField(issue.path), 80)
  }, [actions])

  const editFromReview = useCallback((target, { adSetId, adId } = {}) => {
    if (adSetId) actions.setActiveAdSet(adSetId)
    if (adId) actions.setActiveAd(adSetId, adId)
    goToStage(target)
  }, [actions, goToStage])

  const handleContinue = () => {
    if (stageErrors.length) {
      actions.showAllErrors(true)
      toast.error(t('campaignWizard.footer.fixStage', { count: stageErrors.length }))
      jumpToIssue(stageErrors[0])
      return
    }
    goToStage(STAGES[stageIndex + 1])
  }

  const runPublish = async () => {
    const result = await publisher.publish()
    if (result?.status === 'done') toast.success(t('campaignWizard.publish.doneTitle'))
    else if (result?.status === 'partial') toast.success(t('campaignWizard.publish.partialTitle'))
    else if (result?.status === 'failed') toast.error(t('campaignWizard.publish.failedTitle'))
  }

  const handlePublish = () => {
    if (allErrors.length) {
      actions.showAllErrors(true)
      toast.error(t('campaignWizard.footer.fixAll', { count: allErrors.length }))
      jumpToIssue(allErrors[0])
      return
    }
    setPublishOpen(true)
    runPublish()
  }

  // Ctrl/Cmd + S saves the draft.
  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (wizard.saveNow()) toast.success(t('campaignWizard.header.savedToast'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [wizard, t])

  const draftsPanelProps = {
    drafts: wizard.drafts,
    currentDraftId: state.draftId,
    onOpen: (id) => { wizard.openDraft(id); setDraftsDrawerOpen(false) },
    onNew: () => { wizard.newDraft(); setDraftsDrawerOpen(false) },
    onDuplicate: wizard.duplicateDraft,
    onDelete: wizard.deleteDraft,
  }
  const published = ['done', 'partial'].includes(state.publish.status)
  const StepComponent = { objective: ObjectiveStep, campaignSetup: CampaignSetupStep, adSets: AdSetsStep, ads: AdsStep }[stage]

  return (
    <MetaWizardProvider value={contextValue}>
      <div className="grid items-start gap-4 lg:[grid-template-columns:var(--wizard-cols)]" style={{ '--wizard-cols': `${draftsCollapsed ? 64 : 260}px minmax(0,1fr)` }}>
        <div className="hidden lg:sticky lg:top-0 lg:block">
          <DraftsPanel {...draftsPanelProps} collapsed={draftsCollapsed} onToggleCollapse={() => setDraftsCollapsed((value) => !value)} />
        </div>

        <div ref={topRef} className="grid min-w-0 scroll-mt-4 gap-4">
          <WizardHeader
            title={getEffectiveCampaignName(state, t)}
            account={account}
            saveStatus={wizard.saveStatus}
            lastSavedAt={state.meta.lastSavedAt}
            dirty={state.meta.dirty}
            completion={completionPercent(issues, STAGES)}
            onSave={() => { if (wizard.saveNow()) toast.success(t('campaignWizard.header.savedToast')); else toast.info(t('campaignWizard.header.nothingToSave')) }}
            onOpenDrafts={() => setDraftsDrawerOpen(true)}
          />
          <WizardStepper activeStage={stage} issues={issues} visitedStages={state.meta.visitedStages} onSelect={goToStage} />

          {published && (
            <Callout tone="tip" title={t('campaignWizard.publish.publishedBannerTitle')} action={<Button size="sm" variant="outline" onClick={() => wizard.duplicateDraft(state.draftId)}><Copy size={13} />{t('campaignWizard.publish.duplicateAsNew')}</Button>}>
              {t('campaignWizard.publish.publishedBannerBody')}
            </Callout>
          )}

          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid min-w-0 gap-4">
              <StageIntro stage={stage} stepNumber={stageIndex + 1} totalSteps={STAGES.length} />
              {stage === 'review' ? <ReviewStep onEdit={editFromReview} onJumpToIssue={jumpToIssue} /> : <StepComponent />}
              <WizardFooter
                isFirst={stageIndex === 0}
                isLast={stage === 'review'}
                stageErrorCount={stageErrors.length}
                totalErrorCount={allErrors.length}
                onBack={() => goToStage(STAGES[Math.max(0, stageIndex - 1)])}
                onContinue={handleContinue}
                onPublish={handlePublish}
                publishing={publisher.running}
                publishLabel={t(state.publish.status === 'failed' ? 'campaignWizard.publish.resume' : 'campaignWizard.publish.publish')}
              />
            </div>
            <GuidePanel stage={stage} focusedField={state.meta.focusedField} issues={issues} onJumpToIssue={jumpToIssue} />
          </div>
        </div>
      </div>

      <SubSidebarMobileDrawer open={draftsDrawerOpen} onClose={() => setDraftsDrawerOpen(false)} id="campaign-wizard-drafts" label={t('campaignWizard.drafts.title')}>
        <DraftsPanel {...draftsPanelProps} variant="plain" collapsed={false} />
      </SubSidebarMobileDrawer>

      <PublishDialog
        isOpen={publishOpen}
        running={publisher.running}
        onClose={() => setPublishOpen(false)}
        onRetry={runPublish}
        onStartNew={() => { setPublishOpen(false); wizard.newDraft() }}
        onOpenCampaign={() => navigate(`/campaigns/${center.platform.id}/${state.publish.campaignRemoteId}`)}
      />
    </MetaWizardProvider>
  )
}
