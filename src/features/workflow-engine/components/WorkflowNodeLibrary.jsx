import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, GitBranch, Clock, TimerReset, Flag } from 'lucide-react'
import { Input } from '../../../shared/components/ui/Input'
import { getActionsForContext, getTriggersForContext } from '../registry/workflowRegistry'
import { resolveWorkflowIcon } from '../utils/resolveIcon'

const LOGIC_ITEMS = [
  { kind: 'condition', labelKey: 'workflow.builder.conditionLabel', icon: GitBranch },
  { kind: 'wait', labelKey: 'workflow.builder.waitLabel', icon: Clock },
  { kind: 'wait_for_event', labelKey: 'workflow.builder.waitForEventLabel', icon: TimerReset },
  { kind: 'end', labelKey: 'workflow.builder.endLabel', icon: Flag },
]

function DefinitionRow({ definition, onClick }) {
  const { t } = useTranslation()
  const Icon = resolveWorkflowIcon(definition.icon)

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-start text-sm hover:bg-[var(--surface-2)]"
    >
      <Icon size={16} className="shrink-0 text-[var(--text-muted)]" />
      <span className="min-w-0 flex-1 truncate">{t(definition.labelKey)}</span>
      {definition.backendSupport === false && (
        <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
          {t('workflow.builder.backendNotConnectedShort')}
        </span>
      )}
    </button>
  )
}

function Section({ title, children }) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null
  return (
    <div className="mb-4">
      <p className="mb-1 px-2 text-[11px] font-black uppercase tracking-wide text-[var(--text-muted)]">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

/**
 * Renders the node picker's content only (no modal/drawer chrome) — the
 * Builder decides whether to place this in a sidebar (desktop) or an
 * AppDrawer (mobile), per docs "Builder UX".
 *
 * mode="trigger" shows registered triggers (context module first).
 * mode="step" shows the four core Logic nodes plus registered actions,
 * grouped Recommended → this module → cross-module (see docs
 * "Cross-module Actions" — never hidden, always reachable).
 */
export function WorkflowNodeLibrary({ mode, context, onPickTrigger, onPickAction, onPickLogic }) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const term = search.trim().toLowerCase()

  const matchesSearch = (labelKey) => !term || t(labelKey).toLowerCase().includes(term)

  const triggerGroups = useMemo(() => {
    if (mode !== 'trigger') return null
    const { own, others } = getTriggersForContext({ module: context?.module })
    return { own: own.filter((d) => matchesSearch(d.labelKey)), others: others.map((g) => ({ ...g, triggers: g.triggers.filter((d) => matchesSearch(d.labelKey)) })).filter((g) => g.triggers.length) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, context?.module, term])

  const actionGroups = useMemo(() => {
    if (mode !== 'step') return null
    const { recommended, ownActions, crossModule } = getActionsForContext({ module: context?.module })
    return {
      recommended: recommended.filter((d) => matchesSearch(d.labelKey)),
      ownActions: ownActions.filter((d) => matchesSearch(d.labelKey)),
      crossModule: crossModule.map((g) => ({ ...g, actions: g.actions.filter((d) => matchesSearch(d.labelKey)) })).filter((g) => g.actions.length),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, context?.module, term])

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Input startIcon={<Search size={14} />} placeholder={t('workflow.builder.searchNodes')} value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {mode === 'trigger' && triggerGroups && (
          <>
            <Section title={t('workflow.builder.thisModuleTriggers')}>
              {triggerGroups.own.map((definition) => (
                <DefinitionRow key={definition.id} definition={definition} onClick={() => onPickTrigger(definition.id)} />
              ))}
            </Section>
            {triggerGroups.others.map((group) => (
              <Section key={group.module} title={t(group.labelKey)}>
                {group.triggers.map((definition) => (
                  <DefinitionRow key={definition.id} definition={definition} onClick={() => onPickTrigger(definition.id)} />
                ))}
              </Section>
            ))}
          </>
        )}

        {mode === 'step' && (
          <>
            <Section title={t('workflow.builder.logicSection')}>
              {LOGIC_ITEMS.filter((item) => matchesSearch(item.labelKey)).map((item) => (
                <button
                  key={item.kind}
                  type="button"
                  onClick={() => onPickLogic(item.kind)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-start text-sm hover:bg-[var(--surface-2)]"
                >
                  <item.icon size={16} className="shrink-0 text-[var(--text-muted)]" />
                  <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>
                </button>
              ))}
            </Section>

            {actionGroups && (
              <>
                <Section title={t('workflow.builder.recommendedActions')}>
                  {actionGroups.recommended.map((definition) => (
                    <DefinitionRow key={definition.id} definition={definition} onClick={() => onPickAction(definition.id)} />
                  ))}
                </Section>
                <Section title={t('workflow.builder.thisModuleActions')}>
                  {actionGroups.ownActions.map((definition) => (
                    <DefinitionRow key={definition.id} definition={definition} onClick={() => onPickAction(definition.id)} />
                  ))}
                </Section>
                {actionGroups.crossModule.map((group) => (
                  <Section key={group.module} title={t(group.labelKey)}>
                    {group.actions.map((definition) => (
                      <DefinitionRow key={definition.id} definition={definition} onClick={() => onPickAction(definition.id)} />
                    ))}
                  </Section>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
