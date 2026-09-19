import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutGrid, ListChecks, Table2 } from 'lucide-react'
import { Button } from '../../shared/components/ui/Button'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { OpportunityOverview } from './components/OpportunityOverview'
import { OpportunityInbox } from './components/OpportunityInbox'
import { OpportunitiesTable } from './components/OpportunitiesTable'
import { OpportunityDrawer } from './components/OpportunityDrawer/OpportunityDrawer'

const TABS = [
  ['overview', 'opportunities.overview', LayoutGrid],
  ['inbox', 'opportunities.inbox', ListChecks],
  ['table', 'opportunities.table', Table2],
]

export function OpportunityCenterPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('overview')

  return (
    <div>
      <PageToolbar
        title={t('opportunities.title')}
        description={t('opportunities.description')}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map(([key, labelKey, Icon]) => (
          <Button key={key} variant={tab === key ? 'primary' : 'outline'} onClick={() => setTab(key)}>
            <Icon size={16} />
            {t(labelKey)}
          </Button>
        ))}
      </div>

      {tab === 'overview' && <OpportunityOverview />}
      {tab === 'inbox' && <OpportunityInbox />}
      {tab === 'table' && <OpportunitiesTable />}

      <OpportunityDrawer />
    </div>
  )
}
