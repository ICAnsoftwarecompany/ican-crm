import { ZoomIn, ZoomOut } from 'lucide-react'

export const DATA_TABLE_ZOOM_OPTIONS = [50, 70, 90, 100, 125, 150, 200]

function getClosestZoomIndex(value) {
  const numericValue = Number(value) || 100
  let closestIndex = DATA_TABLE_ZOOM_OPTIONS.indexOf(numericValue)
  if (closestIndex !== -1) return closestIndex

  closestIndex = 0
  let closestDistance = Number.POSITIVE_INFINITY

  DATA_TABLE_ZOOM_OPTIONS.forEach((option, index) => {
    const distance = Math.abs(option - numericValue)
    if (distance < closestDistance) {
      closestDistance = distance
      closestIndex = index
    }
  })

  return closestIndex
}

export function DataTableZoomControl({ value = 100, onChange }) {
  const currentIndex = getClosestZoomIndex(value)
  const canZoomOut = currentIndex > 0
  const canZoomIn = currentIndex < DATA_TABLE_ZOOM_OPTIONS.length - 1

  const updateZoom = (nextValue) => {
    onChange?.(Number(nextValue))
  }

  return (
    <div
      className="inline-flex h-9 items-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
      title="تكبير أو تصغير عرض الجدول فقط"
    >
      <button
        type="button"
        onClick={() => updateZoom(DATA_TABLE_ZOOM_OPTIONS[currentIndex - 1])}
        disabled={!canZoomOut}
        className="inline-flex h-9 w-9 items-center justify-center border-e border-[var(--border)] transition-colors hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="تصغير الجدول"
        title="تصغير الجدول"
      >
        <ZoomOut size={16} />
      </button>

      <select
        value={DATA_TABLE_ZOOM_OPTIONS[currentIndex]}
        onChange={(event) => updateZoom(event.target.value)}
        className="h-9 min-w-20 bg-transparent px-2 text-center text-xs font-bold outline-none"
        aria-label="نسبة تكبير الجدول"
        title="نسبة تكبير الجدول"
      >
        {DATA_TABLE_ZOOM_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}%
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => updateZoom(DATA_TABLE_ZOOM_OPTIONS[currentIndex + 1])}
        disabled={!canZoomIn}
        className="inline-flex h-9 w-9 items-center justify-center border-s border-[var(--border)] transition-colors hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="تكبير الجدول"
        title="تكبير الجدول"
      >
        <ZoomIn size={16} />
      </button>
    </div>
  )
}
