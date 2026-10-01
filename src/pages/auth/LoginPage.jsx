import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'
import { BrandLogo } from '../../shared/components/brand/BrandLogo'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { resolveTenantFromHostname } from '../../services/tenantResolver'
import { getApiRootDomain } from '../../services/apiBaseUrl'
import { LoginBackground } from '../../features/auth/components/LoginBackground'
import { LoginCard } from '../../features/auth/components/LoginCard'
import { LoginShowcase } from '../../features/auth/components/LoginShowcase'
import { SHOWCASE_SLIDES } from '../../features/auth/constants/showcaseSlides'
import { useShowcase } from '../../features/auth/hooks/useShowcase'

const PILL_BUTTON =
  'h-9 rounded-full border border-[color-mix(in_srgb,var(--border)_70%,transparent)] bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] text-sm font-bold backdrop-blur-md transition-colors hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent'

/**
 * /login — composition only. See README_AR.md in this folder for the full
 * explanation of the page, and features/auth/README.md for the API contract.
 */
export function LoginPage() {
  const { t, i18n } = useTranslation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isDark = useThemeStore((s) => s.isDark)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const tenant = useMemo(() => resolveTenantFromHostname(undefined, getApiRootDomain()), [])
  const showcase = useShowcase(SHOWCASE_SLIDES.length)

  if (isAuthenticated) return <Navigate to="/" replace />

  const isArabic = i18n.resolvedLanguage?.startsWith('ar')
  const toggleLanguage = () => i18n.changeLanguage(isArabic ? 'en' : 'ar')

  return (
    <div className="relative min-h-screen overflow-hidden font-arabic text-[var(--text)]">
      <LoginBackground light={SHOWCASE_SLIDES[showcase.index].light} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-5 py-4 sm:px-10 sm:py-6">
          <BrandLogo size={34} wordmark wordmarkClassName="text-lg" />
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleLanguage} aria-label={t('common.language')} className={`${PILL_BUTTON} px-3.5`}>
              <span className={isArabic ? 'font-latin' : 'font-arabic'}>{isArabic ? 'English' : 'العربية'}</span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? t('common.lightMode') : t('common.darkMode')}
              title={isDark ? t('common.lightMode') : t('common.darkMode')}
              className={`${PILL_BUTTON} flex w-9 items-center justify-center`}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Desktop: showcase at the start, card at the end. Mobile: card first. */}
        <main className="mx-auto grid w-full max-w-[1240px] flex-1 items-center gap-10 px-5 pb-10 pt-2 sm:px-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16">
          <LoginShowcase showcase={showcase} className="login-enter order-2 lg:order-1" />
          <LoginCard tenant={tenant} className="login-enter login-enter--late order-1 justify-self-center lg:order-2" />
        </main>

        <footer className="pb-6 text-center text-xs font-medium text-[var(--text-muted)]">
          <span className="font-latin">ICAN CRM © {new Date().getFullYear()}</span>
        </footer>
      </div>
    </div>
  )
}
