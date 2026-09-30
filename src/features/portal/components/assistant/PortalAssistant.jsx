import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bot, MessageCircle, Send, X } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { portalApi } from '../../api/portalApi'
import { usePortalAccess } from '../../hooks/usePortalAccess'

const QUICK = ['status', 'payment', 'human']

/**
 * AI assistant in the portal (spec §45.3). Answers from this customer's own data (records, schedule, requests) and
 * published help articles; "talk to a person" is always there and hands over with a request the team sees.
 */
export function PortalAssistant() {
  const { t, i18n } = useTranslation()
  const { can } = usePortalAccess()
  const [open, setOpen] = useState(false)
  const [conversation, setConversation] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const endRef = useRef(null)
  useEffect(() => endRef.current?.scrollIntoView({ block: 'end' }), [conversation?.messages?.length])
  if (!can('case')) return null
  const send = async (message) => {
    if (!message.trim() || sending) return
    setSending(true)
    setFailed(false)
    try {
      setConversation(await portalApi.post(P.assistant, { message, conversation_id: conversation?.id, language: i18n.language === 'en' ? 'en' : 'ar' }))
      setText('')
    } catch {
      setFailed(true)
    } finally {
      setSending(false)
    }
  }
  const messages = conversation?.messages || []
  const handedOff = conversation?.status === 'handed_off'
  return (
    <div className="fixed bottom-4 end-4 z-40 grid justify-items-end gap-2">
      {open && (
        <section className="grid h-[28rem] w-[min(22rem,calc(100vw-2rem))] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl" aria-label={t('portal.assistant.title')}>
          <header className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3">
            <span className="grid">
              <span className="flex items-center gap-1.5 font-semibold"><Bot size={18} className="text-brand-accent" aria-hidden="true" />{t('portal.assistant.title')}</span>
              <span className="text-xs text-[var(--text-muted)]">{t('portal.assistant.subtitle')}</span>
            </span>
            <button type="button" className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--text)]" aria-label={t('portal.assistant.close')} onClick={() => setOpen(false)}><X size={18} aria-hidden="true" /></button>
          </header>
          <div className="grid content-start gap-2 overflow-y-auto p-3" aria-live="polite">
            {!messages.length && <p className="text-sm text-[var(--text-muted)]">{t('portal.assistant.hello')}</p>}
            {messages.map((message, index) => (
              <p key={index} dir="auto" className={cn('max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm', message.role === 'customer' ? 'justify-self-end bg-brand-accent text-white' : 'justify-self-start bg-[var(--surface-2)]')}>{message.text}</p>
            ))}
            {handedOff && conversation.case && <Link to={`/requests/${conversation.case.id}`} className="justify-self-start text-sm font-medium underline">{t('portal.assistant.openRequest', { number: conversation.case.case_number })}</Link>}
            {failed && <p className="text-xs text-sla-breached">{t('portal.assistant.failed')}</p>}
            <div ref={endRef} />
          </div>
          <div className="grid gap-2 border-t border-[var(--border)] p-3">
            {!handedOff && (
              <div className="flex flex-wrap gap-1.5">
                {QUICK.map((key) => <button key={key} type="button" disabled={sending} onClick={() => send(t(`portal.assistant.quick.${key}`))} className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs hover:bg-[var(--surface-2)]">{t(`portal.assistant.quick.${key}`)}</button>)}
              </div>
            )}
            <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); send(text) }}>
              <input dir="auto" value={text} onChange={(event) => setText(event.target.value)} placeholder={t(handedOff ? 'portal.assistant.placeholderTeam' : 'portal.assistant.placeholder')} aria-label={t('portal.assistant.placeholder')} className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent" />
              <Button type="submit" size="icon" loading={sending} disabled={!text.trim()} aria-label={t('portal.assistant.send')}><Send size={16} aria-hidden="true" className="rtl:-scale-x-100" /></Button>
            </form>
            <p className="text-[0.7rem] text-[var(--text-muted)]">{t('portal.assistant.disclaimer')}</p>
          </div>
        </section>
      )}
      <Button className="rounded-full shadow-lg" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <MessageCircle size={18} aria-hidden="true" />
        {t('portal.assistant.open')}
      </Button>
    </div>
  )
}
