import { useTranslation } from 'react-i18next'
import { LayoutTemplate } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { WORKFLOW_TEMPLATES } from '../../../features/workflow-engine/templates/workflowTemplates'
import { getModule } from '../../../features/workflow-engine'

export function WorkflowTemplatesGrid({ onUseTemplate }) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {WORKFLOW_TEMPLATES.map((template) => (
        <div key={template.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
              <LayoutTemplate size={16} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[var(--text)]">{t(template.labelKey)}</p>
              <p className="text-xs text-[var(--text-muted)]">{t(getModule(template.module)?.labelKey || template.module)}</p>
            </div>
          </div>
          <p className="mb-3 text-xs text-[var(--text-muted)]">{t(template.descriptionKey)}</p>
          <Button size="sm" variant="outline" onClick={() => onUseTemplate(template)}>
            {t('workflow.center.useTemplate')}
          </Button>
        </div>
      ))}
    </div>
  )
}
