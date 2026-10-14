import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, FilePlus2, FileStack, MoreHorizontal, Search, Trash2 } from 'lucide-react'
import { SubSidebarFrame, SubSidebarHeader } from '../../../../../shared/components/sub-sidebar'
import { DropdownMenu } from '../../../../../shared/components/overlays/DropdownMenu'
import { ConfirmDialog } from '../../../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../../../shared/components/ui/Button'
import { formatRelativeTime } from '../../../../../shared/utils/dateTime'
import { cn } from '../../../../../shared/utils/cn'
import { STAGES } from '../../state/wizardStages'

const PUBLISH_BADGE = {
  running: 'text-[var(--brand-accent)]',
  partial: 'text-[var(--notification-warning)]',
  failed: 'text-[var(--notification-danger)]',
  done: 'text-[var(--notification-success)]',
}

/**
 * Saved drafts for the selected ad account. Not a route navigation, so it
 * uses the shared sub-sidebar frame/header (same look, collapse behaviour)
 * with a custom list body.
 */
export function DraftsPanel({ drafts, currentDraftId, onOpen, onNew, onDuplicate, onDelete, collapsed, onToggleCollapse, variant = 'framed' }) {
  const { t, i18n } = useTranslation()
  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return needle ? drafts.filter((draft) => (draft.name || t('campaignWizard.drafts.untitled')).toLowerCase().includes(needle)) : drafts
  }, [drafts, query, t])

  return (
    <SubSidebarFrame variant={variant} collapsed={collapsed} ariaLabel={t('campaignWizard.drafts.title')} className={cn(variant === 'framed' && 'max-h-[calc(100vh-10rem)]')}>
      <SubSidebarHeader
        icon={FileStack}
        title={t('campaignWizard.drafts.title')}
        description={collapsed ? undefined : t('campaignWizard.drafts.description', { count: drafts.length })}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        expandLabel={t('campaignWizard.drafts.expand')}
        collapseLabel={t('campaignWizard.drafts.collapse')}
      />

      {collapsed ? (
        <div className="flex flex-col items-center gap-2 p-2">
          <Button variant="ghost" size="icon" onClick={onNew} aria-label={t('campaignWizard.drafts.new')} title={t('campaignWizard.drafts.new')}><FilePlus2 size={16} /></Button>
          <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs font-bold text-[var(--text-muted)]" dir="ltr">{drafts.length}</span>
        </div>
      ) : (
        <>
          <div className="grid gap-2 border-b border-[var(--border)] p-3">
            <Button size="sm" onClick={onNew} className="w-full justify-center"><FilePlus2 size={14} />{t('campaignWizard.drafts.new')}</Button>
            {drafts.length > 3 && (
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-[var(--text-light)]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('campaignWizard.drafts.search')}
                  aria-label={t('campaignWizard.drafts.search')}
                  className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] ps-8 pe-2 text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                />
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {!drafts.length && <p className="px-2 py-6 text-center text-xs leading-5 text-[var(--text-muted)]">{t('campaignWizard.drafts.empty')}</p>}
            {drafts.length > 0 && !filtered.length && <p className="px-2 py-6 text-center text-xs text-[var(--text-muted)]">{t('campaignWizard.drafts.noMatch')}</p>}
            <ul className="grid gap-1.5">
              {filtered.map((draft) => {
                const current = draft.id === currentDraftId
                const stageIndex = Math.max(0, STAGES.indexOf(draft.currentStage))
                return (
                  <li key={draft.id}>
                    <div className={cn('group relative rounded-md border p-2.5 transition-colors', current ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-transparent hover:border-[var(--border)] hover:bg-[var(--surface-2)]')}>
                      <button type="button" onClick={() => onOpen(draft.id)} className="block w-full pe-7 text-start" aria-current={current ? 'true' : undefined}>
                        <span className="block truncate text-sm font-semibold text-[var(--text)]">{draft.name || t('campaignWizard.drafts.untitled')}</span>
                        <span className="mt-0.5 block truncate text-[11px] text-[var(--text-muted)]">
                          {draft.presetId ? t(`campaignWizard.presets.${draft.presetId}.title`) : draft.objective ? t(`campaignWizard.objectives.${draft.objective}.title`) : t('campaignWizard.drafts.noObjective')}
                        </span>
                        <span className="mt-1.5 flex items-center gap-2">
                          <span className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
                            <span className="block h-full rounded-full bg-[var(--brand-accent)]" style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }} />
                          </span>
                          <span className="text-[10px] text-[var(--text-light)]">{t(`campaignWizard.stages.${STAGES[stageIndex]}.short`)}</span>
                        </span>
                        <span className="mt-1 flex items-center justify-between gap-2 text-[10px] text-[var(--text-light)]">
                          <span>{draft.updatedAt ? formatRelativeTime(draft.updatedAt, i18n.language) : ''}</span>
                          {draft.publishStatus !== 'idle' && <span className={cn('font-bold', PUBLISH_BADGE[draft.publishStatus])}>{t(`campaignWizard.publish.status.${draft.publishStatus}`)}</span>}
                        </span>
                      </button>
                      <div className="absolute end-1.5 top-1.5">
                        <DropdownMenu
                          align="end"
                          trigger={<button type="button" className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface)]" aria-label={t('campaignWizard.drafts.actions')}><MoreHorizontal size={14} /></button>}
                          items={[
                            { id: 'duplicate', label: t('campaignWizard.drafts.duplicate'), icon: <Copy size={14} />, onSelect: () => onDuplicate(draft.id) },
                            { id: 'delete', label: t('campaignWizard.drafts.delete'), icon: <Trash2 size={14} />, onSelect: () => setPendingDelete(draft) },
                          ]}
                        />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        type="danger"
        title={t('campaignWizard.drafts.deleteTitle')}
        message={t('campaignWizard.drafts.deleteMessage', { name: pendingDelete?.name || t('campaignWizard.drafts.untitled') })}
        confirmText={t('campaignWizard.drafts.delete')}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          onDelete(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </SubSidebarFrame>
  )
}
