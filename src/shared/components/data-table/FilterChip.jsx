import { X } from 'lucide-react'

export function FilterChip({ label, value, onRemove, multiValue = false }) {
  const displayValue = multiValue && Array.isArray(value) ? value.join(', ') : value

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium font-arabic">
      <span>{label}: {displayValue}</span>
      <button
        onClick={onRemove}
        className="flex-shrink-0 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={14} />
      </button>
    </div>
  )
}
