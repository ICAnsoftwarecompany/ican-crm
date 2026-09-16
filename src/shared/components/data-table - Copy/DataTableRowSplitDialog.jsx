import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, RotateCcw, TableRowsSplit, X } from 'lucide-react'
import { cn } from '../../utils/cn'

const FIXED_COLUMN_IDS = new Set(['__select', '__serial'])

function getColumnLabel(column) {
  if (typeof column?.header === 'string') return column.header
  if (typeof column?.accessor === 'string') return column.accessor
  return column?.id || 'Column'
}

function getDefaultPrimaryIds(columns = []) {
  const midpoint = Math.ceil(columns.length / 2)
  return columns.slice(0, midpoint).map((column) => column.id)
}

export function DataTableRowSplitDialog({
  isOpen,
  columns = [],
  value = null,
  enabled = false,
  onClose,
  onSave,
  onDisable,
}) {
  const dataColumns = useMemo(
    () => columns.filter((column) => column?.id && !FIXED_COLUMN_IDS.has(column.id)),
    [columns]
  )
  const [primaryIds, setPrimaryIds] = useState([])

  useEffect(() => {
    if (!isOpen) return

    const configuredIds = Array.isArray(value?.primaryColumnIds)
      ? value.primaryColumnIds.filter((columnId) => dataColumns.some((column) => column.id === columnId))
      : []

    setPrimaryIds(configuredIds.length ? configuredIds : getDefaultPrimaryIds(dataColumns))
  }, [dataColumns, isOpen, value])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  const primarySet = new Set(primaryIds)
  const secondaryIds = dataColumns
    .filter((column) => !primarySet.has(column.id))
    .map((column) => column.id)
  const secondarySet = new Set(secondaryIds)
  const canSave = primaryIds.length > 0 && secondaryIds.length > 0

  const moveToPrimary = (columnId) => {
    setPrimaryIds((current) => (
      current.includes(columnId) ? current : [...current, columnId]
    ))
  }

  const moveToSecondary = (columnId) => {
    setPrimaryIds((current) => {
      if (!current.includes(columnId)) return current
      if (current.length <= 1) return current
      return current.filter((item) => item !== columnId)
    })
  }

  const applyAutoSplit = () => {
    setPrimaryIds(getDefaultPrimaryIds(dataColumns))
  }

  const handleSave = () => {
    if (!canSave) return

    onSave?.({
      primaryColumnIds: primaryIds.filter((columnId) => dataColumns.some((column) => column.id === columnId)),
    })
  }

  const renderColumnChoice = (column, target) => {
    const isPrimary = primarySet.has(column.id)
    const isActive = target === 'primary' ? isPrimary : secondarySet.has(column.id)
    const onClick = target === 'primary'
      ? () => moveToPrimary(column.id)
      : () => moveToSecondary(column.id)

    return (
      <button
        key={`${target}-${column.id}`}
        type="button"
        onClick={onClick}
        className={cn(
          'flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-start text-sm transition-colors',
          isActive
            ? 'border-[#8FE4EA] bg-[#E8F9FA] text-[#007A80]'
            : 'border-slate-200 bg-white text-slate-600 hover:border-[#BFEFF2] hover:bg-slate-50'
        )}
      >
        <span className="min-w-0 truncate font-bold">{getColumnLabel(column)}</span>
        <span
          className={cn(
            'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
            isActive ? 'border-[#00AEB8] bg-[#00AEB8] text-white' : 'border-slate-300 text-transparent'
          )}
        >
          <Check size={12} />
        </span>
      </button>
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative z-10 flex max-h-[min(720px,calc(100vh-2rem))] w-[min(860px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F9FA] text-[#007A80]">
              <TableRowsSplit size={20} />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-slate-900">تخصيص تقسيم الصف إلى صفين</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                اختر الأعمدة التي تظهر في الصف العلوي الرئيسي، والباقي يظهر في الصف الفرعي.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-slate-500">
              الصف الرئيسي: {primaryIds.length} عمود / الصف الفرعي: {secondaryIds.length} عمود
            </div>
            <button
              type="button"
              onClick={applyAutoSplit}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RotateCcw size={14} />
              توزيع تلقائي
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h4 className="text-sm font-black text-slate-900">الصف العلوي الرئيسي</h4>
                <span className="rounded-full bg-[#E8F9FA] px-2 py-1 text-[11px] font-black text-[#007A80]">
                  {primaryIds.length}
                </span>
              </div>
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {dataColumns.map((column) => renderColumnChoice(column, 'primary'))}
              </div>
            </section>

            <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h4 className="text-sm font-black text-slate-900">الصف الفرعي</h4>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600">
                  {secondaryIds.length}
                </span>
              </div>
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {dataColumns.map((column) => renderColumnChoice(column, 'secondary'))}
              </div>
            </section>
          </div>

          {!canSave && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
              يجب اختيار عمود واحد على الأقل في الصف الرئيسي وعمود واحد في الصف الفرعي.
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-5 py-4">
          <button
            type="button"
            onClick={onDisable}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            {enabled ? 'إيقاف تقسيم الصفين' : 'إلغاء'}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className={cn(
                'inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-black text-white transition-colors',
                canSave ? 'bg-[#00AEB8] hover:bg-[#0097A0]' : 'cursor-not-allowed bg-slate-300'
              )}
            >
              حفظ وتفعيل
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
