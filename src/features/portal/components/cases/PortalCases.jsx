import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { usePortalList } from '../../api/portalApi'
import { usePortalAccess } from '../../hooks/usePortalAccess'
import { usePortalFormat } from '../../utils/format'
import { PortalPage, StatusPill, categoryTone } from '../PortalPage'

export function PortalCases() {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const { can } = usePortalAccess()
  const query = usePortalList('cases', P.cases)
  const cases = query.data || []
  return (
    <PortalPage
      title={t('portal.sections.cases')}
      description={t('portal.cases.description')}
      actions={can('case', 'create') && <Link to="/requests/new" className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white"><Plus size={16} aria-hidden="true" />{t('portal.cases.new')}</Link>}
      query={query}
      empty={!cases.length}
      emptyTitle={t('portal.cases.empty')}
    >
      <ul className="grid gap-2">
        {cases.map((item) => (
          <li key={item.id}>
            <Link to={`/requests/${item.id}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-colors hover:border-brand-accent">
              <span className="grid min-w-0 flex-1">
                <span className="truncate font-medium">{item.subject}</span>
                <span className="text-xs text-[var(--text-muted)]"><span dir="ltr" className="font-mono">{item.case_number}</span> · {format.label(item.type?.label)} · {t('portal.cases.updated', { date: format.date(item.updated_at) })}</span>
              </span>
              <StatusPill tone={categoryTone(item.status?.category)}>{format.label(item.status?.label)}</StatusPill>
            </Link>
          </li>
        ))}
      </ul>
    </PortalPage>
  )
}
