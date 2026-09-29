import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ConfirmDialog } from '../../../../shared/components/overlays/ConfirmDialog'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'
import { useResourceMutations } from '../api/settingsApi'
import { useSettingsContext } from '../hooks/useSettingsContext'
import { ResourceFormDialog } from './ResourceFormDialog'

/**
 * Generic settings screen: list of a configuration resource with create,
 * edit and delete. Everything specific lives in the resource definition
 * (fields, summary lines) — adding a settings screen = adding a definition.
 */
export function ResourceSettingsPanel({ resource }) {
  const { t, i18n } = useTranslation()
  const ctx = useSettingsContext(resource)
  const { remove } = useResourceMutations(resource)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const list = ctx.lists[resource.key]
  const items = useMemo(() => list.data || [], [list.data])
  const Icon = resource.icon

  const confirmDelete = () =>
    remove.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(t('service.settings.toasts.deleted'))
        setDeleting(null)
      },
      onError: (error) => {
        toast.error(getServiceErrorMessage(error, t))
        setDeleting(null)
      },
    })

  return (
    <section className="grid gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold text-[var(--text)]">
            <Icon size={18} aria-hidden="true" className="text-[var(--text-muted)]" />
            {t(`${resource.i18nKey}.title`)}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">{t(`${resource.i18nKey}.description`)}</p>
        </div>
        <Button className="shrink-0 whitespace-nowrap" onClick={() => setEditing({})}>
          <Plus size={16} aria-hidden="true" />
          {t('service.settings.create', { resource: t(`${resource.i18nKey}.one`) })}
        </Button>
      </header>

      <ResourceState
        isLoading={list.isLoading}
        error={list.error}
        onRetry={list.refetch}
        empty={!items.length}
        emptyIcon={<Icon size={24} />}
        emptyTitle={t('service.settings.emptyTitle')}
        emptyDescription={t(`${resource.i18nKey}.description`)}
      >
        <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--text)]">
                  {localizeLabel(item[resource.titleField || 'label'], i18n.language, item.key || item.title || '-')}
                  {item.active === false && (
                    <span className="rounded-full bg-[var(--surface-2)] px-2 text-[11px] text-[var(--text-muted)]">{t('service.settings.inactive')}</span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{resource.summary?.(item, ctx)}</p>
              </div>
              <Button variant="ghost" size="icon" aria-label={t('service.settings.actions.edit')} onClick={() => setEditing(item)}>
                <Pencil size={16} aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" aria-label={t('service.settings.actions.delete')} onClick={() => setDeleting(item)}>
                <Trash2 size={16} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      </ResourceState>

      <ResourceFormDialog
        resource={resource}
        ctx={ctx}
        open={Boolean(editing)}
        item={editing?.id ? editing : null}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        isOpen={Boolean(deleting)}
        type="danger"
        loading={remove.isPending}
        title={t('service.settings.deleteTitle', { resource: t(`${resource.i18nKey}.one`) })}
        message={t('service.settings.deleteMessage')}
        confirmText={t('service.settings.actions.delete')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </section>
  )
}
