import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Lock, Send } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { cn } from '../../../../../shared/utils/cn'
import { useCaseMutations } from '../../hooks/useCases'

/**
 * Reply to the customer (goes out on the case channel; the backend applies
 * the messaging policy, e.g. WhatsApp 24h window) or add an internal note
 * (never visible to the customer).
 */
export function CaseComposer({ caseItem, disabled }) {
  const { t } = useTranslation()
  const { reply, addNote } = useCaseMutations()
  const [mode, setMode] = useState('reply')
  const [body, setBody] = useState('')
  const mutation = mode === 'reply' ? reply : addNote
  const isNote = mode === 'note'

  const submit = (event) => {
    event.preventDefault()
    if (!body.trim()) return
    mutation.mutate({ caseId: caseItem.id, body }, { onSuccess: () => setBody('') })
  }

  const tab = (value, Icon, label) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === value}
      onClick={() => setMode(value)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
        mode === value ? 'bg-[var(--surface)] font-semibold text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
      )}
    >
      <Icon size={14} aria-hidden="true" className={value === 'reply' ? 'rtl:-scale-x-100' : undefined} />
      {label}
    </button>
  )

  return (
    <form
      onSubmit={submit}
      className={cn(
        'grid gap-2 rounded-lg border bg-[var(--surface)] p-3',
        isNote ? 'border-dashed border-status-contacted' : 'border-[var(--border)]'
      )}
    >
      <div role="tablist" className="flex w-fit gap-1 rounded-lg bg-[var(--surface-2)] p-0.5">
        {tab('reply', Send, t('service.cases.composer.reply'))}
        {tab('note', Lock, t('service.cases.composer.note'))}
      </div>
      <textarea
        value={body}
        disabled={disabled}
        onChange={(event) => setBody(event.target.value)}
        placeholder={isNote ? t('service.cases.composer.notePlaceholder') : t('service.cases.composer.replyPlaceholder')}
        aria-label={isNote ? t('service.cases.composer.note') : t('service.cases.composer.reply')}
        className="min-h-[88px] w-full resize-y rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-accent"
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--text-muted)]">
          {isNote
            ? t('service.cases.composer.noteHint')
            : t('service.cases.composer.replyHint', { channel: t(`service.cases.channels.${caseItem.source_channel}`, { defaultValue: caseItem.source_channel }) })}
        </p>
        <Button type="submit" variant={isNote ? 'outline' : 'primary'} loading={mutation.isPending} disabled={disabled || !body.trim()}>
          {isNote ? t('service.cases.composer.saveNote') : t('service.cases.composer.send')}
        </Button>
      </div>
    </form>
  )
}
