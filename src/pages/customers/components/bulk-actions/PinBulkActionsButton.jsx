import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, PanelTop, Pin, PinOff, Sidebar } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'

const PIN_OPTIONS = [
  { value: 'horizontal', label: 'تثبيت أفقي', description: 'أعلى الصفحة', icon: PanelTop },
  { value: 'vertical', label: 'تثبيت رأسي', description: 'أعلى القائمة الجانبية', icon: Sidebar },
  { value: 'none', label: 'إلغاء التثبيت', description: 'داخل الجدول فقط', icon: PinOff },
]

export function PinBulkActionsButton({ pinMode = 'none', onPinModeChange }) {
  const [open, setOpen] = useState(false)
  const buttonWrapRef = useRef(null)
  const menuRef = useRef(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 224 })
  const pinned = pinMode !== 'none'
  const label = 'خيارات تثبيت إجراءات العملاء المحددين'

  const updateMenuPosition = () => {
    const button = buttonWrapRef.current
    if (!button || typeof window === 'undefined') return

    const rect = button.getBoundingClientRect()
    const width = 224
    const margin = 8
    const top = Math.min(rect.bottom + margin, window.innerHeight - 196)
    const left = Math.min(
      Math.max(rect.right - width, margin),
      Math.max(margin, window.innerWidth - width - margin)
    )

    setMenuPosition({
      top: Math.max(margin, top),
      left,
      width,
    })
  }

  useEffect(() => {
    if (!open) return undefined

    updateMenuPosition()

    const handleClickOutside = (event) => {
      const target = event.target
      if (!menuRef.current?.contains(target) && !buttonWrapRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [open])

  return (
    <div ref={buttonWrapRef} className="relative">
      <Button
        size="icon"
        variant={pinned ? 'primary' : 'outline'}
        onClick={() => setOpen((value) => !value)}
        title={`${label} (Ctrl + P للتبديل الأفقي)`}
        aria-label={`${label} (Ctrl + P للتبديل الأفقي)`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {pinned ? <PinOff size={15} /> : <Pin size={15} />}
      </Button>

      {open && typeof document !== 'undefined' ? createPortal(
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-[250000] max-h-[min(320px,calc(100vh-16px))] overflow-auto rounded-xl border border-[#D7EEF0] bg-white p-1.5 text-start shadow-2xl"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            width: menuPosition.width,
          }}
        >
          {PIN_OPTIONS.map((option) => {
            const Icon = option.icon
            const active = pinMode === option.value

            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  onPinModeChange?.(option.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-xs transition-colors',
                  active ? 'bg-[#E8F9FA] text-[#007A80]' : 'text-[var(--text)] hover:bg-[#F8FAFC]'
                )}
              >
                <Icon size={15} className="shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block font-black">{option.label}</span>
                  <span className="mt-0.5 block text-[11px] font-semibold text-[var(--text-muted)]">
                    {option.description}
                  </span>
                </span>
                {active ? <Check size={14} className="shrink-0" /> : null}
              </button>
            )
          })}
        </div>,
        document.body
      ) : null}
    </div>
  )
}
