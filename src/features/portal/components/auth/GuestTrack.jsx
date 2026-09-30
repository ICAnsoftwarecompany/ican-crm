import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { portalApi } from '../../api/portalApi'
import { usePortalFormat } from '../../utils/format'
import { AuthCard } from './AuthCard'

/** Guest tracking (spec §43.1): reference → code to the recipient's phone → one shipment, limited fields. */
export function GuestTrack() {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const [reference, setReference] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('reference')
  const request = useMutation({ mutationFn: portalApi.track })
  const result = step === 'result' ? request.data : null

  const submit = (event) => {
    event.preventDefault()
    if (step === 'reference') request.mutate({ reference }, { onSuccess: () => setStep('code') })
    else request.mutate({ reference, code }, { onSuccess: () => setStep('result') })
  }

  return (
    <AuthCard title={t('portal.track.title')} description={t('portal.track.description')} footer={<Link to="/login" className="text-center text-sm text-[var(--text-muted)] underline">{t('portal.track.signInLink')}</Link>}>
      {result ? (
        <div className="grid gap-3">
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-2"><dt className="text-[var(--text-muted)]">{t('portal.track.reference')}</dt><dd dir="ltr" className="font-mono">{result.reference_no}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-[var(--text-muted)]">{t('portal.track.status')}</dt><dd className="font-semibold">{result.delivery_status ? t(`portal.track.deliveryStatuses.${result.delivery_status}`) : format.label(result.status?.label)}</dd></div>
            {result.expected_at && <div className="flex justify-between gap-2"><dt className="text-[var(--text-muted)]">{t('portal.track.expected')}</dt><dd>{format.date(result.expected_at)}</dd></div>}
            {result.cod_amount ? <div className="flex justify-between gap-2"><dt className="text-[var(--text-muted)]">{t('portal.track.cod')}</dt><dd dir="ltr">{format.money(result.cod_amount)}</dd></div> : null}
          </dl>
          {result.attempts?.length > 0 && (
            <ul className="grid gap-1 border-t border-[var(--border)] pt-2 text-xs text-[var(--text-muted)]">
              {result.attempts.map((attempt, index) => <li key={index}>{format.dateTime(attempt.occurred_at)} · {t(`portal.track.attempts.${attempt.value}`, { defaultValue: attempt.value })}</li>)}
            </ul>
          )}
          <Button variant="outline" onClick={() => { setStep('reference'); setCode(''); request.reset() }}>{t('portal.track.again')}</Button>
        </div>
      ) : (
        <form className="grid gap-3" onSubmit={submit}>
          <Input label={t('portal.track.reference')} dir="ltr" value={reference} disabled={step === 'code'} onChange={(event) => setReference(event.target.value)} />
          {step === 'code' && (
            <>
              <p className="text-xs text-[var(--text-muted)]">{request.data?.masked_phone ? t('portal.track.codeSentTo', { phone: request.data.masked_phone }) : t('portal.track.codeSent')}</p>
              <Input label={t('portal.auth.code')} dir="ltr" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} autoFocus />
            </>
          )}
          {request.error && <p role="alert" className="text-sm text-sla-breached">{request.error?.response?.status === 429 ? t('portal.auth.tooMany') : t('portal.track.invalid')}</p>}
          <Button type="submit" loading={request.isPending} disabled={!reference.trim() || (step === 'code' && code.length < 4)}>{t(step === 'code' ? 'portal.track.show' : 'portal.auth.sendCode')}</Button>
        </form>
      )}
    </AuthCard>
  )
}
