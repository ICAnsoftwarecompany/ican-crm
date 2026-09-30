import { useTranslation } from 'react-i18next'
import { Image, LayoutPanelTop, Link2, MousePointerClick, Newspaper, Film, Type, UserCircle2 } from 'lucide-react'
import { useMetaWizard } from '../../context/MetaWizardContext'
import { getAdSetRequirements, isVideoGoal } from '../../config/metaAdSetCompatibility'
import { AD_FORMATS, AD_TEXT_LIMITS, getCallToActions } from '../../config/metaCallToActions'
import { getInstagramAccounts } from '../../data/metaAssetsSource'
import { usePagePosts } from '../../hooks/useWizardAssets'
import { ChoiceCard, DemoDataBadge, SectionCard, SelectField, TextField } from '../fields'
import { MediaPicker } from './MediaPicker'
import { CarouselEditor } from './CarouselEditor'
import { TextVariantsField } from './TextVariantsField'
import { LeadFormSection } from './LeadFormSection'
import { MessagingFields } from './MessagingFields'

// Technical format hints (not translatable copy).
const URL_PLACEHOLDER = 'https://'
const UTM_PLACEHOLDER = 'utm_source=facebook&utm_medium=paid'

const FORMAT_ICONS = { single_image: Image, single_video: Film, carousel: LayoutPanelTop, existing_post: Newspaper }

