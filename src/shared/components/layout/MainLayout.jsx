import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BriefcaseBusiness, MessagesSquare } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { SmartWorkspacePanel } from './SmartWorkspacePanel'
import { cn } from '../../utils/cn'
import { useLocalStorage } from '../data-table/hooks/useLocalStorage'
import { useGlobalMessengerNotifications } from '../../../features/conversations/hooks/useGlobalMessengerNotifications'
import { MessengerSidebarPanel } from '../../../features/conversations/components/MessengerSidebarPanel'
import { GmailSidebarPanel } from '../../../features/conversations/components/GmailSidebarPanel'
import { WhatsappSidebarPanel } from '../../../features/conversations/components/WhatsappSidebarPanel'
import { TasksSidebarPanel } from '../../../features/tasks/components/TasksSidebarPanel'
import { TodoSidebarPanel } from '../../../features/tasks'
import { ActiveUsersSidebarPanel } from '../../../features/users/components/ActiveUsersSidebarPanel'
import { InternalChatSidebarPanel } from '../../../features/internal-chat'
import { OPEN_MESSENGER_SIDEBAR_EVENT } from '../../../features/conversations/constants/messengerSidebarEvents'
import { OPEN_WHATSAPP_SIDEBAR_EVENT } from '../../../features/conversations/constants/whatsappSidebarEvents'
import { AlertsStack } from '../../../features/alerts'
import { useChatUnreadCount } from '../../../features/internal-chat'

