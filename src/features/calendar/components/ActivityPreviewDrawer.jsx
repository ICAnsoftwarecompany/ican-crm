import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarClock, Pencil, User } from 'lucide-react'
import { AppDrawer } from '../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../shared/components/ui/Button'
import { ActivityFormDialog } from '../../activities'
import { formatDate, formatTime } from '../../../shared/utils/dateTime'

/**
 * A lightweight, read-mostly preview for a Meeting/Call calendar event.
 * Deliberately NOT a reimplementation of the full ActivityDrawer (which
 * needs onStart/onFinish/onCancel/... handlers currently owned by
 * ActivitiesPage) — editing delegates to the existing, self-sufficient
 * ActivityFormDialog instead of duplicating that lifecycle logic here.
 */
export function ActivityPreviewDrawer({ activity, open, onClose, onSaved }) {
  const { t, i18n } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)

  if (!activity) return null

  return (
    <>
      <AppDrawer
        open={open && !isEditing}
        onClose={onClose}
        title={activity.title}
        description={activity.type === 'call' ? t('calendar.sources.calls') : t('calendar.sources.meetings')}
        size="md"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
            <CalendarClock size={16} className="text-[var(--text-muted)]" />
            {formatDate(activity.startAt, i18n.language, { dateStyle: 'medium' })} • {formatTime(activity.startAt, i18n.language)}
          </div>

          {activity.relatedEntity?.name && (
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
              <User size={16} className="text-[var(--text-muted)]" />
              {activity.relatedEntity.name}
            </div>
          )}

          {activity.description && (
            <p className="rounded-lg bg-[var(--surface-2)] p-2 text-sm text-[var(--text)]">{activity.description}</p>
          )}

          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil size={14} />
            {t('actions.edit')}
          </Button>
        </div>
      </AppDrawer>

      <ActivityFormDialog
        isOpen={isEditing}
        activity={activity}
        onClose={() => setIsEditing(false)}
        onSaved={() => {
          setIsEditing(false)
          onSaved?.()
        }}
      />
    </>
  )
}
