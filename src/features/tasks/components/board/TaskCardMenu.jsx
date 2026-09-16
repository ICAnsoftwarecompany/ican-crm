import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

export function TaskCardMenu({ onOpen, onEdit, onQuickComplete, onDelete }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          setOpen((current) => !current)
        }}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#D7EEF0] bg-white text-[#64748B] transition-colors hover:text-[#007A80]"
        aria-label="Task actions"
      >
        <MoreHorizontal size={14} />
      </button>

      {open && (
        <div className="absolute end-0 top-8 z-20 w-36 rounded-xl border border-[#D7EEF0] bg-white p-1 shadow-lg">
          <button type="button" onClick={() => { onOpen?.(); setOpen(false) }} className="flex w-full items-center justify-start rounded-lg px-2 py-1.5 text-left text-[11px] font-bold text-[#0F172A] hover:bg-[#F8FEFF]">Open</button>
          <button type="button" onClick={() => { onEdit?.(); setOpen(false) }} className="flex w-full items-center justify-start rounded-lg px-2 py-1.5 text-left text-[11px] font-bold text-[#0F172A] hover:bg-[#F8FEFF]">Edit</button>
          <button type="button" onClick={() => { onQuickComplete?.(); setOpen(false) }} className="flex w-full items-center justify-start rounded-lg px-2 py-1.5 text-left text-[11px] font-bold text-[#0F172A] hover:bg-[#F8FEFF]">Mark Complete</button>
          <button type="button" onClick={() => { onDelete?.(); setOpen(false) }} className="flex w-full items-center justify-start rounded-lg px-2 py-1.5 text-left text-[11px] font-bold text-red-600 hover:bg-red-50">Delete</button>
        </div>
      )}
    </div>
  )
}
