import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { tasksApi } from '../api/tasksApi'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractList } from '../../../shared/utils/apiResponse'

export function useTasks(params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.tasks.list(params),
    queryFn: () => tasksApi.getTasks(params),
    select: (data) => extractList(data, ['data', 'tasks', 'items']),
    ...options,
  })
}

export function useTaskInfo(taskId, params, options = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.tasks.detail(taskId), params],
    queryFn: () => tasksApi.getTaskInfo(taskId, params),
    enabled: Boolean(taskId) && (options.enabled ?? true),
    ...options,
  })
}

export function useTaskMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks.all })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads.all })
  }

  return {
    create: useMutation({
      mutationFn: tasksApi.createTask,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ taskId, payload }) => tasksApi.updateTask(taskId, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: tasksApi.deleteTask,
      onSuccess: invalidate,
    }),
    assignUsers: useMutation({
      mutationFn: ({ taskId, payload }) => tasksApi.assignUsers(taskId, payload),
      onSuccess: invalidate,
    }),
    assignTeams: useMutation({
      mutationFn: ({ taskId, payload }) => tasksApi.assignTeams(taskId, payload),
      onSuccess: invalidate,
    }),
    addNote: useMutation({
      mutationFn: ({ taskId, payload }) => tasksApi.addNote(taskId, payload),
      onSuccess: invalidate,
    }),
    updateNote: useMutation({
      mutationFn: ({ taskId, noteId, payload }) => tasksApi.updateNote(taskId, noteId, payload),
      onSuccess: invalidate,
    }),
    deleteNote: useMutation({
      mutationFn: ({ taskId, noteId }) => tasksApi.deleteNote(taskId, noteId),
      onSuccess: invalidate,
    }),
    addAttachments: useMutation({
      mutationFn: ({ taskId, payload }) => tasksApi.addAttachments(taskId, payload),
      onSuccess: invalidate,
    }),
    deleteAttachment: useMutation({
      mutationFn: ({ taskId, attachmentId }) => tasksApi.deleteAttachment(taskId, attachmentId),
      onSuccess: invalidate,
    }),
    markAsRead: useMutation({
      mutationFn: tasksApi.markAsRead,
      onSuccess: invalidate,
    }),
    changeStatus: useMutation({
      mutationFn: ({ taskId, payload }) => tasksApi.changeStatus(taskId, payload),
      onSuccess: invalidate,
    }),
    detachUser: useMutation({
      mutationFn: ({ taskId, userId }) => tasksApi.detachUser(taskId, userId),
      onSuccess: invalidate,
    }),
    detachTeam: useMutation({
      mutationFn: ({ taskId, teamId }) => tasksApi.detachTeam(taskId, teamId),
      onSuccess: invalidate,
    }),
  }
}
