import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Pin, Sparkles } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useLocalStorage } from '../data-table/hooks/useLocalStorage'
import { useNavigation } from '../../../app/navigation/useNavigation'

function SidebarNavItem({ item, isActive, collapsed, t, isFavorite = false, onToggleFavorite }) {
  const Icon = item.icon

  return (
    <div className="group/nav-item relative flex min-w-0 items-center gap-0.5">
      <NavLink
        to={item.path}
        end={item.end}
        title={collapsed ? t(item.labelKey) : undefined}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors duration-150',
          'font-arabic text-[13px] font-medium leading-5',
          collapsed && 'justify-center',
          isActive
            ? 'bg-[var(--shell-active)] font-medium text-[var(--text)]'
            : 'text-[var(--text-muted)] hover:bg-[var(--shell-hover)] hover:text-[var(--text)]'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon size={16} className="shrink-0" />
        {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
      </NavLink>
      <button
        type="button"
        onClick={() => onToggleFavorite?.(item.id)}
        title={t(isFavorite ? 'nav.unpinPage' : 'nav.pinPage')}
        aria-label={t(isFavorite ? 'nav.unpinPage' : 'nav.pinPage')}
        aria-pressed={isFavorite}
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all hover:bg-[var(--shell-hover)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]',
          collapsed && 'hidden',
          isFavorite
            ? 'text-[var(--brand-accent)] opacity-90'
            : 'text-[var(--text-muted)] opacity-20 group-hover/nav-item:opacity-80 focus-visible:opacity-100'
        )}
      >
        <Pin size={13} className={cn(isFavorite && 'fill-current')} />
      </button>
    </div>
  )
}

function SidebarSection({ section, collapsed, activeItemId, activeSectionId, expanded, onToggle, favoriteIds, onToggleFavorite, t, isFirst = false }) {
  const isSingleAndBare = section.hideLabel
  const isActiveSection = section.id === activeSectionId

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        {section.items.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            collapsed
            isActive={item.id === activeItemId}
            isFavorite={favoriteIds.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
            t={t}
          />
        ))}
      </div>
    )
  }

  if (isSingleAndBare) {
    return (
      <div className="space-y-0.5">
        {section.items.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            collapsed={false}
            isActive={item.id === activeItemId}
            isFavorite={favoriteIds.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
            t={t}
          />
        ))}
      </div>
    )
  }

  const isExpanded = expanded

  return (
    <section className={cn(!isFirst && 'border-t border-[var(--border)] pt-2')}>
      <button
        type="button"
        onClick={() => onToggle(section.id)}
        className={cn(
          'flex w-full items-center justify-between rounded-md border-s-2 px-2 py-2 transition-colors',
          isActiveSection
            ? 'border-[var(--brand-accent)] bg-[var(--shell-active)] font-semibold text-[var(--text)]'
            : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--shell-hover)] hover:text-[var(--text)]'
        )}
        aria-expanded={isExpanded}
        aria-controls={`sidebar-section-${section.id}`}
      >
        <span className="font-arabic text-[13px] font-semibold leading-5">
          {t(section.labelKey)}
        </span>
        <ChevronDown
          size={13}
          className={cn('transition-transform duration-150', isExpanded ? 'rotate-0' : '-rotate-90')}
        />
      </button>

      {isExpanded && (
        <div id={`sidebar-section-${section.id}`} className="ms-2 mt-1 space-y-0.5 border-s border-[var(--border)] ps-1.5">
          {section.items.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              collapsed={false}
              isActive={item.id === activeItemId}
              isFavorite={favoriteIds.includes(item.id)}
              onToggleFavorite={onToggleFavorite}
              t={t}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export function Sidebar({ collapsed }) {
  const { t } = useTranslation()
  const { sections, activeItem, activeSectionId } = useNavigation()
  const [collapsedSections, setCollapsedSections] = useLocalStorage('main-sidebar-collapsed-sections', {})
  const [favoriteIds, setFavoriteIds] = useLocalStorage('main-sidebar-favorites', [])
  const visibleItems = sections.flatMap((section) => section.items)
  const favoriteItems = favoriteIds.map((id) => visibleItems.find((item) => item.id === id)).filter(Boolean)

  const handleToggleSection = (sectionId) => {
    setCollapsedSections((current) => ({ ...current, [sectionId]: !current[sectionId] }))
  }

  const handleToggleFavorite = (itemId) => {
    setFavoriteIds((current) => current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId])
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 start-0 z-30 flex flex-col transition-all duration-300',
        'bg-[var(--shell-surface)] text-[var(--text)] border-e border-[var(--border)]',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Workspace chip */}
      <button className="flex items-center gap-2 mx-3 mt-3 mb-2 h-9 px-2 rounded-lg hover:bg-[var(--shell-hover)] transition-colors">
        <LogoMark />
        {!collapsed && (
          <>
            <span className="font-latin font-semibold text-[14px] text-[var(--text)] truncate">
              ICAN CRM
            </span>
            <ChevronDown size={14} className="text-[#9CA3AF] shrink-0" />
          </>
        )}
      </button>

      {/* App nav */}
      <nav aria-label={t('nav.workspace', 'Workspace')} className="flex-1 space-y-2 overflow-y-auto px-3 py-2 scrollbar-thin">
        {sections.map((section, index) => (
          <div key={section.id} className="space-y-2">
            <SidebarSection
              section={section}
              collapsed={collapsed}
              activeItemId={activeItem?.id}
              activeSectionId={activeSectionId}
              expanded={!collapsedSections[section.id]}
              onToggle={handleToggleSection}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              t={t}
              isFirst={index === 0}
            />
            {index === 0 && favoriteItems.length > 0 && (
              <section className="border-t border-[var(--border)] pt-2" aria-label={t('nav.favorites')}>
                {!collapsed && <h2 className="mb-1 px-2 font-arabic text-[13px] font-semibold leading-5 text-[var(--text-muted)]">{t('nav.favorites')}</h2>}
                <div className="space-y-0.5">
                  {favoriteItems.map((item) => (
                    <SidebarNavItem key={`favorite-${item.id}`} item={item} collapsed={collapsed} isActive={item.id === activeItem?.id} isFavorite onToggleFavorite={handleToggleFavorite} t={t} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ))}
      </nav>

      {/* AI Indicator */}
      {!collapsed && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C2CB] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C2CB]" />
            </span>
            <Sparkles size={12} />
            {t('app.aiActive')}
          </div>
        </div>
      )}

    </aside>
  )
}

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#111827" fillOpacity="0.95" />
      <text x="5" y="22" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="14" fill="white">IC</text>
      <circle cx="27" cy="5" r="4" fill="#00C2CB" />
    </svg>
  )
}
