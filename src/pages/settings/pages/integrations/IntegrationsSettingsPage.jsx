import { useState } from 'react'
import { Facebook, Workflow } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { MetaIntegrationTab } from './components/MetaIntegrationTab'
import { OtherIntegrationsTab } from './components/OtherIntegrationsTab'


const INTEGRATIONS_TABS = [
  ['meta', 'ميتا (فيسبوك وواتساب وماسنجر)', Facebook],
  ['other', 'تكاملات أخرى', Workflow],
]

export function IntegrationsSettingsPage() {
  const [tab, setTab] = useState('meta')

  return (
    <div>
      <PageToolbar title="التكاملات" description="ربط النظام مع ميتا وباقي القنوات الخارجية." />

      <div className="mb-4 flex flex-wrap gap-2">
        {INTEGRATIONS_TABS.map(([key, label, Icon]) => (
          <Button key={key} variant={tab === key ? 'primary' : 'outline'} onClick={() => setTab(key)}>
            <Icon size={16} />
            {label}
          </Button>
        ))}
      </div>

      {tab === 'meta' && <MetaIntegrationTab />}
      {tab === 'other' && <OtherIntegrationsTab />}
    </div>
  )
}
