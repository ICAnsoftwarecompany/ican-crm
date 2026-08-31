import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../store/authStore'

export function useLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.token, data.user || { login: data.login })
      navigate('/')
    },
    onError: () => {
      toast.error(t('auth.loginError'))
    },
  })
}
