import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, MessageCircle, MoreHorizontal, Phone, ThumbsUp } from 'lucide-react'
import { cn } from '../../../../../shared/utils/cn'
import { SegmentedControl } from '../fields'
import { MediaThumb } from './MediaThumb'
import { isMessagingLocation } from '../../config/metaAdSetCompatibility'

/**
 * Approximate feed/story preview so users see what they're publishing.
 * Not pixel-exact — Meta's own preview is the reference once live.
 */
export function AdPreview({ ad, adSet, pageName }) {
  const { t } = useTranslation()
  const [placement, setPlacement] = useState('feed')
  const primaryText = ad.primaryTexts?.find((text) => text?.trim()) || t('campaignWizard.preview.primaryTextPlaceholder')
  const headline = ad.headlines?.find((text) => text?.trim()) || (ad.format === 'carousel' ? '' : t('campaignWizard.preview.headlinePlaceholder'))
  const media = ad.format === 'carousel' ? ad.carouselCards?.[0]?.media : ad.media
  const cta = ad.callToAction && ad.callToAction !== 'NO_BUTTON' ? t(`campaignWizard.ctas.${ad.callToAction}`) : null
  const domain = (() => {
    try { return ad.displayLink || new URL(ad.websiteUrl).hostname } catch { return '' }
  })()
  const story = placement === 'story'

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-[var(--text)]">{t('campaignWizard.preview.title')}</span>
        <SegmentedControl size="sm" value={placement} onChange={setPlacement} ariaLabel={t('campaignWizard.preview.title')}
          options={[{ value: 'feed', label: t('campaignWizard.preview.feed') }, { value: 'story', label: t('campaignWizard.preview.story') }]} />
      </div>

      <div className={cn('mx-auto w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm', story ? 'max-w-[240px]' : 'max-w-[340px]')}>
        {story ? (
          <div className="relative aspect-[9/16]">
            <MediaThumb media={media} className="absolute inset-0" />
            <div className="absolute inset-x-0 top-0 flex items-center gap-2 bg-gradient-to-b from-black/60 to-transparent p-3 text-white">
              <span className="h-7 w-7 rounded-full bg-white/30" />
              <span className="text-xs font-bold">{pageName}</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 grid gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
              <p className="line-clamp-3 text-xs">{primaryText}</p>
              {cta && <span className="justify-self-center rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black">{cta}</span>}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 p-3">
              <span className="h-9 w-9 shrink-0 rounded-full bg-[var(--surface-2)]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[var(--text)]">{pageName}</p>
                <p className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">{t('campaignWizard.preview.sponsored')} · <Globe size={10} /></p>
              </div>
              <MoreHorizontal size={16} className="text-[var(--text-muted)]" />
            </div>
            <p className="line-clamp-4 whitespace-pre-line px-3 pb-2 text-sm text-[var(--text)]">{primaryText}</p>
            {ad.format === 'carousel' ? (
              <div className="flex gap-2 overflow-x-auto px-3 pb-2">
                {(ad.carouselCards?.length ? ad.carouselCards : [{ id: 'empty' }]).map((card) => (
                  <div key={card.id} className="w-40 shrink-0 overflow-hidden rounded-lg border border-[var(--border)]">
                    <MediaThumb media={card.media} className="aspect-square w-full" />
                    <p className="truncate px-2 py-1.5 text-xs font-bold text-[var(--text)]">{card.headline || t('campaignWizard.preview.headlinePlaceholder')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <MediaThumb media={media} className="aspect-square w-full" />
            )}
            <div className="flex items-center justify-between gap-3 bg-[var(--surface-2)] px-3 py-2.5">
              <div className="min-w-0">
                {domain && <p className="truncate text-[10px] uppercase text-[var(--text-muted)]" dir="ltr">{domain}</p>}
                {headline && <p className="truncate text-sm font-bold text-[var(--text)]">{headline}</p>}
                {ad.description && <p className="truncate text-xs text-[var(--text-muted)]">{ad.description}</p>}
              </div>
              {cta && <span className="shrink-0 rounded-md bg-[var(--border)] px-3 py-1.5 text-xs font-bold text-[var(--text)]">{cta}</span>}
            </div>
            <div className="flex justify-around border-t border-[var(--border)] py-2 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><ThumbsUp size={13} />{t('campaignWizard.preview.like')}</span>
              <span className="flex items-center gap-1"><MessageCircle size={13} />{t('campaignWizard.preview.comment')}</span>
              {adSet.conversionLocation === 'phone_call' && <span className="flex items-center gap-1"><Phone size={13} />{t('campaignWizard.preview.call')}</span>}
            </div>
          </>
        )}
      </div>

      {isMessagingLocation(adSet.conversionLocation) && ad.messageTemplate?.greeting?.trim() && (
        <div className="mx-auto grid w-full max-w-[340px] gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <span className="text-[11px] font-bold text-[var(--text-muted)]">{t('campaignWizard.preview.chatTitle')}</span>
          <p className="max-w-[85%] rounded-2xl rounded-ss-sm bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text)]">{ad.messageTemplate.greeting}</p>
          <div className="flex flex-wrap gap-1.5">
            {ad.messageTemplate.iceBreakers.filter((item) => item.trim()).map((item) => <span key={item} className="rounded-full border border-[var(--brand-accent)] px-2.5 py-1 text-[11px] text-[var(--text)]">{item}</span>)}
          </div>
        </div>
      )}
      <p className="text-center text-[11px] text-[var(--text-light)]">{t('campaignWizard.preview.disclaimer')}</p>
    </div>
  )
}
