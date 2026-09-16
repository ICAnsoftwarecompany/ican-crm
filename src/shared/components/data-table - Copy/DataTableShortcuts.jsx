import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Keyboard, MousePointerClick } from 'lucide-react'

const shortcuts = [
  { keys: ['Ctrl', 'A'], label: 'تحديد كل الصفوف المفلترة / إلغاء تحديد الكل' },
  { keys: ['Ctrl', 'Click'], label: 'تحديد صف واحد أو إلغاء تحديده' },
  { keys: ['Double Click'], label: 'فتح تفاصيل الصف عند توفرها' },
  { keys: ['Right Click'], label: 'فتح إجراءات الصفوف المحددة' },
  { keys: ['Click Text'], label: 'نسخ قيمة النص داخل الخلية' },
  { keys: ['Drag Header'], label: 'تغيير ترتيب الأعمدة يمينا ويسارا' },
  { keys: ['Resize'], label: 'تغيير عرض العمود من حافة العنوان' },
]

function ShortcutKeys({ keys }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      {keys.map((key) => (
        <kbd
          key={key}
          className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-black text-[var(--text)] shadow-sm"
        >
          {key}
        </kbd>
      ))}
    </span>
  )
}

export function DataTableShortcuts() {
  const [open, setOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const wrapperRef = useRef(null)
  const menuRef = useRef(null)

  const updateMenuPosition = () => {
    if (typeof window === 'undefined') return

    const rect = wrapperRef.current?.getBoundingClientRect()
    if (!rect) return

    const menuWidth = 320
    const margin = 12
    const left = Math.max(
      margin,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - margin)
    )
    const top = Math.min(rect.bottom + 8, window.innerHeight - margin)

    setMenuPosition({ top, left })
  }

  useEffect(() => {
    if (!open) return undefined

    const closeOnOutsidePointer = (event) => {
      if (wrapperRef.current?.contains(event.target)) return
      if (menuRef.current?.contains(event.target)) return
      setOpen(false)
    }

    updateMenuPosition()
    document.addEventListener('pointerdown', closeOnOutsidePointer, true)
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer, true)
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [open])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => {
          updateMenuPosition()
          setOpen((value) => !value)
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
        title="اختصارات الجدول"
        aria-label="اختصارات الجدول"
      >
        <Keyboard size={16} />
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[120] w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-start shadow-2xl"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <div className="mb-2 flex items-center gap-2 border-b border-[var(--border)] pb-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
              <MousePointerClick size={16} />
            </span>
            <div>
              <h3 className="text-sm font-black text-[var(--text)]">اختصارات الجدول</h3>
              <p className="text-xs text-[var(--text-muted)]">أوامر سريعة أثناء العمل على البيانات.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {shortcuts.map((shortcut) => (
              <div
                key={`${shortcut.keys.join('-')}-${shortcut.label}`}
                className="flex min-w-0 items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-[var(--surface-2)]"
              >
                <span className="min-w-0 text-xs font-semibold text-[var(--text-muted)]">{shortcut.label}</span>
                <ShortcutKeys keys={shortcut.keys} />
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
