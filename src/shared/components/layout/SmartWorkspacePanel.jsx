import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Bell, CheckSquare, ExternalLink, PanelRightClose, X } from 'lucide-react'
import { useMyTasks } from '../../../features/my-work'
import { useAlerts } from '../../../features/alerts'
import { useUnreadNotifications } from '../../../features/notifications'
import { getTaskTitle, getTaskDueDate, getTaskDueTime } from '../../../features/tasks/utils/taskMeta'

const TABS = [
  { id: 'tasks', icon: CheckSquare, path: '/my-work' },
  { id: 'alerts', icon: AlertTriangle, path: '/service' },
  { id: 'notifications', icon: Bell, path: '/my-work' },
]

function WorkspaceBody({ tab, onNavigate }) {
  const { t } = useTranslation()
  // These are existing CRM hooks and APIs, not placeholder/demo counters.
  const tasks = useMyTasks()
  const alerts = useAlerts({ enabled: tab === 'alerts' })
  const notifications = useUnreadNotifications({ enabled: tab === 'notifications' })
  const state = tab === 'tasks'
    ? { loading: tasks.isLoading, error: tasks.error, items: tasks.due.map((task) => ({
        id: task.id,
        title: getTaskTitle(task, t),
        description: [getTaskDueDate(task), getTaskDueTime(task)].filter(Boolean).join(' · '),
        target: '/tasks',
      })) }
    : tab === 'alerts'
      ? { loading: alerts.isLoading, error: alerts.error, items: (alerts.data || []).map((item) => ({
          id: item.id, title: item.title, description: item.message, target: item.target,
        })) }
      : { loading: notifications.isLoading, error: notifications.error, items: (notifications.data || []).map((item) => ({
          id: item.id, title: item.title || t('workspacePanel.notificationFallback'),
          description: item.message, target: item.target,
        })) }

  if (state.loading) return <p className="p-4 text-sm text-[var(--text-muted)]">{t('workspacePanel.loading')}</p>
  if (state.error) return <p role="alert" className="p-4 text-sm text-red-600">{t('workspacePanel.error')}</p>
  if (!state.items.length) return <p className="p-4 text-sm text-[var(--text-muted)]">{t('workspacePanel.empty')}</p>

  return (
    <ul className="space-y-2 p-3">
      {state.items.slice(0, 20).map((item) => (
        <li key={item.id}>
          <button type="button" onClick={() => onNavigate(item.target || TABS.find((entry) => entry.id === tab).path)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-start transition-colors hover:border-[var(--brand-accent)]">
            <span className="block text-sm font-bold text-[var(--text)]">{item.title}</span>
            {item.description && <span className="mt-1 block break-words text-xs leading-5 text-[var(--text-muted)]">{item.description}</span>}
          </button>
        </li>
      ))}
    </ul>
  )
}

/** Shared, extensible CRM work panel. Mounted only when opened to avoid background requests. */
export function SmartWorkspacePanel({ open, mode, onClose, onModeChange }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [tab, setTab] = useState('tasks')
  if (!open) return null

  const handleNavigate = (target) => {
    if (target && target.startsWith('/') && !target.startsWith('//')) {
      navigate(target)
      onClose()
    }
  }

  return (
    <>
      <button type="button" aria-label={t('workspacePanel.close')} onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/30 ${mode === 'docked' ? 'lg:hidden' : ''}`} />
      <aside aria-label={t('workspacePanel.title')} className="fixed bottom-0 end-0 top-12 z-40 flex w-[min(340px,calc(100vw-24px))] flex-col border-s border-[var(--border)] bg-[var(--surface)] shadow-xl"
        style={{ maxWidth: 'calc(100vw - 24px)' }}>
        <header className="flex items-center justify-between gap-2 border-b border-[var(--border)] p-3">
          <h2 className="text-base font-black text-[var(--text)]">{t('workspacePanel.title')}</h2>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => onModeChange(mode === 'docked' ? 'overlay' : 'docked')}
              aria-label={t(mode === 'docked' ? 'workspacePanel.float' : 'workspacePanel.pin')}
              title={t(mode === 'docked' ? 'workspacePanel.float' : 'workspacePanel.pin')}
              className="hidden rounded-lg p-2 hover:bg-[var(--surface-2)] lg:inline-flex">
              <PanelRightClose size={17} />
            </button>
            <button type="button" onClick={onClose} aria-label={t('workspacePanel.close')}
              className="rounded-lg p-2 hover:bg-[var(--surface-2)]"><X size={18} /></button>
          </div>
        </header>
        <div className="grid grid-cols-3 gap-1 border-b border-[var(--border)] p-2" role="tablist" aria-label={t('workspacePanel.title')}>
          {TABS.map(({ id, icon: Icon }) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-xs font-bold ${tab === id ? 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'}`}>
              <Icon size={17} />{t(`workspacePanel.tabs.${id}`)}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto" role="tabpanel">
          <WorkspaceBody tab={tab} onNavigate={handleNavigate} />
        </div>
        <button type="button" onClick={() => handleNavigate(TABS.find((item) => item.id === tab).path)}
          className="flex items-center justify-center gap-2 border-t border-[var(--border)] p-3 text-xs font-bold text-[var(--brand-accent)] hover:bg-[var(--surface-2)]">
          <ExternalLink size={15} />{t('workspacePanel.openFullPage')}
        </button>
      </aside>
    </>
  )
}
