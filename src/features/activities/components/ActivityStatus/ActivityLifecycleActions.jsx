import { CalendarPlus, Eye, FileCheck2, Pencil, Play, Trash2, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../../shared/components/ui/Button'

function stop(event, action) {
  event.stopPropagation()
  action?.()
}

export function ActivityLifecycleActions({
  activity,
  onView,
  onEdit,
  onStart,
  onFinish,
  onCancel,
  onDelete,
  onFollowUp,
  compact = false,
  isBusy = false,
}) {
  const { t } = useTranslation()
  const status = activity?.status
  const buttonSize = compact ? 'icon' : 'sm'
  const viewLabel = t('activities.lifecycleActions.view')
  const startLabel = t('activities.meetingDrawer.start')
  const editLabel = t('actions.edit')
  const cancelLabel = t('actions.cancel')
  const finishLabel = t('activities.meetingDrawer.finish')
  const followUpLabel = t('activities.lifecycleActions.followUp')
  const deleteLabel = t('actions.delete')

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button size={buttonSize} variant="ghost" title={viewLabel} onClick={(event) => stop(event, onView)}>
        <Eye size={14} />
        {!compact && viewLabel}
      </Button>
      {status === 'scheduled' ? (
        <>
          <Button size={buttonSize} variant="ai" loading={isBusy} title={startLabel} onClick={(event) => stop(event, onStart)}>
            <Play size={14} />
            {!compact && startLabel}
          </Button>
          <Button size={buttonSize} variant="ghost" title={editLabel} onClick={(event) => stop(event, onEdit)}>
            <Pencil size={14} />
            {!compact && editLabel}
          </Button>
          <Button size={buttonSize} variant="outline" title={cancelLabel} onClick={(event) => stop(event, onCancel)}>
            <XCircle size={14} />
            {!compact && cancelLabel}
          </Button>
        </>
      ) : null}
      {status === 'in_progress' ? (
        <Button size={buttonSize} variant="ai" title={finishLabel} onClick={(event) => stop(event, onFinish)}>
          <FileCheck2 size={14} />
          {!compact && finishLabel}
        </Button>
      ) : null}
      {status === 'completed' ? (
        <Button size={buttonSize} variant="ghost" title={followUpLabel} onClick={(event) => stop(event, onFollowUp)}>
          <CalendarPlus size={14} />
          {!compact && followUpLabel}
        </Button>
      ) : null}
      <Button size={buttonSize} variant="ghost" title={deleteLabel} onClick={(event) => stop(event, onDelete)}>
        <Trash2 size={14} />
        {!compact && deleteLabel}
      </Button>
    </div>
  )
}
