import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/usersApi'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractList } from '../../../shared/utils/apiResponse'

function findUsersArray(value, depth = 0) {
  if (depth > 5 || value === null || value === undefined) return []
  if (Array.isArray(value)) {
    return value.some((item) => item && typeof item === 'object' && ('id' in item || 'email' in item || 'username' in item))
      ? value
      : []
  }
  if (typeof value !== 'object') return []

  for (const item of Object.values(value)) {
    const result = findUsersArray(item, depth + 1)
    if (result.length) return result
  }

  return []
}

function extractUsersList(response) {
  const directList = extractList(response, ['users'])
  if (directList.length) return directList
  return findUsersArray(response?.data ?? response)
}

export function useUsers(params) {
  return useQuery({
    queryKey: params ? [...QUERY_KEYS.users.list, params] : QUERY_KEYS.users.list,
    queryFn: () => usersApi.getUsers(params),
    select: extractUsersList,
  })
}

export function useOnlineUsers(params) {
  return useQuery({
    queryKey: ['users', 'online', params || {}],
    queryFn: () => usersApi.getOnlineUsers(params),
    select: (response) => {
      const directList = extractList(response, ['online_users', 'users', 'data'])
      if (directList.length) return directList

      const nested = response?.data
      if (Array.isArray(nested)) return nested

      if (nested && typeof nested === 'object') {
        const nestedList = extractList(nested, ['online_users', 'users', 'data'])
        if (nestedList.length) return nestedList
      }

      return []
    },
  })
}

export function useUserHistory(userId, params, enabled = true) {
  return useQuery({
    queryKey: ['users', 'history', userId, params || {}],
    queryFn: () => usersApi.getUserHistory(userId, params),
    enabled: Boolean(enabled && userId),
    select: (response) => response?.user_history || response?.data?.user_history || response?.data || response || { data: [] },
  })
}

export function useUserMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all })

  return {
    create: useMutation({
      mutationFn: usersApi.createUser,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, payload }) => usersApi.updateUser(id, payload),
      onSuccess: invalidate,
    }),
  }
}
