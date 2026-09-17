import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { CAMPAIGN_CHANNEL_LIST } from '../../../../../features/outreach-campaigns/config/campaignChannels'
import { useFacebookIntegrations } from '../../../../../features/meta-integrations/hooks/useFacebookIntegrations'
import { useGmailMailboxes } from '../../../../../features/conversations/hooks/useGmailConversations'
import { useAuthStore } from '../../../../../store/authStore'
import { resolveTenantId } from '../../../../../services/tenantResolver'

/**
 * Step 3 — Channel.
 *
 * Distinguishes the two states the spec requires kept separate:
 * 1) channel not available to this tenant's package — there is no
 *    package/entitlement system in this codebase today (confirmed), so
 *    every channel is always "available"; only connection state is real.
 * 2) channel available but not connected — computed from actual connected-
 *    integration data (Meta integrations query for WhatsApp/Messenger,
 *    Gmail mailboxes query for Gmail), never fabricated.
 */
export function CampaignChannelStep({ form, onChange }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const tenant = resolveTenantId(user)

  const integrationsQuery = useFacebookIntegrations(tenant)
  const gmailMailboxesQuery = useGmailMailboxes()

  const connectionByChannel = {
    whatsapp: (integrationsQuery.data?.whatsapp || []).length > 0,
    messenger: (integrationsQuery.data?.messenger || []).length > 0,
    gmail: (gmailMailboxesQuery.data || []).length > 0,
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {CAMPAIGN_CHANNEL_LIST.map((definition) => {
        const Icon = definition.icon
        const isConnected = connectionByChannel[definition.key]
        const isSelected = form.channel === definition.key

        return (
          <button
            key={definition.key}
            type="button"
            onClick={() => onChange({ channel: definition.key })}
            className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-start transition-colors ${
              isSelected ? 'border-[#00C2CB] bg-[#E8F9FA]' : 'border-[var(--border)] bg-[var(--surface)] hover:border-[#00C2CB]/50'
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${definition.accent}1A`, color: definition.accent }}>
                <Icon size={20} />
              </span>
              {isConnected ? (
                <span className="flex items-center gap-1 text-xs font-bold text-[#087D3E]">
                  <CheckCircle2 size={14} />
                  {t('outreachCampaigns.channelStep.connected')}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-[#B45309]">
                  <AlertTriangle size={14} />
                  {t('outreachCampaigns.channelStep.notConnected')}
                </span>
              )}
            </div>
            <div>
              <h4 className="text-sm font-black text-[var(--text)]">{t(definition.labelKey)}</h4>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{t(definition.descriptionKey)}</p>
            </div>
            {!isConnected && definition.key !== 'gmail' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation()
                  navigate('/settings/integrations')
                }}
              >
                {t('outreachCampaigns.channelStep.setup')}
              </Button>
            )}
          </button>
        )
      })}
    </div>
  )
}
