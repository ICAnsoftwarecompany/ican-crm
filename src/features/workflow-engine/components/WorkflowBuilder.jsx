import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Archive, Copy, ListTree, PanelRightOpen, Pause, Play, Save } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { Input } from '../../../shared/components/ui/Input'
import { Select } from '../../../shared/components/ui/Select'
import { AppDrawer } from '../../../shared/components/overlays/AppDrawer'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { createEmptyWorkflow, createStep, findStepById } from '../core/workflowDomainModel'
import { NODE_TYPES } from '../core/nodeTypes'
import { getModules } from '../registry/workflowRegistry'
import { validateWorkflow } from '../utils/workflowGraph'
import { setStepAtAnchor, removeStepById, updateStepConfig } from '../utils/workflowTreeEditor'
import { useWorkflowStore } from '../hooks/useWorkflowStore'
import { WorkflowCanvas } from './WorkflowCanvas'
import { WorkflowNodeLibrary } from './WorkflowNodeLibrary'
import { WorkflowNodeProperties } from './WorkflowNodeProperties'
import { WorkflowLocalStorageNotice } from './WorkflowLocalStorageNotice'
import { WorkflowStatusBadge } from './WorkflowStatusBadge'

const BRANCHING_TYPES = [NODE_TYPES.CONDITION, NODE_TYPES.WAIT_FOR_EVENT]

/**
 * The one, reusable Workflow Builder — see docs "Builder UX". It never
 * knows which module opened it beyond what `context` tells it; every
 * trigger/action/condition it can offer comes from the Workflow Registry.
 *
 * @param {'full'|'context'} [mode='context']
 * @param {import('../core/workflowDomainModel').WorkflowContext} [context]
 * @param {import('../core/workflowDomainModel').Workflow} [initialWorkflow]
 * @param {string[]} [allowedModules] - Restricts the module picker in full mode.
 * @param {(workflow: import('../core/workflowDomainModel').Workflow) => void} [onSave]
 * @param {() => void} [onCancel]
 * @param {boolean} [embedded] - Renders inline without a Cancel/back affordance styled as a modal footer (used when a caller already provides its own chrome, e.g. AppModal from WorkflowLauncher, or a details-page tab).
 */
