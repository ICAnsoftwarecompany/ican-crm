import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle, Bell, CalendarDays, CheckCheck, ChevronDown, ChevronUp,
  ExternalLink, ListTodo, PanelRightClose, Pin, Settings2, X,
} from 'lucide-react'
import { useMyTasks } from '../../../features/my-work'
import { useAlerts } from '../../../features/alerts'
import { useUnreadNotifications } from '../../../features/notifications'
import { getTaskTitle, getTaskDueDate, getTaskDueTime, isTaskOverdue } from '../../../features/tasks/utils/taskMeta'
import { useLocalStorage } from '../data-table/hooks/useLocalStorage'
import { useTaskMutations } from '../../../features/tasks'

const SECTIONS = ['overdue', 'today', 'alerts', 'notifications']
const sectionPath = { overdue: '/my-work', today: '/my-work', alerts: '/my-work', notifications: '/my-work' }
const icons = { overdue: AlertTriangle, today: CalendarDays, alerts: AlertTriangle, notifications: Bell }
const isInternalPath = (path) => typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')
const taskDate = (task) => [getTaskDueDate(task), getTaskDueTime(task)].filter(Boolean).join(' · ')

function WorkSection({ id, items, expanded, onExpand, onNavigate, onComplete, completing, t }) {
  const Icon = icons[id]
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <button type="button" onClick={onExpand} aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 px-3 py-3 text-start hover:bg-[var(--surface-2)]">
        <span className="flex min-w-0 items-center gap-2">
          <Icon size={16} className={id === 'overdue' ? 'text-red-500' : 'text-[var(--brand-accent)]'} />
          <span className="text-sm font-bold text-[var(--text)]">{t('workspacePanel.sections.' + id)}</span>
          <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs font-bold text-[var(--text-muted)]">{items.length}</span>
        </span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expanded && (
        <div className="border-t border-[var(--border)]">
          {items.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-[var(--text-muted)]">{t('workspacePanel.empty')}</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {items.slice(0, 8).map((item) => (
                <li key={item.id} className="flex items-start gap-2 px-3 py-2.5 hover:bg-[var(--surface-2)]">
                  {item.task && (
                    <button type="button" disabled={completing} onClick={() => onComplete(item.id)}
                      aria-label={t('workspacePanel.completeTask')} title={t('workspacePanel.completeTask')}
                      className="mt-0.5 shrink-0 rounded p-1 text-[var(--text-muted)] hover:text-emerald-600 disabled:opacity-40">
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button type="button" className="min-w-0 flex-1 text-start" onClick={() => onNavigate(item.target || sectionPath[id])}>
                    <span className="block break-words text-sm font-semibold text-[var(--text)]">{item.title}</span>
                    {item.description && <span className="mt-0.5 block break-words text-xs text-[var(--text-muted)]">{item.description}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={() => onNavigate(sectionPath[id])}
            className="flex w-full items-center justify-center gap-1 border-t border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--brand-accent)] hover:bg-[var(--surface-2)]">
            {t('workspacePanel.openFullPage')} <ExternalLink size={13} />
          </button>
        </div>
      )}
    </section>
  )
}

export function SmartWorkspacePanel({ open, mode, onClose, onModeChange }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [tab, setTab] = useLocalStorage('smart-work-hub-tab', 'overview')
  const [expanded, setExpanded] = useLocalStorage('smart-work-hub-expanded', ['overdue', 'today'])
  const [visibleSections, setVisibleSections] = useLocalStorage('smart-work-hub-sections', SECTIONS)
  const [wide, setWide] = useLocalStorage('smart-work-hub-wide', false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [completeError, setCompleteError] = useState(false)

  // Always call hooks in the same order; only request alerts/notifications while open.
  const tasks = useMyTasks()
  const alerts = useAlerts({ enabled: open })
  const notifications = useUnreadNotifications({ enabled: open })
  const taskMutations = useTaskMutations()

  const sections = useMemo(() => {
    const now = new Date()
    const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
    const taskItem = (task) => ({ id: task.id, title: getTaskTitle(task, t), description: taskDate(task), target: '/tasks', task: true })
    const due = Array.isArray(tasks.due) ? tasks.due : []
    const late = due.filter((task) => isTaskOverdue(task, now))
    const current = due.filter((task) => !isTaskOverdue(task, now) && getTaskDueDate(task) === today)
    return {
      overdue: late.map(taskItem),
      today: current.map(taskItem),
      alerts: (alerts.data || []).map((item) => ({ id: item.id, title: item.title || item.message || t('workspacePanel.sections.alerts'), description: item.title ? item.message : '', target: item.target })),
      notifications: (notifications.data || []).map((item) => ({ id: item.id, title: item.title || t('workspacePanel.notificationFallback'), description: item.message, target: item.target })),
    }
  }, [tasks.due, alerts.data, notifications.data, t])

  if (!open) return null

  const navigateTo = (path) => {
    if (isInternalPath(path)) {
      navigate(path)
      if (mode !== 'docked') onClose()
    }
  }
  const toggleSection = (id) => setExpanded((old) => {
    const list = Array.isArray(old) ? old : []
    return list.includes(id) ? list.filter((key) => key !== id) : [...list, id]
  })
  const toggleVisible = (id) => setVisibleSections((old) => {
    const list = Array.isArray(old) ? old : SECTIONS
    return list.includes(id) ? list.filter((key) => key !== id) : [...list, id]
  })
  const completeTask = (id) => {
    setCompleteError(false)
    taskMutations.changeStatus.mutate({ taskId: id, payload: { status: 'completed' } }, {
      onError: () => setCompleteError(true),
    })
  }
  const selected = tab === 'tasks' ? ['overdue', 'today'] : tab === 'notifications' ? ['notifications', 'alerts'] : SECTIONS
  const displayed = selected.filter((id) => (Array.isArray(visibleSections) ? visibleSections : SECTIONS).includes(id))
  const loading = tasks.isLoading || alerts.isLoading || notifications.isLoading
  const error = tasks.error || alerts.error || notifications.error

  return (
    <>
      <button type="button" aria-label={t('workspacePanel.close')} onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/30 ${mode === 'docked' ? 'lg:hidden' : ''}`} />
      <aside aria-label={t('workspacePanel.title')}
        className="fixed bottom-0 end-0 top-12 z-40 flex flex-col border-s border-[var(--border)] bg-[var(--surface)] shadow-xl"
        style={{ width: wide ? 'min(420px, calc(100vw - 24px))' : 'min(320px, calc(100vw - 24px))' }}>
        <header className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-3">
          <div>
            <h2 className="text-base font-black text-[var(--text)]">{t('workspacePanel.title')}</h2>
            <p className="text-xs text-[var(--text-muted)]">{t('workspacePanel.subtitle')}</p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" aria-label={t('workspacePanel.customize')} title={t('workspacePanel.customize')}
              onClick={() => setSettingsOpen((value) => !value)} className="rounded-lg p-2 hover:bg-[var(--surface-2)]"><Settings2 size={17} /></button>
            <button type="button" aria-label={t(mode === 'docked' ? 'workspacePanel.float' : 'workspacePanel.pin')}
              title={t(mode === 'docked' ? 'workspacePanel.float' : 'workspacePanel.pin')}
              onClick={() => onModeChange(mode === 'docked' ? 'overlay' : 'docked')}
              className="hidden rounded-lg p-2 hover:bg-[var(--surface-2)] lg:inline-flex">{mode === 'docked' ? <PanelRightClose size={17} /> : <Pin size={17} />}</button>
            <button type="button" aria-label={t('workspacePanel.close')} onClick={onClose} className="rounded-lg p-2 hover:bg-[var(--surface-2)]"><X size={18} /></button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="mb-3 grid grid-cols-3 gap-2">
            {['overdue', 'today', 'alerts'].map((id) => (
              <div key={id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2 py-3 text-center">
                <strong className={`block text-xl tabular-nums ${id === 'overdue' ? 'text-red-600' : 'text-[var(--text)]'}`}>{sections[id].length}</strong>
                <span className="text-[11px] text-[var(--text-muted)]">{t('workspacePanel.sections.' + id)}</span>
              </div>
            ))}
          </div>
          {settingsOpen && (
            <div className="mb-3 rounded-xl border border-[var(--border)] p-3">
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold">
                <input type="checkbox" checked={wide} onChange={(event) => setWide(event.target.checked)} />
                {t('workspacePanel.wide')}
              </label>
              {SECTIONS.map((id) => (
                <label key={id} className="flex items-center gap-2 py-1 text-xs">
                  <input type="checkbox" checked={(Array.isArray(visibleSections) ? visibleSections : SECTIONS).includes(id)}
                    onChange={() => toggleVisible(id)} />
                  {t('workspacePanel.sections.' + id)}
                </label>
              ))}
            </div>
          )}
          <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-[var(--surface-2)] p-1" role="tablist">
            {['overview', 'tasks', 'notifications'].map((id) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={`rounded-lg px-1 py-2 text-xs font-bold ${tab === id ? 'bg-[var(--surface)] text-[var(--brand-accent)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
                {t('workspacePanel.views.' + id)}
              </button>
            ))}
          </div>
          {loading && <p className="mb-2 text-xs text-[var(--text-muted)]">{t('workspacePanel.loading')}</p>}
          {error && <p role="alert" className="mb-2 text-xs text-red-600">{t('workspacePanel.error')}</p>}
          {completeError && <p role="alert" className="mb-2 text-xs text-red-600">{t('workspacePanel.completeError')}</p>}
          <div className="space-y-2">
            {displayed.map((id) => (
              <WorkSection key={id} id={id} items={sections[id]}
                expanded={(Array.isArray(expanded) ? expanded : []).includes(id)}
                onExpand={() => toggleSection(id)} onNavigate={navigateTo} onComplete={completeTask}
                completing={taskMutations.changeStatus.isPending} t={t} />
            ))}
            {!displayed.length && <p className="py-6 text-center text-sm text-[var(--text-muted)]">{t('workspacePanel.empty')}</p>}
          </div>
        </div>
        <button type="button" onClick={() => navigateTo('/my-work')}
          className="flex items-center justify-center gap-2 border-t border-[var(--border)] p-3 text-xs font-bold text-[var(--brand-accent)] hover:bg-[var(--surface-2)]">
          <ListTodo size={15} />{t('workspacePanel.openFullPage')}<ExternalLink size={14} />
        </button>
      </aside>
    </>
  )
}
