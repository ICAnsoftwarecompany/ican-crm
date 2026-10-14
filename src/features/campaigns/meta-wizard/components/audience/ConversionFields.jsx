import { useTranslation } from 'react-i18next'
import { useMetaWizard, useWizardField } from '../../context/MetaWizardContext'
import { getAdSetOptionsForObjective, getAdSetRequirements } from '../../config/metaAdSetCompatibility'
import { META_CONVERSION_EVENTS } from '../../config/metaConversionEvents'
import { getInstagramAccounts, getWhatsappNumbers } from '../../data/metaAssetsSource'
import { useApps, usePixels } from '../../hooks/useWizardAssets'
import { normalizePhoneNumber } from '../../domain/contactFormats'
import { Callout, ChoiceCard, DemoDataBadge, IssueMessage, SelectField, TextField } from '../fields'

/**
 * Where results happen (conversion location), what Meta optimizes for,
 * and every field that combination needs — nothing more.
 */
export function ConversionFields({ adSet, onChange }) {
  const { t } = useTranslation()
  const { state, tenantId, accountId, integrations } = useMetaWizard()
  const base = `adSets.${adSet.id}`
  const options = getAdSetOptionsForObjective(state.objective, adSet.conversionLocation)
  const requirements = getAdSetRequirements(state.objective, adSet)
  const locationField = useWizardField(`${base}.conversionLocation`, 'adSet.conversionLocation')
  const pixels = usePixels({ tenantId, accountId, enabled: requirements.has('pixel') })
  const apps = useApps({ tenantId, accountId, enabled: requirements.has('app') })
  const whatsapp = getWhatsappNumbers(integrations)
  const instagram = getInstagramAccounts(integrations)
  const adLevel = ['leadForm', 'phone', 'websiteUrl'].filter((key) => requirements.has(key))

  if (!state.objective) return <Callout tone="warning">{t('campaignWizard.adSets.chooseObjectiveFirst')}</Callout>

  return (
    <div className="grid gap-4">
      {!options.locationIsAutomatic && (
        <div className="grid gap-2" data-wizard-field={`${base}.conversionLocation`}>
          <span className="text-sm font-medium text-[var(--text)]">{t('campaignWizard.adSets.conversionLocation')}<span className="ms-1 text-[var(--notification-danger)]">*</span></span>
          <div role="radiogroup" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {options.locations.map((location) => (
              <ChoiceCard
                key={location}
                compact
                title={t(`campaignWizard.locations.${location}.title`)}
                description={t(`campaignWizard.locations.${location}.description`)}
                selected={adSet.conversionLocation === location}
                onSelect={() => onChange({ conversionLocation: location })}
                onFocus={() => locationField.fieldProps.onFocus()}
              />
            ))}
          </div>
          {locationField.issue && <IssueMessage issue={locationField.issue} />}
        </div>
      )}

      {adSet.conversionLocation && options.goals.length > 0 && (
        <SelectField
          path={`${base}.performanceGoal`}
          guideKey="adSet.performanceGoal"
          label={t('campaignWizard.adSets.performanceGoal')}
          value={adSet.performanceGoal}
          placeholder={false}
          onChange={(performanceGoal) => onChange({ performanceGoal })}
          hint={adSet.performanceGoal ? t(`campaignWizard.goals.${adSet.performanceGoal}.description`) : undefined}
          options={options.goals.map((goal) => ({ value: goal, label: t(`campaignWizard.goals.${goal}.title`) }))}
        />
      )}

      {requirements.has('whatsapp') && (
        <div className="grid gap-2 sm:grid-cols-2">
          {whatsapp.items.length > 0 && (
            <SelectField
              path={`${base}.whatsappNumberPicker`}
              guideKey="adSet.whatsappPhoneNumber"
              label={t('campaignWizard.adSets.connectedWhatsapp')}
              value={whatsapp.items.find((item) => normalizePhoneNumber(item.displayPhoneNumber) === normalizePhoneNumber(adSet.whatsappPhoneNumber))?.id || ''}
              onChange={(id) => onChange({ whatsappPhoneNumber: whatsapp.items.find((item) => item.id === id)?.displayPhoneNumber || '' })}
              options={whatsapp.items.map((item) => ({ value: item.id, label: [item.displayPhoneNumber, item.verifiedName].filter(Boolean).join(' — ') }))}
              action={<DemoDataBadge show={whatsapp.isMock} />}
            />
          )}
          <TextField path={`${base}.whatsappPhoneNumber`} guideKey="adSet.whatsappPhoneNumber" label={t('campaignWizard.adSets.whatsappNumber')} required dir="ltr" inputMode="tel" placeholder="+20 100 000 0000" value={adSet.whatsappPhoneNumber} onChange={(whatsappPhoneNumber) => onChange({ whatsappPhoneNumber })} hint={t('campaignWizard.adSets.whatsappHint')} />
        </div>
      )}

      {requirements.has('instagram') && (
        <SelectField path={`${base}.instagramAccountId`} guideKey="adSet.instagramAccountId" label={t('campaignWizard.adSets.instagramAccount')} required value={adSet.instagramAccountId} onChange={(instagramAccountId) => onChange({ instagramAccountId })}
          options={instagram.items.map((item) => ({ value: item.id, label: `@${item.username}` }))} action={<DemoDataBadge show={instagram.isMock} />} />
      )}

      {requirements.has('pixel') && (
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField path={`${base}.pixelId`} guideKey="adSet.pixelId" label={t('campaignWizard.adSets.pixel')} required value={adSet.pixelId} onChange={(pixelId) => onChange({ pixelId })}
            placeholder={pixels.isLoading ? t('campaignWizard.common.loading') : undefined}
            options={(pixels.data?.items || []).map((pixel) => ({ value: pixel.id, label: `${pixel.name} (${pixel.id})` }))} action={<DemoDataBadge show={pixels.data?.isMock} />} hint={t('campaignWizard.adSets.pixelHint')} />
          <SelectField path={`${base}.customEventType`} guideKey="adSet.customEventType" label={t('campaignWizard.adSets.conversionEvent')} required value={adSet.customEventType} onChange={(customEventType) => onChange({ customEventType })}
            options={META_CONVERSION_EVENTS.map((event) => ({ value: event, label: t(`campaignWizard.events.${event}`) }))} />
        </div>
      )}

      {requirements.has('app') && (
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField path={`${base}.applicationId`} guideKey="adSet.applicationId" label={t('campaignWizard.adSets.app')} required value={adSet.applicationId}
            onChange={(applicationId) => onChange({ applicationId, objectStoreUrl: (apps.data?.items || []).find((app) => app.id === applicationId)?.objectStoreUrl || adSet.objectStoreUrl })}
            options={(apps.data?.items || []).map((app) => ({ value: app.id, label: app.name }))} action={<DemoDataBadge show={apps.data?.isMock} />} />
          <TextField path={`${base}.objectStoreUrl`} guideKey="adSet.objectStoreUrl" label={t('campaignWizard.adSets.storeUrl')} required dir="ltr" type="url" value={adSet.objectStoreUrl} onChange={(objectStoreUrl) => onChange({ objectStoreUrl })} />
        </div>
      )}
      {requirements.has('appEvent') && !requirements.has('pixel') && (
        <SelectField path={`${base}.customEventType`} guideKey="adSet.customEventType" label={t('campaignWizard.adSets.appEvent')} required value={adSet.customEventType} onChange={(customEventType) => onChange({ customEventType })}
          options={META_CONVERSION_EVENTS.map((event) => ({ value: event, label: t(`campaignWizard.events.${event}`) }))} />
      )}

      {requirements.has('event') && (
        <TextField path={`${base}.eventId`} guideKey="adSet.eventId" label={t('campaignWizard.adSets.eventId')} required dir="ltr" value={adSet.eventId} onChange={(eventId) => onChange({ eventId })} hint={t('campaignWizard.adSets.eventIdHint')} />
      )}

      {requirements.has('frequencyCap') && (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField path={`${base}.frequencyMax`} guideKey="adSet.frequency" label={t('campaignWizard.adSets.frequencyMax')} required type="number" dir="ltr" value={adSet.frequencyMax} onChange={(value) => onChange({ frequencyMax: Number(value) })} />
          <TextField path={`${base}.frequencyIntervalDays`} guideKey="adSet.frequency" label={t('campaignWizard.adSets.frequencyInterval')} required type="number" dir="ltr" value={adSet.frequencyIntervalDays} onChange={(value) => onChange({ frequencyIntervalDays: Number(value) })} />
        </div>
      )}

      {adLevel.length > 0 && (
        <Callout tone="tip">{t('campaignWizard.adSets.adLevelNote', { items: adLevel.map((key) => t(`campaignWizard.adSets.adLevelItems.${key}`)).join(t('campaignWizard.common.listSeparator')) })}</Callout>
      )}
    </div>
  )
}
