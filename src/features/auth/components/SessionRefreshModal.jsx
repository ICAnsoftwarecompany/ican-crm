import { useEffect, useState } from 'react'
import { Clock3, LogIn, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { AppModal } from '../../../shared/components/overlays/AppModal'
import { useAuthStore } from '../../../store/authStore'
import { authApi } from '../api/authApi'

const COUNTDOWN_SECONDS = 10

export function SessionRefreshModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const user = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)
  const logout = useAuthStore((state) => state.logout)
  const setSessionRefreshNeeded = useAuthStore((state) => state.setSessionRefreshNeeded)

  const redirectToLogin = () => {
    logout()
    setSessionRefreshNeeded(false)
    setIsOpen(false)
    window.location.href = '/login'
  }

  useEffect(() => {
    const handleSessionExpired = () => {
      setCountdown(COUNTDOWN_SECONDS)
      setSessionRefreshNeeded(true)
      setIsOpen(true)
    }

    window.addEventListener('ican:session-expired', handleSessionExpired)

    return () => {
      window.removeEventListener('ican:session-expired', handleSessionExpired)
    }
  }, [setSessionRefreshNeeded])

  useEffect(() => {
    if (!isOpen || isSubmitting) return undefined

    if (countdown <= 0) {
      redirectToLogin()
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setCountdown((value) => Math.max(0, value - 1))
    }, 1000)

    return () => window.clearTimeout(timeoutId)
  }, [countdown, isOpen, isSubmitting])

  const handleRefreshSession = async () => {
    setIsSubmitting(true)

    try {
      const data = await authApi.refreshSession()
      const token = data?.token

      if (!token) {
        throw new Error('Missing refreshed token')
      }

      setAuth(token, data?.user || user)
      setSessionRefreshNeeded(false)
      setIsOpen(false)
      setCountdown(COUNTDOWN_SECONDS)
      toast.success('تم تجديد الجلسة بنجاح')
    } catch {
      toast.error('تعذر تجديد الجلسة، الرجاء تسجيل الدخول مرة أخرى.')
      redirectToLogin()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={redirectToLogin}
      title="الجلسة على وشك الانتهاء"
      description="يمكنك تجديد الجلسة الآن للاستمرار بدون تسجيل خروج."
      size="sm"
      closeOnBackdrop={false}
    >
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F9FA] text-[#007A80]">
          <Clock3 size={28} />
        </div>

        <div>
          <div className="text-3xl font-black text-[var(--text)]">{countdown}</div>
          <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">
            سيتم تحويلك لتسجيل الدخول عند انتهاء العد التنازلي.
          </p>
        </div>

        <div className="rounded-xl border border-[#D7EEF0] bg-[#F8FEFF] p-3 text-start text-sm text-[#0F172A]">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#64748B]">User</div>
          <div className="mt-1 truncate font-bold">
            {user?.name || user?.login || user?.username || user?.email || '-'}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={redirectToLogin}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D7EEF0] bg-white px-4 text-sm font-black text-[#475569] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogIn size={14} />
            تسجيل الدخول
          </button>

          <button
            type="button"
            onClick={handleRefreshSession}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#007A80] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCw size={14} className={isSubmitting ? 'animate-spin' : ''} />
            {isSubmitting ? 'جاري التجديد...' : 'تجديد الجلسة'}
          </button>
        </div>
      </div>
    </AppModal>
  )
}
