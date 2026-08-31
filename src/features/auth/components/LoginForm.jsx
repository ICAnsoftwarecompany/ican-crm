import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, User, Lock } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { Input } from '../../../shared/components/ui/Input'
import { useLogin } from '../hooks/useLogin'

const schema = z.object({
  login:    z.string().min(1, 'مطلوب'),
  password: z.string().min(1, 'مطلوب'),
})

export function LoginForm() {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  return (
    <form onSubmit={handleSubmit((data) => login(data))} className="space-y-5">
      <Input
        label={t('auth.username')}
        placeholder={t('auth.username')}
        startIcon={<User size={16} />}
        error={errors.login?.message}
        {...register('login')}
      />

      <Input
        label={t('auth.password')}
        type={showPassword ? 'text' : 'password'}
        placeholder={t('auth.password')}
        startIcon={<Lock size={16} />}
        endIcon={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-[var(--text-light)] hover:text-[var(--text)] transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        error={errors.password?.message}
        {...register('password')}
      />

      <Button
        type="submit"
        size="lg"
        loading={isPending}
        className="w-full"
      >
        {isPending ? t('auth.loggingIn') : t('auth.loginButton')}
      </Button>
    </form>
  )
}
