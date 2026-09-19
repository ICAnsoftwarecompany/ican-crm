import { Workflow } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '../feedback/EmptyState'

/** Reuses the shared EmptyState — VisualFlow never invents its own empty-state UI. */
export function VisualFlowEmptyState({ titleKey = 'visualFlow.empty.title', descriptionKey = 'visualFlow.empty.description', action }) {
  const { t } = useTranslation()
  return <EmptyState icon={<Workflow size={24} />} title={t(titleKey)} description={t(descriptionKey)} action={action} />
}
