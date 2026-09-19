import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Circle } from 'lucide-react'
import { Input } from '../../ui/Input'
import { DEFAULT_NODE_CATEGORY_LABEL_KEYS } from '../constants/nodeCategories'
import { useVisualFlowRuntime } from '../VisualFlowProvider'

/**
 * Drags use native HTML5 drag-and-drop (`draggable` + `dataTransfer`) —
 * the standard pattern for "drag a palette item onto a canvas" that
 * `@xyflow/react` itself expects (its `onDrop`/`onDragOver` examples use
 * the same API). This is unrelated to `@dnd-kit`, which the project uses
 * elsewhere for list *reordering* (Kanban, etc.) — a different
 * interaction, not a conflicting convention.
 */
export function NodeLibraryPanel({ categoryLabelKeys = DEFAULT_NODE_CATEGORY_LABEL_KEYS, onNodePick }) {
  const { t } = useTranslation()
  const { nodeRegistry } = useVisualFlowRuntime()
  const [search, setSearch] = useState('')

  const groups = useMemo(() => {
    const all = nodeRegistry?.getAll() || []
    const term = search.trim().toLowerCase()
    const filtered = term ? all.filter((definition) => t(definition.labelKey).toLowerCase().includes(term)) : all

    const byCategory = new Map()
    filtered.forEach((definition) => {
      const key = definition.category || 'uncategorized'
      if (!byCategory.has(key)) byCategory.set(key, [])
      byCategory.get(key).push(definition)
    })
    return Array.from(byCategory.entries())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeRegistry, search, t])

  const handleDragStart = (event, definition) => {
    event.dataTransfer.setData('application/visual-flow-node-type', definition.type)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Input startIcon={<Search size={14} />} placeholder={t('visualFlow.library.search')} value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {groups.length === 0 && <p className="px-2 text-xs text-[var(--text-muted)]">{t('visualFlow.library.noResults')}</p>}
        {groups.map(([category, definitions]) => (
          <div key={category} className="mb-4">
            <p className="mb-1 px-2 text-[11px] font-black uppercase tracking-wide text-[var(--text-muted)]">
              {categoryLabelKeys[category] ? t(categoryLabelKeys[category]) : category}
            </p>
            <div className="space-y-0.5">
              {definitions.map((definition) => (
                <button
                  key={definition.type}
                  type="button"
                  draggable={!definition.disabled}
                  onDragStart={(event) => !definition.disabled && handleDragStart(event, definition)}
                  onClick={() => !definition.disabled && onNodePick?.(definition.type)}
                  disabled={definition.disabled}
                  title={definition.descriptionKey ? t(definition.descriptionKey) : undefined}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-start text-sm hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Circle size={14} className="shrink-0 text-[var(--text-muted)]" />
                  <span className="min-w-0 flex-1 truncate">{t(definition.labelKey)}</span>
                  {definition.disabled && definition.disabledReasonKey && (
                    <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">{t(definition.disabledReasonKey)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
