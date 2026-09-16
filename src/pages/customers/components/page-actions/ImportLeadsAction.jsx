import { Upload } from 'lucide-react'

export function ImportLeadsAction({ onClick, closeMenu }) {
  if (!onClick) return null

  return (
    <button
      type="button"
      onClick={() => {
        closeMenu?.()
        onClick()
      }}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
      role="menuitem"
    >
      <Upload size={15} />
      استيراد عملاء محتملين
    </button>
  )
}
