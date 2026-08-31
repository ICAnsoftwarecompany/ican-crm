import httpClient from '../../../services/httpClient'

export const authApi = {
  login: async ({ login, password }) => {
    const formData = new FormData()
    formData.append('login', login)
    formData.append('password', password)

    const res = await httpClient.post('/api/tenant/auth/signin', formData)
    return res.data
  },

  logout: async () => {
    const res = await httpClient.get('/api/tenant/auth/logout')
    return res.data
  },
}
