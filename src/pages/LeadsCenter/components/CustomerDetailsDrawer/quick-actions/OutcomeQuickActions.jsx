import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ThumbsDown, Trophy } from 'lucide-react'
import { LeadLostDialog, LeadWonDialog } from '../../../../../features/leads'
import { QuickActionButton } from './QuickActionButton'

/** Drawer quick action "Won" (2026-10-15): records a sale on a deal (products + payment). */
export function WonQuickAction({ customer, onDone }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  return (
    <>
      <QuickActionButton icon={Trophy} label={t('customers.leadOutcome.won.action')} accentClassName="text-[#15803D]" onClick={() => setOpen(true)} />
      <LeadWonDialog open={open} customer={customer} onClose={() => setOpen(false)} onDone={onDone} />
    </>
  )
}

/** Drawer quick action "Lost" (2026-10-15): reason from the tenant's lost reasons + note. */
export function LostQuickAction({ customer, onDone }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  return (
    <>
      <QuickActionButton icon={ThumbsDown} label={t('customers.leadOutcome.lost.action')} accentClassName="text-[#B91C1C]" onClick={() => setOpen(true)} />
      <LeadLostDialog open={open} customers={customer ? [customer] : []} onClose={() => setOpen(false)} onDone={onDone} />
    </>
  )
}
