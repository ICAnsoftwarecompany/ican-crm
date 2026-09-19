import { ExternalLink, Mail, Phone, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ActivityCustomerCard({ activity, onOpenRelated }) {
  const { t } = useTranslation()
  const related = activity?.relatedEntity || {}

  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
            <UserRound size={18} />
          </div>
          <h4 className="whitespace-normal break-words text-sm font-black text-[var(--text)]">{related.name || '-'}</h4>
          <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{related.company || related.status || '-'}</p>
        </div>
        {related.id ? (
          <button
            type="button"
            onClick={() => onOpenRelated?.(activity)}
            className="rounded-lg border border-[#BEEFF2] bg-[#F8FEFF] p-2 text-[#007A80] hover:bg-[#E8F9FA]"
            title={t('activities.table.openCustomerTitle')}
          >
            <ExternalLink size={15} />
          </button>
        ) : null}
      </div>
      <div className="mt-3 space-y-1 text-xs font-semibold text-[var(--text-muted)]">
        <p className="flex min-w-0 items-center gap-2">
          <Phone size={13} />
          <span className="min-w-0 break-words">{related.phone || activity?.phone || '-'}</span>
        </p>
        <p className="flex min-w-0 items-center gap-2">
          <Mail size={13} />
          <span className="min-w-0 break-words">{related.email || '-'}</span>
        </p>
      </div>
    </article>
  )
}
