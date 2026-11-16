import { useTranslation } from 'react-i18next'
import { Bot } from 'lucide-react'
import { AiSetupPage } from '../../../shared/components/ai-setup'
import { LEAD_AI_CAPABILITIES } from '../../../features/leads'

/** /LeadsCenter/ai — shared AI setup for the Leads Center (added 2026-10-01; per-browser draft until features/ai exists). */
export function LeadsAiSetupPage() {
  const { t } = useTranslation()
  const capabilities = LEAD_AI_CAPABILITIES.map((id) => ({
    id,
    label: t(`customers.ai.capabilities.${id}.label`),
    description: t(`customers.ai.capabilities.${id}.description`),
  }))

  return (
    <AiSetupPage
      scopeKey="leads-center"
      icon={Bot}
      title={t('customers.nav.aiSetup')}
      description={t('customers.ai.description')}
      capabilities={capabilities}
    />
  )
}
