import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, UserCheck } from 'lucide-react'
import { Badge } from '../../../shared/components/ui/Badge'
import { Button } from '../../../shared/components/ui/Button'
import { Input } from '../../../shared/components/ui/Input'
import { ResourceState } from '../../../shared/components/data/ResourceState'
import { displayValue, extractMessage } from '../../../shared/utils/apiResponse'
import { useAssignmentRules, useLeadMutations } from '../hooks/useLeads'

const EMPTY_RULE = { name: '', active: true }

/**
 * Lead assignment rules: list + create. Moved from the removed /leads page (2026-10-01) to
 * /LeadsCenter/assignments. Same endpoints and payload as before:
 * GET /api/tenant/lead-assignment/rules, POST .../create/rule with { name, active }.
 */
export function AssignmentRulesPanel() {
  const { t } = useTranslation()
  const rulesQuery = useAssignmentRules()
  const mutations = useLeadMutations()
  const [ruleForm, setRuleForm] = useState(EMPTY_RULE)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const rules = rulesQuery.data || []

  const handleCreateRule = async (event) => {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')
    try {
      await mutations.createRule.mutateAsync(ruleForm)
      setRuleForm(EMPTY_RULE)
      setMessage(t('leads.page.ruleCreated'))
    } catch (error) {
      setErrorMessage(extractMessage(error, t('leads.page.ruleCreateFailed')))
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <form onSubmit={handleCreateRule} className="grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-bold text-[var(--text)]">{t('leads.page.newRuleTitle')}</h2>
        <Input
          label={t('leads.page.ruleNameLabel')}
          value={ruleForm.name}
          onChange={(event) => setRuleForm((current) => ({ ...current, name: event.target.value }))}
        />
        <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--brand-accent)]"
            checked={ruleForm.active}
            onChange={(event) => setRuleForm((current) => ({ ...current, active: event.target.checked }))}
          />
          {t('leads.page.activeLabel')}
        </label>
        <Button type="submit" variant="accent" loading={mutations.createRule.isPending} disabled={!ruleForm.name.trim()}>
          <Plus size={16} />
          {t('leads.page.createRule')}
        </Button>
        {message && <p role="status" className="text-sm text-emerald-600 dark:text-emerald-300">{message}</p>}
        {errorMessage && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{errorMessage}</p>}
      </form>

      <section className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="mb-3 text-sm font-bold text-[var(--text)]">{t('leads.page.distributionRulesTitle')}</h2>
        <ResourceState
          isLoading={rulesQuery.isLoading}
          error={rulesQuery.error}
          empty={rules.length === 0}
          emptyIcon={<UserCheck size={24} />}
          emptyTitle={t('leads.page.noRulesFound')}
          onRetry={rulesQuery.refetch}
        >
          <ul className="grid gap-2">
            {rules.map((rule, index) => (
              <li key={rule.id || index} className="flex items-center justify-between gap-3 rounded-lg bg-[var(--surface-2)] p-3 text-sm text-[var(--text)]">
                <span className="min-w-0 truncate">{displayValue(rule.name || rule.rule_name, t('leads.page.ruleFallback', { id: rule.id || index + 1 }))}</span>
                <Badge variant={rule.active === false ? 'danger' : 'success'}>
                  {rule.active === false ? t('leads.page.inactiveLabel') : t('leads.page.activeLabel')}
                </Badge>
              </li>
            ))}
          </ul>
        </ResourceState>
      </section>
    </div>
  )
}
