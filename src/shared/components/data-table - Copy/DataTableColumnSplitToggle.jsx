import { Columns2 } from 'lucide-react'

export function DataTableColumnSplitToggle({ enabled, onConfigure }) {
  return (
    <button
      type="button"
      onClick={onConfigure}
      className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-colors ${
        enabled
          ? 'border-[#8FE4EA] bg-[#E8F9FA] text-[#007A80] shadow-sm'
          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]'
      }`}
      title={enabled ? 'تعديل تقسيم الأعمدة' : 'تقسيم الجدول إلى يمين ويسار'}
      aria-pressed={enabled}
    >
      <Columns2 size={16} />
      <span className="hidden xl:inline">{enabled ? 'تقسيم الأعمدة مفعل' : 'تقسيم الأعمدة'}</span>
    </button>
  )
}
