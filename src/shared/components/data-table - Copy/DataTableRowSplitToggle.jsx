import { TableRowsSplit } from 'lucide-react'

export function DataTableRowSplitToggle({ enabled, onToggle, onConfigure }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (onConfigure) {
          onConfigure()
          return
        }

        onToggle?.(!enabled)
      }}
      className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-colors ${
        enabled
          ? 'border-[#8FE4EA] bg-[#E8F9FA] text-[#007A80] shadow-sm'
          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]'
      }`}
      title={enabled ? 'إيقاف تقسيم كل صف إلى صفين' : 'عرض كل سجل على صفين'}
      aria-pressed={enabled}
    >
      <TableRowsSplit size={16} />
      <span className="hidden xl:inline">{enabled ? 'صفين مفعل' : 'تقسيم الصفوف'}</span>
    </button>
  )
}
