import { useTranslation } from 'react-i18next'
import { RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { useAiMutations } from '../api/aiApi'

/** Case summary on demand (spec §45.2). Built from keyed facts so it reads in the agent's language. */
export function AiSummary({ caseItem }) {
  const { t, i18n } = useTranslation()
  const { summary } = useAiMutations()
  const data = summary.data || caseItem.ai_summary
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-[var(--text)]">{t('service.ai.summary.title')}</h3>
        <Button size="sm" variant="ghost" loading={summary.isPending} onClick={() => summary.mutate(caseItem.id)}>
          {data ? <RefreshCw size={14} aria-hidden="true" /> : <Sparkles size={14} aria-hidden="true" />}
          {t(data ? 'service.ai.summary.refresh' : 'service.ai.summary.generate')}
        </Button>
      </div>
      {data && (
        <ul className="grid gap-1 text-sm text-[var(--text)]">
          <li><span className="text-[var(--text-muted)]">{t('service.ai.summary.ask')}</span> <bdi>{data.ask}</bdi></li>
          <li className="text-[var(--text-muted)]">{t('service.ai.summary.counts', { messages: data.customer_messages, replies: data.replies, notes: data.notes })}</li>
          {data.last_customer_message && <li><span className="text-[var(--text-muted)]">{t('service.ai.summary.lastCustomer')}</span> <bdi>{data.last_customer_message}</bdi></li>}
          {data.last_reply && <li><span className="text-[var(--text-muted)]">{t('service.ai.summary.lastReply')}</span> <bdi>{data.last_reply}</bdi></li>}
          <li className="font-medium">{t(`service.ai.summary.waiting.${data.waiting_on}`)}</li>
          {data.generated_at && <li className="text-xs text-[var(--text-muted)]">{t('service.ai.generatedAt', { when: formatRelativeTime(data.generated_at, i18n.language) })}</li>}
        </ul>
      )}
    </div>
  )
}
