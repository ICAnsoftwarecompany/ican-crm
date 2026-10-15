import { useState } from 'react'
import { HeartHandshake } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../../../../shared/components/ui/Button'
import { LeadInterestDialog } from '../../../../../../features/leads'

/**
 * "Add interest" in the selection bar (2026-10-15): one catalog interest (product, service, plan or bundle) added
 * to every selected customer that has a lead. Owns its dialog.
 */
export function AddInterestBulkAction({ rows = [], onDone }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={!rows.length}
        title={t('leads.interestDialog.customersCount', { count: rows.length })}
        className="whitespace-nowrap"
      >
        <HeartHandshake size={14} />
        {t('leads.interestDialog.bulkButton')}
      </Button>
      <LeadInterestDialog
        open={open}
        customers={rows}
        onClose={() => setOpen(false)}
        onSaved={() => onDone?.()}
      />
    </>
  )
}
