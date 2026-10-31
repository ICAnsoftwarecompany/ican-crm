import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { useDealPeople } from '../common/useDealPeople'
import { useLeadDialogs } from '../pipeline/useLeadDialogs'
import { DealLeadDrawer } from './DealLeadDrawer'

/** Separate deal-lead route composition, extensible independently of the CRM customer page. */
export function DealLeadDetail() {
  const { dealLeadId } = useParams()
  const { t } = useTranslation()
  const { dealId, leads, leadsQuery, stages } = useDealWorkspace()
  const { people } = useDealPeople(dealId)
  const { actions, dialogs } = useLeadDialogs({ dealId, leads, stages, people })
  const lead = leads.find((item) => String(item.id) === String(dealLeadId))
  return <div className="space-y-4">
    <Link className="inline-flex items-center gap-2 text-sm text-[var(--brand-accent)]" to={`/deals/${dealId}/pipeline`}><ArrowRight size={15} />{t('dealWorkspace.pages.pipeline')}</Link>
    <ResourceState isLoading={leadsQuery.isLoading} error={leadsQuery.error} onRetry={leadsQuery.refetch} empty={!lead} emptyTitle={t('dealWorkspace.leads.drawer.notFound')}>
      <h2 className="text-lg font-bold text-[var(--text)]">{lead?.name}</h2>
      <DealLeadDrawer inline dealId={dealId} lead={lead} stages={stages} people={people} actions={actions} />
    </ResourceState>
    {dialogs}
  </div>
}
