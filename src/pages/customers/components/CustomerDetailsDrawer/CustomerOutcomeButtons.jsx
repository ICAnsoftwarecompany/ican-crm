import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ThumbsDown, Trophy } from 'lucide-react'
import { LeadLostDialog, LeadWonDialog } from '../../../../features/leads'

const buttonClass = 'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-colors'

/**
 * "Won" / "Lost" on the customer header card of the drawer and the lead page (2026-10-15). Same dialogs as the
 * quick actions, row menu and selection bar (`features/leads/outcome`). `onDone` refreshes the customer.
 */
export function CustomerOutcomeButtons({ customer, onDone }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(null)
  if (!customer?.lead?.id && !customer?.lead_id) return null

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3">
      <button
        type="button"
        onClick={() => setOpen('won')}
        className={`${buttonClass} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300`}
        title={t('customers.leadOutcome.contextWon')}
      >
        <Trophy size={14} />
        {t('customers.leadOutcome.won.action')}
      </button>
      <button
        type="button"
        onClick={() => setOpen('lost')}
        className={`${buttonClass} border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300`}
        title={t('customers.leadOutcome.contextLost')}
      >
        <ThumbsDown size={14} />
        {t('customers.leadOutcome.lost.action')}
      </button>
      <LeadWonDialog open={open === 'won'} customer={customer} onClose={() => setOpen(null)} onDone={onDone} />
      <LeadLostDialog open={open === 'lost'} customers={[customer]} onClose={() => setOpen(null)} onDone={onDone} />
    </div>
  )
}
