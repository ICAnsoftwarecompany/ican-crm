import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, AlertCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { EmptyState } from '../feedback/EmptyState'

/**
 * Horizontally-scrollable tab strip, generic (`{id, label}[]`) — used for
 * relocating a page's own tabs into the sidebar's top instead of a
 * separate page-level tab strip. Shows a fade-edge hint only when there is
 * genuinely more to scroll to, on either side, RTL-aware.
 */
function ScrollableTabs({ tabs, activeTabId, onTabChange }) {
  const { i18n } = useTranslation()
  const containerRef = useRef(null)
  const [canScrollStart, setCanScrollStart] = useState(false)
  const [canScrollEnd, setCanScrollEnd] = useState(false)
  const isRtl = i18n.dir() === 'rtl'

  const updateScrollState = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    setCanScrollStart(el.scrollLeft > 1)
    setCanScrollEnd(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = containerRef.current
    if (!el) return undefined
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState, tabs])

  return (
    <div className="relative border-b border-[var(--border)]">
      <div ref={containerRef} className="flex gap-1 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange?.(tab.id)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              tab.id === activeTabId
                ? 'bg-[#00C2CB] text-white'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {canScrollStart && (
        <div className={`pointer-events-none absolute inset-y-0 start-0 w-6 ${isRtl ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-[var(--surface-2)] to-transparent`} />
      )}
      {canScrollEnd && (
        <div className={`pointer-events-none absolute inset-y-0 end-0 w-6 ${isRtl ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-[var(--surface-2)] to-transparent`} />
      )}
    </div>
  )
}

/**
 * Generic "browse and pick one" sidebar for the visual-flow module — see
 * docs/VISUAL_FLOW_ARCHITECTURE_AR.md section "VisualFlowSidebar". Like
 * VisualFlow itself, this is domain-agnostic: it never knows what a
 * "workflow" is. Callers map their own domain list into the generic
 * `{ id, title, subtitle?, badge?, icon?, actions? }` item shape before
 * passing it in — status badges, module labels, etc. all arrive pre-
 * rendered as `badge`/`actions` ReactNode slots, the same slot pattern
 * VisualFlow.jsx itself uses for leftPanel/rightPanel. `tabs` is the same
 * idea applied to a page's own tab strip: pass `{id, label}[]` to render
 * it inside the sidebar's top instead of as separate page-level chrome.
 *
 * Renders only its own content (tabs + search + list), not an <aside>
 * wrapper — the same choice NodeLibraryPanel makes — so the caller
 * controls whether it sits in a plain sidebar, a drawer, or anything
 * else, including the actual collapsed/expanded width.
 */
export function VisualFlowSidebar({
  items = [],
  activeItemId,
  onSelectItem,

  tabs,
  activeTabId,
  onTabChange,

  collapsed = false,
  onToggleCollapse,

  searchable = true,
  searchPlaceholderKey = 'visualFlow.sidebar.searchPlaceholder',

  onCreate,
  createLabelKey = 'visualFlow.sidebar.create',

  isLoading = false,
  error = null,
  onRetry,

  emptyTitleKey = 'visualFlow.sidebar.emptyTitle',
  emptyDescriptionKey = 'visualFlow.sidebar.emptyDescription',
  noResultsKey = 'visualFlow.sidebar.noResults',

  renderItem,
  header,
  footer,
  className,
}) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter((item) =>
      [item.title, item.subtitle].filter(Boolean).some((value) => String(value).toLowerCase().includes(term))
    )
  }, [items, search])

  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <div className={`flex h-full flex-col ${className || ''}`}>
      {onToggleCollapse && (
        <div className={`flex items-center border-b border-[var(--border)] p-2 ${collapsed ? 'justify-center' : 'justify-end'}`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={t(collapsed ? 'visualFlow.sidebar.expand' : 'visualFlow.sidebar.collapse')}
            title={t(collapsed ? 'visualFlow.sidebar.expand' : 'visualFlow.sidebar.collapse')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            <ToggleIcon size={16} />
          </button>
        </div>
      )}

      {header}

      {!collapsed && tabs?.length > 0 && <ScrollableTabs tabs={tabs} activeTabId={activeTabId} onTabChange={onTabChange} />}

      {!collapsed && (searchable || onCreate) && (
        <div className="flex items-center gap-2 p-3">
          {searchable && (
            <div className="min-w-0 flex-1">
              <Input startIcon={<Search size={14} />} placeholder={t(searchPlaceholderKey)} value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          )}
          {onCreate && (
            <Button variant="outline" size="icon" onClick={onCreate} aria-label={t(createLabelKey)} title={t(createLabelKey)}>
              <Plus size={16} />
            </Button>
          )}
        </div>
      )}

      {collapsed && onCreate && (
        <div className="flex justify-center p-2">
          <Button variant="outline" size="icon" onClick={onCreate} aria-label={t(createLabelKey)} title={t(createLabelKey)}>
            <Plus size={16} />
          </Button>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto pb-3 ${collapsed ? 'px-1' : 'px-2'}`}>
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Spinner size="sm" />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
            <AlertCircle size={20} className="text-[#EF4444]" />
            {!collapsed && <p className="text-xs text-[var(--text-muted)]">{t('visualFlow.sidebar.errorTitle')}</p>}
            {!collapsed && onRetry && <Button variant="outline" size="sm" onClick={onRetry}>{t('common.retry')}</Button>}
          </div>
        )}

        {!isLoading && !error && items.length === 0 && !collapsed && (
          <EmptyState title={t(emptyTitleKey)} description={t(emptyDescriptionKey)} />
        )}

        {!isLoading && !error && items.length > 0 && filteredItems.length === 0 && !collapsed && (
          <p className="px-2 py-6 text-center text-xs text-[var(--text-muted)]">{t(noResultsKey)}</p>
        )}

        {!isLoading && !error && filteredItems.length > 0 && (
          <div className="space-y-1">
            {filteredItems.map((item) => {
              const isActive = item.id === activeItemId

              if (collapsed) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectItem?.(item.id)}
                    title={item.title}
                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                      isActive ? 'bg-[var(--brand-bg)] text-[var(--text)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                    }`}
                  >
                    {item.icon || item.title?.charAt(0)?.toUpperCase() || '•'}
                  </button>
                )
              }

              if (renderItem) return <div key={item.id}>{renderItem(item, { isActive })}</div>

              return (
                <div
                  key={item.id}
                  className={`group relative flex items-center gap-2 rounded-lg ps-3 pe-2 py-2 text-start text-sm transition-colors ${
                    isActive ? 'bg-[var(--brand-bg)] font-semibold text-[var(--text)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                  }`}
                >
                  {isActive && <span className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-[#00C2CB]" />}
                  <button type="button" onClick={() => onSelectItem?.(item.id)} className="flex min-w-0 flex-1 items-center gap-2 text-start">
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{item.title}</span>
                      {item.subtitle && <span className="block truncate text-xs text-[var(--text-light)]">{item.subtitle}</span>}
                    </span>
                  </button>
                  {item.badge && <span className="shrink-0">{item.badge}</span>}
                  {item.actions && <span className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">{item.actions}</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {!collapsed && footer}
    </div>
  )
}
