import { useTranslation } from 'react-i18next'
import { AlertTriangle, MessageCircle, RefreshCcw } from 'lucide-react'
import { Avatar } from '../../../../shared/components/ui/Avatar'
import { Button } from '../../../../shared/components/ui/Button'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { formatContentDateTime } from '../../utils/socialFormatters'

function CommentRow({ comment, language }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-2.5">
      <Avatar name={comment.author.name || '?'} src={comment.author.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="rounded-lg bg-[var(--surface-2)] px-3 py-2">
          <p className="text-xs font-bold text-[var(--text)]">{comment.author.name || t('socialMedia.comments.unknownAuthor')}</p>
          {comment.text && <p className="mt-0.5 text-sm text-[var(--text)]">{comment.text}</p>}
        </div>
        <p className="mt-1 text-[11px] text-[var(--text-light)]" dir="ltr">{formatContentDateTime(comment.createdAt, language)}</p>

        {comment.replies?.length > 0 && (
          <div className="mt-2 grid gap-2 ps-4">
            {comment.replies.map((reply) => <CommentRow key={reply.id} comment={reply} language={language} />)}
          </div>
        )}
      </div>
    </div>
  )
}

/** Lazy-loaded (only fetched once this section opens) — see docs "Comments". Loading/Empty/Error/Retry all handled explicitly per spec. */
export function ContentComments({ comments, isLoading, error, onRetry }) {
  const { t, i18n } = useTranslation()

  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-2.5">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertTriangle size={20} />}
        title={t('socialMedia.comments.loadFailed')}
        description={error?.message}
        action={onRetry && <Button variant="outline" size="sm" onClick={onRetry}><RefreshCcw size={14} />{t('common.retry')}</Button>}
      />
    )
  }

  if (!comments || comments.length === 0) {
    return <EmptyState icon={<MessageCircle size={20} />} title={t('socialMedia.comments.empty')} />
  }

  return (
    <div className="grid gap-3">
      {comments.map((comment) => <CommentRow key={comment.id} comment={comment} language={i18n.language} />)}
    </div>
  )
}
