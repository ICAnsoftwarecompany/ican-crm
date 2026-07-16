import { Search, X } from 'lucide-react'
import { Input } from '../ui/Input'

export function GlobalSearch({ value, onChange }) {
  return (
    <div className="relative">
      <Input
        placeholder="بحث عام..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        startIcon={<Search size={16} />}
        endIcon={
          value && (
            <button
              onClick={() => onChange('')}
              className="p-1 hover:bg-[var(--surface-2)] rounded transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )
        }
      />
    </div>
  )
}
