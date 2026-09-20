import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Heart, MessageCircle, Share2, ImageOff, PlayCircle, Images, FileText } from 'lucide-react'
import { SocialPlatformBadge } from '../SocialPlatformBadge'
import { formatMetric, formatContentDate, truncateCaption } from '../../utils/socialFormatters'

const MEDIA_TYPE_ICON = {
  video: PlayCircle,
  carousel: Images,
  text: FileText,
}

/**
 * Platform-agnostic content card — works for any `SocialContent` (see
 * socialAdapterContract.js), not just Facebook. A broken/missing image
 * never breaks the card (see docs "Media Handling") — it falls back to a
 * neutral placeholder instead of a broken-image icon.
 */
export function SocialContentCard({ content, onOpen }) {
  const { t, i18n } = useTranslation()
  const [imageFailed, setImageFailed] = useState(false)
  const MediaIcon = MEDIA_TYPE_ICON[content.mediaType]
  const showImage = content.thumbnail && !imageFailed

  return (
    <button
      type="button"
      onClick={() => onOpen?.(content)}
      className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] text-start transition-colors hover:bg-[var(--surface-2)]"
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[var(--surface-2)]">
        {showImage ? (
          <img src={content.thumbnail} alt="" className="h-full w-full object-cover" onError={() => setImageFailed(true)} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--text-light)]">
            {MediaIcon ? <MediaIcon size={28} /> : <ImageOff size={28} />}
          </div>
        )}
        <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-1">
          <SocialPlatformBadge platform={content.platform} className="bg-[var(--surface)]/90 backdrop-blur" />
          <span className="rounded-full bg-[var(--surface)]/90 px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)] backdrop-blur">
            {t(`socialMedia.contentType.${content.contentType}`)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {content.message && <p className="line-clamp-2 text-xs text-[var(--text-muted)]">{truncateCaption(content.message, 140)}</p>}
        <p className="text-[11px] text-[var(--text-light)]" dir="ltr">{formatContentDate(content.publishedAt, i18n.language)}</p>

        <div className="mt-auto flex items-center gap-3 border-t border-[var(--border)] pt-2 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1" dir="ltr">
            <Heart size={13} />
            {formatMetric(content.engagement.likes, i18n.language)}
          </span>
          <span className="flex items-center gap-1" dir="ltr">
            <MessageCircle size={13} />
            {formatMetric(content.engagement.comments, i18n.language)}
          </span>
          <span className="flex items-center gap-1" dir="ltr">
            <Share2 size={13} />
            {formatMetric(content.engagement.shares, i18n.language)}
          </span>
        </div>
      </div>
    </button>
  )
}
