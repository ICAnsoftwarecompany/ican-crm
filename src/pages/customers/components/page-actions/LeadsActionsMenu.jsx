import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { AddLeadAction } from './AddLeadAction'
import { ImportLeadsAction } from './ImportLeadsAction'
import { ExportLeadsAction } from './ExportLeadsAction'

export function LeadsActionsMenu({ onAdd, onImport, onExport }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const hasActions = Boolean(onAdd || onImport || onExport)

  useEffect(() => {
    if (!open) return undefined

    const onClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!hasActions) return null

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="primary"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        className="gap-2"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Plus size={16} />
        إجراء عميل محتمل
        <ChevronDown size={14} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </Button>

      {open && (
        <div
          className="absolute end-0 top-full z-50 mt-2 w-56 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl"
          role="menu"
        >
          <AddLeadAction onClick={onAdd} closeMenu={() => setOpen(false)} />
          <ImportLeadsAction onClick={onImport} closeMenu={() => setOpen(false)} />
          <ExportLeadsAction onClick={onExport} closeMenu={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
