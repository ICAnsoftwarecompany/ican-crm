import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ChevronDown, Zap } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { DropdownMenu } from '../../../../shared/components/overlays/DropdownMenu'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useCaseMutations } from '../../cases/hooks/useCases'
import { useResourceList } from '../../settings/api/settingsApi'
import { macrosResource } from '../../settings/resources/communicationResources'

/**
 * Case header menu that runs a macro. The server applies every action
 * atomically (and rejects the macro if a status change is not allowed).
 */
export function MacroMenu({ caseItem, disabled }) {
  const { t, i18n } = useTranslation()
  const macros = useResourceList(macrosResource)
  const { applyMacro } = useCaseMutations()
  const active = (macros.data || []).filter((macro) => macro.active !== false)

  const run = (macro) =>
    applyMacro.mutate(
      { caseId: caseItem.id, macro_id: macro.id, version: caseItem.version, language: i18n.language },
      { onSuccess: () => toast.success(t('service.replies.macroApplied', { name: localizeLabel(macro.name, i18n.language) })) }
    )

  if (!active.length) return null

  return (
    <DropdownMenu
      align="end"
      contentClassName="w-72"
      items={active.map((macro) => ({
        id: macro.id,
        label: (
          <span className="grid min-w-0 gap-0.5 text-start">
            <span className="truncate">{localizeLabel(macro.name, i18n.language, macro.id)}</span>
            {macro.description && <span className="text-xs font-normal text-[var(--text-muted)]">{localizeLabel(macro.description, i18n.language)}</span>}
          </span>
        ),
        onSelect: () => run(macro),
      }))}
      trigger={
        <Button variant="outline" disabled={disabled || applyMacro.isPending} loading={applyMacro.isPending}>
          <Zap size={16} aria-hidden="true" />
          {t('service.replies.macros')}
          <ChevronDown size={16} aria-hidden="true" />
        </Button>
      }
    />
  )
}
