import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { assignmentApi } from '../api/assignmentApi'

export const sections = [
  { key: 'rules', fetch: assignmentApi.rules.list },
  { key: 'distribution', fetch: assignmentApi.distribution.list },
  { key: 'logs', fetch: assignmentApi.logs },
]

function listFromResponse(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.items)) return response.items
  return null
}

export function AssignmentSection({ section }) {
  const { t } = useTranslation()
  const query = useQuery({ queryKey: ['service', 'assignment', section.key], queryFn: section.fetch, retry: 1 })
  const rows = listFromResponse(query.data)
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text)]">
      <h2 className="font-semibold">{t(`serviceAssignment.${section.key}`)}</h2>
      {query.isPending && <p className="mt-2 text-sm text-[var(--text-muted)]">{t('serviceAssignment.loading')}</p>}
      {query.isError && <div className="mt-2 text-sm text-[var(--text-muted)]"><p>{t('serviceAssignment.error')}</p><button type="button" className="mt-2 underline" onClick={() => query.refetch()}>{t('serviceAssignment.retry')}</button></div>}
      {query.isSuccess && rows === null && <p className="mt-2 text-sm text-[var(--text-muted)]">{t('serviceAssignment.unrecognized')}</p>}
      {query.isSuccess && rows?.length === 0 && <p className="mt-2 text-sm text-[var(--text-muted)]">{t('serviceAssignment.empty')}</p>}
      {query.isSuccess && rows?.length > 0 && <ul className="mt-3 divide-y divide-[var(--border)]">{rows.map((row, index) => (
        <li key={row.id ?? index} className="py-2 text-sm">
          <p className="font-medium">{String(row.name ?? row.entity_type ?? row.strategy ?? row.id ?? index + 1)}</p>
          <p className="text-xs text-[var(--text-muted)]">{[row.entity_type, row.strategy, row.assign_type, row.active === false ? t('serviceAssignment.inactive') : null].filter(Boolean).join(' · ')}</p>
        </li>
      ))}</ul>}
    </section>
  )
}

export function AssignmentSettingsPanel({ sectionKey = 'rules' }) {
  const { t } = useTranslation()
  const section = sections.find((entry) => entry.key === sectionKey) || sections[0]
  return <div className="grid gap-4"><header><h1 className="text-xl font-bold text-[var(--text)]">{t(`serviceAssignment.${section.key}`)}</h1><p className="text-sm text-[var(--text-muted)]">{t('serviceAssignment.description')}</p></header><AssignmentSection section={section} /></div>
}
