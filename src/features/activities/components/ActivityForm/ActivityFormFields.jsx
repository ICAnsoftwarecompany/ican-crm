export const inputClassName = 'h-10 w-full min-w-0 rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'
export const textareaClassName = 'min-h-24 w-full min-w-0 resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'

export function FormField({ label, error, children }) {
  return (
    <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
      <span>{label}</span>
      {children}
      {error ? <span className="block text-[11px] font-bold text-red-600">{error}</span> : null}
    </label>
  )
}
