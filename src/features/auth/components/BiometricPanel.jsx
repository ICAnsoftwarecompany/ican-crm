import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Fingerprint, KeyRound, ScanFace, User } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { Input } from '../../../shared/components/ui/Input'
import { useDirection } from '../../../shared/hooks/useDirection'
import { LOGIN_METHOD, PIN_LENGTH } from '../constants/loginMethods'
import { useBiometricLogin, usePinLogin } from '../hooks/useAlternativeLogin'
import { readLastLogin } from '../hooks/useCompleteSignIn'
import { isPlatformAuthenticatorAvailable } from '../utils/webauthn'
import { LoginErrorAlert } from './LoginErrorAlert'
import { PinInput } from './PinInput'

const STEP = { SCAN: 'scan', PIN: 'pin' }

/**
 * Face ID / fingerprint sign-in with a PIN fallback.
 *
 * Flow: username (prefilled from last sign-in) → device biometric prompt.
 * If the device has no biometric, the prompt is cancelled, or verification
 * fails, the panel switches to the PIN pad and says why.
 */
export function BiometricPanel({ method, onBack }) {
  const { t } = useTranslation()
  const dir = useDirection()
  const [login, setLogin] = useState(readLastLogin)
  const [step, setStep] = useState(STEP.SCAN)
  const [fallbackReason, setFallbackReason] = useState('')
  const [pin, setPin] = useState('')
  const [deviceSupported, setDeviceSupported] = useState(true)

  const biometric = useBiometricLogin()
  const pinLogin = usePinLogin()

  const isFace = method === LOGIN_METHOD.FACE_ID
  const MethodIcon = isFace ? ScanFace : Fingerprint
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft

  useEffect(() => {
    let active = true
    isPlatformAuthenticatorAvailable().then((available) => {
      if (!active) return
      setDeviceSupported(available)
      if (!available) {
        setFallbackReason('auth.biometric.deviceNotSupported')
        setStep(STEP.PIN)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const switchToPin = (reasonKey) => {
    setFallbackReason(reasonKey)
    setPin('')
    pinLogin.reset()
    setStep(STEP.PIN)
  }

  const startScan = () => {
    if (!login.trim()) return
    biometric.mutate(
      { login: login.trim() },
      {
        onError: (error) => {
          // The user closing the OS prompt is not a failure worth alarming about.
          const cancelled = error?.name === 'NotAllowedError' || error?.name === 'AbortError'
          switchToPin(cancelled ? 'auth.biometric.cancelled' : 'auth.biometric.failed')
        },
      }
    )
  }

  const submitPin = (value) => {
    if (!login.trim() || value.length !== PIN_LENGTH) return
    pinLogin.mutate({ login: login.trim(), pin: value }, { onError: () => setPin('') })
  }

  const loginField = (
    <Input
      label={t('auth.usernameOrEmail')}
      placeholder={t('auth.usernamePlaceholder')}
      startIcon={<User size={16} />}
      autoComplete="username webauthn"
      autoCapitalize="none"
      spellCheck={false}
      dir="auto"
      className="h-11"
      value={login}
      onChange={(event) => setLogin(event.target.value)}
      autoFocus={!login}
    />
  )

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--text-muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:text-[var(--text)]"
      >
        <BackIcon size={15} />
        {t('auth.backToPassword')}
      </button>

      {step === STEP.SCAN ? (
        <>
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--ai-bg)] text-[var(--ai-text)]">
              <MethodIcon size={40} strokeWidth={1.4} className={biometric.isPending ? 'animate-pulse' : undefined} />
            </span>
            <div>
              <h3 className="text-lg font-black text-[var(--text)]">
                {t(isFace ? 'auth.biometric.faceTitle' : 'auth.biometric.fingerprintTitle')}
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {t(isFace ? 'auth.biometric.faceHint' : 'auth.biometric.fingerprintHint')}
              </p>
            </div>
          </div>

          {loginField}

          <Button
            size="xl"
            className="w-full rounded-xl font-bold dark:bg-brand-accent dark:text-[var(--brand-primary)] dark:hover:bg-brand-accent dark:hover:opacity-90"
            loading={biometric.isPending}
            disabled={!login.trim() || !deviceSupported}
            onClick={startScan}
          >
            {biometric.isPending
              ? t('auth.biometric.waiting')
              : t(isFace ? 'auth.biometric.startFace' : 'auth.biometric.startFingerprint')}
          </Button>

          <button
            type="button"
            onClick={() => switchToPin('')}
            className="mx-auto flex items-center gap-1.5 text-sm font-bold text-[var(--ai-text)] hover:underline focus-visible:outline-none focus-visible:underline"
          >
            <KeyRound size={15} />
            {t('auth.pin.useInstead')}
          </button>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--text)]">
              <KeyRound size={30} strokeWidth={1.5} />
            </span>
            <div>
              <h3 className="text-lg font-black text-[var(--text)]">{t('auth.pin.title')}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {fallbackReason ? t(fallbackReason) : t('auth.pin.hint', { count: PIN_LENGTH })}
              </p>
            </div>
          </div>

          {loginField}

          <LoginErrorAlert error={pinLogin.error} />

          <PinInput
            value={pin}
            onChange={setPin}
            onComplete={submitPin}
            disabled={pinLogin.isPending || !login.trim()}
            invalid={Boolean(pinLogin.error)}
            autoFocus={Boolean(login)}
          />

          <Button
            size="xl"
            className="w-full rounded-xl font-bold dark:bg-brand-accent dark:text-[var(--brand-primary)] dark:hover:bg-brand-accent dark:hover:opacity-90"
            loading={pinLogin.isPending}
            disabled={pin.length !== PIN_LENGTH || !login.trim()}
            onClick={() => submitPin(pin)}
          >
            {pinLogin.isPending ? t('auth.loggingIn') : t('auth.loginButton')}
          </Button>

          {deviceSupported && (
            <button
              type="button"
              onClick={() => {
                biometric.reset()
                setStep(STEP.SCAN)
              }}
              className="mx-auto flex items-center gap-1.5 text-sm font-bold text-[var(--ai-text)] hover:underline focus-visible:outline-none focus-visible:underline"
            >
              <MethodIcon size={15} />
              {t(isFace ? 'auth.biometric.retryFace' : 'auth.biometric.retryFingerprint')}
            </button>
          )}
        </>
      )}
    </div>
  )
}
