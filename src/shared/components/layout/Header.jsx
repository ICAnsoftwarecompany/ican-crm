import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Plus, MoreHorizontal, Command, PanelLeft, Users } from 'lucide-react'
import { usePageHeaderStore } from '../../../store/pageHeaderStore'
import { useAuthStore } from '../../../store/authStore'
import { Avatar } from '../ui/Avatar'
import { NAV_ITEMS } from './Sidebar'
import { NetworkStatusIndicator } from './NetworkStatusIndicator'
import { MessengerLogoIcon, MessengerNavbarButton } from '../../../features/conversations/components/MessengerNavbarButton'
import { GmailNavbarButton } from '../../../features/conversations/components/GmailNavbarButton'
import { WhatsappNavbarButton } from '../../../features/conversations/components/WhatsappNavbarButton'
import { TasksNavbarButton } from '../../../features/tasks/components/TasksNavbarButton'
import { InternalChatNavbarButton } from '../../../features/internal-chat'
import { NotificationCenterButton } from '../../../features/notifications'
import { LiveMeetingIndicator } from '../../../features/call-meetings'

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
  internalChatSidebarOpen = false,
  onToggleInternalChatSidebar,
  activeUsersSidebarOpen = false,
  onToggleActiveUsersSidebar,
}) {
  const { t } = useTranslation()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const { title: customTitle, icon: customIcon, actions } = usePageHeaderStore()

  // Fall back to the matching nav item so every page gets a title/icon for
  // free; a page can still override both via usePageHeader().
  const current = NAV_ITEMS.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )
  const title = customTitle || (current ? t(current.labelKey) : '')
  const Icon = customIcon || current?.icon
  const ChannelIcon = customIcon ? null : PAGE_CHANNEL_ICONS.find((item) => item.match(location.pathname))?.icon

  return (
    <header
      className="fixed top-0 end-0 start-0 z-20 flex items-center gap-3 px-4 border-b border-[#E5E7EB] bg-[#FBFBFA]"
      style={{
        height: 'var(--layout-header-height, 48px)',
        paddingInlineStart: collapsed
          ? 'calc(var(--sidebar-collapsed) + 16px)'
          : 'calc(var(--sidebar-width) + 16px)',
        paddingInlineEnd: messengerSidebarOpen || gmailSidebarOpen || whatsappSidebarOpen || tasksSidebarOpen || internalChatSidebarOpen
          ? 'calc(var(--messenger-sidebar-width) + 16px)'
          : '16px',
      }}
    >
      <button
        onClick={onToggleSidebar}
        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors shrink-0"
        aria-label="Toggle sidebar"
      >
        <PanelLeft size={16} />
      </button>

      {/* Page identity — set per-page via usePageHeader() */}
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon size={16} className="text-[#6B7280] shrink-0" />}
        {ChannelIcon && <ChannelIcon size={18} />}
        <span className="font-arabic font-medium text-[15px] text-[#111827] truncate">
          {title}
        </span>
      </div>

      <div className="ms-auto flex items-center gap-2 shrink-0">
        {/* page-specific buttons (Fly again / Schedule launch / Retire, etc.) */}
        {actions}

        <NetworkStatusIndicator />

        <LiveMeetingIndicator />

        <NotificationCenterButton />

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
              ? 'border-[#7FDDE1] bg-[#F3FDFF] text-[#007A80]'
              : 'border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]',
          ].join(' ')}
          aria-label="Active users"
          title="المستخدمون النشطون"
        >
          <Users size={14} />
          <span className="hidden md:inline">Active</span>
        </button>

        <IconButton onClick={() => {}} aria-label={t('actions.search')}>
          <Search size={16} />
        </IconButton>

        <button className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors">
          <Plus size={14} />
          <span className="font-latin">{t('actions.new')}</span>
        </button>

        <IconButton aria-label="More">
          <MoreHorizontal size={16} />
        </IconButton>

        <span className="hidden md:flex items-center gap-0.5 h-8 px-1.5 rounded-md border border-[#E5E7EB] text-xs text-[#9CA3AF]">
          <Command size={11} /> K
        </span>

        {user && (
          <div className="flex items-center gap-2 ps-1">
            <Avatar name={user.name || user.login} size="sm" />
          </div>
        )}
      </div>
    </header>
  )
}

function IconButton({ children, ...props }) {
  return (
    <button
      type="button"
      className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
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
      className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
      {...props}
    >
      <Icon size={14} />
      <span className="font-latin hidden lg:inline">{label}</span>
    </button>
  )
}
