import { CalendarPlus, Eye, FileCheck2, Pencil, Play, Trash2, XCircle } from 'lucide-react'
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
  const status = activity?.status
  const buttonSize = compact ? 'icon' : 'sm'

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button size={buttonSize} variant="ghost" title="عرض" onClick={(event) => stop(event, onView)}>
        <Eye size={14} />
        {!compact && 'عرض'}
      </Button>
      {status === 'scheduled' ? (
        <>
          <Button size={buttonSize} variant="ai" loading={isBusy} title="بدء" onClick={(event) => stop(event, onStart)}>
            <Play size={14} />
            {!compact && 'بدء'}
          </Button>
          <Button size={buttonSize} variant="ghost" title="تعديل" onClick={(event) => stop(event, onEdit)}>
            <Pencil size={14} />
            {!compact && 'تعديل'}
          </Button>
          <Button size={buttonSize} variant="outline" title="إلغاء" onClick={(event) => stop(event, onCancel)}>
            <XCircle size={14} />
            {!compact && 'إلغاء'}
          </Button>
        </>
      ) : null}
      {status === 'in_progress' ? (
        <Button size={buttonSize} variant="ai" title="إنهاء" onClick={(event) => stop(event, onFinish)}>
          <FileCheck2 size={14} />
          {!compact && 'إنهاء'}
        </Button>
      ) : null}
      {status === 'completed' ? (
        <Button size={buttonSize} variant="ghost" title="متابعة" onClick={(event) => stop(event, onFollowUp)}>
          <CalendarPlus size={14} />
          {!compact && 'متابعة'}
        </Button>
      ) : null}
      <Button size={buttonSize} variant="ghost" title="حذف" onClick={(event) => stop(event, onDelete)}>
        <Trash2 size={14} />
        {!compact && 'حذف'}
      </Button>
    </div>
  )
}
