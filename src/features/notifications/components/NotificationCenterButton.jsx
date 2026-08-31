import { Bell } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import {
  selectNotificationUnreadCount,
  useNotificationCenterStore,
} from '../store/notificationCenterStore'
import { NotificationCenterPanel } from './NotificationCenterPanel'

export function NotificationCenterButton() {
  const open = useNotificationCenterStore((state) => state.open)
  const toggleOpen = useNotificationCenterStore((state) => state.toggleOpen)
  const unreadCount = useNotificationCenterStore(selectNotificationUnreadCount)

  return (
    <div className="relative" data-notification-center-root>
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          'relative h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-colors',
          open
            ? 'border-[#0F766E] bg-[#ECFDF5] text-[#0F766E]'
            : 'border-[#E5E7EB] bg-white text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111827]'
        )}
        aria-label="مركز التنبيهات"
        title="مركز التنبيهات"
      >
        <Bell size={16} />
        {unreadCount > 0 ? (
          <span className="absolute -top-1.5 -end-1.5 min-w-5 h-5 rounded-full bg-[#EF4444] px-1 text-[10px] font-black leading-5 text-white shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      <NotificationCenterPanel open={open} />
    </div>
  )
}
