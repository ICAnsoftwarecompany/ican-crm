import { useTranslation } from 'react-i18next'
import { Plus, Trash2, X } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { Input } from '../../../shared/components/ui/Input'
import { Select } from '../../../shared/components/ui/Select'
import { getAction, getConditions, getModule, getTrigger, getTriggers } from '../registry/workflowRegistry'
import { CONDITION_OPERATORS, UNARY_OPERATORS } from '../constants/operators'
import { WAIT_UNITS } from '../core/nodeTypes'
import { findStepById } from '../core/workflowDomainModel'
import { useDataSourceOptions } from '../hooks/useDataSourceOptions'
import { WorkflowFieldRenderer } from './fields/WorkflowFieldRenderer'

function ConditionValueSelect({ source, value, onChange }) {
  const { t } = useTranslation()
  const { options, isLoading } = useDataSourceOptions(source)
  return (
    <Select
      label={t('workflow.builder.valueLabel')}
      value={value ? String(value) : ''}
      onChange={onChange}
      options={options.map((option) => ({ value: option.value, label: option.labelKey ? t(option.labelKey) : option.label }))}
      placeholder={isLoading ? t('common.loading') : t('workflow.fields.selectPlaceholder')}
    />
  )
}

function DefinitionFields({ definition, config, onChange, variables }) {
  const { t } = useTranslation()
  if (!definition) return null

  return (
    <div className="space-y-3">
      {definition.descriptionKey && <p className="text-xs text-[var(--text-muted)]">{t(definition.descriptionKey)}</p>}
      {(definition.fields || []).map((field) => (
        <WorkflowFieldRenderer
          key={field.key}
          field={field}
          value={config?.[field.key]}
          onChange={(value) => onChange({ [field.key]: value })}
          variables={variables}
        />
      ))}
      {(definition.fields || []).length === 0 && <p className="text-xs text-[var(--text-muted)]">{t('workflow.builder.noConfigNeeded')}</p>}
    </div>
  )
}

function ConditionEditor({ step, module, onChangeConfig }) {
  const { t } = useTranslation()
  const rules = step.config?.conditions || []
  const registeredConditions = getConditions(module)

  const updateRule = (index, patch) => {
    const next = [...rules]
    next[index] = { ...next[index], ...patch }
    onChangeConfig({ conditions: next })
  }

  const addRule = () => onChangeConfig({ conditions: [...rules, { field: '', operator: 'equals', value: '' }] })
  const addFromRegistry = (definitionId) => {
    if (!definitionId) return
    const definition = registeredConditions.find((entry) => entry.id === definitionId)
    if (!definition) return
    onChangeConfig({
      conditions: [
        ...rules,
        { field: definition.id, fieldLabel: t(definition.labelKey), operator: definition.operators?.[0] || 'equals', value: '', source: definition.fields?.[0]?.source },
      ],
    })
  }
  const removeRule = (index) => onChangeConfig({ conditions: rules.filter((_, i) => i !== index) })

  return (
    <div className="space-y-3">
      {registeredConditions.length > 0 && (
        <Select
          label={t('workflow.builder.quickAddCondition')}
          value=""
          onChange={addFromRegistry}
          options={registeredConditions.map((definition) => ({ value: definition.id, label: t(definition.labelKey) }))}
          placeholder={t('workflow.fields.selectPlaceholder')}
        />
      )}

      {rules.length > 1 && (
        <Select
          label={t('workflow.builder.groupOperatorLabel')}
          value={step.config?.groupOperator || 'and'}
          onChange={(value) => onChangeConfig({ groupOperator: value })}
          options={[
            { value: 'and', label: t('workflow.builder.groupOperator.and') },
            { value: 'or', label: t('workflow.builder.groupOperator.or') },
          ]}
        />
      )}

      {rules.map((rule, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-[var(--border)] p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)]">{t('workflow.builder.ruleLabel', { index: index + 1 })}</span>
            <button type="button" onClick={() => removeRule(index)} aria-label={t('actions.delete')}>
              <X size={14} />
            </button>
          </div>
          {rule.fieldLabel ? (
            <Input label={t('workflow.builder.fieldLabel')} value={rule.fieldLabel} disabled />
          ) : (
            <Input
              label={t('workflow.builder.fieldLabel')}
              value={rule.field}
              onChange={(event) => updateRule(index, { field: event.target.value })}
              placeholder={t('workflow.builder.fieldPlaceholder')}
            />
          )}
          <Select
            label={t('workflow.builder.operatorLabel')}
            value={rule.operator}
            onChange={(value) => updateRule(index, { operator: value })}
            options={CONDITION_OPERATORS.map((operator) => ({ value: operator.value, label: t(operator.labelKey) }))}
          />
          {!UNARY_OPERATORS.includes(rule.operator) && (
            rule.source ? (
              <ConditionValueSelect source={rule.source} value={rule.value} onChange={(value) => updateRule(index, { value })} />
            ) : (
              <Input label={t('workflow.builder.valueLabel')} value={rule.value} onChange={(event) => updateRule(index, { value: event.target.value })} />
            )
          )}
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addRule}>
        <Plus size={14} />
        {t('workflow.builder.addRule')}
      </Button>
    </div>
  )
}

