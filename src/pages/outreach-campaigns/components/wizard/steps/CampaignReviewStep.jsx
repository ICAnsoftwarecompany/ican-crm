import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { CampaignChannelBadge } from '../../CampaignChannelBadge'
import { getChannelDefinition } from '../../../../../features/outreach-campaigns/config/campaignChannels'
import { evaluateAudienceEligibility, getCustomerName } from '../../../../../features/outreach-campaigns/utils/campaignAudience'
import { useFacebookIntegrations } from '../../../../../features/meta-integrations/hooks/useFacebookIntegrations'
import { useGmailMailboxes } from '../../../../../features/conversations/hooks/useGmailConversations'
import { useAuthStore } from '../../../../../store/authStore'
import { resolveTenantId } from '../../../../../services/tenantResolver'

/**
 * Step 7 — Review & Launch. Warnings inform but don't block; only
 * `blockingErrors` (from campaignFormSchema, surfaced by the wizard shell)
 * prevent launch.
 */
export function CampaignReviewStep({ form }) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const tenant = resolveTenantId(user)
  const definition = getChannelDefinition(form.channel)

  const integrationsQuery = useFacebookIntegrations(tenant)
  const gmailMailboxesQuery = useGmailMailboxes()
  const isConnected = form.channel === 'gmail'
    ? (gmailMailboxesQuery.data || []).length > 0
    : (integrationsQuery.data?.[form.channel] || []).length > 0

  const { eligible, ineligible, unknown } = evaluateAudienceEligibility(form.audience.customers, form.channel)

  const warnings = []
  if (!isConnected) warnings.push(t('outreachCampaigns.review.warnings.notConnected', { channel: definition ? t(definition.labelKey) : form.channel }))
  if (ineligible.length > 0) warnings.push(t('outreachCampaigns.review.warnings.ineligible', { count: ineligible.length, field: t(`outreachCampaigns.audience.${form.channel === 'whatsapp' ? 'missingPhone' : 'missingEmail'}`) }))
  if (unknown.length > 0) warnings.push(t('outreachCampaigns.review.warnings.eligibilityUnknown', { count: unknown.length }))
  if (form.team.userIds.length === 0) warnings.push(t('outreachCampaigns.review.warnings.noAssignees'))
  if (form.channel === 'whatsapp') {
    const { headerParams = [], bodyParams = [] } = form.content.whatsapp
    const incomplete = [...headerParams, ...bodyParams].some((value) => !value?.trim())
    if (incomplete) warnings.push(t('outreachCampaigns.review.warnings.incompleteVariables'))
  }

  const rows = [
    { label: t('outreachCampaigns.review.name'), value: form.name },
    { label: t('outreachCampaigns.review.objective'), value: form.objective ? t(`outreachCampaigns.objectives.${form.objective}`) : '—' },
    { label: t('outreachCampaigns.review.audience'), value: t('outreachCampaigns.audience.matchCount', { count: form.audience.customers.length }) },
    { label: t('outreachCampaigns.review.schedule'), value: `${form.schedule.date} ${form.schedule.time}` },
    { label: t('outreachCampaigns.review.team'), value: form.team.userIds.length },
    { label: t('outreachCampaigns.review.attachments'), value: form.stagedAttachments.length },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-[var(--text-muted)]">{t('outreachCampaigns.review.channel')}:</span>
        <CampaignChannelBadge channel={form.channel} />
      </div>

      <dl className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-bold text-[var(--text-muted)]">{row.label}</dt>
            <dd className="text-sm font-semibold text-[var(--text)]">{row.value || '—'}</dd>
          </div>
        ))}
      </dl>

      {eligible.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold text-[var(--text-muted)]">{t('outreachCampaigns.review.eligibleSample')}</p>
          <div className="flex flex-wrap gap-2">
            {eligible.slice(0, 8).map((customer) => (
              <span key={customer.id} className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-xs font-semibold text-[var(--text)]">
                {getCustomerName(customer)}
              </span>
            ))}
            {eligible.length > 8 && <span className="text-xs text-[var(--text-muted)]">+{eligible.length - 8}</span>}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
          {warnings.map((warning) => (
            <div key={warning} className="flex items-start gap-2 text-sm text-amber-800">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
