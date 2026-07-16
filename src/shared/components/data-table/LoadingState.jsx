import { AlertCircle } from 'lucide-react'

export function LoadingState({ columns }) {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3 p-4 bg-[var(--surface-2)] rounded-lg animate-pulse">
          {columns.map((col) => (
            <div
              key={col.id}
              className="h-4 bg-[var(--border)] rounded flex-1"
              style={{ width: col.width || '100px' }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
