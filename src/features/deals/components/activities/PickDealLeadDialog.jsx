import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'

/** Choose which lead of the deal a call / meeting is with (open leads first). */
export function PickDealLeadDialog({ open, onClose, onPick, title }) {
  const { t } = useTranslation()
  const { leads } = useDealWorkspace()
  const [leadId, setLeadId] = useState('')
  const options = useMemo(() => [...leads].sort((left, right) => (left.status === 'open' ? -1 : 1) - (right.status === 'open' ? -1 : 1)), [leads])

  useEffect(() => {
    if (open) setLeadId('')
  }, [open])

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      submitDisabled={!leadId}
      submitText={t('dealWorkspace.common.continue')}
      onSubmit={() => onPick(leads.find((lead) => String(lead.id) === String(leadId)))}
    >
      <FieldLabel label={t('dealWorkspace.activities.pickLead')}>
        <select className={dealInputClass} value={leadId} onChange={(event) => setLeadId(event.target.value)}>
          <option value="">{t('dealWorkspace.common.choose')}</option>
          {options.map((lead) => <option key={lead.id} value={lead.id}>{lead.name || `#${lead.id}`}{lead.status !== 'open' ? ` · ${t(`dealWorkspace.options.leadStatus.${lead.status}`)}` : ''}</option>)}
        </select>
      </FieldLabel>
    </FormDialog>
  )
}
