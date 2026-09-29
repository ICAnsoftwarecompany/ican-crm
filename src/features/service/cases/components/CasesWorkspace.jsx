import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { KanbanSquare, LayoutList, Plus, Search } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { cn } from '../../../../shared/utils/cn'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { CASE_VIEWS, DEFAULT_CASE_VIEW } from '../constants/caseViews'
import { useCaseList, useCaseSetup, useCaseSummary } from '../hooks/useCases'
import { useCaseTransitionFlow } from '../hooks/useCaseTransitionFlow'
import { CaseCreateDialog } from './CaseCreateDialog'
import { CaseViewTabs } from './CaseViewTabs'
import { CasesBoard } from './CasesBoard'
import { CasesTable } from './CasesTable'
import { CaseFilters } from './CaseFilters'
import { SavedViewTabs } from './SavedViewTabs'

/**
 * Cases workspace: view tabs (server views + counts), search, list/board.
 * State lives in the URL (?view=&mode=&q=&priority=&queue=&type=&saved=) so
 * views are shareable; a saved view is just a named set of these params.
 */
export function CasesWorkspace() {
  const { t } = useTranslation()
  const term = useServiceTerminology()
  const [params, setParams] = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)
  const view = CASE_VIEWS.includes(params.get('view')) ? params.get('view') : DEFAULT_CASE_VIEW
  const mode = params.get('mode') === 'board' ? 'board' : 'list'
  const [search, setSearch] = useState(params.get('q') || '')
  const debouncedSearch = useDebounce(search, 350)

  const setup = useCaseSetup()
  const summary = useCaseSummary()
  const filters = { priority: params.get('priority') || '', queue: params.get('queue') || '', type: params.get('type') || '' }
  const list = useCaseList({
    view,
    search: debouncedSearch || undefined,
    priority: filters.priority || undefined,
    queue_id: filters.queue || undefined,
    type_id: filters.type || undefined,
  })
  const { requestTransition, transitionDialog } = useCaseTransitionFlow(setup.data)

  const updateParams = (changes) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)))
    setParams(next, { replace: true })
  }
  // Any manual change leaves the saved view (its chip un-highlights).
  const updateFilters = (changes) => updateParams({ ...changes, saved: '' })
  const applySavedView = (savedView) => {
    const saved = savedView.filters || {}
    setSearch(saved.search || '')
    updateParams({
      saved: savedView.id,
      view: saved.view && saved.view !== DEFAULT_CASE_VIEW ? saved.view : '',
      q: saved.search || '',
      priority: saved.priority || '',
      queue: saved.queue_id || '',
      type: saved.type_id || '',
    })
  }
  const currentFilters = { view, search: debouncedSearch, priority: filters.priority, queue_id: filters.queue, type_id: filters.type }
  const hasFilters = Boolean(debouncedSearch || filters.priority || filters.queue || filters.type || view !== DEFAULT_CASE_VIEW)

  const modeButton = (value, Icon, label) => (
    <button
      type="button"
      onClick={() => updateParams({ mode: value === 'list' ? '' : value })}
      aria-pressed={mode === value}
      title={label}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
        mode === value ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
      )}
    >
      <Icon size={16} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  )

  const emptyMessage = t('service.cases.empty', { entity: term('case', 'other') })

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              updateFilters({ q: event.target.value })
            }}
            placeholder={t('service.cases.searchPlaceholder')}
            aria-label={t('service.cases.searchPlaceholder')}
            startIcon={<Search size={16} />}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-[var(--surface-2)] p-0.5">
            {modeButton('list', LayoutList, t('service.cases.mode.list'))}
            {modeButton('board', KanbanSquare, t('service.cases.mode.board'))}
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} aria-hidden="true" />
            {t('service.cases.create.button', { entity: term('case') })}
          </Button>
        </div>
      </div>

      <CaseViewTabs view={view} onChange={(key) => updateFilters({ view: key === DEFAULT_CASE_VIEW ? '' : key })} counts={summary.data?.views} />
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
        <SavedViewTabs activeId={params.get('saved')} currentFilters={currentFilters} canSave={hasFilters} onSelect={applySavedView} />
        <CaseFilters setup={setup.data} values={filters} onChange={updateFilters} />
      </div>

      {mode === 'list' ? (
        <CasesTable query={list} emptyMessage={emptyMessage} />
      ) : (
        <ResourceState
          isLoading={list.isLoading || setup.isLoading}
          error={list.error || setup.error}
          onRetry={() => {
            list.refetch()
            setup.refetch()
          }}
        >
          <CasesBoard cases={list.cases} setup={setup.data} onRequestTransition={requestTransition} />
          {list.hasNextPage && (
            <div className="flex justify-center">
              <Button variant="outline" loading={list.isFetchingNextPage} onClick={() => list.fetchNextPage()}>
                {t('service.cases.loadMore')}
              </Button>
            </div>
          )}
        </ResourceState>
      )}

      <CaseCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      {transitionDialog}
    </div>
  )
}
