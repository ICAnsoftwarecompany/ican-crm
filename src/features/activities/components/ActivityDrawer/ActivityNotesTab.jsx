import { formatActivityDateTime } from '../../utils/activityDateHelpers'
import { activityText } from '../../utils/activityHelpers'

export function ActivityNotesTab({ activity }) {
  const notes = activity.notes || []

  if (!notes.length) {
    return <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm font-semibold text-[var(--text-muted)]">لا توجد ملاحظات على هذا النشاط.</p>
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <article key={note.id || note.created_at} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
            <span>{note.user?.name || note.created_by?.name || '-'}</span>
            <span>{formatActivityDateTime(note.created_at)}</span>
          </div>
          <p className="whitespace-normal break-words text-sm font-bold text-[var(--text)]">
            {activityText(note.note || note.body || note.text || note.description, '-')}
          </p>
        </article>
      ))}
    </div>
  )
}
