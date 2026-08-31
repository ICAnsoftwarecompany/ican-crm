import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '../../utils/cn'
import { useLocalStorage } from '../data-table/hooks/useLocalStorage'
import { useGlobalMessengerNotifications } from '../../../features/conversations/hooks/useGlobalMessengerNotifications'
import { MessengerSidebarPanel } from '../../../features/conversations/components/MessengerSidebarPanel'
import { GmailSidebarPanel } from '../../../features/conversations/components/GmailSidebarPanel'
import { WhatsappSidebarPanel } from '../../../features/conversations/components/WhatsappSidebarPanel'
import { TasksSidebarPanel } from '../../../features/tasks/components/TasksSidebarPanel'
import { OPEN_MESSENGER_SIDEBAR_EVENT } from '../../../features/conversations/constants/messengerSidebarEvents'
import { OPEN_WHATSAPP_SIDEBAR_EVENT } from '../../../features/conversations/constants/whatsappSidebarEvents'

export function MainLayout() {
  const { i18n } = useTranslation()
  const [collapsed, setCollapsed] = useLocalStorage('main-sidebar-collapsed', false)
  const [messengerSidebarOpen, setMessengerSidebarOpen] = useState(false)
  const [messengerSidebarTarget, setMessengerSidebarTarget] = useState({ conversationId: '' })
  const [gmailSidebarOpen, setGmailSidebarOpen] = useState(false)
  const [gmailSidebarTarget] = useState({ gmailConversationId: '' })
  const [whatsappSidebarOpen, setWhatsappSidebarOpen] = useState(false)
  const [whatsappSidebarTarget, setWhatsappSidebarTarget] = useState({ whatsappConversationId: '' })
  const [tasksSidebarOpen, setTasksSidebarOpen] = useState(false)
  useGlobalMessengerNotifications()

  useEffect(() => {
    window.localStorage.removeItem('messenger-sidebar-open')
  }, [])

  useEffect(() => {
    setMessengerSidebarOpen(false)
    setGmailSidebarOpen(false)
    setWhatsappSidebarOpen(false)
    setTasksSidebarOpen(false)
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
      setGmailSidebarOpen(false)
      setWhatsappSidebarOpen(false)
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

  const activeRightSidebar = messengerSidebarOpen || gmailSidebarOpen || whatsappSidebarOpen || tasksSidebarOpen

  useEffect(() => {
    const rightOffset = activeRightSidebar ? 'min(390px, calc(100vw - 72px))' : '0px'
    document.documentElement.style.setProperty('--layout-right-sidebar-offset', rightOffset)
    if (!document.documentElement.style.getPropertyValue('--layout-page-drawer-offset')) {
      document.documentElement.style.setProperty('--layout-page-drawer-offset', '0px')
    }

    return () => {
      document.documentElement.style.setProperty('--layout-right-sidebar-offset', '0px')
      document.documentElement.style.setProperty('--layout-page-drawer-offset', '0px')
    }
  }, [activeRightSidebar])

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]" style={{ '--layout-header-height': '48px' }}>
      <Sidebar collapsed={collapsed} />

      {/* Offset content by sidebar width */}
      <div
        className={cn(
          'transition-all duration-300',
          collapsed ? 'ps-16' : 'ps-60'
        )}
        style={{
          '--messenger-sidebar-width': 'min(390px, calc(100vw - 72px))',
          '--tasks-sidebar-width': 'min(390px, calc(100vw - 72px))',
          paddingInlineEnd: 'calc(var(--layout-right-sidebar-offset, 0px) + var(--layout-page-drawer-offset, 0px))',
        }}
      >
        <Header
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((c) => !c)}
          messengerSidebarOpen={messengerSidebarOpen}
          onToggleMessengerSidebar={() => {
            setMessengerSidebarOpen((open) => {
              const next = !open
              if (next) {
                setTasksSidebarOpen(false)
                setGmailSidebarOpen(false)
                setWhatsappSidebarOpen(false)
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
              }
              return next
            })
          }}
          tasksSidebarOpen={tasksSidebarOpen}
          onToggleTasksSidebar={() => {
            setTasksSidebarOpen((open) => {
              const next = !open
              if (next) {
                setMessengerSidebarOpen(false)
                setGmailSidebarOpen(false)
                setWhatsappSidebarOpen(false)
              }
              return next
            })
          }}
        />

        <main className="min-h-screen" style={{ paddingTop: 'var(--layout-header-height, 48px)' }}>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

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
    </div>
  )
}