/** Everything for one ad, only showing what its ad set's destination needs. */
export function AdEditor({ adSet, ad }) {
  const { t } = useTranslation()
  const { state, actions, pages, integrations, tenantId, accountId } = useMetaWizard()
  const base = `ads.${ad.id}`
  const update = (patch) => actions.updateAd(adSet.id, ad.id, patch)
  const requirements = getAdSetRequirements(state.objective, adSet)
  const pageId = ad.identity?.pageId || state.campaign.pageId
  const instagram = getInstagramAccounts(integrations)
  const posts = usePagePosts({ tenantId, accountId, pageId, enabled: ad.format === 'existing_post' })
  const formats = isVideoGoal(adSet.performanceGoal) ? ['single_video', 'existing_post'] : AD_FORMATS

  return (
    <div className="grid gap-4">
      <SectionCard icon={UserCircle2} title={t('campaignWizard.ads.identityTitle')} description={t('campaignWizard.ads.identityDescription')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField path={`${base}.name`} guideKey="ad.name" label={t('campaignWizard.ads.name')} value={ad.name} placeholder={t('campaignWizard.ads.namePlaceholder')} onChange={(name) => update({ name })} />
          <SelectField path={`${base}.identity.pageId`} guideKey="ad.identity" label={t('campaignWizard.ads.page')} value={ad.identity?.pageId} placeholder={t('campaignWizard.ads.sameAsCampaign')} onChange={(value) => update({ identity: { ...ad.identity, pageId: value } })}
            options={pages.map((page) => ({ value: String(page.page_id || page.id), label: page.name || page.page_name || String(page.page_id || page.id) }))} />
          <SelectField path={`${base}.identity.instagramAccountId`} guideKey="ad.identity" label={t('campaignWizard.ads.instagram')} optional value={ad.identity?.instagramAccountId} placeholder={t('campaignWizard.ads.useFacebookPage')} onChange={(value) => update({ identity: { ...ad.identity, instagramAccountId: value } })}
            options={instagram.items.map((item) => ({ value: item.id, label: `@${item.username}` }))} action={<DemoDataBadge show={instagram.isMock} />} />
        </div>
      </SectionCard>

      <SectionCard icon={LayoutPanelTop} title={t('campaignWizard.ads.formatTitle')} description={t('campaignWizard.ads.formatDescription')} fieldPath={`${base}.format`}>
        <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
          {formats.map((format) => (
            <ChoiceCard key={format} compact icon={FORMAT_ICONS[format]} title={t(`campaignWizard.ads.formats.${format}.title`)} description={t(`campaignWizard.ads.formats.${format}.description`)} selected={ad.format === format} onSelect={() => update({ format })} onFocus={() => actions.setFocusedField(`ad.formats.${format}`)} />
          ))}
        </div>
        {ad.format === 'single_image' && <MediaPicker label={t('campaignWizard.ads.image')} accept="image" value={ad.media} path={`${base}.media`} onChange={(media) => update({ media })} />}
        {ad.format === 'single_video' && <MediaPicker label={t('campaignWizard.ads.video')} accept="video" value={ad.media} path={`${base}.media`} onChange={(media) => update({ media })} />}
        {ad.format === 'carousel' && <CarouselEditor ad={ad} path={`${base}.carouselCards`} showLinks={requirements.has('websiteUrl')} onChange={update} />}
        {ad.format === 'existing_post' && (
          <SelectField path={`${base}.existingPostId`} guideKey="ad.existingPost" label={t('campaignWizard.ads.existingPost')} required value={ad.existingPostId} onChange={(existingPostId) => update({ existingPostId })}
            placeholder={posts.isLoading ? t('campaignWizard.common.loading') : undefined}
            options={(posts.data?.items || []).map((post) => ({ value: post.id, label: (post.message || post.id).slice(0, 80) }))} action={<DemoDataBadge show={posts.data?.isMock} />} />
        )}
      </SectionCard>

      {ad.format !== 'existing_post' && (
        <SectionCard icon={Type} title={t('campaignWizard.ads.textTitle')} description={t('campaignWizard.ads.textDescription')}>
          <TextVariantsField path={`${base}.primaryTexts`} guideKey="ad.primaryText" label={t('campaignWizard.ads.primaryText')} required multiline values={ad.primaryTexts} onChange={(primaryTexts) => update({ primaryTexts })} max={AD_TEXT_LIMITS.maxPrimaryTextVariants} recommendedLength={AD_TEXT_LIMITS.primaryText} placeholder={t('campaignWizard.ads.primaryTextPlaceholder')} />
          {ad.format !== 'carousel' && (
            <TextVariantsField path={`${base}.headlines`} guideKey="ad.headline" label={t('campaignWizard.ads.headline')} values={ad.headlines} onChange={(headlines) => update({ headlines })} max={AD_TEXT_LIMITS.maxHeadlineVariants} recommendedLength={AD_TEXT_LIMITS.headline} placeholder={t('campaignWizard.ads.headlinePlaceholder')} />
          )}
          {ad.format !== 'carousel' && <TextField path={`${base}.description`} guideKey="ad.description" label={t('campaignWizard.ads.description')} optional value={ad.description} maxLength={120} onChange={(description) => update({ description })} />}
        </SectionCard>
      )}

      <SectionCard icon={MousePointerClick} title={t('campaignWizard.ads.destinationTitle')} description={t(`campaignWizard.locations.${adSet.conversionLocation || 'default'}.adHint`)}>
        <SelectField path={`${base}.callToAction`} guideKey="ad.callToAction" label={t('campaignWizard.ads.callToAction')} value={ad.callToAction} placeholder={false} onChange={(callToAction) => update({ callToAction })}
          options={getCallToActions(adSet.conversionLocation).map((cta) => ({ value: cta, label: t(`campaignWizard.ctas.${cta}`) }))} />

        {requirements.has('websiteUrl') && ad.format !== 'existing_post' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField path={`${base}.websiteUrl`} guideKey="ad.websiteUrl" label={t('campaignWizard.ads.websiteUrl')} required dir="ltr" type="url" placeholder={URL_PLACEHOLDER} value={ad.websiteUrl} onChange={(websiteUrl) => update({ websiteUrl })} className="sm:col-span-2" />
            <TextField path={`${base}.displayLink`} guideKey="ad.displayLink" label={t('campaignWizard.ads.displayLink')} optional dir="ltr" value={ad.displayLink} onChange={(displayLink) => update({ displayLink })} />
            <TextField path={`${base}.urlParameters`} guideKey="ad.urlParameters" label={t('campaignWizard.ads.urlParameters')} optional dir="ltr" placeholder={UTM_PLACEHOLDER} value={ad.urlParameters} onChange={(urlParameters) => update({ urlParameters })}
              action={!ad.urlParameters ? <button type="button" onClick={() => update({ urlParameters: 'utm_source=facebook&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}' })} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-accent)]"><Link2 size={12} />{t('campaignWizard.ads.addUtm')}</button> : null} />
          </div>
        )}
        {requirements.has('leadForm') && <LeadFormSection ad={ad} pageId={pageId} path={`${base}.leadForm`} onChange={update} />}
        {requirements.has('phone') && <TextField path={`${base}.phoneNumber`} guideKey="ad.phoneNumber" label={t('campaignWizard.ads.phoneNumber')} required dir="ltr" inputMode="tel" placeholder="+20 100 000 0000" value={ad.phoneNumber} onChange={(phoneNumber) => update({ phoneNumber })} hint={t('campaignWizard.ads.phoneHint')} />}
        {requirements.has('messageTemplate') && <MessagingFields template={ad.messageTemplate} path={`${base}.messageTemplate`} onChange={update} />}
      </SectionCard>
    </div>
  )
}
