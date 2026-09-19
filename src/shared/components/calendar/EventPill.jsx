import { useTranslation } from 'react-i18next'
import { cn } from '../../utils/cn'
import { formatTime } from '../../utils/dateTime'

export function EventPill({ event, source, onClick, className, dense = false }) {
  const { i18n } = useTranslation()
  const colorVar = source?.colorVar || '--brand-accent'

  return (
    <button
      type="button"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation()
        onClick?.(event)
      }}
      title={event.title}
      className={cn(
        'flex w-full items-center gap-1 truncate rounded-md px-1.5 text-start font-bold text-white',
        dense ? 'py-0.5 text-[10px]' : 'py-1 text-[11px]',
        className
      )}
      style={{ backgroundColor: `var(${colorVar})` }}
    >
      {!event.allDay && (
        <span className="shrink-0 opacity-90">{formatTime(event.start, i18n.language)}</span>
      )}
      <span className="truncate">{event.title}</span>
    </button>
  )
}
