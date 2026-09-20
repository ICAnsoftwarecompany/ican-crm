import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Plus, History, BarChart3, Copy, Trash2, Workflow as WorkflowIcon } from 'lucide-react'
import { EmptyState } from '../../shared/components/feedback/EmptyState'
import { Button } from '../../shared/components/ui/Button'
import { ConfirmDialog } from '../../shared/components/overlays/ConfirmDialog'
import { VisualFlowSidebar } from '../../shared/components/visual-flow'
import { WorkflowBuilder, WorkflowLocalStorageNotice, WorkflowStatusBadge, getModule, useWorkflowStore } from '../../features/workflow-engine'
import { WorkflowTemplatesGrid } from './components/WorkflowTemplatesGrid'

export function AutomationCenterPage() {
  const { t } = useTranslation()
  const workflowStore = useWorkflowStore()
  const workflows = workflowStore.list()

  const [activeTab, setActiveTab] = useState('workflows')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeWorkflowId, setActiveWorkflowId] = useState(null)
  const [draftWorkflow, setDraftWorkflow] = useState(null) // { workflow, context, key } for a not-yet-saved workflow
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const draftKeyRef = useRef(0)

  const selectedWorkflow = draftWorkflow ? draftWorkflow.workflow : workflows.find((row) => row.id === activeWorkflowId) || null
  const selectedContext = draftWorkflow ? draftWorkflow.context : selectedWorkflow?.context || null
  const builderKey = draftWorkflow ? `draft-${draftWorkflow.key}` : activeWorkflowId ? `wf-${activeWorkflowId}` : null

  const selectWorkflow = (id) => {
    setDraftWorkflow(null)
    setActiveWorkflowId(id)
  }

  const createNew = () => {
    draftKeyRef.current += 1
    setActiveWorkflowId(null)
    setDraftWorkflow({ workflow: null, context: null, key: draftKeyRef.current })
    setActiveTab('workflows')
  }

  const useTemplate = (template) => {
    draftKeyRef.current += 1
    const built = template.build()
    setActiveWorkflowId(null)
    setDraftWorkflow({ workflow: built, context: built.context, key: draftKeyRef.current })
    setActiveTab('workflows')
  }

  const handleBuilderSave = (saved) => {
    setDraftWorkflow(null)
    setActiveWorkflowId(saved.id)
  }

  const duplicateWorkflow = (workflow) => {
    const copy = workflowStore.duplicate(workflow.id)
    if (copy) {
      toast.success(t('workflow.builder.duplicated'))
      selectWorkflow(copy.id)
    }
  }

  const confirmDelete = () => {
    if (activeWorkflowId === confirmDeleteId) {
      setActiveWorkflowId(null)
      setDraftWorkflow(null)
    }
    workflowStore.remove(confirmDeleteId)
    setConfirmDeleteId(null)
    toast.success(t('workflow.center.deleteSuccess'))
  }

  const sidebarItems = workflows.map((workflow) => ({
    id: workflow.id,
    title: workflow.name || t('workflow.center.untitled'),
    subtitle: workflow.module ? t(getModule(workflow.module)?.labelKey || workflow.module) : undefined,
    badge: <WorkflowStatusBadge status={workflow.status} />,
    actions: (
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" onClick={() => duplicateWorkflow(workflow)} aria-label={t('workflow.builder.duplicate')}>
          <Copy size={14} />
        </Button>
        <Button variant="ghost" size="icon" className="text-[#EF4444]" onClick={() => setConfirmDeleteId(workflow.id)} aria-label={t('actions.delete')}>
          <Trash2 size={14} />
        </Button>
      </div>
    ),
  }))

  const sidebarTabs = [
    { id: 'workflows', label: t('workflow.center.tabs.workflows') },
    { id: 'templates', label: t('workflow.center.tabs.templates') },
    { id: 'executions', label: t('workflow.center.tabs.executions') },
    { id: 'logs', label: t('workflow.center.tabs.logs') },
  ]

  return (
    <>
      <div
        className={`-m-6 grid min-h-[calc(100vh-var(--layout-header-height,48px))] overflow-hidden border-t border-[var(--border)] bg-[var(--surface-2)] ${
          sidebarCollapsed ? 'lg:grid-cols-[64px_minmax(0,1fr)]' : 'lg:grid-cols-[280px_minmax(0,1fr)]'
        }`}
      >
        <aside className="min-h-0 border-b border-[var(--border)] bg-[var(--surface-2)] lg:border-b-0 lg:border-e">
          <VisualFlowSidebar
            tabs={sidebarTabs}
            activeTabId={activeTab}
            onTabChange={setActiveTab}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
            items={sidebarItems}
            activeItemId={draftWorkflow ? null : activeWorkflowId}
            onSelectItem={selectWorkflow}
            onCreate={createNew}
            createLabelKey="workflow.center.createWorkflow"
            emptyTitleKey="workflow.center.emptyWorkflows"
          />
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col bg-[var(--surface)]">
          <WorkflowLocalStorageNotice />

          <main className="min-h-0 flex-1">
            {activeTab === 'workflows' && (
              selectedWorkflow !== null || draftWorkflow ? (
                <div className="h-full">
                  <WorkflowBuilder
                    key={builderKey}
                    mode={selectedContext?.module ? 'context' : 'full'}
                    context={selectedContext || {}}
                    initialWorkflow={selectedWorkflow}
                    embedded
                    onSave={handleBuilderSave}
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <EmptyState
                    icon={<WorkflowIcon size={24} />}
                    title={t('workflow.center.selectPromptTitle')}
                    description={t('workflow.center.selectPromptDescription')}
                    action={<Button onClick={createNew}><Plus size={16} />{t('workflow.center.createWorkflow')}</Button>}
                  />
                </div>
              )
            )}

            {activeTab === 'templates' && (
              <div className="h-full overflow-y-auto p-4">
                <WorkflowTemplatesGrid onUseTemplate={useTemplate} />
              </div>
            )}

            {activeTab === 'executions' && (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  icon={<History size={24} />}
                  title={t('workflow.center.executionsNotAvailableTitle')}
                  description={t('workflow.center.executionsNotAvailableDescription')}
                />
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  icon={<BarChart3 size={24} />}
                  title={t('workflow.center.logsNotAvailableTitle')}
                  description={t('workflow.center.logsNotAvailableDescription')}
                />
              </div>
            )}
          </main>
        </section>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        type="danger"
        title={t('workflow.center.confirmDeleteTitle')}
        message={t('workflow.center.confirmDeleteMessage')}
        confirmText={t('actions.delete')}
      />
    </>
  )
}
