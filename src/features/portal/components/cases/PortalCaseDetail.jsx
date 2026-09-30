import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { portalApi, usePortalDetail, usePortalMutation } from '../../api/portalApi'
import { usePortalAccess } from '../../hooks/usePortalAccess'
import { usePortalFormat } from '../../utils/format'
import { Card, PortalPage, StatusPill, categoryTone } from '../PortalPage'

const TEXTAREA = 'min-h-[88px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-brand-accent'

/** A request: customer-visible conversation only (internal notes never reach the portal) + reply. */
export function PortalCaseDetail() {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const { caseId } = useParams()
  const { can } = usePortalAccess()
  const query = usePortalDetail('case', `${P.cases}/${caseId}`)
  const item = query.data
  const [reply, setReply] = useState('')
  const send = usePortalMutation((body) => portalApi.post(`${P.cases}/${caseId}/reply`, { body }), { onSuccess: () => { setReply(''); toast.success(t('portal.cases.replySent')) } })
  const closed = ['resolved', 'closed', 'cancelled'].includes(item?.status?.category)

  return (
    <PortalPage title={item?.subject || t('portal.sections.cases')} actions={<Link to="/requests" className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"><ArrowRight size={16} aria-hidden="true" className="ltr:rotate-180" />{t('portal.cases.back')}</Link>} query={query}>
      {item && (
        <div className="grid gap-4">
          <Card className="flex flex-wrap items-center gap-2 text-sm">
            <span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{item.case_number}</span>
            <StatusPill tone={categoryTone(item.status?.category)}>{format.label(item.status?.label)}</StatusPill>
            <span className="text-xs text-[var(--text-muted)]">{format.label(item.type?.label)} · {t('portal.cases.opened', { date: format.dateTime(item.opened_at) })}</span>
          </Card>
          <Card>
            <ol className="grid gap-3">
              {item.messages.map((message) => (
                <li key={message.id} className={cn('grid max-w-[85%] gap-1 rounded-xl px-3 py-2 text-sm', message.from === 'customer' ? 'ms-auto bg-[var(--brand-accent-soft)]' : 'bg-[var(--surface-2)]')}>
                  <span className="text-xs font-semibold text-[var(--text-muted)]">{message.from === 'customer' ? t('portal.cases.you') : t('portal.cases.team')}</span>
                  <p className="whitespace-pre-line"><bdi>{message.body}</bdi></p>
                  <span className="text-[11px] text-[var(--text-muted)]">{format.dateTime(message.occurred_at)}</span>
                </li>
              ))}
              {!item.messages.length && <li className="text-sm text-[var(--text-muted)]">{t('portal.cases.noMessages')}</li>}
            </ol>
          </Card>
          {can('case', 'reply') && !closed && (
            <Card className="grid gap-2">
              <label htmlFor="portal-reply" className="text-sm font-medium">{t('portal.cases.reply')}</label>
              <textarea id="portal-reply" dir="auto" className={TEXTAREA} value={reply} onChange={(event) => setReply(event.target.value)} />
              <Button className="w-fit" loading={send.isPending} disabled={!reply.trim()} onClick={() => send.mutate(reply.trim())}>{t('portal.cases.send')}</Button>
            </Card>
          )}
          {closed && <p className="text-sm text-[var(--text-muted)]">{t('portal.cases.closedHint')}</p>}
        </div>
      )}
    </PortalPage>
  )
}
