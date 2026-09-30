import { useTranslation } from 'react-i18next'
import { Bot, User } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'

/** Messages of one AI agent conversation: customer on the start side, AI on the end side, tools used under each reply. */
export function AgentChatLog({ messages = [] }) {
  const { t } = useTranslation()
  return (
    <ol className="grid gap-2">
      {messages.map((message, index) => {
        const ai = message.role === 'ai'
        return (
          <li key={index} className={cn('flex max-w-[85%] items-start gap-2', ai ? 'justify-self-end' : 'justify-self-start')}>
            {!ai && <User size={16} className="mt-1 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />}
            <div className={cn('grid gap-1 rounded-lg px-3 py-2 text-sm', ai ? 'bg-[var(--ai-bg)] text-[var(--text)]' : 'bg-[var(--surface-2)] text-[var(--text)]')}>
              <p dir="auto" className="whitespace-pre-line">{message.text}</p>
              {ai && message.tools?.length > 0 && <p className="text-[0.7rem] text-[var(--text-muted)]">{t('service.ai.agent.tools', { tools: message.tools.map((tool) => t(`service.ai.agent.toolNames.${tool}`)).join(', ') })}</p>}
            </div>
            {ai && <Bot size={16} className="mt-1 shrink-0 text-[var(--ai-color)]" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}
