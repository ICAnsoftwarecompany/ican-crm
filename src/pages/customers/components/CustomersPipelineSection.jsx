import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { CustomersPipelineView, statusRequiresReason, useCustomerStatusMove } from '../../../features/customers/pipeline'
import { CustomersBulkActions } from './bulk-actions'
import { StatusChangeReasonDialog } from './bulk-actions/selection-actions'

function getReasonLeadContext(customer) {
  const lead = customer?.lead || {}
  return {
    id: lead.id ?? customer?.lead_id ?? customer?.id,
    name: lead.name || customer?.name || '',
    phone: lead.phone || customer?.phone || '',
    lead,
    linked_by: customer?.linked_by || lead.linked_by,
    agent_id: customer?.agent_id,
  }
}

/**
 * Page composition for the Leads Center pipeline mode: the board from features/customers,
 * plus the page-owned bulk actions and the "status needs a reason" dialog.
 */
export function CustomersPipelineSection({ statuses = [], statusById, onDone, onAddLeadNote, ...viewProps }) {
  const { t } = useTranslation()
  const [reasonMove, setReasonMove] = useState(null)
  const { moveCustomer, isMoving } = useCustomerStatusMove({ statusById })

  const handleStatusDrop = ({ customer, status }) => {
    if (statusRequiresReason(status)) {
      setReasonMove({ customer, status })
      return undefined
    }
    return moveCustomer({ customer, status })
  }

  const handleSubmitReason = async ({ reason, schedulePayload }) => {
    if (!reasonMove) return
    const moved = await moveCustomer({ ...reasonMove, reason, schedulePayload })
    if (moved) setReasonMove(null)
  }

  return (
    <>
      <CustomersPipelineView
        {...viewProps}
        statuses={statuses}
        onStatusDrop={handleStatusDrop}
        renderToolbarActions={({ selectedRows, selectedCount, clearSelection }) => (
          <CustomersBulkActions
            selectedRows={selectedRows}
            selectedCount={selectedCount}
            clearSelection={clearSelection}
            onDone={onDone}
            onAddLeadNote={onAddLeadNote}
          />
        )}
        emptyAction={(
          <Link
            to="/LeadsCenter/customization"
            className="inline-flex h-8 items-center rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]"
          >
            {t('customers.pipeline.manageStatuses')}
          </Link>
        )}
      />

      <StatusChangeReasonDialog
        open={Boolean(reasonMove)}
        loading={isMoving}
        status={reasonMove?.status}
        lead={reasonMove ? getReasonLeadContext(reasonMove.customer) : null}
        onClose={() => setReasonMove(null)}
        onSubmit={handleSubmitReason}
      />
    </>
  )
}
