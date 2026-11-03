import { useState } from 'react'
import { AtSign } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppModal } from '../../../shared/components/overlays/AppModal'
import { MentionsInbox } from './MentionsInbox'
import { useUnseenMentionCount } from '../hooks/useMentions'

export function MentionsCenterButton() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const countQuery = useUnseenMentionCount({ refetchInterval: 60000 })
  const payload = countQuery.data?.data ?? countQuery.data
  const count = Number(payload?.unseen_count ?? payload?.count ?? 0)

  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label={t('mentions.title')}
      className="relative inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[var(--text)] hover:bg-[var(--shell-hover)]">
      <AtSign size={17} aria-hidden="true" />
      {Number.isFinite(count) && count > 0 && <span className="text-xs font-semibold">{count > 99 ? '99+' : count}</span>}
    </button>
    <AppModal isOpen={open} onClose={() => setOpen(false)} title={t('mentions.title')} size="lg">
      <MentionsInbox />
    </AppModal>
  </>
}
