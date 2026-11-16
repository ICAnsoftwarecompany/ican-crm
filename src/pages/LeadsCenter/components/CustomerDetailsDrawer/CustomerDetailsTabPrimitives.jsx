import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { fieldValue } from './customerDetailsUtils'

export function EmptyPanel({ title, description }) {
  return (
    <div className="my-4 min-w-0 rounded-xl border border-dashed border-[#BEEFF2] bg-[#F8FEFF] p-6 text-center">
      <div className="text-sm font-black text-[var(--text)]">{title}</div>
      <div className="mt-1 break-words text-sm text-[var(--text-muted)]">{description}</div>
    </div>
  )
}

export function RelatedCard({ title, subtitle, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-lg border border-[#E5F7F8] bg-[#F8FEFF] p-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold text-[var(--text)]">{title}</div>
          <div className="mt-1 break-words text-xs text-[var(--text-muted)]">{subtitle}</div>
        </div>
        {Icon && <Icon size={16} className="shrink-0 text-[#007A80]" />}
      </div>
    </div>
  )
}

export function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-start"
      >
        <h4 className="text-sm font-black text-[var(--text)]">{title}</h4>
        <span className="rounded-md bg-[var(--surface-2)] p-1 text-[var(--text-muted)]">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </section>
  )
}

export function FieldRow({ icon: Icon, label, value, children }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(82px,112px)_minmax(0,1fr)] items-start gap-3 rounded-lg px-1 py-1.5 text-sm hover:bg-[var(--surface-2)]">
      <dt className="inline-flex min-w-0 items-center gap-2 text-[var(--text-muted)]">
        {Icon && <Icon size={16} className="shrink-0" />}
        <span className="truncate">{label}</span>
      </dt>
      <dd className="min-w-0 max-w-full text-[var(--text)]">
        {children || (
          <span className="inline-flex min-w-0 max-w-full items-center rounded-md bg-[#F3FAFB] px-2 py-1 font-semibold ring-1 ring-[#E5F7F8]">
            <span className="min-w-0 max-w-full break-words">{fieldValue(value)}</span>
          </span>
        )}
      </dd>
    </div>
  )
}
