import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Archive, ArchiveRestore, CheckCheck, Eye, Send, Undo2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'
import { TEXTAREA_CLASS } from '../../settings/components/fields/ResourceField'
import { useKbMutations } from '../api/knowledgeApi'

/**
 * Article lifecycle buttons (spec §41): draft → review → published → archived. Publishing needs `kb.publish` on the
 * server; the UI shows the step and lets the API refuse. Save always keeps a new version when the content changed.
 */
export function ArticleWorkflowActions({ article, saving, onSave, onPreview, onSaved }) {
  const { t } = useTranslation()
  const { action } = useKbMutations()
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState('')
  const status = article?.status || 'draft'
  const run = (name, payload = {}, toastKey = name) =>
    action.mutate({ id: article.id, action: name, ...payload }, {
      onSuccess: (saved) => {
        toast.success(t(`service.knowledge.toasts.${toastKey}`))
        setRejecting(false)
        setNote('')
        onSaved?.(saved)
      },
      onError: (error) => error?.response?.status !== 422 && toast.error(getServiceErrorMessage(error, t)),
    })
  const busy = saving || action.isPending

  return (
    <>
      <Button type="submit" loading={saving}>{t('service.knowledge.actions.save')}</Button>
      {status === 'draft' && (
        <>
          <Button type="button" variant="outline" disabled={busy} onClick={() => onSave({ then: (saved) => action.mutateAsync({ id: saved.id, action: 'submit-review' }) })}>
            <Send size={16} aria-hidden="true" className="rtl:-scale-x-100" />
            {t('service.knowledge.actions.submitReview')}
          </Button>
          <Button type="button" variant="ghost" disabled={busy} onClick={() => onSave({ andPublish: true })}>{t('service.knowledge.actions.publishNow')}</Button>
        </>
      )}
      {status === 'review' && (
        <>
          <Button type="button" variant="outline" disabled={busy} onClick={() => onSave({ andPublish: true })}>
            <CheckCheck size={16} aria-hidden="true" />
            {t('service.knowledge.actions.approve')}
          </Button>
          {!rejecting ? (
            <Button type="button" variant="ghost" disabled={busy} onClick={() => setRejecting(true)}><Undo2 size={16} aria-hidden="true" />{t('service.knowledge.actions.sendBack')}</Button>
          ) : (
            <div className="grid gap-2 rounded-md border border-[var(--border)] p-2">
              <textarea dir="auto" aria-label={t('service.knowledge.fields.reviewNote')} placeholder={t('service.knowledge.fields.reviewNote')} className={TEXTAREA_CLASS} value={note} onChange={(event) => setNote(event.target.value)} />
              <Button type="button" size="sm" variant="outline" disabled={!note.trim() || busy} onClick={() => run('reject', { note }, 'sentBack')}>{t('service.knowledge.actions.sendBack')}</Button>
            </div>
          )}
        </>
      )}
      {article && status !== 'archived' && (
        <Button type="button" variant="ghost" disabled={busy} onClick={() => run('archive', {}, 'archived')}><Archive size={16} aria-hidden="true" />{t('service.knowledge.actions.archive')}</Button>
      )}
      {status === 'archived' && (
        <Button type="button" variant="ghost" disabled={busy} onClick={() => run('unarchive', {}, 'unarchived')}><ArchiveRestore size={16} aria-hidden="true" />{t('service.knowledge.actions.unarchive')}</Button>
      )}
      <Button type="button" variant="ghost" onClick={onPreview}><Eye size={16} aria-hidden="true" />{t('service.knowledge.actions.preview')}</Button>
    </>
  )
}
