import { useState } from 'react'
import { MessageSquarePlus } from 'lucide-react'

import { FollowUpNoteDialog } from '../../follow-up-note'
import { QuickActionButton } from './QuickActionButton'
import { useTranslation } from 'react-i18next'

export function FollowUpQuickAction({ customer, currentStatus, statuses = [], onFollowUpAdded }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <QuickActionButton
        icon={MessageSquarePlus}
        label={t('customers.followUp.addFollowUp')}
        accentClassName="text-[#007A80]"
        onClick={() => setOpen(true)}
      />
      <FollowUpNoteDialog
        open={open}
        customer={customer}
        currentStatus={currentStatus}
        statuses={statuses}
        onClose={() => setOpen(false)}
        onSaved={({ customer: savedCustomer }) => onFollowUpAdded?.({
          customer: savedCustomer || customer,
          actionType: 'note',
        })}
      />
    </>
  )
}
