import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

import { useLeadCloseRequest } from '../../../../features/leads'
import { useLeadMutations } from '../../../../features/leads/hooks/useLeads'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'
import { formatDateTimeForApi } from './customerDetailsUtils'
import { useTranslation } from 'react-i18next'

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

export function CustomerStatusChanger({ customer, statuses = [], currentStatus, onChanged, compact = false, className }) {
  const { t } = useTranslation()
  const [selectedStatusId, setSelectedStatusId] = useState('')
  const mutations = useLeadMutations()
  const leadId = getLeadId(customer)
  const selectedStatus = statuses.find((status) => String(status.id) === String(selectedStatusId))
  const canSubmit = Boolean(leadId && selectedStatusId && selectedStatus)
  const currentStatusId = customer?.lead?.status_type_id ?? customer?.status_type_id
  const close = useLeadCloseRequest({
    statuses,
    getOldStatus: () => currentStatus || statuses.find((status) => String(status.id) === String(currentStatusId)) || null,
  })

  const handleChangeStatus = async () => {
    if (!canSubmit) return

    // Won / lost (and reopening a closed lead) go through the close dialog.
    const closing = close.interceptStatusChange({
      rows: [customer],
      status: selectedStatus,
      onDone: () => {
        setSelectedStatusId('')
        onChanged?.({ customer, actionType: 'status', newStatus: selectedStatus, oldStatus: currentStatus })
      },
    })
    if (closing) return

    await mutations.saveAction.mutateAsync({
      lead_id: leadId,
      action: 'create_activity',
      type: 'status_change',
      title: t('customers.pipeline.activity.title', { status: selectedStatus.status }),
      description: t('customers.quickActions.statusChangedDescription', { status: selectedStatus.status }),
      note: '',
      data: {
        source: 'customer_details_drawer',
      },
      new_status_id: selectedStatus.id,
      new_status_title: selectedStatus.status,
      old_status_title: currentStatus?.status || '',
      activity_at: formatDateTimeForApi(new Date()),
    })

    setSelectedStatusId('')
    onChanged?.({
      customer,
      actionType: 'status',
      newStatus: selectedStatus,
      oldStatus: currentStatus,
    })
  }

  if (!leadId || statuses.length === 0) return null

  return (
    <div
      className={cn(
        'grid gap-2 rounded-xl border border-[#E5F7F8] bg-white/80 p-2 sm:grid-cols-[1fr_auto]',
        compact ? 'min-w-[260px]' : 'mt-3',
        className
      )}
    >
      <select
        value={selectedStatusId}
        onChange={(event) => setSelectedStatusId(event.target.value)}
        className="h-9 min-w-0 rounded-lg border border-[var(--border)] bg-white px-2 text-xs font-semibold text-[var(--text)]"
      >
        <option value="">{t('customers.quickActions.chooseNewStatus')}</option>
        {statuses.map((status) => (
          <option key={status.id} value={status.id}>
            {status.status}
          </option>
        ))}
      </select>

      <Button
        type="button"
        size="sm"
        variant="primary"
        onClick={handleChangeStatus}
        disabled={!canSubmit}
        loading={mutations.saveAction.isPending}
        className="justify-center gap-2"
      >
        <RefreshCw size={14} />
        {t('customers.quickActions.changeStatus')}
      </Button>
      {close.dialog}
    </div>
  )
}
