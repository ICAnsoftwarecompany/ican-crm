import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { cn } from '../../../../shared/utils/cn'
import { usePublicSettings, useSignIn } from '../../api/portalApi'
import { usePortalSession } from '../../store/portalSessionStore'
import { AuthCard } from './AuthCard'

const fieldError = (error, name) => error?.response?.data?.errors?.[name]
const statusOf = (error) => error?.response?.status

/** Sign in with a one-time code (phone or email) or, for company users when enabled, email + password. */
export function LoginScreen() {
  const { t } = useTranslation()
  const token = usePortalSession((state) => state.token)
  const settings = usePublicSettings()
  const { requestOtp, verifyOtp, login } = useSignIn()
  const [mode, setMode] = useState('otp')
  const [target, setTarget] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  if (token) return <Navigate to="/" replace />

  const otpError = requestOtp.error || verifyOtp.error
  const errorText = (error) => {
    if (!error) return null
    if (statusOf(error) === 429) return t('portal.auth.tooMany')
    if (statusOf(error) === 403) return t('portal.auth.noAccess')
    if (fieldError(error, 'code') || fieldError(error, 'password')) return t('portal.auth.invalid')
    if (fieldError(error, 'target')) return t('portal.auth.targetRequired')
    return t('portal.errors.generic')
  }

  return (
    <AuthCard
      title={t('portal.auth.title')}
      description={t('portal.auth.description')}
      footer={
        <div className="flex flex-wrap justify-center gap-4 text-sm text-[var(--text-muted)]">
          <Link to="/track" className="underline">{t('portal.auth.trackLink')}</Link>
          {settings.data?.public_help_center && <Link to="/help-center" className="underline">{t('portal.help.browseHelp')}</Link>}
        </div>
      }
    >
      {settings.data?.b2b_password_login && (
        <div role="tablist" className="grid grid-cols-2 gap-1 rounded-lg bg-[var(--surface-2)] p-1">
          {['otp', 'password'].map((value) => (
            <button key={value} type="button" role="tab" aria-selected={mode === value} onClick={() => setMode(value)} className={cn('rounded-md px-3 py-1.5 text-sm', mode === value ? 'bg-[var(--surface)] font-semibold shadow-sm' : 'text-[var(--text-muted)]')}>
              {t(`portal.auth.modes.${value}`)}
            </button>
          ))}
        </div>
      )}
      {mode === 'otp' ? (
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            if (!codeSent) requestOtp.mutate(target, { onSuccess: () => setCodeSent(true) })
            else verifyOtp.mutate({ target, code })
          }}
        >
          <Input label={t('portal.auth.target')} dir="ltr" autoComplete="username" value={target} disabled={codeSent} onChange={(event) => setTarget(event.target.value)} />
          {codeSent && (
            <>
              <p className="text-xs text-[var(--text-muted)]">{t('portal.auth.codeSent')}</p>
              <Input label={t('portal.auth.code')} dir="ltr" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} autoFocus />
            </>
          )}
          {otpError && <p role="alert" className="text-sm text-sla-breached">{errorText(otpError)}</p>}
          <Button type="submit" loading={requestOtp.isPending || verifyOtp.isPending} disabled={!target.trim() || (codeSent && code.length < 4)}>
            {t(codeSent ? 'portal.auth.signIn' : 'portal.auth.sendCode')}
          </Button>
          {codeSent && <button type="button" className="text-xs text-[var(--text-muted)] underline" onClick={() => { setCodeSent(false); setCode(''); verifyOtp.reset() }}>{t('portal.auth.changeTarget')}</button>}
        </form>
      ) : (
        <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); login.mutate({ email, password }) }}>
          <Input label={t('portal.auth.email')} type="email" dir="ltr" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input label={t('portal.auth.password')} type="password" dir="ltr" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {login.error && <p role="alert" className="text-sm text-sla-breached">{errorText(login.error)}</p>}
          <Button type="submit" loading={login.isPending} disabled={!email || !password}>{t('portal.auth.signIn')}</Button>
        </form>
      )}
    </AuthCard>
  )
}
