import { useTranslation } from 'react-i18next'
import { Select } from '../../../../../shared/components/ui/Select'
import { Input } from '../../../../../shared/components/ui/Input'
import { useFacebookIntegrations } from '../../../../../features/meta-integrations/hooks/useFacebookIntegrations'
import { useAuthStore } from '../../../../../store/authStore'
import { resolveTenantId } from '../../../../../services/tenantResolver'
import { MessengerMessagePreview } from '../../preview/MessengerMessagePreview'

function Textarea({ label, value, onChange, rows = 8 }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium font-arabic text-[var(--text)]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-arabic text-[var(--text)] outline-none focus:ring-2 focus:ring-[#00C2CB]"
      />
    </label>
  )
}

/**
 * Messenger campaign content.
 *
 * BACKEND CLARIFICATION REQUIRED (see docs "Backend Gaps"): the create
 * endpoint's `external_id` field is only documented as "a number", with no
 * confirmed link to a specific customer/page/integration record. As a
 * best-effort (not a guess presented as fact), we let the user pick from
 * the tenant's connected Messenger pages (from the same Meta integrations
 * data already used in Settings → Integrations → Meta) and send that
 * page's internal id — but this mapping must be confirmed with backend
 * before relying on it in production. A manual numeric override is also
 * offered in case the real value doesn't come from this list.
 */
export function MessengerCampaignContent({ messenger = {}, message, onChangeMessenger, onChangeMessage }) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const tenant = resolveTenantId(user)

  const integrationsQuery = useFacebookIntegrations(tenant)
  const messengerPages = integrationsQuery.data?.messenger || []

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Select
          label={t('outreachCampaigns.content.messenger.page')}
          value={messenger.externalId ? String(messenger.externalId) : ''}
          onChange={(value) => onChangeMessenger({ ...messenger, externalId: value })}
          options={messengerPages.map((page) => ({ value: String(page.id), label: page.name }))}
          placeholder={integrationsQuery.isLoading ? t('common.loading') : t('outreachCampaigns.content.messenger.selectPage')}
        />
        <p className="text-xs text-[var(--text-muted)]">{t('outreachCampaigns.content.messenger.externalIdNote')}</p>
        <Input
          label={t('outreachCampaigns.content.messenger.manualId')}
          value={messenger.externalId || ''}
          onChange={(event) => onChangeMessenger({ ...messenger, externalId: event.target.value })}
          dir="ltr"
        />
        <Textarea
          label={t('outreachCampaigns.content.messenger.body')}
          value={message || ''}
          onChange={onChangeMessage}
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-[var(--text-muted)]">{t('outreachCampaigns.content.preview')}</p>
        <MessengerMessagePreview bodyText={message} />
      </div>
    </div>
  )
}
