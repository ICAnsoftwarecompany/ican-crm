import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { DropdownMenu } from '../../../../../shared/components/overlays/DropdownMenu'
import { cn } from '../../../../../shared/utils/cn'
import { localizeLabel } from '../../../core/utils/localizeLabel'
import { STATUS_CATEGORY_TONE, getAllowedTransitions } from '../../utils/caseStatus'

/** "Change status" menu built from the pipeline transitions of the case. */
export function CaseTransitionMenu({ caseItem, setup, onSelect, disabled }) {
  const { t, i18n } = useTranslation()
  const transitions = getAllowedTransitions(setup, caseItem)

  const items = transitions.map((target) => ({
    id: target.status.id,
    label: localizeLabel(target.status.label, i18n.language, target.status.key),
    icon: <span className={cn('h-2 w-2 rounded-full', STATUS_CATEGORY_TONE[target.status.category])} aria-hidden="true" />,
    onSelect: () => onSelect(caseItem, target),
  }))

  return (
    <DropdownMenu
      align="end"
      items={items}
      trigger={
        <Button variant="outline" disabled={disabled || !items.length}>
          {items.length ? t('service.cases.transition.menu') : t('service.cases.transition.none')}
          <ChevronDown size={16} aria-hidden="true" />
        </Button>
      }
    />
  )
}
