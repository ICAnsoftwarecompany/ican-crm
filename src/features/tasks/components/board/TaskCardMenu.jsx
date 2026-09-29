import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function TaskCardMenu({ onOpen, onEdit, onQuickComplete, onDelete }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          setOpen((current) => !current)
        }}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-colors hover:text-[var(--brand-accent)]"
        aria-label={t('tasks.board.menuAriaLabel')}
      >
        <MoreHorizontal size={14} />
      </button>

      {open && (
        <div className="absolute end-0 top-8 z-20 w-36 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
          <button type="button" onClick={() => { onOpen?.(); setOpen(false) }} className="flex w-full items-center justify-start rounded-lg px-2 py-1.5 text-left text-[11px] font-bold text-[var(--text)] hover:bg-[var(--surface-2)]">{t('tasks.board.menuOpen')}</button>
          <button type="button" onClick={() => { onEdit?.(); setOpen(false) }} className="flex w-full items-center justify-start rounded-lg px-2 py-1.5 text-left text-[11px] font-bold text-[var(--text)] hover:bg-[var(--surface-2)]">{t('actions.edit')}</button>
          <button type="button" onClick={() => { onQuickComplete?.(); setOpen(false) }} className="flex w-full items-center justify-start rounded-lg px-2 py-1.5 text-left text-[11px] font-bold text-[var(--text)] hover:bg-[var(--surface-2)]">{t('tasks.board.markComplete')}</button>
          <button type="button" onClick={() => { onDelete?.(); setOpen(false) }} className="flex w-full items-center justify-start rounded-lg px-2 py-1.5 text-left text-[11px] font-bold text-red-600 hover:bg-red-50">{t('actions.delete')}</button>
        </div>
      )}
    </div>
  )
}
