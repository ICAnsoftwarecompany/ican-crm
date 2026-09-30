import { MessagesSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { InternalChatWorkspace } from '../../features/internal-chat/components/InternalChatWorkspace'
import { usePageHeader } from '../../shared/hooks/usePageHeader'

export function InternalChatPage() {
  const { t } = useTranslation()
  usePageHeader({
    title: t('nav.teamChat'),
    icon: MessagesSquare,
  })

  return <InternalChatWorkspace />
}
