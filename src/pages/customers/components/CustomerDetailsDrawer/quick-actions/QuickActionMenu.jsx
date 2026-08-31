import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

import { cn } from '../../../../../shared/utils/cn'

export function QuickActionMenu({ icon: Icon, label, accentClassName, alert = false, alertTitle, options = [] }) {
  const [open, setOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const hint = `${label} - اضغط مطولًا واسحب يمين أو يسار لتغيير الترتيب`

  const updateMenuPosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return

    const menuWidth = 208
    const margin = 8
    const top = rect.bottom + 8
    const availableTop = rect.top - 8
    const shouldOpenUp = top + 180 > window.innerHeight && availableTop > 180

    setMenuPosition({
      top: shouldOpenUp ? rect.top - 8 : top,
      left: Math.min(Math.max(rect.left, margin), window.innerWidth - menuWidth - margin),
      transform: shouldOpenUp ? 'translateY(-100%)' : 'none',
    })
  }

  useEffect(() => {
    if (!open) return undefined
    updateMenuPosition()

    const closeOnOutsidePointerDown = (event) => {
      if (buttonRef.current?.contains(event.target)) return
      if (menuRef.current?.contains(event.target)) return
      setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointerDown, true)
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointerDown, true)
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [open])

  return (
    <div className="relative min-w-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
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
        <Icon size={15} className="shrink-0" />
        <span className="hidden sm:inline">{label}</span>
        <ChevronDown size={11} className="shrink-0 text-[var(--text-muted)]" />
      </button>

      {open && menuPosition && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[120] w-52 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-2xl"
          style={menuPosition}
        >
          {options.map((option) => {
            const OptionIcon = option.icon

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  option.onClick?.()
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-xs font-bold text-[var(--text)] transition-colors hover:bg-[#E8F9FA] hover:text-[#007A80]"
              >
                {OptionIcon && <OptionIcon size={15} className="shrink-0" />}
                <span className="min-w-0 truncate">{option.label}</span>
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}
