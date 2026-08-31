import { Button } from '../ui/Button'
import { MessengerLogoIcon } from '../../../features/conversations/components/MessengerNavbarButton'

function renderToolbarTitle(title) {
  if (typeof title === 'string' && (title.includes('ماسنجر') || title.includes('ظ…ط§ط³ظ†ط¬ط±'))) {
    return (
      <span className="inline-flex items-center gap-2">
        <MessengerLogoIcon size={24} />
        <span>{'\u0645\u062d\u0627\u062f\u062b\u0627\u062a \u0645\u0627\u0633\u0646\u062c\u0631'}</span>
      </span>
    )
  }

  return title
}

export function PageToolbar({ title, description, actionLabel, actionIcon, onAction, children }) {
  return (
    <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-xl font-bold font-arabic text-[var(--text)]">{renderToolbarTitle(title)}</h1>
        {description && (
          <p className="mt-1 text-sm leading-6 font-arabic text-[var(--text-muted)]">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {actionLabel && (
          <Button size="md" onClick={onAction}>
            {actionIcon}
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
