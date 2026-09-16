import { useMutation, useQueryClient } from '@tanstack/react-query'

import { activitiesApi } from '../api/activitiesApi'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { activityKeys } from './useActivityKeys'

export function useActivityMutations() {
  const queryClient = useQueryClient()

  const invalidateActivities = (activityId) => {
    queryClient.invalidateQueries({ queryKey: activityKeys.all })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.meetings.all })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads.all })
    if (activityId) {
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(activityId) })
      queryClient.invalidateQueries({ queryKey: ['activities', activityId, 'reports'] })
    }
  }

  return {
    create: useMutation({
      mutationFn: activitiesApi.createActivity,
      onSuccess: () => invalidateActivities(),
    }),
    update: useMutation({
      mutationFn: ({ activityId, payload }) => activitiesApi.updateActivity(activityId, payload),
      onSuccess: (_, vars) => invalidateActivities(vars?.activityId),
    }),
    remove: useMutation({
      mutationFn: activitiesApi.deleteActivity,
      onSuccess: () => invalidateActivities(),
    }),
    start: useMutation({
      mutationFn: activitiesApi.startActivity,
      onSuccess: (_, activityId) => invalidateActivities(activityId),
    }),
    cancel: useMutation({
      mutationFn: activitiesApi.cancelActivity,
      onSuccess: (_, activityId) => invalidateActivities(activityId),
    }),
    complete: useMutation({
      mutationFn: activitiesApi.completeActivity,
      onSuccess: (_, activityId) => invalidateActivities(activityId),
    }),
    changeStatus: useMutation({
      mutationFn: ({ activityId, payload }) => activitiesApi.changeActivityStatus(activityId, payload),
      onSuccess: (_, vars) => invalidateActivities(vars?.activityId),
    }),
    createReport: useMutation({
      mutationFn: ({ activityId, payload }) => activitiesApi.createActivityReport(activityId, payload),
      onSuccess: (_, vars) => invalidateActivities(vars?.activityId),
    }),
    addNote: useMutation({
      mutationFn: ({ activityId, payload }) => activitiesApi.addActivityNote(activityId, payload),
      onSuccess: (_, vars) => invalidateActivities(vars?.activityId),
    }),
  }
}
