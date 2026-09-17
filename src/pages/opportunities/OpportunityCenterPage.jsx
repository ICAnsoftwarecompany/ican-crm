import { useState } from 'react'
import { LayoutGrid, ListChecks, Table2 } from 'lucide-react'
import { Button } from '../../shared/components/ui/Button'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { OpportunityOverview } from './components/OpportunityOverview'
import { OpportunityInbox } from './components/OpportunityInbox'
import { OpportunitiesTable } from './components/OpportunitiesTable'
import { OpportunityDrawer } from './components/OpportunityDrawer/OpportunityDrawer'

const TABS = [
  ['overview', 'نظرة عامة', LayoutGrid],
  ['inbox', 'صندوق الفرص', ListChecks],
  ['table', 'كل الفرص', Table2],
]

export function OpportunityCenterPage() {
  const [tab, setTab] = useState('overview')

  return (
    <div>
      <PageToolbar
        title="مركز الفرص البيعية"
        description="اكتشف فرص البيع التكميلي والترقية والتجديد المحتملة، وتابعها من مكان واحد."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map(([key, label, Icon]) => (
          <Button key={key} variant={tab === key ? 'primary' : 'outline'} onClick={() => setTab(key)}>
            <Icon size={16} />
            {label}
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
