import { useTranslation } from 'react-i18next'
import { AppWindow, Eye, FileText, MessageCircle, MessagesSquare, MousePointerClick, Phone, PlaySquare, ShoppingCart, Smartphone, Sparkles, Target, ThumbsUp, Zap } from 'lucide-react'
import { Badge } from '../../../../shared/components/ui/Badge'
import { ChoiceCard, SectionCard } from '../components/fields'
import { useMetaWizard, useWizardField } from '../context/MetaWizardContext'
import { META_CAMPAIGN_OBJECTIVES } from '../config/metaObjectives'
import { CAMPAIGN_PRESETS } from '../config/campaignPresets'
import { getAdSetOptionsForObjective } from '../config/metaAdSetCompatibility'
import { IssueMessage } from '../components/fields/FieldFrame'

export const OBJECTIVE_ICONS = {
  OUTCOME_AWARENESS: Eye,
  OUTCOME_TRAFFIC: MousePointerClick,
  OUTCOME_ENGAGEMENT: MessagesSquare,
  OUTCOME_LEADS: Target,
  OUTCOME_SALES: ShoppingCart,
  OUTCOME_APP_PROMOTION: Smartphone,
}

export const PRESET_ICONS = {
  form: FileText,
  whatsapp: MessageCircle,
  messenger: MessagesSquare,
  phone: Phone,
  target: Target,
  click: MousePointerClick,
  cart: ShoppingCart,
  video: PlaySquare,
  like: ThumbsUp,
  eye: Eye,
  app: AppWindow,
}

/**
 * Stage 1. Two ways in: a ready-made template (recommended for most
 * users) or picking the Meta objective directly.
 */
export function ObjectiveStep() {
  const { t } = useTranslation()
  const { state, actions } = useMetaWizard()
  const { issue } = useWizardField('objective', 'objective')

  return (
    <div className="grid gap-4">
      <SectionCard icon={Zap} title={t('campaignWizard.objectiveStep.presetsTitle')} description={t('campaignWizard.objectiveStep.presetsDescription')}>
        <div role="radiogroup" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {CAMPAIGN_PRESETS.map((preset) => (
            <ChoiceCard
              key={preset.id}
              compact
              icon={PRESET_ICONS[preset.icon]}
              title={t(`campaignWizard.presets.${preset.id}.title`)}
              description={t(`campaignWizard.presets.${preset.id}.description`)}
              badge={preset.recommended ? <Badge variant="success">{t('campaignWizard.common.recommended')}</Badge> : null}
              selected={state.presetId === preset.id}
              onSelect={() => actions.applyPreset(preset.id)}
              onFocus={() => actions.setFocusedField(`presets.${preset.id}`)}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={Sparkles} title={t('campaignWizard.objectiveStep.objectivesTitle')} description={t('campaignWizard.objectiveStep.objectivesDescription')} fieldPath="objective">
        <div role="radiogroup" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {META_CAMPAIGN_OBJECTIVES.map((objective) => {
            const { locations } = getAdSetOptionsForObjective(objective)
            return (
              <ChoiceCard
                key={objective}
                icon={OBJECTIVE_ICONS[objective]}
                title={t(`campaignWizard.objectives.${objective}.title`)}
                description={t(`campaignWizard.objectives.${objective}.description`)}
                selected={state.objective === objective}
                onSelect={() => actions.setObjective(objective)}
                onFocus={() => actions.setFocusedField(`objectives.${objective}`)}
                footer={(
                  <div className="flex flex-wrap gap-1">
                    {locations.filter((location) => location !== 'default').slice(0, 5).map((location) => (
                      <span key={location} className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">{t(`campaignWizard.locations.${location}.title`)}</span>
                    ))}
                    {locations.length > 5 && <span className="text-[10px] text-[var(--text-light)]" dir="ltr">+{locations.length - 5}</span>}
                  </div>
                )}
              />
            )
          })}
        </div>
        {issue && <IssueMessage issue={issue} />}
        <p className="text-xs text-[var(--text-muted)]">{t('campaignWizard.objectiveStep.lockedNote')}</p>
      </SectionCard>
    </div>
  )
}
