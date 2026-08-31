import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import { LoginForm } from '../../features/auth/components/LoginForm'
import { useAuthStore } from '../../store/authStore'

export function LoginPage() {
  const { t, i18n } = useTranslation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    const lang = i18n.language || 'ar'
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [i18n.language])

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen flex bg-[var(--brand-bg)]">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#162847] p-12 text-white">
        <LogoBlock />
        <div>
          <h1 className="text-4xl font-bold font-arabic leading-tight mb-4">
            إدارة علاقات العملاء
            <br />
            <span className="text-[#00C2CB]">بذكاء اصطناعي</span>
          </h1>
          <p className="text-white/60 font-arabic text-lg">
            منصة متكاملة لإدارة العملاء المحتملين، المحادثات، والحملات التسويقية
          </p>
        </div>
        <div className="flex items-center gap-2 text-white/40 text-sm font-latin">
          <Sparkles size={14} className="text-[#00C2CB]" />
          ICAN CRM © {new Date().getFullYear()}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <LogoBlock small />
          </div>

          <h2 className="text-2xl font-bold font-arabic text-[var(--text)] mb-1">
            {t('auth.welcomeBack')}
          </h2>
          <p className="text-[var(--text-muted)] font-arabic text-sm mb-8">
            {t('auth.welcomeSubtitle')}
          </p>

          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-sm">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}

function LogoBlock({ small }) {
  return (
    <div className={`flex items-center gap-3 ${small ? '' : ''}`}>
      <svg width={small ? 36 : 44} height={small ? 36 : 44} viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="11" fill="#162847" />
        <text x="7" y="30" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="18" fill="white">IC</text>
        <circle cx="38" cy="6" r="5" fill="#00C2CB" />
      </svg>
      {!small && (
        <span className="font-latin font-bold text-xl text-white">ICAN CRM</span>
      )}
    </div>
  )
}
