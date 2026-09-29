import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Bookmark, BookmarkPlus, Users, X } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ConfirmDialog } from '../../../../shared/components/overlays/ConfirmDialog'
import { cn } from '../../../../shared/utils/cn'
import { useAuthStore } from '../../../../store/authStore'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'
import { SaveViewDialog, useSavedViewMutations, useSavedViews } from '../../saved-views'

export const CASE_VIEW_ENTITY = 'service_case'

/**
 * Saved case views as chips + "Save view" for the current filters.
 * Only the owner sees the remove button; the server enforces it anyway.
 */
export function SavedViewTabs({ activeId, currentFilters, canSave, onSelect }) {
  const { t } = useTranslation()
  const userId = useAuthStore((state) => (state.user?.id != null ? String(state.user.id) : null))
  const views = useSavedViews(CASE_VIEW_ENTITY)
  const { remove } = useSavedViewMutations(CASE_VIEW_ENTITY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(views.data || []).map((view) => {
        const active = view.id === activeId
        const Icon = view.visibility === 'shared' ? Users : Bookmark
        return (
          <span
            key={view.id}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors',
              active ? 'border-brand-accent bg-[var(--brand-accent-soft)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            <button type="button" className="inline-flex items-center gap-1" aria-pressed={active} onClick={() => onSelect(view)}>
              <Icon size={12} aria-hidden="true" />
              {view.name}
            </button>
            {view.owner_id === userId && (
              <button type="button" aria-label={t('service.savedViews.remove', { name: view.name })} onClick={() => setDeleting(view)} className="rounded-full hover:text-[var(--text)]">
                <X size={12} aria-hidden="true" />
              </button>
            )}
          </span>
        )
      })}
      <Button variant="ghost" size="sm" disabled={!canSave} onClick={() => setSaving(true)}>
        <BookmarkPlus size={14} aria-hidden="true" />
        {t('service.savedViews.saveCurrent')}
      </Button>

      <SaveViewDialog open={saving} onClose={() => setSaving(false)} entity={CASE_VIEW_ENTITY} filters={currentFilters} onSaved={onSelect} />
      <ConfirmDialog
        isOpen={Boolean(deleting)}
        type="danger"
        loading={remove.isPending}
        title={t('service.savedViews.removeTitle')}
        message={t('service.savedViews.removeMessage', { name: deleting?.name })}
        confirmText={t('service.settings.actions.delete')}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          remove.mutate(deleting.id, {
            onSuccess: () => setDeleting(null),
            onError: (error) => {
              toast.error(getServiceErrorMessage(error, t))
              setDeleting(null)
            },
          })
        }
      />
    </div>
  )
}
