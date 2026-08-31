import { EmptyPanel } from '../CustomerDetailsTabPrimitives'
import { fieldValue } from '../customerDetailsUtils'

export function NotesTab({ customer, layoutMode = 'compact' }) {
  const notes = Array.isArray(customer.notes) ? customer.notes : []

  return notes.length ? (
    <div className={layoutMode === 'wide' ? 'grid min-w-0 grid-cols-2 gap-3 py-4' : 'min-w-0 space-y-3 py-4'}>
      {notes.map((note, index) => (
        <div key={note.id || index} className="min-w-0 break-words rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-3 text-sm text-[var(--text)] shadow-sm">
          {fieldValue(note.body || note.note || note.content)}
        </div>
      ))}
    </div>
  ) : (
    <EmptyPanel title="Notes" description="لا توجد ملاحظات محفوظة لهذا العميل." />
  )
}
