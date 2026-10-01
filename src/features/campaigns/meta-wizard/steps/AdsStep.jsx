import { useTranslation } from 'react-i18next'
import { Callout, SelectField } from '../components/fields'
import { ItemTabs } from '../components/layout/ItemTabs'
import { AdEditor } from '../components/ads/AdEditor'
import { AdPreview } from '../components/ads/AdPreview'
import { useMetaWizard } from '../context/MetaWizardContext'
import { WIZARD_PUBLISH_CAPABILITIES } from '../config/wizardCapabilities'
import { getEffectiveAdName, getEffectiveAdSetName } from '../domain/naming'
import { adSetStatus, adStatus } from './stepStatus'

/** Stage 4: creatives for every ad set, with a live preview. */
export function AdsStep() {
  const { t, i18n } = useTranslation()
  const { state, actions, issues, pages } = useMetaWizard()
  const adSet = state.adSets.find((item) => item.id === state.meta.activeAdSetId) || state.adSets[0]
  const activeAdId = state.meta.activeAdIdByAdSet?.[adSet.id]
  const ad = adSet.ads.find((item) => item.id === activeAdId) || adSet.ads[0]
  const pageId = ad.identity?.pageId || state.campaign.pageId
  const page = pages.find((item) => String(item.page_id || item.id) === String(pageId))
  const pageName = page?.name || page?.page_name || t('campaignWizard.preview.pageName')

  return (
    <div className="grid gap-4">
      {!WIZARD_PUBLISH_CAPABILITIES.createAds && (
        <Callout tone="info" title={t('campaignWizard.ads.apiPendingTitle')}>{t('campaignWizard.ads.apiPendingBody')}</Callout>
      )}

      {state.adSets.length > 1 && (
        <SelectField
          path="ads.adSetPicker"
          guideKey="ad.adSetPicker"
          label={t('campaignWizard.ads.forAdSet')}
          value={adSet.id}
          placeholder={false}
          onChange={actions.setActiveAdSet}
          options={state.adSets.map((item) => ({ value: item.id, label: `${getEffectiveAdSetName(item, t, i18n.language)}${adSetStatus(issues, item.id) === 'error' ? ' ⚠' : ''}` }))}
        />
      )}

      <ItemTabs
        ariaLabel={t('campaignWizard.ads.tabsLabel')}
        items={adSet.ads.map((item) => ({ id: item.id, label: getEffectiveAdName(item, t), status: adStatus(issues, item.id) }))}
        activeId={ad.id}
        onSelect={(adId) => actions.setActiveAd(adSet.id, adId)}
        onAdd={() => actions.addAd(adSet.id)}
        onDuplicate={(adId) => actions.duplicateAd(adSet.id, adId)}
        onRemove={(adId) => actions.removeAd(adSet.id, adId)}
        addLabel={t('campaignWizard.ads.add')}
      />

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <AdEditor key={ad.id} adSet={adSet} ad={ad} />
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 2xl:sticky 2xl:top-3 2xl:self-start">
          <AdPreview ad={ad} adSet={adSet} pageName={pageName} />
        </div>
      </div>
    </div>
  )
}