export function WorkflowBuilder({ mode = 'context', context, initialWorkflow, allowedModules, onSave, onCancel, embedded = false }) {
  const { t } = useTranslation()
  const workflowStore = useWorkflowStore()

  const [workflow, setWorkflow] = useState(() => initialWorkflow || createEmptyWorkflow(context))
  const [selection, setSelection] = useState(null)
  const [libraryMode, setLibraryMode] = useState(null) // 'trigger' | 'step' | null
  const [pendingAnchor, setPendingAnchor] = useState(null)
  const [mobilePane, setMobilePane] = useState(null) // 'library' | 'properties' | null
  const [validation, setValidation] = useState(null)
  const [confirmRemoveStepId, setConfirmRemoveStepId] = useState(null)
  const [confirmArchive, setConfirmArchive] = useState(false)

  const modules = useMemo(() => getModules(), [])

  const effectiveModule = workflow.module || context?.module || ''

  // AppDrawer mounts a full-viewport transparent backdrop the instant
  // `open` is true, even on desktop where it's visually redundant with the
  // always-on side panels — so `mobilePane` must never be set outside the
  // `lg:hidden` breakpoint, or that invisible backdrop silently blocks
  // every click on the desktop canvas underneath it.
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true))
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const handleChange = (event) => setIsDesktop(event.matches)
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  const openMobilePane = (pane) => {
    if (!isDesktop) setMobilePane(pane)
  }

  const openLibraryForTrigger = () => {
    setLibraryMode('trigger')
    setPendingAnchor(null)
    openMobilePane('library')
  }

  const openLibraryForStep = (anchor) => {
    setLibraryMode('step')
    setPendingAnchor(anchor)
    openMobilePane('library')
  }

  const handleSelect = (nextSelection) => {
    if (nextSelection.kind === 'trigger' && !workflow.trigger?.definitionId) {
      openLibraryForTrigger()
      return
    }
    setSelection(nextSelection)
    setLibraryMode(null)
    openMobilePane('properties')
  }

  const handlePickTrigger = (definitionId) => {
    setWorkflow((current) => ({ ...current, trigger: { definitionId, config: {} } }))
    setSelection({ kind: 'trigger' })
    setLibraryMode(null)
    openMobilePane('properties')
  }

  const handlePickAction = (definitionId) => {
    const newStep = createStep(NODE_TYPES.ACTION, { definitionId })
    setWorkflow((current) => setStepAtAnchor(current, pendingAnchor, newStep))
    setSelection({ kind: 'step', stepId: newStep.id })
    setLibraryMode(null)
    setPendingAnchor(null)
    openMobilePane('properties')
  }

  const handlePickLogic = (kind) => {
    const newStep = createStep(kind)
    setWorkflow((current) => setStepAtAnchor(current, pendingAnchor, newStep))
    setSelection({ kind: 'step', stepId: newStep.id })
    setLibraryMode(null)
    setPendingAnchor(null)
    openMobilePane('properties')
  }

  const performRemoveStep = (stepId) => {
    setWorkflow((current) => removeStepById(current, stepId))
    setSelection((current) => (current?.kind === 'step' && current.stepId === stepId ? null : current))
    setMobilePane(null)
  }

  const handleRemoveStepRequest = (stepId) => {
    const step = findStepById(workflow.rootStep, stepId)
    if (step && BRANCHING_TYPES.includes(step.type)) {
      setConfirmRemoveStepId(stepId)
      return
    }
    performRemoveStep(stepId)
  }

  const handleChangeTriggerConfig = (patch) => {
    setWorkflow((current) => ({ ...current, trigger: { ...current.trigger, config: { ...current.trigger.config, ...patch } } }))
  }

  const handleChangeStepConfig = (stepId, patch) => {
    setWorkflow((current) => updateStepConfig(current, stepId, patch))
  }

  const persistAndReport = (nextWorkflow, successMessageKey) => {
    const saved = workflowStore.save(nextWorkflow)
    setWorkflow(saved)
    toast.success(t(successMessageKey))
    onSave?.(saved)
    return saved
  }

  const handleSaveDraft = () => {
    if (!workflow.name.trim()) {
      toast.error(t('workflow.builder.nameRequiredToast'))
      return
    }
    persistAndReport({ ...workflow, status: workflow.status === 'active' ? 'active' : 'draft' }, 'workflow.builder.draftSaved')
  }

  const handleActivate = () => {
    const result = validateWorkflow(workflow)
    setValidation(result)
    if (!result.isValid) {
      toast.error(t('workflow.builder.fixErrorsBeforeActivate'))
      return
    }
    persistAndReport({ ...workflow, status: 'active' }, 'workflow.builder.activated')
  }

  const handlePause = () => persistAndReport({ ...workflow, status: 'paused' }, 'workflow.builder.paused')

  const handleDuplicate = () => {
    if (!workflow.id) {
      toast.error(t('workflow.builder.saveBeforeDuplicate'))
      return
    }
    const copy = workflowStore.duplicate(workflow.id)
    if (copy) toast.success(t('workflow.builder.duplicated'))
  }

  const handleArchive = () => {
    persistAndReport({ ...workflow, status: 'archived' }, 'workflow.builder.archived')
    setConfirmArchive(false)
  }

  const canvas = (
    <WorkflowCanvas
      workflow={workflow}
      selection={selection}
      onSelect={handleSelect}
      onAddStep={openLibraryForStep}
      onRemoveStep={handleRemoveStepRequest}
    />
  )

  const library = (libraryMode || mode === 'full') && (
    <WorkflowNodeLibrary
      mode={libraryMode || 'step'}
      context={{ module: effectiveModule }}
      onPickTrigger={handlePickTrigger}
      onPickAction={handlePickAction}
      onPickLogic={handlePickLogic}
    />
  )

  const properties = (
    <WorkflowNodeProperties
      workflow={workflow}
      selection={selection}
      onChangeTriggerConfig={handleChangeTriggerConfig}
      onChangeStepConfig={handleChangeStepConfig}
      onRemoveStep={handleRemoveStepRequest}
      onClose={() => setMobilePane(null)}
    />
  )

  return (
    <div className="flex h-full min-h-[560px] flex-col">
      <div className="space-y-3 border-b border-[var(--border)] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            className="min-w-[220px] flex-1"
            placeholder={t('workflow.builder.namePlaceholder')}
            value={workflow.name}
            onChange={(event) => setWorkflow((current) => ({ ...current, name: event.target.value }))}
          />
          {mode === 'full' && !context?.module && (
            <Select
              className="min-w-[180px]"
              placeholder={t('workflow.builder.selectModule')}
              value={workflow.module}
              onChange={(value) => setWorkflow((current) => ({ ...current, module: value }))}
              options={(allowedModules ? modules.filter((module) => allowedModules.includes(module.module)) : modules).map((module) => ({
                value: module.module,
                label: t(module.labelKey),
              }))}
            />
          )}
          <WorkflowStatusBadge status={workflow.status} />

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save size={14} />
              {t('workflow.builder.saveDraft')}
            </Button>
            {workflow.status === 'active' ? (
              <Button variant="outline" size="sm" onClick={handlePause}>
                <Pause size={14} />
                {t('workflow.builder.pause')}
              </Button>
            ) : (
              <Button size="sm" onClick={handleActivate}>
                <Play size={14} />
                {t('workflow.builder.activate')}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy size={14} />
              {t('workflow.builder.duplicate')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmArchive(true)}>
              <Archive size={14} />
              {t('workflow.builder.archive')}
            </Button>
            {!embedded && onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                {t('actions.close')}
              </Button>
            )}
          </div>
        </div>

        <WorkflowLocalStorageNotice />

        {validation && !validation.isValid && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <p className="mb-1 font-bold">{t('workflow.builder.validationErrorsTitle')}</p>
            <ul className="list-inside list-disc space-y-0.5">
              {validation.errors.map((error, index) => (
                <li key={index}>{t(error.messageKey, { field: error.field })}</li>
              ))}
            </ul>
          </div>
        )}
        {validation && validation.warnings.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <ul className="list-inside list-disc space-y-0.5">
              {validation.warnings.map((warning, index) => (
                <li key={index}>{t(warning.messageKey)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="hidden overflow-y-auto border-e border-[var(--border)] bg-[var(--surface-2)] lg:block">
          {mode === 'full' && !libraryMode ? (
            <WorkflowNodeLibrary
              mode="step"
              context={{ module: effectiveModule }}
              onPickTrigger={handlePickTrigger}
              onPickAction={handlePickAction}
              onPickLogic={handlePickLogic}
            />
          ) : (
            library || <p className="p-4 text-xs text-[var(--text-muted)]">{t('workflow.builder.libraryHint')}</p>
          )}
        </aside>

        <main className="min-h-0 overflow-auto bg-[var(--surface)]">{canvas}</main>

        <aside className="hidden overflow-y-auto border-s border-[var(--border)] bg-[var(--surface-2)] lg:block">{properties}</aside>
      </div>

      <div className="flex items-center justify-center gap-3 border-t border-[var(--border)] p-2 lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setMobilePane('library')}>
          <ListTree size={14} />
          {t('workflow.builder.nodeLibrary')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMobilePane('properties')} disabled={!selection}>
          <PanelRightOpen size={14} />
          {t('workflow.builder.properties')}
        </Button>
      </div>

      <AppDrawer open={mobilePane === 'library'} onClose={() => setMobilePane(null)} title={t('workflow.builder.nodeLibrary')} size="md">
        {library || <p className="p-4 text-xs text-[var(--text-muted)]">{t('workflow.builder.libraryHint')}</p>}
      </AppDrawer>

      <AppDrawer open={mobilePane === 'properties'} onClose={() => setMobilePane(null)} title={t('workflow.builder.properties')} size="md">
        {properties}
      </AppDrawer>

      <ConfirmDialog
        isOpen={Boolean(confirmRemoveStepId)}
        onCancel={() => setConfirmRemoveStepId(null)}
        onConfirm={() => {
          performRemoveStep(confirmRemoveStepId)
          setConfirmRemoveStepId(null)
        }}
        type="danger"
        title={t('workflow.builder.confirmRemoveBranchTitle')}
        message={t('workflow.builder.confirmRemoveBranchMessage')}
        confirmText={t('actions.delete')}
      />

      <ConfirmDialog
        isOpen={confirmArchive}
        onCancel={() => setConfirmArchive(false)}
        onConfirm={handleArchive}
        type="warning"
        title={t('workflow.builder.confirmArchiveTitle')}
        message={t('workflow.builder.confirmArchiveMessage')}
        confirmText={t('workflow.builder.archive')}
      />
    </div>
  )
}
