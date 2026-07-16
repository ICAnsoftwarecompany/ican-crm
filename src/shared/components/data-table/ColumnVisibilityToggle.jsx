import { Settings } from 'lucide-react'
import { Button } from '../ui/Button'
import { useState, useRef, useEffect } from 'react'

export function ColumnVisibilityToggle({ columns, columnVisibility, onToggle }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const visibleCount = columns.filter((col) => columnVisibility[col.id] !== false).length

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Settings size={16} />
        الأعمدة ({visibleCount})
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg z-10 min-w-48">
          <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
            {columns.map((col) => (
              <label key={col.id} className="flex items-center gap-2 cursor-pointer hover:bg-[var(--surface-2)] p-2 rounded">
                <input
                  type="checkbox"
                  checked={columnVisibility[col.id] !== false}
                  onChange={() => onToggle(col.id)}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-sm text-[var(--text)] font-arabic">{col.header}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
