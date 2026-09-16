export function NoteActivity({ activity }) {
  const text = activity?.noteText || activity?.description || ''
  if (!text) return null

  return (
    <blockquote className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-sm font-semibold text-slate-800">
      {text}
    </blockquote>
  )
}
