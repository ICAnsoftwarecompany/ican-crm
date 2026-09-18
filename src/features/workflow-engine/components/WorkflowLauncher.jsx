import { AppModal } from '../../../shared/components/overlays/AppModal'
import { Button } from '../../../shared/components/ui/Button'
import { useWorkflowBuilder } from '../hooks/useWorkflowBuilder'
import { WorkflowBuilder } from './WorkflowBuilder'

/**
 * The reusable entry point named in docs section "Reusable Entry Point" —
 * every module opens the exact same builder through this component.
 *
 * <WorkflowLauncher context={{ module: 'leads', entity: 'lead' }}>
 *   Create Lead Automation
 * </WorkflowLauncher>
 */
export function WorkflowLauncher({ context, initialWorkflow, allowedModules, onSaved, children, variant = 'outline', size = 'sm', className }) {
  const workflow = useWorkflowBuilder(context)

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={workflow.open}>
        {children}
      </Button>

      <AppModal isOpen={workflow.isOpen} onClose={workflow.close} size="lg" className="max-w-6xl" contentClassName="p-0">
        <div className="h-[80vh]">
          <WorkflowBuilder
            mode="context"
            context={workflow.context}
            initialWorkflow={initialWorkflow}
            allowedModules={allowedModules}
            onSave={onSaved}
            onCancel={workflow.close}
          />
        </div>
      </AppModal>
    </>
  )
}
