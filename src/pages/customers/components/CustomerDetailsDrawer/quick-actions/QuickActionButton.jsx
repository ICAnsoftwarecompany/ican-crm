import { createElement, isValidElement } from 'react'

import { cn } from '../../../../../shared/utils/cn'

export function QuickActionButton({
  icon: Icon,
  label,
  accentClassName,
  alert = false,
  alertTitle,
  onClick,
  badgeContent = null,
  hideLabel = false,
}) {
  const hint = `${label} - اضغط مطولا واسحب يمين أو يسار لتغيير الترتيب`
  const iconNode = isValidElement(Icon)
    ? Icon
    : createElement(Icon, { size: 15, className: 'shrink-0' })

  return (
    <button
      type="button"
      onClick={onClick}
      title={alertTitle || hint}
      aria-label={alertTitle || hint}
      className={cn(
        'relative inline-flex h-8 min-w-0 items-center justify-center gap-1 rounded-lg border border-[#D9EEF0] bg-white px-2 text-[10px] font-black text-[var(--text)] shadow-sm transition-colors hover:border-[#00C2CB] hover:bg-[#F8FEFF]',
        accentClassName,
        alert && 'border-red-300 bg-red-50 text-red-700 hover:border-red-500 hover:bg-red-100'
      )}
    >
      {alert && (
        <span className="absolute -end-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
      )}
      {iconNode}
      {badgeContent !== null && badgeContent !== undefined && badgeContent !== '' && (
        <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1.5 py-0.5 text-[9px] font-black leading-none text-white">
          {badgeContent}
        </span>
      )}
      {!hideLabel && <span className="hidden sm:inline">{label}</span>}
    </button>
  )
}
