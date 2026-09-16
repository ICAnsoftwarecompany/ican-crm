import { MessagesSquare } from 'lucide-react'

import { InternalChatWorkspace } from '../../features/internal-chat/components/InternalChatWorkspace'
import { usePageHeader } from '../../shared/hooks/usePageHeader'

export function InternalChatPage() {
  usePageHeader({
    title: 'الشات الداخلي',
    icon: MessagesSquare,
  })

  return <InternalChatWorkspace />
}
