import { useState } from 'react'
import { HeartHandshake } from 'lucide-react'
import { toast } from 'sonner'

import { QuickActionButton } from '../QuickActionButton'
import { InterestFormDialog } from './InterestFormDialog'
import { useTranslation } from 'react-i18next'

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

export function AddInterestQuickAction({ customer, onInterestChanged }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const leadId = getLeadId(customer)

  return (
    <>
      <QuickActionButton
        icon={HeartHandshake}
        label={t('customers.interestForm.addTitle')}
        accentClassName="text-[#007A80]"
        onClick={() => {
          if (!leadId) {
            toast.info(t('customers.interestForm.noLead'))
            return
          }
          setOpen(true)
        }}
        alert={false}
        alertTitle={leadId ? t('customers.interestForm.addForCustomer') : t('customers.interestForm.noLead')}
      />

      <InterestFormDialog
        open={open}
        customer={customer}
        onClose={() => setOpen(false)}
        onSaved={onInterestChanged}
      />
    </>
  )
}
