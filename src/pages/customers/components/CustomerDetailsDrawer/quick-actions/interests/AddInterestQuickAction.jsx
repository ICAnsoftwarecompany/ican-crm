import { useState } from 'react'
import { HeartHandshake } from 'lucide-react'
import { toast } from 'sonner'

import { QuickActionButton } from '../QuickActionButton'
import { InterestFormDialog } from './InterestFormDialog'

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

export function AddInterestQuickAction({ customer, onInterestChanged }) {
  const [open, setOpen] = useState(false)
  const leadId = getLeadId(customer)

  return (
    <>
      <QuickActionButton
        icon={HeartHandshake}
        label="إضافة اهتمام"
        accentClassName="text-[#007A80]"
        onClick={() => {
          if (!leadId) {
            toast.info('لا يوجد lead مرتبط بهذا العميل')
            return
          }
          setOpen(true)
        }}
        alert={false}
        alertTitle={leadId ? 'إضافة اهتمام للعميل' : 'لا يوجد lead مرتبط بهذا العميل'}
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
