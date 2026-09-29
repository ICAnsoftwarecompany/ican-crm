import { BellOff } from 'lucide-react'
import { ResourceState } from '../../../shared/components/data/ResourceState'
import { NotificationItem } from './NotificationItem'
import { getNotificationGroup } from '../utils/notificationTime'

export function NotificationList({ notifications, isLoading, error, onRetry, onOpen, onRead, isPending, emptyTitle, emptyDescription, t }) {
  const groups = notifications.reduce((result, notification) => {
    const key = getNotificationGroup(notification.createdAt, t)
    result[key] = [...(result[key] || []), notification]
    return result
  }, {})

  return (
    <ResourceState isLoading={isLoading} error={error} onRetry={onRetry} empty={!isLoading && !error && !notifications.length} emptyIcon={<BellOff size={24} />} emptyTitle={emptyTitle} emptyDescription={emptyDescription}>
      <div>
        {Object.entries(groups).map(([label, items]) => (
          <section key={label}>
            <h3 className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-[11px] font-bold text-[var(--text-muted)]">{label}</h3>
            {items.map((notification) => <NotificationItem key={notification.id} notification={notification} onOpen={onOpen} onRead={onRead} isPending={isPending} />)}
          </section>
        ))}
      </div>
    </ResourceState>
  )
}
