import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2, ClipboardList, Megaphone, MessageCircle, MessagesSquare, Moon, Sun } from 'lucide-react'
import { BrandLogo } from '../../shared/components/brand/BrandLogo'
import { Spinner } from '../../shared/components/ui/Spinner'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { resolveTenantFromHostname } from '../../services/tenantResolver'
import { getApiRootDomain } from '../../services/apiBaseUrl'
import { LoginForm } from '../../features/auth/components/LoginForm'
import { LoginBackground } from '../../features/auth/components/LoginBackground'
import { AlternativeMethods } from '../../features/auth/components/AlternativeMethods'
import { BiometricPanel } from '../../features/auth/components/BiometricPanel'
import { LoginErrorAlert } from '../../features/auth/components/LoginErrorAlert'
import {
  BIOMETRIC_METHODS,
  LOGIN_METHOD,
  resolveEnabledLoginMethods,
} from '../../features/auth/constants/loginMethods'
import { useCompleteGoogleSignIn, useStartGoogleSignIn } from '../../features/auth/hooks/useAlternativeLogin'

const CHANNELS = [
  { key: 'whatsapp', icon: MessageCircle },
  { key: 'messenger', icon: MessagesSquare },
  { key: 'leadForms', icon: ClipboardList },
  { key: 'ads', icon: Megaphone },
]

export function LoginPage() {
  const { t, i18n } = useTranslation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isDark = useThemeStore((s) => s.isDark)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeMethod, setActiveMethod] = useState(LOGIN_METHOD.PASSWORD)

  const enabledMethods = useMemo(() => resolveEnabledLoginMethods(), [])
  const tenant = useMemo(() => resolveTenantFromHostname(undefined, getApiRootDomain()), [])

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

  if (isAuthenticated) return <Navigate to="/" replace />

  const isArabic = i18n.resolvedLanguage?.startsWith('ar')
  const toggleLanguage = () => i18n.changeLanguage(isArabic ? 'en' : 'ar')

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
    <div className="relative min-h-screen overflow-hidden font-arabic text-[var(--text)]">
      <LoginBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-4 sm:px-10 sm:py-6">
          <BrandLogo size={34} wordmark wordmarkClassName="text-lg" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={t('common.language')}
              className="h-9 rounded-full border border-[color-mix(in_srgb,var(--border)_70%,transparent)] bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] px-3.5 text-sm font-bold backdrop-blur-md transition-colors hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <span className={isArabic ? 'font-latin' : 'font-arabic'}>{isArabic ? 'English' : 'العربية'}</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? t('common.lightMode') : t('common.darkMode')}
              title={isDark ? t('common.lightMode') : t('common.darkMode')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--border)_70%,transparent)] bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] backdrop-blur-md transition-colors hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Hero + card */}
        <main className="flex flex-1 flex-col items-center px-4 pb-10 pt-2 sm:pt-4">
          <div className="login-enter flex flex-col items-center text-center">
            <div className="flex rounded-[15px] shadow-[0_18px_40px_-14px_color-mix(in_srgb,var(--brand-primary)_55%,transparent)]">
              <BrandLogo size={60} tone="tile" />
            </div>
            <h1 className="mt-6 max-w-[20ch] text-[34px] font-black leading-[1.15] tracking-tight sm:text-5xl lg:text-[56px]">
              {t('auth.hero.title')}
            </h1>
            <p className="mt-3 max-w-[52ch] text-base font-medium leading-relaxed text-[var(--text-muted)] sm:text-[17px]">
              {t('auth.hero.subtitle')}
            </p>
          </div>

          <section
            aria-labelledby="login-card-title"
            className="login-enter login-enter--late mt-7 w-full max-w-[420px] rounded-[26px] border border-[color-mix(in_srgb,var(--surface)_60%,transparent)] bg-[color-mix(in_srgb,var(--surface)_78%,transparent)] p-6 shadow-[0_30px_80px_-30px_color-mix(in_srgb,var(--brand-primary)_45%,transparent)] backdrop-blur-xl sm:p-8"
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

          {/* What the product unifies — replaces a generic logo strip. */}
          <div className="login-enter login-enter--late mt-10 flex flex-col items-center gap-3">
            <p className="text-sm font-semibold text-[var(--text-muted)]">{t('auth.channels.title')}</p>
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {CHANNELS.map(({ key, icon: Icon }) => (
                <li key={key} className="flex items-center gap-1.5 text-sm font-bold text-[var(--text)] opacity-80">
                  <Icon size={16} strokeWidth={1.8} />
                  {t(`auth.channels.${key}`)}
                </li>
              ))}
            </ul>
          </div>
        </main>

        <footer className="pb-6 text-center text-xs font-medium text-[var(--text-muted)]">
          <span className="font-latin">ICAN CRM © {new Date().getFullYear()}</span>
        </footer>
      </div>
    </div>
  )
}
