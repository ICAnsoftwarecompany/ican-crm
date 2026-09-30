import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useAiMutations, useAiSettings } from '../api/aiApi'

/**
 * "Draft with AI" in the case composer: fills the text box with a suggested reply (KB-grounded). It is never sent
 * automatically — the agent edits and sends. Blocked topics return no draft.
 */
export function AiDraftReplyButton({ caseItem, disabled, onDraft }) {
  const { t, i18n } = useTranslation()
  const settings = useAiSettings()
  const { suggestReply, feedback } = useAiMutations()
  if (settings.data?.features?.suggested_reply === false) return null
  const draft = () =>
    suggestReply.mutate({ caseId: caseItem.id, language: i18n.language === 'en' ? 'en' : 'ar' }, {
      onSuccess: (result) => {
        if (result.blocked) {
          toast.warning(t('service.ai.reply.blocked'))
          return
        }
        onDraft(result.body)
        feedback.mutate({ caseId: caseItem.id, feature: 'suggested_reply', accepted: true })
        toast.success(result.sources?.length ? t('service.ai.reply.readyWithSource', { title: result.sources[0].title }) : t('service.ai.reply.ready'))
      },
    })
  return (
    <Button type="button" size="sm" variant="ghost" disabled={disabled} loading={suggestReply.isPending} onClick={draft}>
      <Sparkles size={14} className="text-[var(--ai-color)]" aria-hidden="true" />
      {t('service.ai.reply.draft')}
    </Button>
  )
}