function WaitEditor({ step, onChangeConfig }) {
  const { t } = useTranslation()
  const config = step.config || {}

  return (
    <div className="space-y-3">
      <Select
        label={t('workflow.builder.waitModeLabel')}
        value={config.mode || 'duration'}
        onChange={(value) => onChangeConfig({ mode: value })}
        options={[
          { value: 'duration', label: t('workflow.builder.waitModeDuration') },
          { value: 'until', label: t('workflow.builder.waitModeUntil') },
        ]}
      />
      {(config.mode || 'duration') === 'duration' ? (
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" label={t('workflow.builder.valueLabel')} value={config.value ?? ''} onChange={(event) => onChangeConfig({ value: Number(event.target.value) })} />
          <Select
            label={t('workflow.builder.unitLabel')}
            value={config.unit || 'days'}
            onChange={(value) => onChangeConfig({ unit: value })}
            options={WAIT_UNITS.map((unit) => ({ value: unit, label: t(`workflow.builder.units.${unit}`) }))}
          />
        </div>
      ) : (
        <Input type="datetime-local" label={t('workflow.builder.untilLabel')} value={config.until || ''} onChange={(event) => onChangeConfig({ until: event.target.value })} />
      )}
    </div>
  )
}

function WaitForEventEditor({ step, onChangeConfig }) {
  const { t } = useTranslation()
  const config = step.config || {}
  const triggerOptions = getTriggers().map((trigger) => ({ value: trigger.id, label: `${t(getModule(trigger.module)?.labelKey || trigger.module)} · ${t(trigger.labelKey)}` }))

  return (
    <div className="space-y-3">
      <Select
        label={t('workflow.builder.eventLabel')}
        value={config.eventTriggerId || ''}
        onChange={(value) => onChangeConfig({ eventTriggerId: value })}
        options={triggerOptions}
        placeholder={t('workflow.fields.selectPlaceholder')}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" label={t('workflow.builder.timeoutValueLabel')} value={config.timeout?.value ?? ''} onChange={(event) => onChangeConfig({ timeout: { ...config.timeout, value: Number(event.target.value) } })} />
        <Select
          label={t('workflow.builder.unitLabel')}
          value={config.timeout?.unit || 'days'}
          onChange={(value) => onChangeConfig({ timeout: { ...config.timeout, unit: value } })}
          options={WAIT_UNITS.map((unit) => ({ value: unit, label: t(`workflow.builder.units.${unit}`) }))}
        />
      </div>
      <p className="text-xs text-[var(--text-muted)]">{t('workflow.builder.waitForEventNoSchedulerNote')}</p>
    </div>
  )
}

/**
 * Dynamic configuration panel. Renders from the selected definition's
 * `fields` wherever possible (see docs "Reusable Properties Panel") —
 * condition/wait/wait-for-event have bespoke editors here because they are
 * core engine concepts, not module definitions.
 */
export function WorkflowNodeProperties({ workflow, selection, onChangeTriggerConfig, onChangeStepConfig, onRemoveStep, onClose }) {
  const { t } = useTranslation()

  if (!selection) {
    return <p className="p-4 text-sm text-[var(--text-muted)]">{t('workflow.builder.selectNodeHint')}</p>
  }

  if (selection.kind === 'trigger') {
    const definition = workflow.trigger?.definitionId ? getTrigger(workflow.trigger.definitionId) : null
    return (
      <div className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-black text-[var(--text)]">{definition ? t(definition.labelKey) : t('workflow.builder.triggerLabel')}</h3>
          {onClose && <button type="button" onClick={onClose} aria-label={t('actions.close')}><X size={16} /></button>}
        </div>
        <DefinitionFields definition={definition} config={workflow.trigger?.config} onChange={(patch) => onChangeTriggerConfig(patch)} variables={[]} />
      </div>
    )
  }

  const step = findStepById(workflow.rootStep, selection.stepId)
  if (!step) return null

  const variables = getModule(workflow.module)?.variables || []
  const changeConfig = (patch) => onChangeStepConfig(step.id, patch)

  let body = null
  let title = ''

  if (step.type === 'action') {
    const definition = getAction(step.definitionId)
    title = definition ? t(definition.labelKey) : t('workflow.builder.actionLabel')
    body = <DefinitionFields definition={definition} config={step.config} onChange={changeConfig} variables={variables} />
  } else if (step.type === 'condition') {
    title = t('workflow.builder.conditionLabel')
    body = <ConditionEditor step={step} module={workflow.module} onChangeConfig={changeConfig} />
  } else if (step.type === 'wait') {
    title = t('workflow.builder.waitLabel')
    body = <WaitEditor step={step} onChangeConfig={changeConfig} />
  } else if (step.type === 'wait_for_event') {
    title = t('workflow.builder.waitForEventLabel')
    body = <WaitForEventEditor step={step} onChangeConfig={changeConfig} />
  } else if (step.type === 'end') {
    title = t('workflow.builder.endLabel')
    body = <p className="text-xs text-[var(--text-muted)]">{t('workflow.builder.endDescription')}</p>
  }

  return (
    <div className="p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-black text-[var(--text)]">{title}</h3>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => onRemoveStep(step.id)} className="rounded p-1 text-[#EF4444] hover:bg-red-50" aria-label={t('actions.delete')}>
            <Trash2 size={16} />
          </button>
          {onClose && <button type="button" onClick={onClose} aria-label={t('actions.close')}><X size={16} /></button>}
        </div>
      </div>
      {body}
    </div>
  )
}
