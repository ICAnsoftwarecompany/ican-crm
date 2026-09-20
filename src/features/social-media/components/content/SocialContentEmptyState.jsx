import { useTranslation } from 'react-i18next'
import { ImageOff, FilterX, Unplug } from 'lucide-react'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'

const VARIANTS = {
  noIntegration: { icon: Unplug, titleKey: 'socialMedia.emptyStates.noIntegration.title', descriptionKey: 'socialMedia.emptyStates.noIntegration.description' },
  noPages: { icon: Unplug, titleKey: 'socialMedia.emptyStates.noPages.title', descriptionKey: 'socialMedia.emptyStates.noPages.description' },
  noContent: { icon: ImageOff, titleKey: 'socialMedia.emptyStates.noContent.title', descriptionKey: 'socialMedia.emptyStates.noContent.description' },
  noFilterResults: { icon: FilterX, titleKey: 'socialMedia.emptyStates.noFilterResults.title', descriptionKey: 'socialMedia.emptyStates.noFilterResults.description' },
}

/** One of the standard Social Media empty states (see docs "Empty States") — a fixed vocabulary so every screen stays consistent instead of ad hoc copy. */
export function SocialContentEmptyState({ variant = 'noContent', action }) {
  const { t } = useTranslation()
  const config = VARIANTS[variant] || VARIANTS.noContent
  const Icon = config.icon

  return <EmptyState icon={<Icon size={24} />} title={t(config.titleKey)} description={t(config.descriptionKey)} action={action} />
}
