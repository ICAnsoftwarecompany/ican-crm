import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GitBranch, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { ConfirmDialog } from '../../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { usePipelineTemplateMutations, usePipelineTemplates } from '../../hooks/useDeals'
import { PipelineTemplateDialog } from './PipelineTemplateDialog'

/** Pipeline templates (blueprints of stages new deals copy). Also shown in /settings via the settings registry. */
export function PipelineTemplatesPanel() {
  const { t } = useTranslation()
  const query = usePipelineTemplates()
  const { delete: remove } = usePipelineTemplateMutations()
  const [editing, setEditing] = useState(null)
  const [removing, setRemoving] = useState(null)

  const confirmRemove = async () => {
    try {
      await remove.mutateAsync(removing.id)
      toast.success(t('dealWorkspace.pipelines.deleted'))
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.pipelines.deleteFailed')))
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--text-muted)]">{t('dealWorkspace.pipelines.description')}</p>
        <Button size="sm" onClick={() => setEditing({})}><Plus size={15} />{t('dealWorkspace.pipelines.newTitle')}</Button>
      </div>
      <ResourceState isLoading={query.isLoading} error={query.error} onRetry={query.refetch} empty={!query.templates.length} emptyIcon={<GitBranch size={24} />} emptyTitle={t('dealWorkspace.pipelines.emptyTitle')} emptyDescription={t('dealWorkspace.pipelines.emptyDescription')}>
        <ul className="grid gap-3 lg:grid-cols-2">
          {query.templates.map((template) => {
            const stages = [...(template.stages || [])].sort((a, b) => Number(a.order) - Number(b.order))
            return (
              <li key={template.id} className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-[var(--text)]">{template.name}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{t(`dealWorkspace.options.dealType.${template.type}`, template.type || '')} · {t('dealWorkspace.pipelines.stagesCount', { count: stages.length })}</p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setEditing(template)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)]" aria-label={t('dealWorkspace.pipelines.edit')} title={t('dealWorkspace.pipelines.edit')}><Pencil size={15} /></button>
                    <button type="button" onClick={() => setRemoving(template)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-red-600" aria-label={t('dealWorkspace.pipelines.delete')} title={t('dealWorkspace.pipelines.delete')}><Trash2 size={15} /></button>
                  </div>
                </div>
                <ol className="flex flex-wrap gap-1.5">
                  {stages.map((stage) => (
                    <li key={stage.id || stage.name} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text)]">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color || 'var(--text-muted)' }} />{stage.name}
                    </li>
                  ))}
                </ol>
              </li>
            )
          })}
        </ul>
      </ResourceState>
      <PipelineTemplateDialog template={editing?.id ? editing : null} open={Boolean(editing)} onClose={() => setEditing(null)} />
      <ConfirmDialog
        isOpen={Boolean(removing)}
        onCancel={() => setRemoving(null)}
        onConfirm={confirmRemove}
        type="danger"
        loading={remove.isPending}
        title={t('dealWorkspace.pipelines.deleteTitle')}
        message={t('dealWorkspace.pipelines.deleteMessage', { name: removing?.name || '' })}
        confirmText={t('dealWorkspace.pipelines.delete')}
        cancelText={t('dealWorkspace.common.cancel')}
      />
    </div>
  )
}
