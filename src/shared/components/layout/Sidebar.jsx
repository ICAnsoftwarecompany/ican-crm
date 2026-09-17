import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, LogOut, Moon, Sparkles, Sun } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAuthStore } from '../../../store/authStore'
import { useThemeStore } from '../../../store/themeStore'
import { useLocalStorage } from '../data-table/hooks/useLocalStorage'
import { useNavigation } from '../../../app/navigation/useNavigation'
import { Avatar } from '../ui/Avatar'

function SidebarNavItem({ item, isActive, collapsed, t }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      end={item.end}
      title={collapsed ? t(item.labelKey) : undefined}
      className={cn(
        'flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors duration-150',
        'text-sm font-arabic',
        collapsed && 'justify-center',
        isActive
          ? 'bg-[#ECECEA] font-medium text-[#111827]'
          : 'text-[#6B7280] hover:bg-[#F0F0EF] hover:text-[#111827]'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon size={16} className="shrink-0" />
      {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
    </NavLink>
  )
}

function SidebarSection({ section, collapsed, activeItemId, activeSectionId, expanded, onToggle, t }) {
  const isSingleAndBare = section.hideLabel

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        {section.items.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            collapsed
            isActive={item.id === activeItemId}
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
            t={t}
          />
        ))}
      </div>
    )
  }

  const isExpanded = expanded || section.id === activeSectionId

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(section.id)}
        className="flex w-full items-center justify-between px-2 py-1 rounded-md text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`sidebar-section-${section.id}`}
      >
        <span className="text-xs font-medium font-arabic uppercase tracking-wide">
          {t(section.labelKey)}
        </span>
        <ChevronDown
          size={13}
          className={cn('transition-transform duration-150', isExpanded ? 'rotate-0' : '-rotate-90')}
        />
      </button>

      {isExpanded && (
        <div id={`sidebar-section-${section.id}`} className="mt-0.5 space-y-0.5">
          {section.items.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              collapsed={false}
              isActive={item.id === activeItemId}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ collapsed }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { isDark, toggleTheme } = useThemeStore()
  const { sections, activeItem, activeSectionId } = useNavigation()
  const [collapsedSections, setCollapsedSections] = useLocalStorage('main-sidebar-collapsed-sections', {})

  const toggleLanguage = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(next)
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleToggleSection = (sectionId) => {
    setCollapsedSections((current) => ({ ...current, [sectionId]: !current[sectionId] }))
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 start-0 z-30 flex flex-col transition-all duration-300',
        'bg-[#FAFAF9] text-[var(--text)] border-e border-[#ECECEC]',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Workspace chip */}
      <button className="flex items-center gap-2 mx-3 mt-3 mb-2 h-9 px-2 rounded-lg hover:bg-[#F0F0EF] transition-colors">
        <LogoMark />
        {!collapsed && (
          <>
            <span className="font-latin font-semibold text-[14px] text-[#111827] truncate">
              ICAN CRM
            </span>
            <ChevronDown size={14} className="text-[#9CA3AF] shrink-0" />
          </>
        )}
      </button>

      {/* App nav */}
      <nav aria-label={t('nav.workspace', 'Workspace')} className="flex-1 py-2 space-y-3 overflow-y-auto scrollbar-thin px-3">
        {sections.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            collapsed={collapsed}
            activeItemId={activeItem?.id}
            activeSectionId={activeSectionId}
            expanded={!collapsedSections[section.id]}
            onToggle={handleToggleSection}
            t={t}
          />
        ))}
      </nav>

      {/* AI Indicator */}
      {!collapsed && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C2CB] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C2CB]" />
            </span>
            <Sparkles size={12} />
            AI نشط
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="border-t border-[#ECECEC] p-3 space-y-0.5">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[#6B7280] hover:bg-[#F0F0EF] hover:text-[#111827] text-sm font-arabic transition-colors"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && (isDark ? t('common.lightMode') : t('common.darkMode'))}
        </button>

        <button
          onClick={toggleLanguage}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[#6B7280] hover:bg-[#F0F0EF] hover:text-[#111827] text-sm font-arabic transition-colors"
        >
          <span className="font-latin text-xs font-bold w-4 text-center">
            {i18n.language === 'ar' ? 'EN' : 'ع'}
          </span>
          {!collapsed && t('common.language')}
        </button>

        {user && (
          <div className={cn('flex items-center gap-2.5 px-2 py-1.5', collapsed && 'justify-center')}>
            <Avatar name={user.name || user.login} size="sm" />
            {!collapsed && (
              <p className="text-sm font-medium text-[#111827] truncate font-arabic">
                {user.name || user.login}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#B91C1C] text-sm font-arabic transition-colors"
        >
          <LogOut size={16} />
          {!collapsed && t('actions.logout')}
        </button>
      </div>
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
