import { useState } from 'react'
import { Plus } from 'lucide-react'

export function InlineTaskCreator({ onSubmit, onCancel, placeholder = 'Task title...' }) {
  const [title, setTitle] = useState('')

  const handleSubmit = () => {
    const value = title.trim()
    if (!value) return
    onSubmit?.(value)
    setTitle('')
  }

  return (
    <div className="space-y-2 rounded-xl border border-dashed border-[#CFECEF] bg-[#F8FEFF] p-2">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-[#D7EEF0] bg-white px-3 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            handleSubmit()
          }
        }}
      />

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-8 rounded-lg border border-[#D7EEF0] bg-white px-2 text-[11px] font-black text-[#64748B]">Cancel</button>
        <button type="button" onClick={handleSubmit} disabled={!title.trim()} className="h-8 rounded-lg bg-[#007A80] px-2 text-[11px] font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">Add Task</button>
      </div>
    </div>
  )
}
