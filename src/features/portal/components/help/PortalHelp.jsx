import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Search, Star } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { cn } from '../../../../shared/utils/cn'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { portalApi, usePortalList, usePortalMutation } from '../../api/portalApi'
import { usePortalAccess } from '../../hooks/usePortalAccess'
import { usePortalFormat } from '../../utils/format'
import { Card, PortalPage } from '../PortalPage'

const TEXTAREA = 'min-h-[80px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-brand-accent'

function FeedbackCard() {
  const { t } = useTranslation()
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const send = usePortalMutation(() => portalApi.post(P.feedback, { score, comment: comment || undefined }), { onSuccess: () => { toast.success(t('portal.help.thanks')); setScore(0); setComment('') } })
  return (
    <Card className="grid gap-3">
      <h2 className="font-semibold">{t('portal.help.feedbackTitle')}</h2>
      <div className="flex gap-1" role="radiogroup" aria-label={t('portal.help.rating')}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" role="radio" aria-checked={score === value} aria-label={t('portal.help.stars', { count: value })} onClick={() => setScore(value)} className="p-1">
            <Star size={24} aria-hidden="true" className={cn(value <= score ? 'fill-sla-at-risk text-sla-at-risk' : 'text-[var(--text-muted)]')} />
          </button>
        ))}
      </div>
      <textarea dir="auto" aria-label={t('portal.help.comment')} placeholder={t('portal.help.comment')} className={TEXTAREA} value={comment} onChange={(event) => setComment(event.target.value)} />
      <Button className="w-fit" disabled={!score} loading={send.isPending} onClick={() => send.mutate()}>{t('portal.help.send')}</Button>
    </Card>
  )
}

/** Help center (customer-visible KB) + feedback. */
export function PortalHelp() {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const { can } = usePortalAccess()
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search, 300)
  const query = usePortalList('kb', P.kb, debounced ? { search: debounced } : undefined, { enabled: can('kb') })
  const articles = query.data || []
  return (
    <PortalPage title={t('portal.sections.kb')} description={t('portal.help.description')}>
      {can('kb') && (
        <>
          <div className="max-w-md"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('portal.help.search')} aria-label={t('portal.help.search')} startIcon={<Search size={16} aria-hidden="true" />} /></div>
          <PortalPage level={2} title={t('portal.help.articles')} query={query} empty={!articles.length} emptyTitle={t('portal.help.empty')}>
            <div className="grid gap-2">
              {articles.map((article) => (
                <details key={article.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <summary className="cursor-pointer font-medium"><bdi>{article.title}</bdi></summary>
                  <p dir="auto" className="mt-2 whitespace-pre-line text-sm text-[var(--text-muted)]">{article.body}</p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">{t('portal.help.updated', { date: format.date(article.updated_at) })}</p>
                </details>
              ))}
            </div>
          </PortalPage>
        </>
      )}
      {can('feedback', 'create') && <FeedbackCard />}
    </PortalPage>
  )
}
