import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2 } from 'lucide-react'
import { Spinner } from '../../../shared/components/ui/Spinner'
import { cn } from '../../../shared/utils/cn'
import { BIOMETRIC_METHODS, LOGIN_METHOD, resolveEnabledLoginMethods } from '../constants/loginMethods'
import { useCompleteGoogleSignIn, useStartGoogleSignIn } from '../hooks/useAlternativeLogin'
import { AlternativeMethods } from './AlternativeMethods'
import { BiometricPanel } from './BiometricPanel'
import { LoginErrorAlert } from './LoginErrorAlert'
import { LoginForm } from './LoginForm'

/**
 * The frosted sign-in card: tenant chip, password form, alternative
 * methods, biometric/PIN panel and the Google return step.
 */
export function LoginCard({ tenant, className }) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeMethod, setActiveMethod] = useState(LOGIN_METHOD.PASSWORD)
  const enabledMethods = useMemo(() => resolveEnabledLoginMethods(), [])

  const startGoogle = useStartGoogleSignIn()
  const completeGoogle = useCompleteGoogleSignIn()

  // Google sends the user back to /login?code=…&state=… — finish sign-in once.
  const googleHandled = useRef(false)
  const googleCode = searchParams.get('code')
  const googleState = searchParams.get('state')
  useEffect(() => {
    if (googleHandled.current || !googleCode || !enabledMethods.has(LOGIN_METHOD.GOOGLE)) return
    googleHandled.current = true
    setSearchParams({}, { replace: true })
    completeGoogle.mutate({ code: googleCode, state: googleState })
  }, [completeGoogle, enabledMethods, googleCode, googleState, setSearchParams])

  const handleSelectMethod = (method) => {
    if (method === LOGIN_METHOD.GOOGLE) {
      startGoogle.mutate()
      return
    }
    setActiveMethod(method)
  }

  const isBiometric = BIOMETRIC_METHODS.includes(activeMethod)
  const googleBusy = startGoogle.isPending || completeGoogle.isPending
  const googleError = startGoogle.error || completeGoogle.error

  return (
    <section
      aria-labelledby="login-card-title"
      className={cn(
        'w-full max-w-[420px] rounded-[26px] border p-6 backdrop-blur-xl sm:p-8',
        'border-[color-mix(in_srgb,var(--surface)_60%,transparent)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)]',
        'shadow-[0_30px_80px_-30px_color-mix(in_srgb,var(--brand-primary)_45%,transparent)]',
        className
      )}
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 id="login-card-title" className="text-xl font-black">
            {t('auth.welcomeBack')}
          </h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">{t('auth.welcomeSubtitle')}</p>
        </div>
        {tenant && (
          <span
            className="inline-flex max-w-[45%] shrink-0 items-center gap-1.5 rounded-full border border-[var(--ai-border)] bg-[var(--ai-bg)] px-2.5 py-1 text-xs font-bold text-[var(--ai-text)]"
            title={t('auth.tenantLabel', { tenant })}
          >
            <Building2 size={13} className="shrink-0" />
            <span dir="ltr" className="truncate font-latin">
              {tenant}
            </span>
          </span>
        )}
      </div>

      {completeGoogle.isPending ? (
        <div className="flex flex-col items-center gap-3 py-10 text-sm font-bold text-[var(--text-muted)]" role="status">
          <Spinner />
          {t('auth.google.completing')}
        </div>
      ) : isBiometric ? (
        <BiometricPanel method={activeMethod} onBack={() => setActiveMethod(LOGIN_METHOD.PASSWORD)} />
      ) : (
        <div className="space-y-6">
          <LoginForm />
          {googleError && <LoginErrorAlert error={googleError} />}
          <AlternativeMethods
            enabledMethods={enabledMethods}
            busyMethod={googleBusy ? LOGIN_METHOD.GOOGLE : null}
            onSelect={handleSelectMethod}
          />
        </div>
      )}
    </section>
  )
}
