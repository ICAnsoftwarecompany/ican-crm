import { useState } from 'react'
import { ThumbsDown, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../../../../shared/components/ui/Button'
import { LeadLostDialog, LeadWonDialog } from '../../../../../../features/leads'

/**
 * "Won" and "Lost" in the selection bar (2026-10-15). Won records one sale (products + payment), so it needs exactly
 * one selected customer; lost closes every selected customer with the same reason. Each owns its dialog.
 */
export function OutcomeBulkActions({ rows = [], onDone }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(null)
  const single = rows.length === 1

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen('won')}
        disabled={!single}
        title={single ? t('customers.leadOutcome.contextWon') : t('customers.leadOutcome.wonSingleOnly')}
        className="whitespace-nowrap text-[#15803D]"
      >
        <Trophy size={14} />
        <span className="sr-only">{t('customers.leadOutcome.won.action')}</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen('lost')}
        disabled={!rows.length}
        title={t('customers.leadOutcome.contextLost')}
        className="whitespace-nowrap text-[#B91C1C]"
      >
        <ThumbsDown size={14} />
        <span className="sr-only">{t('customers.leadOutcome.lost.action')}</span>
      </Button>
      <LeadWonDialog open={open === 'won'} customer={rows[0] || null} onClose={() => setOpen(null)} onDone={onDone} />
      <LeadLostDialog open={open === 'lost'} customers={rows} onClose={() => setOpen(null)} onDone={onDone} />
    </>
  )
}
