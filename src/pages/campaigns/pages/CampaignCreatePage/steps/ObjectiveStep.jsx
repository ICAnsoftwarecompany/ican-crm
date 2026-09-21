import { Eye, MessageSquare, MousePointerClick, ShoppingCart, Smartphone, Target } from 'lucide-react'
import { CardOption } from '../components/CardOption'

// Full ODAX outcome objective set (today's wizard only had 2 of these).
const OBJECTIVES = [
  { value: 'OUTCOME_AWARENESS', icon: Eye },
  { value: 'OUTCOME_TRAFFIC', icon: MousePointerClick },
  { value: 'OUTCOME_ENGAGEMENT', icon: MessageSquare },
  { value: 'OUTCOME_LEADS', icon: Target },
  { value: 'OUTCOME_APP_PROMOTION', icon: Smartphone },
  { value: 'OUTCOME_SALES', icon: ShoppingCart },
]

export function ObjectiveStep({ t, objective, onChange, onFocusField, onBlurField }) {
  return (
    <div>
      <p className="mb-4 text-sm text-[var(--text-muted)]">{t('campaigns.create.objectiveStep.intro')}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {OBJECTIVES.map(({ value, icon }) => (
          <CardOption
            key={value}
            icon={icon}
            title={t(`campaigns.objectives.${value}`)}
            description={t(`campaigns.create.objectiveStep.useWhen.${value}`)}
            selected={objective === value}
            onSelect={() => onChange(value)}
            onFocusGuide={() => onFocusField(`objective.${value}`)}
            onBlurGuide={onBlurField}
          />
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--text-muted)]">{t('campaigns.create.objectiveStep.lockedNote')}</p>
    </div>
  )
}
