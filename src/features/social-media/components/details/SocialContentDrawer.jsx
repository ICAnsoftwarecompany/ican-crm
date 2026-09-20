import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ExternalLink, MessageCircle } from 'lucide-react'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { SocialPlatformBadge } from '../SocialPlatformBadge'
import { ContentMediaPreview } from './ContentMediaPreview'
import { ContentEngagement } from './ContentEngagement'
import { ContentComments } from './ContentComments'
import { useSocialEngagement } from '../../hooks/useSocialEngagement'
import { useSocialComments } from '../../hooks/useSocialComments'
import { formatContentDateTime } from '../../utils/socialFormatters'

/**
 * Content Details Drawer — see docs "Content Details Drawer". Engagement
 * refetches fresh data the moment the drawer opens (spec: "عند فتح Post
 * Details"), showing the already-known summary instantly while that
 * resolves so there's no loading flash for data we already have. Comments
 * only fetch once the Comments section is explicitly expanded — never on
 * drawer open — this is the N+1-avoidance requirement from the spec.
 */
export function SocialContentDrawer({ content, tenantId, open, onClose }) {
  const { t, i18n } = useTranslation()
  const [commentsExpanded, setCommentsExpanded] = useState(false)
  const [commentsEverOpened, setCommentsEverOpened] = useState(false)

  const engagementQuery = useSocialEngagement({
    tenantId,
    platform: content?.platform,
    contentId: content?.id,
    externalId: content?.externalId,
    enabled: open && Boolean(content),
  })

  const commentsQuery = useSocialComments({
    tenantId,
    platform: content?.platform,
    contentId: content?.id,
    externalId: content?.externalId,
    enabled: open && commentsEverOpened,
  })

  if (!content) return null

  const engagement = engagementQuery.data || content.engagement

  const toggleComments = () => {
    setCommentsExpanded((current) => !current)
    setCommentsEverOpened(true)
  }

  return (
    <AppDrawer open={open} onClose={onClose} title={t('socialMedia.contentDrawer.title')} size="lg">
      <div className="grid gap-5 p-4">
        <ContentMediaPreview content={content} />

        {content.message && (
          <div>
            <h4 className="mb-1.5 text-xs font-black text-[var(--text-muted)]">{t('socialMedia.contentDrawer.content')}</h4>
            <p className="whitespace-pre-wrap text-sm text-[var(--text)]">{content.message}</p>
          </div>
        )}

        <div>
          <h4 className="mb-2 text-xs font-black text-[var(--text-muted)]">{t('socialMedia.contentDrawer.publishingInfo')}</h4>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-[var(--text-muted)]">{t('socialMedia.contentDrawer.platform')}</dt>
              <dd className="mt-0.5"><SocialPlatformBadge platform={content.platform} /></dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('socialMedia.contentDrawer.postType')}</dt>
              <dd className="mt-0.5 font-bold text-[var(--text)]">{t(`socialMedia.mediaType.${content.mediaType}`)}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('socialMedia.contentDrawer.publishedAt')}</dt>
              <dd className="mt-0.5 font-bold text-[var(--text)]" dir="ltr">{formatContentDateTime(content.publishedAt, i18n.language)}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">{t('socialMedia.contentDrawer.postId')}</dt>
              <dd className="mt-0.5 font-bold text-[var(--text)]" dir="ltr">{content.externalId}</dd>
            </div>
          </dl>
          {content.permalink && (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => window.open(content.permalink, '_blank', 'noopener,noreferrer')}>
              <ExternalLink size={14} />
              {t('socialMedia.contentDrawer.openOriginal')}
            </Button>
          )}
        </div>

        <div>
          <h4 className="mb-2 text-xs font-black text-[var(--text-muted)]">{t('socialMedia.contentDrawer.engagement')}</h4>
          <ContentEngagement engagement={engagement} isLoading={engagementQuery.isLoading} />
        </div>

        <div>
          <button type="button" onClick={toggleComments} className="flex w-full items-center justify-between gap-2 border-t border-[var(--border)] pt-3 text-start">
            <h4 className="flex items-center gap-1.5 text-xs font-black text-[var(--text-muted)]">
              <MessageCircle size={14} />
              {t('socialMedia.contentDrawer.comments')}
            </h4>
            <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${commentsExpanded ? 'rotate-180' : ''}`} />
          </button>

          {commentsExpanded && (
            <div className="mt-3">
              <ContentComments
                comments={commentsQuery.data}
                isLoading={commentsQuery.isLoading}
                error={commentsQuery.error}
                onRetry={commentsQuery.refetch}
              />
            </div>
          )}
        </div>
      </div>
    </AppDrawer>
  )
}
