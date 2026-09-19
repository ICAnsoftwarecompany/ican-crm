import { useMemo, useState } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../shared/components/ui/Button'
import { Input } from '../../shared/components/ui/Input'
import { Badge } from '../../shared/components/ui/Badge'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { ResourceState } from '../../shared/components/data/ResourceState'
import { useAssignmentRules, useLeadLogs, useLeadMutations } from '../../features/leads/hooks/useLeads'
import { displayValue, extractMessage } from '../../shared/utils/apiResponse'
import { WorkflowLauncher } from '../../features/workflow-engine'

const initialAction = {
  lead_id: '',
  action: '',
  note: '',
}

export function LeadsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [actionForm, setActionForm] = useState(initialAction)
  const [ruleForm, setRuleForm] = useState({ name: '', active: true })
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const logsQuery = useLeadLogs()
  const rulesQuery = useAssignmentRules()
  const mutations = useLeadMutations()

  const logs = logsQuery.data || []
  const rules = rulesQuery.data || []
  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return logs
    return logs.filter((log) => JSON.stringify(log).toLowerCase().includes(term))
  }, [logs, search])

  const handleActionChange = (event) => {
    const { name, value } = event.target
    setActionForm((current) => ({ ...current, [name]: value }))
  }

  const handleSaveAction = async (event) => {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')

    if (!actionForm.lead_id || !actionForm.action) {
      setErrorMessage(t('leads.page.actionRequiredError'))
      return
    }

    try {
      await mutations.saveAction.mutateAsync(actionForm)
      setActionForm(initialAction)
      setMessage(t('leads.page.actionSaved'))
    } catch (error) {
      setErrorMessage(extractMessage(error, t('leads.page.actionSaveFailed')))
    }
  }

  const handleCreateRule = async (event) => {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')

    try {
      await mutations.createRule.mutateAsync(ruleForm)
      setRuleForm({ name: '', active: true })
      setMessage(t('leads.page.ruleCreated'))
    } catch (error) {
      setErrorMessage(extractMessage(error, t('leads.page.ruleCreateFailed')))
    }
  }

  return (
    <div>
      <PageToolbar title={t('leads.title')} description={t('leads.page.description')}>
        <WorkflowLauncher context={{ module: 'leads', entity: 'lead' }}>{t('workflow.builder.createAutomation')}</WorkflowLauncher>
      </PageToolbar>
      {(message || errorMessage) && (
        <div className={`mb-4 rounded-lg p-3 text-sm ${errorMessage ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {errorMessage || message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-4">
        <div className="grid gap-4 h-fit">
          <form onSubmit={handleSaveAction} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 grid gap-3">
            <h2 className="font-bold">{t('leads.page.newActionTitle')}</h2>
            <Input label="Lead ID" name="lead_id" value={actionForm.lead_id} onChange={handleActionChange} />
            <Input label={t('leads.page.actionTypeLabel')} name="action" value={actionForm.action} onChange={handleActionChange} placeholder="call, note, status_change" />
            <Input label={t('leads.page.noteLabel')} name="note" value={actionForm.note} onChange={handleActionChange} />
            <Button type="submit" loading={mutations.saveAction.isPending}>
              <Plus size={16} />
              {t('leads.page.saveAction')}
            </Button>
          </form>

          <form onSubmit={handleCreateRule} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 grid gap-3">
            <h2 className="font-bold">{t('leads.page.newRuleTitle')}</h2>
            <Input label={t('leads.page.ruleNameLabel')} value={ruleForm.name} onChange={(event) => setRuleForm((current) => ({ ...current, name: event.target.value }))} />
            <label className="inline-flex items-center gap-2 text-sm font-arabic">
              <input
                type="checkbox"
                checked={ruleForm.active}
                onChange={(event) => setRuleForm((current) => ({ ...current, active: event.target.checked }))}
              />
              {t('leads.page.activeLabel')}
            </label>
            <Button type="submit" variant="accent" loading={mutations.createRule.isPending}>
              <Plus size={16} />
              {t('leads.page.createRule')}
            </Button>
          </form>
        </div>

        <section className="grid gap-4 min-w-0">
          <Input placeholder={t('leads.page.searchLogsPlaceholder')} value={search} onChange={(event) => setSearch(event.target.value)} startIcon={<Search size={16} />} />
          <ResourceState
            isLoading={logsQuery.isLoading}
            error={logsQuery.error}
            empty={filteredLogs.length === 0}
            emptyIcon={<Users size={24} />}
            emptyTitle={t('leads.noLeads')}
            emptyDescription={t('leads.page.noLogsOrLeadsMatch')}
            onRetry={logsQuery.refetch}
          >
            <div className="grid gap-3">
              {filteredLogs.map((log, index) => (
                <article key={log.id || index} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">Lead #{displayValue(log.lead_id || log.id, index + 1)}</h3>
                      <p className="text-sm text-[var(--text-muted)]">{displayValue(log.action || log.type || log.status)}</p>
                      <p className="text-sm text-[var(--text-muted)]">{displayValue(log.note || log.description || log.message)}</p>
                    </div>
                    <Badge variant="info">{displayValue(log.created_at || log.date)}</Badge>
                  </div>
                </article>
              ))}
            </div>
          </ResourceState>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h2 className="font-bold mb-3">{t('leads.page.distributionRulesTitle')}</h2>
            <ResourceState
              isLoading={rulesQuery.isLoading}
              error={rulesQuery.error}
              empty={rules.length === 0}
              emptyTitle={t('leads.page.noRulesFound')}
              onRetry={rulesQuery.refetch}
            >
              <div className="grid gap-2">
                {rules.map((rule, index) => (
                  <div key={rule.id || index} className="rounded-lg bg-[var(--surface-2)] p-3 flex items-center justify-between gap-3">
                    <span>{displayValue(rule.name || rule.rule_name, t('leads.page.ruleFallback', { id: rule.id || index + 1 }))}</span>
                    <Badge variant={rule.active === false ? 'danger' : 'success'}>{rule.active === false ? t('leads.page.inactiveLabel') : t('leads.page.activeLabel')}</Badge>
                  </div>
                ))}
              </div>
            </ResourceState>
          </div>
        </section>
      </div>
    </div>
  )
}