export function MainLayout() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useLocalStorage('main-sidebar-collapsed', false)
  const [workspaceOpen, setWorkspaceOpen] = useLocalStorage('smart-workspace-open', false)
  const [workspaceMode, setWorkspaceMode] = useLocalStorage('smart-workspace-mode', 'docked')
  const [messengerSidebarOpen, setMessengerSidebarOpen] = useState(false)
  const [messengerSidebarTarget, setMessengerSidebarTarget] = useState({ conversationId: '' })
  const [gmailSidebarOpen, setGmailSidebarOpen] = useState(false)
  const [gmailSidebarTarget] = useState({ gmailConversationId: '' })
  const [whatsappSidebarOpen, setWhatsappSidebarOpen] = useState(false)
  const [whatsappSidebarTarget, setWhatsappSidebarTarget] = useState({ whatsappConversationId: '' })
  const [tasksSidebarOpen, setTasksSidebarOpen] = useState(false)
  const [todoSidebarOpen, setTodoSidebarOpen] = useState(false)
  const [internalChatSidebarOpen, setInternalChatSidebarOpen] = useState(false)
  const [activeUsersSidebarOpen, setActiveUsersSidebarOpen] = useState(false)
  useGlobalMessengerNotifications()

  useEffect(() => {
    window.localStorage.removeItem('messenger-sidebar-open')
  }, [])

  useEffect(() => {
    setMessengerSidebarOpen(false)
    setGmailSidebarOpen(false)
    setWhatsappSidebarOpen(false)
    setTasksSidebarOpen(false)
    setTodoSidebarOpen(false)
    setInternalChatSidebarOpen(false)
    setActiveUsersSidebarOpen(false)
  }, [i18n.language])

  useEffect(() => {
    const handleOpenMessengerSidebar = (event) => {
      const detail = event?.detail || {}
      setMessengerSidebarTarget({
        conversationId: String(detail.conversationId || ''),
        leadId: String(detail.leadId || ''),
        customerId: String(detail.customerId || ''),
        phone: String(detail.phone || ''),
        email: String(detail.email || ''),
      })
      setTasksSidebarOpen(false)
      setTodoSidebarOpen(false)
      setGmailSidebarOpen(false)
      setWhatsappSidebarOpen(false)
      setInternalChatSidebarOpen(false)
      setActiveUsersSidebarOpen(false)
      setMessengerSidebarOpen(true)
    }

    const handleOpenWhatsappSidebar = (event) => {
      const detail = event?.detail || {}
      setWhatsappSidebarTarget({
        whatsappConversationId: String(detail.whatsappConversationId || detail.conversationId || ''),
        leadId: String(detail.leadId || ''),
        customerId: String(detail.customerId || ''),
        phone: String(detail.phone || ''),
        email: String(detail.email || ''),
      })
      setTasksSidebarOpen(false)
      setTodoSidebarOpen(false)
      setInternalChatSidebarOpen(false)
      setActiveUsersSidebarOpen(false)
      setGmailSidebarOpen(false)
      setMessengerSidebarOpen(false)
      setWhatsappSidebarOpen(true)
    }

    window.addEventListener(OPEN_MESSENGER_SIDEBAR_EVENT, handleOpenMessengerSidebar)
    window.addEventListener(OPEN_WHATSAPP_SIDEBAR_EVENT, handleOpenWhatsappSidebar)
    return () => {
      window.removeEventListener(OPEN_MESSENGER_SIDEBAR_EVENT, handleOpenMessengerSidebar)
      window.removeEventListener(OPEN_WHATSAPP_SIDEBAR_EVENT, handleOpenWhatsappSidebar)
    }
  }, [])

  const activeRightSidebar = messengerSidebarOpen || gmailSidebarOpen || whatsappSidebarOpen || tasksSidebarOpen || todoSidebarOpen || internalChatSidebarOpen || activeUsersSidebarOpen
  const toggleWorkspace = () => {
    setWorkspaceOpen((open) => !open)
    setMessengerSidebarOpen(false)
    setGmailSidebarOpen(false)
    setWhatsappSidebarOpen(false)
    setTasksSidebarOpen(false)
    setTodoSidebarOpen(false)
    setInternalChatSidebarOpen(false)
    setActiveUsersSidebarOpen(false)
  }
  const workspaceDocked = workspaceOpen && workspaceMode === 'docked'

  useEffect(() => {
    if (activeRightSidebar) setWorkspaceOpen(false)
  }, [activeRightSidebar])
  const internalChatUnreadQuery = useChatUnreadCount({ per_page: 30 })
  const internalChatUnreadCount = Number(internalChatUnreadQuery.unreadCount || 0)
  const isDealRoute = /^\/deals\//.test(location.pathname)
  const dealChatRoute = isDealRoute && !location.pathname.endsWith('/chats')
    ? `${location.pathname.replace(/\/$/, '')}/chats`
    : null

  useEffect(() => {
    const rightOffset = activeRightSidebar
      ? (activeUsersSidebarOpen ? 'min(340px, calc(100vw - 56px))' : 'min(390px, calc(100vw - 72px))')
      : '0px'
    document.documentElement.style.setProperty('--layout-right-sidebar-offset', rightOffset)
    if (!document.documentElement.style.getPropertyValue('--layout-page-drawer-offset')) {
      document.documentElement.style.setProperty('--layout-page-drawer-offset', '0px')
    }

    return () => {
      document.documentElement.style.setProperty('--layout-right-sidebar-offset', '0px')
      document.documentElement.style.setProperty('--layout-page-drawer-offset', '0px')
    }
  }, [activeRightSidebar, activeUsersSidebarOpen])

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]" style={{ '--layout-header-height': '48px' }}>
      <Sidebar collapsed={collapsed} />

      {/* Offset content by sidebar width */}
      <div
        className={cn(
          'transition-all duration-300',
          collapsed ? 'ps-16' : 'ps-60',
          workspaceDocked && 'lg:!pe-[340px]'
        )}
        style={{
          '--messenger-sidebar-width': 'min(390px, calc(100vw - 72px))',
          '--tasks-sidebar-width': 'min(390px, calc(100vw - 72px))',
          '--layout-sidebar-current': collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
          paddingInlineEnd: 'calc(var(--layout-right-sidebar-offset, 0px) + var(--layout-page-drawer-offset, 0px) + var(--smart-workspace-dock-offset, 0px))',
          '--smart-workspace-dock-offset': '0px',
        }}
      >
        <Header
          collapsed={collapsed}
          workspaceOpen={workspaceOpen}
          onToggleWorkspace={toggleWorkspace}
          onToggleSidebar={() => setCollapsed((c) => !c)}
          messengerSidebarOpen={messengerSidebarOpen}
          onToggleMessengerSidebar={() => {
            setMessengerSidebarOpen((open) => {
              const next = !open
              if (next) {
                setTasksSidebarOpen(false)
                setTodoSidebarOpen(false)
                setGmailSidebarOpen(false)
                setWhatsappSidebarOpen(false)
                setInternalChatSidebarOpen(false)
              }
              return next
            })
          }}
          gmailSidebarOpen={gmailSidebarOpen}
          onToggleGmailSidebar={() => {
            setGmailSidebarOpen((open) => {
              const next = !open
              if (next) {
                setMessengerSidebarOpen(false)
                setWhatsappSidebarOpen(false)
                setTasksSidebarOpen(false)
                setTodoSidebarOpen(false)
                setInternalChatSidebarOpen(false)
              }
              return next
            })
          }}
          whatsappSidebarOpen={whatsappSidebarOpen}
          onToggleWhatsappSidebar={() => {
            setWhatsappSidebarOpen((open) => {
              const next = !open
              if (next) {
                setMessengerSidebarOpen(false)
                setGmailSidebarOpen(false)
                setTasksSidebarOpen(false)
                setTodoSidebarOpen(false)
                setInternalChatSidebarOpen(false)
              }
              return next
            })
          }}
          tasksSidebarOpen={tasksSidebarOpen}
          onToggleTasksSidebar={() => {
            setTasksSidebarOpen((open) => {
              const next = !open
              if (next) {
                setTodoSidebarOpen(false)
                setMessengerSidebarOpen(false)
                setGmailSidebarOpen(false)
                setWhatsappSidebarOpen(false)
                setInternalChatSidebarOpen(false)
                setActiveUsersSidebarOpen(false)
              }
              return next
            })
          }}
          todoSidebarOpen={todoSidebarOpen}
          onToggleTodoSidebar={() => {
            setTodoSidebarOpen((open) => {
              const next = !open
              if (next) {
                setTasksSidebarOpen(false)
                setMessengerSidebarOpen(false)
                setGmailSidebarOpen(false)
                setWhatsappSidebarOpen(false)
                setInternalChatSidebarOpen(false)
                setActiveUsersSidebarOpen(false)
              }
              return next
            })
          }}
          internalChatSidebarOpen={internalChatSidebarOpen}
          onToggleInternalChatSidebar={() => {
            setInternalChatSidebarOpen((open) => {
              const next = !open
              if (next) {
                setMessengerSidebarOpen(false)
                setGmailSidebarOpen(false)
                setWhatsappSidebarOpen(false)
                setTasksSidebarOpen(false)
                setTodoSidebarOpen(false)
                setActiveUsersSidebarOpen(false)
              }
              return next
            })
          }}
          activeUsersSidebarOpen={activeUsersSidebarOpen}
          onToggleActiveUsersSidebar={() => {
            setActiveUsersSidebarOpen((open) => {
              const next = !open
              if (next) {
                setMessengerSidebarOpen(false)
                setGmailSidebarOpen(false)
                setWhatsappSidebarOpen(false)
                setTasksSidebarOpen(false)
                setTodoSidebarOpen(false)
                setInternalChatSidebarOpen(false)
              }
              return next
            })
          }}
        />

        <main className="min-h-screen" style={{ paddingTop: 'var(--layout-header-height, 48px)' }}>
          <AlertsStack />
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <SmartWorkspacePanel
        open={workspaceOpen}
        mode={workspaceMode}
        onClose={() => setWorkspaceOpen(false)}
        onModeChange={setWorkspaceMode}
      />

      <MessengerSidebarPanel
        open={messengerSidebarOpen}
        initialTarget={messengerSidebarTarget}
        onClose={() => setMessengerSidebarOpen(false)}
      />

      <GmailSidebarPanel
        open={gmailSidebarOpen}
        initialTarget={gmailSidebarTarget}
        onClose={() => setGmailSidebarOpen(false)}
      />

      <WhatsappSidebarPanel
        open={whatsappSidebarOpen}
        initialTarget={whatsappSidebarTarget}
        onClose={() => setWhatsappSidebarOpen(false)}
      />

      <TasksSidebarPanel
        open={tasksSidebarOpen}
        onClose={() => setTasksSidebarOpen(false)}
      />

      <TodoSidebarPanel
        open={todoSidebarOpen}
        onClose={() => setTodoSidebarOpen(false)}
      />

      <div className="fixed bottom-4 end-4 z-30 flex flex-col items-end gap-2">
        {dealChatRoute ? (
          <button
            type="button"
            onClick={() => navigate(dealChatRoute)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#BEEFF2] bg-[var(--surface)] text-[var(--brand-accent)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--surface-2)]"
            aria-label="محادثات الصفقة"
            title="محادثات الصفقة"
          >
            <BriefcaseBusiness size={20} />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setInternalChatSidebarOpen((open) => !open)}
          className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#BEEFF2] bg-[var(--surface)] text-[var(--brand-accent)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--surface-2)]"
          aria-label="الدردشة الداخلية"
          title="الدردشة الداخلية"
        >
          <MessagesSquare size={20} />
          {internalChatUnreadCount > 0 ? (
            <span className="absolute -top-1.5 -end-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-black leading-5 text-white shadow-sm">
              {internalChatUnreadCount > 99 ? '99+' : internalChatUnreadCount}
            </span>
          ) : null}
        </button>
      </div>

      <InternalChatSidebarPanel
        open={internalChatSidebarOpen}
        onClose={() => setInternalChatSidebarOpen(false)}
      />

      <ActiveUsersSidebarPanel
        open={activeUsersSidebarOpen}
        onClose={() => setActiveUsersSidebarOpen(false)}
      />
    </div>
  )
}
