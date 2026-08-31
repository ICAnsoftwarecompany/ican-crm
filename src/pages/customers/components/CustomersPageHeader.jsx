import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Plus, Upload } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { CustomersTrashButton } from '../pages/TrashCustomer/CustomersTrashButton'
import { CustomersPageShortcuts } from './CustomersPageShortcuts'

export function CustomersPageHeader({
  title,
  description,
  onAdd,
  onImport,
  onExport,
  onTrash,
  trashActive = false,
  onTableSettings,
}) {
  const [moreOpen, setMoreOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!moreOpen) return

    const onClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMoreOpen(false)
      }
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMoreOpen(false)
    }

    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [moreOpen])

  return (
    <header className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-base font-bold leading-6 text-[var(--text)]">{title}</h1>
          {description && (
            <p className="max-w-3xl truncate text-xs leading-5 text-[var(--text-muted)]">{description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CustomersPageShortcuts />

          {(onAdd || onImport) && (
            <div ref={menuRef} className="relative">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setMoreOpen((value) => !value)}
                  className="gap-2"
                aria-haspopup="menu"
                aria-expanded={moreOpen}
              >
                <Plus size={16} />
                إجراء عميل
                <ChevronDown size={14} className={moreOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </Button>

              {moreOpen && (
                <div
                  className="absolute end-0 top-full z-50 mt-2 w-48 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl"
                  role="menu"
                >
                  {onAdd && (
                    <button
                      type="button"
                      onClick={() => {
                        setMoreOpen(false)
                        onAdd()
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
                      role="menuitem"
                    >
                      <Plus size={15} />
                      إضافة عميل
                    </button>
                  )}

                  {onImport && (
                    <button
                      type="button"
                      onClick={() => {
                        setMoreOpen(false)
                        onImport()
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
                      role="menuitem"
                    >
                      <Upload size={15} />
                      استيراد عملاء
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {onTrash && (
            <CustomersTrashButton active={trashActive} onClick={onTrash} size="sm" />
          )}
        </div>
      </div>
    </header>
  )
}
