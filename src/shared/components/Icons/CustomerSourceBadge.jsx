import { Globe2 } from 'lucide-react'

function FacebookIcon() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1877F2] text-xs font-black text-white">
      f
    </span>
  )
}

function getSourceMeta(source) {
  const value = String(source || '').toLowerCase()

  if (value.includes('facebook')) {
    return {
      icon: <FacebookIcon />,
      className: 'border-[#BBD7FF] bg-[#EFF6FF] text-[#145DBF]',
    }
  }

  return {
    icon: <Globe2 size={14} />,
    className: 'border-[#D9EEF0] bg-white/80 text-[var(--text-muted)]',
  }
}

export function CustomerSourceBadge({ source, iconOnly = false, title }) {
  if (!source) return null

  const meta = getSourceMeta(source)
  const tooltip = title || source

  if (iconOnly) {
    return (
      <span
        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${meta.className}`}
        title={tooltip}
        aria-label={tooltip}
      >
        {meta.icon}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex min-w-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-bold ${meta.className}`}
      title={tooltip}
      aria-label={tooltip}
    >
      {meta.icon}
      <span className="min-w-0 max-w-32 truncate">{source}</span>
    </span>
  )
}
