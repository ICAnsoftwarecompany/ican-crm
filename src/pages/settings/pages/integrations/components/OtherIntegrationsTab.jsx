import { Settings } from 'lucide-react'
import { Badge } from '../../../../../shared/components/ui/Badge'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { useIntegrations } from '../../../../../features/integrations/hooks/useIntegrations'
import { displayValue } from '../../../../../shared/utils/apiResponse'

export function OtherIntegrationsTab() {
  const integrationsQuery = useIntegrations()

  return (
    <ResourceState
      isLoading={integrationsQuery.isLoading}
      error={integrationsQuery.error}
      empty={(integrationsQuery.data || []).length === 0}
      emptyIcon={<Settings size={24} />}
      emptyTitle="لا توجد تكاملات أخرى"
      emptyDescription="عند تفعيل تكاملات إضافية ستظهر بياناتها هنا."
      onRetry={integrationsQuery.refetch}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {(integrationsQuery.data || []).map((integration, index) => (
          <article key={integration.id || index} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="font-bold">{displayValue(integration.name || integration.provider, `Integration #${integration.id || index + 1}`)}</h3>
            <p className="text-sm text-[var(--text-muted)]">{displayValue(integration.type || integration.status)}</p>
            <Badge variant={integration.active === false ? 'danger' : 'success'}>{integration.active === false ? 'غير نشط' : 'نشط'}</Badge>
          </article>
        ))}
      </div>
    </ResourceState>
  )
}
