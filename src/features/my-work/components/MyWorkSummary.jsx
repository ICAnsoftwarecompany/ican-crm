import { useTranslation } from 'react-i18next'
import { AlarmClock, CalendarClock, CheckSquare, MessagesSquare } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import { useConversationUnreadSummary } from '../../conversations'
import { useChatUnreadCount } from '../../internal-chat'
import { useMyActivities } from '../hooks/useMyActivities'
import { useMyTasks } from '../hooks/useMyTasks'

function Tile({ icon: Icon, label, value, danger, targetId }) {
  const content = (
    <>
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          danger ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300' : 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
        )}
      >
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block font-latin text-2xl font-bold leading-none text-[var(--text)]">{value ?? '—'}</span>
        <span className="mt-1 block truncate text-xs text-[var(--text-muted)]">{label}</span>
      </span>
    </>
  )

  return (
    <a
      href={`#my-work-${targetId}`}
      className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
    >
      {content}
    </a>
  )
}

/** Four numbers that answer "how much is waiting for me right now?". Each jumps to its section. */
export function MyWorkSummary() {
  const { t } = useTranslation()
  const activities = useMyActivities()
  const tasks = useMyTasks()
  const conversations = useConversationUnreadSummary()
  const chat = useChatUnreadCount()

  const overdue = activities.isLoading || tasks.isLoading ? null : activities.overdue.length + tasks.overdue.length
  const today = activities.isLoading ? null : activities.today.length
  const due = tasks.isLoading ? null : tasks.due.length
  const unread = conversations.isLoading && chat.isLoading ? null : conversations.counts.total + (chat.unreadCount || 0)

  return (
    <section aria-label={t('myWork.summary.label')} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile icon={AlarmClock} label={t('myWork.summary.overdue')} value={overdue} danger={overdue > 0} targetId="overdue" />
      <Tile icon={CalendarClock} label={t('myWork.summary.today')} value={today} targetId="today" />
      <Tile icon={CheckSquare} label={t('myWork.summary.tasks')} value={due} targetId="tasks" />
      <Tile icon={MessagesSquare} label={t('myWork.summary.unread')} value={unread} targetId="messages" />
    </section>
  )
}
