import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarRange, ChevronDown, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const EMPTY_VALUE = { columnId: '', from: '', to: '' }

function getColumnLabel(column) {
  if (!column) return ''
  if (typeof column.header === 'string') return column.header
  if (typeof column.header === 'number') return String(column.header)
  return column.id || column.accessor || ''
}

export function DateRangeFilter({ dateColumns = [], value = EMPTY_VALUE, onChange }) {
  const { t } = useTranslation()
  const wrapperRef = useRef(null)
  const menuRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState(null)

  const activeColumn = dateColumns.find((column) => column.id === value?.columnId)
  const hasActiveFilter = Boolean(value?.columnId && (value?.from || value?.to))
  const isDisabled = dateColumns.length === 0

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOnOutsideClick = (event) => {
      if (wrapperRef.current?.contains(event.target)) return
      if (menuRef.current?.contains(event.target)) return
      setIsOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const updateMenuPosition = () => {
      const trigger = wrapperRef.current
      if (!trigger || typeof window === 'undefined') return

      const rect = trigger.getBoundingClientRect()
      const width = Math.min(window.innerWidth - 24, 360)
      const left = Math.min(Math.max(rect.right - width, 12), window.innerWidth - width - 12)

      setMenuStyle({
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        left: `${left}px`,
        width: `${width}px`,
        zIndex: 9999,
      })
    }

    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)

    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [isOpen])

  const updateValue = (patch) => {
    onChange({
      columnId: value?.columnId || '',
      from: value?.from || '',
      to: value?.to || '',
      ...patch,
    })
  }

  const clearFilter = () => {
    onChange(EMPTY_VALUE)
  }

  const toggleMenu = () => {
    setIsOpen((current) => !current)
  }

  const menu = isOpen && typeof document !== 'undefined'
    ? createPortal(
      <div
        ref={menuRef}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-2xl"
        style={menuStyle || { position: 'fixed', top: 0, left: 0, width: 360, zIndex: 9999 }}
      >
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
          <div>
            <div className="text-sm font-bold text-[var(--text)]">{t('dataTable.dateFilter.title')}</div>
            <div className="text-[11px] text-[var(--text-muted)]">
              {t('dataTable.dateFilter.description')}
            </div>
          </div>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={clearFilter}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              title={t('dataTable.dateFilter.clear')}
              aria-label={t('dataTable.dateFilter.clear')}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <label className="block space-y-1">
          <span className="text-[11px] font-semibold text-[var(--text-muted)]">{t('dataTable.dateFilter.column')}</span>
          <select
            value={value?.columnId || ''}
            onChange={(event) => updateValue({ columnId: event.target.value })}
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition-colors focus:border-[#00A8B0] focus:ring-2 focus:ring-[#00A8B0]/15"
          >
            <option value="">{t('dataTable.savedFilters.chooseColumn')}</option>
            {dateColumns.map((column) => (
              <option key={column.id} value={column.id}>
                {getColumnLabel(column)}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">{t('dataTable.dateFilter.startDate')}</span>
            <input
              type="date"
              value={value?.from || ''}
              onChange={(event) => updateValue({ from: event.target.value })}
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition-colors focus:border-[#00A8B0] focus:ring-2 focus:ring-[#00A8B0]/15"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">{t('dataTable.dateFilter.endDate')}</span>
            <input
              type="date"
              value={value?.to || ''}
              onChange={(event) => updateValue({ to: event.target.value })}
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition-colors focus:border-[#00A8B0] focus:ring-2 focus:ring-[#00A8B0]/15"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-[var(--text-muted)]">
            {t('dataTable.dateFilter.instantApply')}
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="h-8 rounded-lg bg-[#00A8B0] px-3 text-xs font-bold text-white transition-colors hover:bg-[#008E95]"
          >
            {t('dataTable.done')}
          </button>
        </div>
      </div>,
      document.body
    )
    : null

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <button
        type="button"
        disabled={isDisabled}
        onClick={toggleMenu}
        className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          hasActiveFilter
            ? 'border-[#00A8B0] bg-[#E8F9FA] text-[#007A80]'
            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]'
        }`}
        title={isDisabled ? t('dataTable.dateFilter.noColumns') : t('dataTable.dateFilter.title')}
        aria-expanded={isOpen}
      >
        <CalendarRange size={16} />
        <span className="hidden xl:inline">
          {hasActiveFilter ? getColumnLabel(activeColumn) : t('dataTable.dateFilter.button')}
        </span>
        <ChevronDown size={14} />
      </button>
      {menu}
    </div>
  )
}
