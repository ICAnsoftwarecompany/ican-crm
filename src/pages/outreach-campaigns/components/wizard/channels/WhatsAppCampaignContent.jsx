import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Select } from '../../../../../shared/components/ui/Select'
import { Input } from '../../../../../shared/components/ui/Input'
import { useWhatsappTemplates } from '../../../../../features/integrations/whatsapp'
import { useFacebookIntegrations } from '../../../../../features/meta-integrations/hooks/useFacebookIntegrations'
import { useAuthStore } from '../../../../../store/authStore'
import { resolveTenantId } from '../../../../../services/tenantResolver'
import { WhatsAppMessagePreview } from '../../preview/WhatsAppMessagePreview'

function getTemplateId(template) {
  return template?.id ?? template?.template_id ?? template?.whatsapp_template_id ?? template?.name
}

function getTemplateName(template) {
  return template?.name || template?.template_name || template?.display_name || `#${getTemplateId(template)}`
}

function extractTemplateParts(template) {
  const components = template?.components || template?.data?.components || []
  const header = components.find((component) => component.type === 'HEADER')
  const body = components.find((component) => component.type === 'BODY')
  const footer = components.find((component) => component.type === 'FOOTER')
  return { header, body, footer }
}

function countPlaceholders(text) {
  if (!text) return 0
  const matches = text.match(/\{\{\s*\d+\s*\}\}/g)
  return matches ? matches.length : 0
}

function fillPlaceholders(text, values = []) {
  if (!text) return ''
  let index = 0
  return text.replace(/\{\{\s*\d+\s*\}\}/g, () => values[index++] || `{{${index}}}`)
}

/**
 * WhatsApp campaign content — phone number + template selection, template
 * preview, and header/body variable inputs generated from the template's
 * own `{{n}}` placeholders (the user never edits `template_params` arrays
 * directly, per the spec).
 */
export function WhatsAppCampaignContent({ whatsapp = {}, onChange }) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const tenant = resolveTenantId(user)

  const integrationsQuery = useFacebookIntegrations(tenant)
  const phoneNumbers = integrationsQuery.data?.whatsapp || []

  const templatesQuery = useWhatsappTemplates()
  const templates = templatesQuery.data || []

  const selectedTemplate = useMemo(
    () => templates.find((template) => String(getTemplateId(template)) === String(whatsapp.templateId)),
    [templates, whatsapp.templateId]
  )

  const { header, body, footer } = extractTemplateParts(selectedTemplate)
  const headerPlaceholderCount = countPlaceholders(header?.text)
  const bodyPlaceholderCount = countPlaceholders(body?.text)

  const update = (patch) => onChange({ ...whatsapp, ...patch })

  const updateHeaderParam = (index, value) => {
    const next = [...(whatsapp.headerParams || [])]
    next[index] = value
    update({ headerParams: next })
  }

  const updateBodyParam = (index, value) => {
    const next = [...(whatsapp.bodyParams || [])]
    next[index] = value
    update({ bodyParams: next })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Select
          label={t('outreachCampaigns.content.whatsapp.phoneNumber')}
          value={whatsapp.phoneNumberId}
          onChange={(value) => update({ phoneNumberId: value })}
          options={phoneNumbers.map((phone) => ({
            value: phone.phone_number_id,
            label: `${phone.verified_name || phone.name} — ${phone.display_phone_number || ''}`,
          }))}
          placeholder={integrationsQuery.isLoading ? t('common.loading') : t('outreachCampaigns.content.whatsapp.selectPhone')}
        />

        <Select
          label={t('outreachCampaigns.content.whatsapp.template')}
          value={whatsapp.templateId ? String(whatsapp.templateId) : ''}
          onChange={(value) => update({ templateId: value, headerParams: [], bodyParams: [] })}
          options={templates.map((template) => ({ value: String(getTemplateId(template)), label: getTemplateName(template) }))}
          placeholder={templatesQuery.isLoading ? t('common.loading') : t('outreachCampaigns.content.whatsapp.selectTemplate')}
        />

        {headerPlaceholderCount > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-[var(--text-muted)]">{t('outreachCampaigns.content.whatsapp.headerParams')}</p>
            {Array.from({ length: headerPlaceholderCount }).map((_, index) => (
              <Input
                key={`header-${index}`}
                label={`{{${index + 1}}}`}
                value={whatsapp.headerParams?.[index] || ''}
                onChange={(event) => updateHeaderParam(index, event.target.value)}
              />
            ))}
          </div>
        )}

        {bodyPlaceholderCount > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-[var(--text-muted)]">{t('outreachCampaigns.content.whatsapp.bodyParams')}</p>
            {Array.from({ length: bodyPlaceholderCount }).map((_, index) => (
              <Input
                key={`body-${index}`}
                label={`{{${index + 1}}}`}
                value={whatsapp.bodyParams?.[index] || ''}
                onChange={(event) => updateBodyParam(index, event.target.value)}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-[var(--text-muted)]">{t('outreachCampaigns.content.preview')}</p>
        <WhatsAppMessagePreview
          headerText={header ? fillPlaceholders(header.text, whatsapp.headerParams) : ''}
          bodyText={body ? fillPlaceholders(body.text, whatsapp.bodyParams) : ''}
          footerText={footer?.text}
        />
      </div>
    </div>
  )
}
