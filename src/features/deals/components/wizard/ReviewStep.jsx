import { useTranslation } from 'react-i18next'
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { usePipelineTemplates } from '../../hooks/useDeals'
import { buildWizardRequests, resolveTeamMembers } from '../../utils/dealWizard'
import { formatMoney } from '../../utils/dealMoney'

const ICONS = { running: Loader2, done: CheckCircle2, error: XCircle }

function Section({ title, step, onEdit, children }) {
  const { t } = useTranslation()
  return (
    <section className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[var(--text)]">{title}</h3>
        <button type="button" onClick={() => onEdit(step)} className="text-xs font-semibold text-[var(--brand-accent)] hover:underline">{t('dealWorkspace.wizard.review.edit')}</button>
      </div>
      {children}
    </section>
  )
}

/** Step 5 — summary of every answer, then the requests that will be sent and their progress. */
export function ReviewStep({ state, created, progress, error, onEdit }) {
  const { t, i18n } = useTranslation()
  const { templates } = usePipelineTemplates()
  const template = templates.find((item) => String(item.id) === String(state.pipeline.templateId))
  const stages = state.pipeline.mode === 'new' ? state.pipeline.stages.filter((stage) => stage.name.trim()) : template?.stages || []
  const team = resolveTeamMembers(state)
  const requests = buildWizardRequests(state)
  const basics = state.basics

  const steps = [
    ...(requests.template ? [{ id: 'template', label: t('dealWorkspace.wizard.review.requests.template'), done: Boolean(created.templateId) }] : []),
    { id: 'deal', label: t('dealWorkspace.wizard.review.requests.deal'), done: Boolean(created.dealId) },
    ...team.map((member, index) => ({ id: `team-${index}`, label: t('dealWorkspace.wizard.review.requests.team', { kind: t(`dealWorkspace.team.add.kinds.${member.kind}`), role: t(`dealWorkspace.options.teamRole.${member.role}`) }), done: created.teamDone.includes(index) })),
    ...(requests.products(1) ? [{ id: 'products', label: t('dealWorkspace.wizard.review.requests.products', { count: state.products.ids.length }), done: created.productsDone }] : []),
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="space-y-3">
        <Section title={t('dealWorkspace.wizard.steps.pipeline.title')} step="pipeline" onEdit={onEdit}>
          <p className="text-sm text-[var(--text)]">{state.pipeline.mode === 'new' ? `${state.pipeline.name} (${t('dealWorkspace.wizard.review.newTemplate')})` : template?.name || '—'}</p>
          <ol className="flex flex-wrap gap-1.5">
            {stages.map((stage, index) => <li key={stage.id || index} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text)]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color || 'var(--text-muted)' }} />{stage.name}</li>)}
          </ol>
        </Section>
        <Section title={t('dealWorkspace.wizard.steps.basics.title')} step="basics" onEdit={onEdit}>
          <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.fields.name')}</dt><dd className="text-[var(--text)]">{basics.name}</dd></div>
            <div><dt className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.fields.type')} · {t('dealWorkspace.fields.status')}</dt><dd className="text-[var(--text)]">{t(`dealWorkspace.options.dealType.${basics.type}`)} · {t(`dealWorkspace.options.dealStatus.${basics.status}`)}</dd></div>
            <div><dt className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.fields.period')}</dt><dd dir="ltr" className="text-start text-[var(--text)]">{basics.start_date || '—'} → {basics.end_date || '—'}</dd></div>
            <div><dt className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.fields.leads')} · {t('dealWorkspace.fields.revenue')}</dt><dd className="text-[var(--text)]"><span dir="ltr">{basics.target_leads || '—'} · {basics.target_revenue ? formatMoney(basics.target_revenue, i18n.language) : '—'}</span></dd></div>
          </dl>
        </Section>
        <Section title={t('dealWorkspace.wizard.steps.products.title')} step="products" onEdit={onEdit}>
          <p className="text-sm text-[var(--text)]">{state.products.ids.length ? t('dealWorkspace.wizard.products.selected', { count: state.products.ids.length }) : t('dealWorkspace.wizard.products.none')}</p>
        </Section>
        <Section title={t('dealWorkspace.wizard.steps.team.title')} step="team" onEdit={onEdit}>
          <p className="text-sm text-[var(--text)]">{team.length ? t('dealWorkspace.wizard.review.teamCount', { count: team.length }) : t('dealWorkspace.wizard.team.none')}</p>
        </Section>
      </div>

      <aside className="space-y-3">
        <section className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.wizard.review.requestsTitle')}</h3>
          <ol className="space-y-1.5">
            {steps.map((item) => {
              const status = item.done ? 'done' : progress[item.id]
              const Icon = ICONS[status] || Circle
              return (
                <li key={item.id} className="flex items-center gap-2 text-sm text-[var(--text)]">
                  <Icon size={15} className={status === 'running' ? 'animate-spin text-[var(--brand-accent)]' : status === 'done' ? 'text-emerald-600 dark:text-emerald-400' : status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-[var(--text-muted)]'} />
                  {item.label}
                </li>
              )
            })}
          </ol>
        </section>
        {error && <ModuleNotice tone="warning">{t('dealWorkspace.wizard.review.stoppedAt')} {error.message}</ModuleNotice>}
        {created.dealId && !error && <ModuleNotice>{t('dealWorkspace.wizard.review.resumeNote')}</ModuleNotice>}
      </aside>
    </div>
  )
}
