import { useTranslation } from 'react-i18next'
import { visibleCapabilities } from '../../constants/capabilityRegistry'
import { useCapabilityName } from '../../components/common/catalogUi'

/** Under the step guide in the tutorial panel: what the chosen item type changes in this step (or that it is manual). */
export function StepTypeNote({ step, itemType, typeDefaults }) {
  const { t } = useTranslation()
  const capabilityName = useCapabilityName()
  if (step === 'review') return null
  if (!itemType) return <p className="text-xs leading-5 text-[var(--text-muted)]">{t(`productSetup.steps.${step}.manual`)}</p>
  const values = {
    type: itemType.name,
    units: typeDefaults?.units || 0,
    relations: typeDefaults?.relations || 0,
    capabilities: visibleCapabilities(itemType.capabilities).map((capability) => capabilityName(capability.code)).join(' · ') || '—',
  }
  return <p className="text-xs leading-5 text-[var(--text-muted)]">{t(`productSetup.steps.${step}.withType`, values)}</p>
}
