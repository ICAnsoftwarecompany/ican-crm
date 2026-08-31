import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

import { useLeadMutations } from '../../../../features/leads/hooks/useLeads'
import { Button } from '../../../../shared/components/ui/Button'
import { formatDateTimeForApi } from './customerDetailsUtils'

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

export function CustomerStatusChanger({ customer, statuses = [], currentStatus, onChanged }) {
  const [selectedStatusId, setSelectedStatusId] = useState('')
  const mutations = useLeadMutations()
  const leadId = getLeadId(customer)
  const selectedStatus = statuses.find((status) => String(status.id) === String(selectedStatusId))
  const canSubmit = Boolean(leadId && selectedStatusId && selectedStatus)

  const handleChangeStatus = async () => {
    if (!canSubmit) return

    await mutations.saveAction.mutateAsync({
      lead_id: leadId,
      action: 'create_activity',
      type: 'status_change',
      title: `تغيير الحالة إلى ${selectedStatus.status}`,
      description: `تم تغيير حالة العميل إلى ${selectedStatus.status}`,
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
    <div className="mt-3 grid gap-2 rounded-xl border border-[#E5F7F8] bg-white/80 p-2 sm:grid-cols-[1fr_auto]">
      <select
        value={selectedStatusId}
        onChange={(event) => setSelectedStatusId(event.target.value)}
        className="h-9 min-w-0 rounded-lg border border-[var(--border)] bg-white px-2 text-xs font-semibold text-[var(--text)]"
      >
        <option value="">اختر حالة جديدة</option>
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
        تغيير الحالة
      </Button>
    </div>
  )
}
