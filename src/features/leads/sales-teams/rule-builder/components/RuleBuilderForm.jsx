import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Check, GitBranch } from 'lucide-react'
import { ModulePageHeader } from '../../../../../shared/components/module-pages'
import { Button } from '../../../../../shared/components/ui/Button'
import { useRuleBuilder } from '../hooks/useRuleBuilder'
import { RuleBuilderStepper } from './RuleBuilderStepper'
import { StepHelpPanel } from './StepHelpPanel'
import { RuleSummaryCard } from './RuleSummaryCard'
import { BasicsStep } from './steps/BasicsStep'
import { ConditionsStep } from './steps/ConditionsStep'
import { MethodStep } from './steps/MethodStep'
import { TargetStep } from './steps/TargetStep'
import { PriorityStep } from './steps/PriorityStep'
import { ReviewStep } from './steps/ReviewStep'

const STEP_COMPONENTS = { basics: BasicsStep, conditions: ConditionsStep, method: MethodStep, target: TargetStep, priority: PriorityStep, review: ReviewStep }

/** Header + stepper + current step (with its intro) + help and live summary on the side + back / next / save. */
export function RuleBuilderForm({ data, rule, initialForm, onDone }) {
  const { t } = useTranslation()
  const builder = useRuleBuilder({ initialForm, ruleId: rule?.id, onSaved: onDone })
  const Step = STEP_COMPONENTS[builder.step]
  const context = { teams: data.teams, users: data.users, teamById: data.teamById, userById: data.userById, rules: data.rules, editingId: rule?.id || '' }

  return (
    <div className="space-y-4">
      <ModulePageHeader
        icon={GitBranch}
        title={builder.isEdit ? t('salesTeams.builder.editTitle', { name: rule?.name || '' }) : t('salesTeams.builder.newTitle')}
        description={t('salesTeams.builder.description')}
        actions={<Button variant="outline" onClick={onDone}>{t('salesTeams.builder.cancel')}</Button>}
      />

      <RuleBuilderStepper steps={builder.steps} current={builder.step} reachable={builder.reachable} onSelect={builder.goTo} />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)]" aria-labelledby="rule-step-title">
          <header className="border-b border-[var(--border)] px-5 py-4">
            <p className="text-xs font-semibold text-[var(--brand-accent)]">
              {t('salesTeams.builder.stepOf', { current: builder.stepIndex + 1, total: builder.steps.length })}
            </p>
            <h2 id="rule-step-title" className="mt-1 text-lg font-bold text-[var(--text)]">{t(`salesTeams.builder.steps.${builder.step}.title`)}</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{t(`salesTeams.builder.steps.${builder.step}.intro`)}</p>
          </header>

          <div className="px-5 py-5">
            <Step builder={builder} context={context} />
          </div>

          {builder.serverError && <p role="alert" className="px-5 pb-3 text-sm text-red-600 dark:text-red-300">{builder.serverError}</p>}

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] px-5 py-3">
            <Button variant="ghost" onClick={builder.back} disabled={builder.isFirst}>
              <ArrowRight size={16} className="ltr:rotate-180" aria-hidden="true" />
              {t('salesTeams.builder.back')}
            </Button>
            {builder.isLast ? (
              <Button variant="accent" onClick={builder.submit} loading={builder.saving}>
                <Check size={16} />
                {builder.isEdit ? t('salesTeams.common.save') : t('salesTeams.rules.create')}
              </Button>
            ) : (
              <Button variant="accent" onClick={builder.next}>
                {t('salesTeams.builder.next')}
                <ArrowLeft size={16} className="ltr:rotate-180" aria-hidden="true" />
              </Button>
            )}
          </footer>
        </section>

        <aside className="grid gap-4 lg:sticky lg:top-20">
          <StepHelpPanel step={builder.step} />
          <RuleSummaryCard form={builder.form} context={context} />
        </aside>
      </div>
    </div>
  )
}
