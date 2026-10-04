import { useMemo, useRef, useState } from 'react'
import { Check, CheckCircle2, ChevronDown, Circle, LoaderCircle, Users, X, XCircle } from 'lucide-react'
import { ConversationComposer } from './ConversationComposer'

const SEND_INTERVAL_MS = 15000

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
}

export function NewConversationComposer({ channelLabel, recipients, onCancel, onOpenRecipient, onSendRecipient }) {
  const [selectedIds, setSelectedIds] = useState([])
  const [pickerOpen, setPickerOpen] = useState(true)
  const [progress, setProgress] = useState(null)
  const [recipientStatuses, setRecipientStatuses] = useState({})
  const sendingRef = useRef(false)
  const selectedSet = useMemo(() => new Set(selectedIds.map(String)), [selectedIds])

  const toggleRecipient = (id) => {
    if (sendingRef.current) return
    const value = String(id)
    setSelectedIds((current) => current.some((item) => String(item) === value)
      ? current.filter((item) => String(item) !== value)
      : [...current, value])
  }

  const handleSend = async (message) => {
    const queue = recipients.filter((recipient) => selectedSet.has(String(recipient.id)))
    if (!queue.length || sendingRef.current) return

    sendingRef.current = true
    setRecipientStatuses(Object.fromEntries(queue.map((recipient) => [String(recipient.id), 'pending'])))
    setProgress({ total: queue.length, completed: 0, failed: 0, current: queue[0]?.label || '' })

    for (let index = 0; index < queue.length; index += 1) {
      const recipient = queue[index]
      setRecipientStatuses((current) => ({ ...current, [String(recipient.id)]: 'sending' }))
      setProgress((current) => ({ ...current, current: recipient.label }))
      try {
        await onSendRecipient(recipient, message)
        setRecipientStatuses((current) => ({ ...current, [String(recipient.id)]: 'success' }))
        setProgress((current) => ({ ...current, completed: current.completed + 1 }))
      } catch {
        setRecipientStatuses((current) => ({ ...current, [String(recipient.id)]: 'failed' }))
        setProgress((current) => ({ ...current, failed: current.failed + 1 }))
      }

      if (index < queue.length - 1) await wait(SEND_INTERVAL_MS)
    }

    sendingRef.current = false
    if (queue.length === 1) onOpenRecipient(queue[0].id)
  }

  const remaining = progress ? Math.max(progress.total - progress.completed - progress.failed, 0) : 0
  const statusConfig = {
    pending: { label: 'في الانتظار', icon: Circle, className: 'text-[var(--text-muted)]' },
    sending: { label: 'جارٍ الإرسال', icon: LoaderCircle, className: 'text-[var(--brand-accent)]' },
    success: { label: 'نجح', icon: CheckCircle2, className: 'text-emerald-600' },
    failed: { label: 'فشل', icon: XCircle, className: 'text-red-600' },
  }

  return (
    <section className="flex min-h-[520px] flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] xl:sticky xl:top-16 xl:h-[calc(100vh-5rem)] xl:max-h-[calc(100vh-5rem)]">
      <header className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] p-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]"><Users size={18} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-black text-[var(--text)]">رسالة جديدة عبر {channelLabel}</h2>
          <p className="text-xs font-semibold text-[var(--text-muted)]">اختر عميلًا واحدًا أو عدة عملاء</p>
        </div>
        <button type="button" onClick={onCancel} disabled={sendingRef.current} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-50" aria-label="إغلاق"><X size={15} /></button>
      </header>

      <div className="border-b border-[var(--border)] p-3">
        <button type="button" onClick={() => setPickerOpen((current) => !current)} className="flex h-10 w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-start text-xs font-black text-[var(--text)]">
          <Users size={15} className="text-[var(--brand-accent)]" />
          <span className="flex-1">العملاء المحددون: {selectedIds.length}</span>
          <ChevronDown size={15} className={pickerOpen ? 'rotate-180 transition' : 'transition'} />
        </button>
        {pickerOpen ? (
          <div className="mt-2 max-h-44 space-y-1 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
            {recipients.map((recipient) => {
              const selected = selectedSet.has(String(recipient.id))
              return <button key={recipient.id} type="button" onClick={() => toggleRecipient(recipient.id)} className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-start text-xs font-bold transition ${selected ? 'bg-[var(--brand-accent-soft)] text-[var(--text)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'}`}>
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded border ${selected ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white' : 'border-[var(--border)]'}`}>{selected ? <Check size={13} /> : null}</span>
                <span className="min-w-0 flex-1 truncate">{recipient.label}</span>
                {recipient.detail ? <span className="max-w-[45%] truncate text-[10px] text-[var(--text-muted)]">{recipient.detail}</span> : null}
              </button>
            })}
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-end bg-[var(--surface-2)] p-4">
        {progress ? (
          <div className="mb-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
            <div className="flex items-center gap-2 text-xs font-black text-[var(--text)]"><LoaderCircle size={15} className={remaining ? 'animate-spin text-[var(--brand-accent)]' : 'text-emerald-600'} />{remaining ? `جارٍ الإرسال إلى ${progress.current}` : 'اكتمل الإرسال'}</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full bg-[var(--brand-accent)] transition-all" style={{ width: `${((progress.completed + progress.failed) / progress.total) * 100}%` }} /></div>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-bold text-[var(--text-muted)]"><span>تم: {progress.completed}</span><span>متبقي: {remaining}</span>{progress.failed ? <span className="text-red-600">تعذر: {progress.failed}</span> : null}</div>
            <div className="mt-3 max-h-32 space-y-1 overflow-y-auto border-t border-[var(--border)] pt-2">
              {recipients.filter((recipient) => selectedSet.has(String(recipient.id))).map((recipient) => {
                const status = statusConfig[recipientStatuses[String(recipient.id)] || 'pending']
                const StatusIcon = status.icon
                return <div key={recipient.id} className="flex items-center gap-2 rounded-md bg-[var(--surface-2)] px-2 py-1.5 text-[11px] font-bold"><span className="min-w-0 flex-1 truncate text-[var(--text)]">{recipient.label}</span><span className={`inline-flex shrink-0 items-center gap-1 ${status.className}`}><StatusIcon size={13} className={recipientStatuses[String(recipient.id)] === 'sending' ? 'animate-spin' : ''} />{status.label}</span></div>
              })}
            </div>
          </div>
        ) : null}
        <ConversationComposer
          onSend={handleSend}
          isSending={Boolean(progress && remaining)}
          disabled={!selectedIds.length || sendingRef.current}
          supportsAttachments
          autoFocusKey={`new-${channelLabel}`}
        />
      </div>
    </section>
  )
}
