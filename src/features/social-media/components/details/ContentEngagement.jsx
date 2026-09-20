import { useTranslation } from 'react-i18next'
import { Heart, MessageCircle, Share2, Sparkles } from 'lucide-react'
import { SocialMetricsCards } from '../SocialMetricsCards'
import { calculateTotalEngagement } from '../../utils/engagementUtils'
import { formatMetric } from '../../utils/socialFormatters'

/**
 * Shows likes/comments/shares + a raw sum labeled "Total Engagement" —
 * never "Engagement Rate" (see docs "Engagement Calculation": a rate needs
 * a denominator like reach/impressions/followers, which this API does not
 * provide today).
 */
export function ContentEngagement({ engagement, isLoading }) {
  const { t, i18n } = useTranslation()
  const total = calculateTotalEngagement(engagement)

  return (
    <div>
      <SocialMetricsCards
        items={[
          { labelKey: 'socialMedia.engagement.likes', value: engagement.likes, icon: <Heart size={13} /> },
          { labelKey: 'socialMedia.engagement.comments', value: engagement.comments, icon: <MessageCircle size={13} /> },
          { labelKey: 'socialMedia.engagement.shares', value: engagement.shares, icon: <Share2 size={13} /> },
        ]}
      />
      <div className="mt-2 flex items-center justify-between rounded-lg border border-dashed border-[var(--border)] p-3">
        <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--text)]">
          <Sparkles size={14} className="text-[#00C2CB]" />
          {t('socialMedia.engagement.total')}
        </span>
        <span className="font-latin text-lg font-black text-[var(--text)]" dir="ltr">
          {isLoading ? '…' : formatMetric(total, i18n.language)}
        </span>
      </div>
    </div>
  )
}
