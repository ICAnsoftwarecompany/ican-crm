import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teamsApi } from '../api/teamsApi'
import { usersApi } from '../../users/api/usersApi'
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

export function useTeams() {
  return useQuery({
    queryKey: QUERY_KEYS.teams.list,
    queryFn: () => teamsApi.getTeams(),
    select: (data) => extractList(data, ['teams']),
  })
}

export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.users.list,
    queryFn: () => usersApi.getUsers(),
    select: extractUsersList,
  })
}

export function useTeamMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teams.all })

  return {
    create: useMutation({ mutationFn: teamsApi.createTeam, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, payload }) => teamsApi.updateTeam(id, payload),
      onSuccess: invalidate,
    }),
    attach: useMutation({
      mutationFn: ({ id, payload }) => teamsApi.attachMembers(id, payload),
      onSuccess: invalidate,
    }),
    detach: useMutation({
      mutationFn: ({ id, payload }) => teamsApi.detachMembers(id, payload),
      onSuccess: invalidate,
    }),
  }
}
