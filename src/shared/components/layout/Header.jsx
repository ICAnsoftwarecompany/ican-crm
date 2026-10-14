import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Plus, MoreHorizontal, Command, PanelLeft, Users, Moon, Sun } from 'lucide-react'
import { usePageHeaderStore } from '../../../store/pageHeaderStore'
import { useThemeStore } from '../../../store/themeStore'
import { useNavigation } from '../../../app/navigation/useNavigation'
import { NetworkStatusIndicator } from './NetworkStatusIndicator'
import { MessengerLogoIcon, MessengerNavbarButton } from '../../../features/conversations/components/MessengerNavbarButton'
import { GmailNavbarButton } from '../../../features/conversations/components/GmailNavbarButton'
import { WhatsappNavbarButton } from '../../../features/conversations/components/WhatsappNavbarButton'
import { TasksNavbarButton } from '../../../features/tasks/components/TasksNavbarButton'
import { TodoNavbarButton } from '../../../features/tasks'
import { InternalChatNavbarButton } from '../../../features/internal-chat'
import { NotificationCenterButton } from '../../../features/notifications'
import { LiveMeetingIndicator } from '../../../features/call-meetings'
import { HeaderProfileMenu } from './HeaderProfileMenu'
import { AlertsIndicator } from '../../../features/alerts'

const PAGE_CHANNEL_ICONS = [
  {
    match: (pathname) => pathname.startsWith('/conversations'),
    icon: MessengerLogoIcon,
  },
]

export function Header({
  onToggleSidebar,
  collapsed,
  messengerSidebarOpen = false,
  onToggleMessengerSidebar,
  gmailSidebarOpen = false,
  onToggleGmailSidebar,
  whatsappSidebarOpen = false,
  onToggleWhatsappSidebar,
  tasksSidebarOpen = false,
  onToggleTasksSidebar,
  todoSidebarOpen = false,
  onToggleTodoSidebar,
  internalChatSidebarOpen = false,
  onToggleInternalChatSidebar,
  activeUsersSidebarOpen = false,
  onToggleActiveUsersSidebar,
}) {
  const { t } = useTranslation()
  const location = useLocation()
  const { isDark, toggleTheme } = useThemeStore()
  const { title: customTitle, icon: customIcon, actions } = usePageHeaderStore()
  const { activeItem } = useNavigation()

  // Fall back to the resolved navigation item so every page gets a
  // title/icon for free; a page can still override both via usePageHeader().
  // Both Header and Sidebar read from the same navigation.config — see
  // src/app/navigation/ — so there is no Header -> Sidebar dependency.
  const title = customTitle || (activeItem ? t(activeItem.labelKey) : '')
  const Icon = customIcon || activeItem?.icon
  const ChannelIcon = customIcon ? null : PAGE_CHANNEL_ICONS.find((item) => item.match(location.pathname))?.icon

  return (
    <header
      className="fixed top-0 end-0 start-0 z-20 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--shell-surface)] px-4 text-[var(--text)] shadow-sm"
      style={{
        height: 'var(--layout-header-height, 48px)',
        paddingInlineStart: collapsed
          ? 'calc(var(--sidebar-collapsed) + 16px)'
          : 'calc(var(--sidebar-width) + 16px)',
        paddingInlineEnd: messengerSidebarOpen || gmailSidebarOpen || whatsappSidebarOpen || tasksSidebarOpen || todoSidebarOpen || internalChatSidebarOpen
          ? 'calc(var(--messenger-sidebar-width) + 16px)'
          : '16px',
      }}
    >
      <button
        onClick={onToggleSidebar}
        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--shell-hover)] transition-colors shrink-0"
        aria-label={t('app.toggleSidebar')}
      >
        <PanelLeft size={16} />
      </button>

      {/* Page identity — set per-page via usePageHeader() */}
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon size={16} className="text-[var(--text-muted)] shrink-0" />}
        {ChannelIcon && <ChannelIcon size={18} />}
        <span className="font-arabic font-medium text-[15px] text-[var(--text)] truncate">
          {title}
        </span>
      </div>

      <div className="ms-auto flex items-center gap-2 shrink-0">
        {/* page-specific buttons (Fly again / Schedule launch / Retire, etc.) */}
        {actions}

        <NetworkStatusIndicator />

        <LiveMeetingIndicator />

        <NotificationCenterButton />

        <AlertsIndicator />

        <MessengerNavbarButton
          active={messengerSidebarOpen}
          onClick={onToggleMessengerSidebar}
        />

        <GmailNavbarButton
          active={gmailSidebarOpen}
          onClick={onToggleGmailSidebar}
        />

        <WhatsappNavbarButton
          active={whatsappSidebarOpen}
          onClick={onToggleWhatsappSidebar}
        />

        <TasksNavbarButton
          active={tasksSidebarOpen}
          onClick={onToggleTasksSidebar}
        />

        <TodoNavbarButton
          active={todoSidebarOpen}
          onClick={onToggleTodoSidebar}
        />

        <InternalChatNavbarButton
          active={internalChatSidebarOpen}
          onClick={onToggleInternalChatSidebar}
        />

        <button
          type="button"
          onClick={onToggleActiveUsersSidebar}
          className={[
            'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2 text-xs font-black transition-colors',
            activeUsersSidebarOpen
              ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]',
          ].join(' ')}
          aria-label={t('app.activeUsers')}
          title="المستخدمون النشطون"
        >
          <Users size={14} />
          <span className="hidden md:inline">{t('app.active')}</span>
        </button>

        <IconButton onClick={() => {}} aria-label={t('actions.search')}>
          <Search size={16} />
        </IconButton>

        <button className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors">
          <Plus size={14} />
          <span className="font-latin">{t('actions.new')}</span>
        </button>

        <IconButton aria-label={t('app.more')}>
          <MoreHorizontal size={16} />
        </IconButton>

        <span className="hidden md:flex items-center gap-0.5 h-8 px-1.5 rounded-md border border-[var(--border)] text-xs text-[var(--text-muted)]">
          <Command size={11} /> K
        </span>

        <IconButton onClick={toggleTheme} aria-label={isDark ? t('common.lightMode') : t('common.darkMode')} title={isDark ? t('common.lightMode') : t('common.darkMode')}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>

        <HeaderProfileMenu />
      </div>
    </header>
  )
}

function IconButton({ children, ...props }) {
  return (
    <button
      type="button"
      className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
      {...props}
    >
      {children}
    </button>
  )
}

/** Small helper for page-specific action buttons, e.g. "Fly again". */
export function HeaderButton({ icon: Icon, label, ...props }) {
  return (
    <button
      type="button"
      className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
      {...props}
    >
      <Icon size={14} />
      <span className="font-latin hidden lg:inline">{label}</span>
    </button>
  )
}
