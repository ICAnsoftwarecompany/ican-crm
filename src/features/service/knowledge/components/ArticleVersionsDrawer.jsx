import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { RotateCcw } from 'lucide-react'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'
import { useKbMutations, useKbVersion } from '../api/knowledgeApi'

/** Version history: every content change is kept; the live (published) one is marked; restore = new version. */
export function ArticleVersionsDrawer({ article, open, onClose }) {
  const { t, i18n } = useTranslation()
  const [selected, setSelected] = useState(null)
  const version = useKbVersion(article.id, selected)
  const { restore } = useKbMutations()
  const restoreNote = (note) => (note?.startsWith('restore:') ? t('service.knowledge.restoredFrom', { n: note.split(':')[1] }) : null)
  return (
    <AppDrawer open={open} onClose={onClose} size="md" title={t('service.knowledge.versions')} description={article.title} drawerKey="service-kb-versions" pushPage={false}>
      <div className="grid gap-3 p-4">
        <ul className="grid gap-2">
          {(article.versions || []).map((entry) => (
            <li key={entry.version}>
              <button type="button" aria-pressed={selected === entry.version} onClick={() => setSelected(entry.version)} className={cn('grid w-full gap-0.5 rounded-lg border p-3 text-start transition-colors', selected === entry.version ? 'border-brand-accent' : 'border-[var(--border)] hover:bg-[var(--surface-2)]')}>
                <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--text)]">
                  {t('service.knowledge.versionN', { n: entry.version })}
                  {entry.version === article.published_version && <span className="rounded-full border border-status-won px-2 text-xs">{t('service.knowledge.live')}</span>}
                  {entry.version === article.version && <span className="rounded-full border border-[var(--border)] px-2 text-xs text-[var(--text-muted)]">{t('service.knowledge.current')}</span>}
                </span>
                <span className="text-xs text-[var(--text-muted)]">{[entry.created_by?.name, entry.created_at && formatRelativeTime(entry.created_at, i18n.language), restoreNote(entry.note)].filter(Boolean).join(' · ')}</span>
                <bdi className="truncate text-xs text-[var(--text)]" lang={article.language}>{entry.title}</bdi>
              </button>
            </li>
          ))}
        </ul>
        {selected && (
          <ResourceState isLoading={version.isLoading} error={version.error} onRetry={version.refetch}>
            {version.data && (
              <section className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <h3 className="text-sm font-semibold text-[var(--text)]"><bdi lang={article.language}>{version.data.title}</bdi></h3>
                <p dir="auto" lang={article.language} className="whitespace-pre-line text-sm text-[var(--text)]">{version.data.body}</p>
                {selected !== article.version && (
                  <Button size="sm" variant="outline" className="w-fit" disabled={restore.isPending} onClick={() => restore.mutate({ id: article.id, version: selected }, { onSuccess: () => { toast.success(t('service.knowledge.toasts.restored', { n: selected })); setSelected(null); onClose() } })}>
                    <RotateCcw size={14} aria-hidden="true" />
                    {t('service.knowledge.actions.restoreVersion')}
                  </Button>
                )}
              </section>
            )}
          </ResourceState>
        )}
      </div>
    </AppDrawer>
  )
}
