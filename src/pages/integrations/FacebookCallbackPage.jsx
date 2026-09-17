import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckCircle2, Facebook, XCircle } from 'lucide-react'
import { Button } from '../../shared/components/ui/Button'

const REDIRECT_DELAY_MS = 2500
const INTEGRATIONS_SETTINGS_ROUTE = '/settings/integrations'

export function FacebookCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(REDIRECT_DELAY_MS / 1000))

  const status = searchParams.get('status') || 'error'
  const isSuccess = status === 'success'

  const counts = useMemo(() => ([
    { key: 'pages_saved', label: 'صفحات فيسبوك', value: searchParams.get('pages_saved') },
    { key: 'messenger_saved', label: 'حسابات ماسنجر', value: searchParams.get('messenger_saved') },
    { key: 'whatsapp_saved', label: 'حسابات واتساب', value: searchParams.get('whatsapp_saved') },
  ].filter((item) => item.value !== null)), [searchParams])

  // Facebook appends a "#_=_" hash artifact to OAuth redirect URLs — clean it up.
  useEffect(() => {
    if (window.location.hash === '#_=_') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  useEffect(() => {
    if (isSuccess) {
      toast.success('تم ربط حساب ميتا بنجاح')
    } else {
      toast.error('تعذر إتمام الربط مع ميتا')
    }
  }, [isSuccess])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1))
    }, 1000)

    const timeout = window.setTimeout(() => {
      navigate(INTEGRATIONS_SETTINGS_ROUTE, { replace: true })
    }, REDIRECT_DELAY_MS)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${isSuccess ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#FEF2F2] text-[#EF4444]'}`}>
        {isSuccess ? <CheckCircle2 size={30} /> : <XCircle size={30} />}
      </div>

      <div className="mb-2 flex items-center gap-2 text-[#1877F2]">
        <Facebook size={18} />
        <span className="text-sm font-bold">Meta / Facebook</span>
      </div>

      <h1 className="text-xl font-black text-[var(--text)]">
        {isSuccess ? 'تم ربط حساب ميتا بنجاح' : 'تعذر إتمام الربط مع ميتا'}
      </h1>

      <p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">
        {isSuccess
          ? 'تم حفظ بيانات الاتصال، جاري تحويلك تلقائيًا لصفحة التكاملات.'
          : 'حدث خطأ أثناء الربط مع حساب فيسبوك، برجاء المحاولة مرة أخرى من صفحة التكاملات.'}
      </p>

      {isSuccess && counts.length > 0 && (
        <div className="mt-5 grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
          {counts.map((item) => (
            <div key={item.key} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
              <p className="text-lg font-black text-[var(--text)] font-latin">{item.value}</p>
              <p className="text-xs font-semibold text-[var(--text-muted)]">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      <Button
        className="mt-6"
        variant={isSuccess ? 'primary' : 'outline'}
        onClick={() => navigate(INTEGRATIONS_SETTINGS_ROUTE, { replace: true })}
      >
        الرجوع إلى إعدادات التكاملات الآن {secondsLeft > 0 ? `(${secondsLeft})` : ''}
      </Button>
    </div>
  )
}
