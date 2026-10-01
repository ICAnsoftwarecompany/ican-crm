import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { ArrowUpFromLine, Eye, EyeOff, Lock, User } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { Input } from '../../../shared/components/ui/Input'
import { useLogin } from '../hooks/useLogin'
import { LoginErrorAlert } from './LoginErrorAlert'

export function LoginForm() {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const { mutate: login, isPending, error, reset } = useLogin()

  // Built inside the component so validation messages follow the active language.
  const schema = useMemo(
    () =>
      z.object({
        login: z.string().trim().min(1, t('auth.validation.loginRequired')),
        password: z.string().min(1, t('auth.validation.passwordRequired')),
      }),
    [t]
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const trackCapsLock = (event) => {
    if (typeof event.getModifierState === 'function') {
      setCapsLockOn(event.getModifierState('CapsLock'))
    }
  }

  // Typing again clears a stale server error instead of leaving it on screen.
  const clearServerError = () => {
    if (error) reset()
  }

  return (
    <form onSubmit={handleSubmit((data) => login(data))} className="space-y-4" noValidate>
      <LoginErrorAlert error={error} />

      <Input
        label={t('auth.usernameOrEmail')}
        placeholder={t('auth.usernamePlaceholder')}
        startIcon={<User size={16} />}
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        autoFocus
        dir="auto"
        className="h-11"
        error={errors.login?.message}
        {...register('login', { onChange: clearServerError })}
      />

      <div className="space-y-1.5">
        <Input
          label={t('auth.password')}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.passwordPlaceholder')}
          startIcon={<Lock size={16} />}
          autoComplete="current-password"
          className="h-11"
          onKeyDown={trackCapsLock}
          onKeyUp={trackCapsLock}
          endIcon={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              aria-pressed={showPassword}
              className="flex text-[var(--text-light)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:text-[var(--text)]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password', { onChange: clearServerError, onBlur: () => setCapsLockOn(false) })}
        />
        {capsLockOn && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--status-contacted)]" role="status">
            <ArrowUpFromLine size={13} />
            {t('auth.capsLockOn')}
          </p>
        )}
      </div>

      <Button type="submit" size="xl" loading={isPending} className="w-full rounded-xl font-bold dark:bg-brand-accent dark:text-[var(--brand-primary)] dark:hover:bg-brand-accent dark:hover:opacity-90">
        {isPending ? t('auth.loggingIn') : t('auth.loginButton')}
      </Button>
    </form>
  )
}
