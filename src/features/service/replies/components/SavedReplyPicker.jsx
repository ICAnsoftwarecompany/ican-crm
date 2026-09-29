import { useTranslation } from 'react-i18next'
import { MessageSquareText } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { DropdownMenu } from '../../../../shared/components/overlays/DropdownMenu'
import { useAuthStore } from '../../../../store/authStore'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useResourceList } from '../../settings/api/settingsApi'
import { savedRepliesResource } from '../../settings/resources/communicationResources'
import { renderTemplate, repliesForCase } from '../utils/renderTemplate'

/**
 * "Saved replies" button for the case composer. Picks a reply that applies to
 * the case (type/channel), fills known variables and hands the text back.
 */
export function SavedReplyPicker({ caseItem, onPick, disabled }) {
  const { t, i18n } = useTranslation()
  const agentName = useAuthStore((state) => state.user?.name)
  const replies = useResourceList(savedRepliesResource)
  const available = repliesForCase(replies.data, caseItem)

  const items = available.length
    ? available.map((reply) => {
        const body = localizeLabel(reply.body, i18n.language)
        return {
          id: reply.id,
          label: (
            <span className="grid min-w-0 gap-0.5 text-start">
              <span className="truncate">{localizeLabel(reply.title, i18n.language, reply.id)}</span>
              <span className="line-clamp-2 text-xs font-normal text-[var(--text-muted)]">{body}</span>
            </span>
          ),
          onSelect: () => onPick(renderTemplate(body, { caseItem, agentName })),
        }
      })
    : [{ id: 'empty', label: t(replies.isLoading ? 'service.replies.loading' : 'service.replies.empty'), disabled: true }]

  return (
    <DropdownMenu
      align="start"
      contentClassName="w-80 max-h-80 overflow-y-auto"
      items={items}
      trigger={
        <Button type="button" variant="ghost" size="sm" disabled={disabled}>
          <MessageSquareText size={14} aria-hidden="true" />
          {t('service.replies.insert')}
        </Button>
      }
    />
  )
}
