import httpClient from '../../../services/httpClient'

export const createUser = async (payload) => {
  const res = await httpClient.post('/api/tenant/users/create/', payload)
  return res.data
}

export const updateUser = async (id, payload) => {
  const res = await httpClient.post(`/api/tenant/users/update/${id}/`, payload)
  return res.data
}

export const getUsers = async (params) => {
  const res = await httpClient.get('/api/tenant/users/get', { params })
  return res.data
}

export const usersApi = {
  createUser,
  updateUser,
  getUsers,
}
