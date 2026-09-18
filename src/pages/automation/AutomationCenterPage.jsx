import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Plus, History, BarChart3 } from 'lucide-react'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { EmptyState } from '../../shared/components/feedback/EmptyState'
import { Tabs } from '../../shared/components/ui/Tabs'
import { AppModal } from '../../shared/components/overlays/AppModal'
import { ConfirmDialog } from '../../shared/components/overlays/ConfirmDialog'
import { DataTable } from '../../shared/components/data-table'
import { WorkflowBuilder, WorkflowLocalStorageNotice, useWorkflowStore } from '../../features/workflow-engine'
import { useAutomationWorkflowColumns } from './components/useAutomationWorkflowColumns'
import { WorkflowTemplatesGrid } from './components/WorkflowTemplatesGrid'

export function AutomationCenterPage() {
  const { t } = useTranslation()
  const workflowStore = useWorkflowStore()
  const workflows = workflowStore.list()

  const [activeTab, setActiveTab] = useState('workflows')
  const [builderState, setBuilderState] = useState({ open: false, workflow: null, context: null })
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const openWorkflow = (workflow) => setBuilderState({ open: true, workflow, context: workflow.context })
  const createNew = () => setBuilderState({ open: true, workflow: null, context: null })
  const useTemplate = (template) => {
    const built = template.build()
    setBuilderState({ open: true, workflow: built, context: built.context })
  }
  const closeBuilder = () => setBuilderState({ open: false, workflow: null, context: null })

  const columns = useAutomationWorkflowColumns({
    onOpen: openWorkflow,
    onDuplicate: (row) => {
      const copy = workflowStore.duplicate(row.id)
      if (copy) toast.success(t('workflow.builder.duplicated'))
    },
    onDelete: (row) => setConfirmDeleteId(row.id),
  })

  return (
    <div className="space-y-6">
      <PageToolbar
        title={t('workflow.center.pageTitle')}
        description={t('workflow.center.pageDescription')}
        actionLabel={t('workflow.center.createWorkflow')}
        actionIcon={<Plus size={16} />}
        onAction={createNew}
      />

      <WorkflowLocalStorageNotice />

      <Tabs
        variant="underline"
        active={activeTab}
        onChange={setActiveTab}
        items={[
          {
            id: 'workflows',
            label: t('workflow.center.tabs.workflows'),
            content: (
              <DataTable
                data={workflows}
                columns={columns}
                tableId="automation-workflows"
                emptyMessage={t('workflow.center.emptyWorkflows')}
                enableSorting
                enableFiltering
                enableGlobalSearch
                enablePagination
                enableColumnVisibility={false}
                enableExport={false}
                showToolbar
                showFooter
              />
            ),
          },
          {
            id: 'templates',
            label: t('workflow.center.tabs.templates'),
            content: <WorkflowTemplatesGrid onUseTemplate={useTemplate} />,
          },
          {
            id: 'executions',
            label: t('workflow.center.tabs.executions'),
            content: (
              <EmptyState
                icon={<History size={24} />}
                title={t('workflow.center.executionsNotAvailableTitle')}
                description={t('workflow.center.executionsNotAvailableDescription')}
              />
            ),
          },
          {
            id: 'logs',
            label: t('workflow.center.tabs.logs'),
            content: (
              <EmptyState
                icon={<BarChart3 size={24} />}
                title={t('workflow.center.logsNotAvailableTitle')}
                description={t('workflow.center.logsNotAvailableDescription')}
              />
            ),
          },
        ]}
      />

      <AppModal isOpen={builderState.open} onClose={closeBuilder} size="lg" className="max-w-6xl" contentClassName="p-0">
        <div className="h-[80vh]">
          <WorkflowBuilder
            mode={builderState.context?.module ? 'context' : 'full'}
            context={builderState.context || {}}
            initialWorkflow={builderState.workflow}
            onSave={closeBuilder}
            onCancel={closeBuilder}
          />
        </div>
      </AppModal>

      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          workflowStore.remove(confirmDeleteId)
          setConfirmDeleteId(null)
          toast.success(t('workflow.center.deleteSuccess'))
        }}
        type="danger"
        title={t('workflow.center.confirmDeleteTitle')}
        message={t('workflow.center.confirmDeleteMessage')}
        confirmText={t('actions.delete')}
      />
    </div>
  )
}
