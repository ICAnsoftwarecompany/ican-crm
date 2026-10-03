import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { Tabs } from '../../../../shared/components/ui/Tabs'
import { AddExistingLeadsForm } from './AddExistingLeadsForm'
import { CreateDealLeadForm } from './CreateDealLeadForm'
import { ImportLeadsForm } from './ImportLeadsForm'

/** Add leads to the deal: pick existing CRM leads, create a new one, or import a file (planned). */
export function AddLeadsDialog({ dealId, stages, people, open, onClose }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('existing')
  const common = { dealId, stages, people, onDone: onClose }

  return (
    <AppModal isOpen={open} onClose={onClose} size="lg" title={t('dealWorkspace.leads.addTitle')} description={t('dealWorkspace.leads.addDescription')}>
      <Tabs
        variant="underline"
        active={tab}
        onChange={setTab}
        items={[
          { id: 'existing', label: t('dealWorkspace.leads.tabs.existing'), content: <AddExistingLeadsForm {...common} /> },
          { id: 'new', label: t('dealWorkspace.leads.tabs.new'), content: <CreateDealLeadForm {...common} /> },
          { id: 'import', label: t('dealWorkspace.leads.tabs.import'), content: <ImportLeadsForm {...common} /> },
        ]}
      />
    </AppModal>
  )
}
