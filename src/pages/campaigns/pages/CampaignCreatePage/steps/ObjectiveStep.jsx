import { Eye, MessageSquare, MousePointerClick, ShoppingCart, Smartphone, Target } from 'lucide-react'
import { CardOption } from '../components/CardOption'
import { META_CAMPAIGN_OBJECTIVES } from '../config/metaObjectives'

const OBJECTIVE_ICONS = {
  OUTCOME_AWARENESS: Eye,
  OUTCOME_TRAFFIC: MousePointerClick,
  OUTCOME_ENGAGEMENT: MessageSquare,
  OUTCOME_LEADS: Target,
  OUTCOME_SALES: ShoppingCart,
  OUTCOME_APP_PROMOTION: Smartphone,
}

export function ObjectiveStep({ t, objective, onChange, onFocusField, onBlurField }) {
  return (
    <div>
      <p className="mb-4 text-sm text-[var(--text-muted)]">{t('campaigns.create.objectiveStep.intro')}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {META_CAMPAIGN_OBJECTIVES.map((value) => (
          <CardOption
            key={value}
            icon={OBJECTIVE_ICONS[value]}
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
