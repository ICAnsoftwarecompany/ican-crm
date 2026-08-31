import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { meetingsApi } from '../api/meetingsApi'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractList } from '../../../shared/utils/apiResponse'

export function useMeetings(params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.meetings.list(params),
    queryFn: () => meetingsApi.getMeetings(params),
    select: (data) => extractList(data, ['data', 'meetings', 'items']),
    ...options,
  })
}

export function useMeetingInfo(meetingId, params, options = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.meetings.detail(meetingId), params],
    queryFn: () => meetingsApi.getMeetingInfo(meetingId, params),
    enabled: Boolean(meetingId) && (options.enabled ?? true),
    ...options,
  })
}


export function useLeadCallsMeetings(leadId, params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.meetings.leadCallsMeetings(leadId, params),
    queryFn: () => meetingsApi.getLeadCallsMeetings(leadId, params),
    enabled: Boolean(leadId) && (options.enabled ?? true),
    select: (data) => extractList(data, ['data', 'calls_meetings', 'meetings', 'calls', 'items']),
    ...options,
  })
}

export function useMeetingReports(meetingId, params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.meetings.reports(meetingId, params),
    queryFn: () => meetingsApi.getReports(meetingId, params),
    enabled: Boolean(meetingId) && (options.enabled ?? true),
    select: (data) => extractList(data, ['data', 'reports', 'items']),
    ...options,
  })
}

export function useMeetingReportsSummary(params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.meetings.reportsSummary(params),
    queryFn: () => meetingsApi.getReportsSummary(params),
    ...options,
  })
}

export function useMeetingMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.meetings.all })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads.all })
  }

  return {
    create: useMutation({
      mutationFn: meetingsApi.createMeetingOrCall,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ meetingId, payload }) => meetingsApi.updateMeetingOrCall(meetingId, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: meetingsApi.deleteMeetingOrCall,
      onSuccess: invalidate,
    }),
    createReport: useMutation({
      mutationFn: ({ meetingId, payload }) => meetingsApi.createReport(meetingId, payload),
      onSuccess: invalidate,
    }),
    deleteReport: useMutation({
      mutationFn: ({ meetingId, reportId }) => meetingsApi.deleteReport(meetingId, reportId),
      onSuccess: invalidate,
    }),
    addNote: useMutation({
      mutationFn: ({ meetingId, payload }) => meetingsApi.addNote(meetingId, payload),
      onSuccess: invalidate,
    }),
    updateNote: useMutation({
      mutationFn: ({ meetingId, noteId, payload }) => meetingsApi.updateNote(meetingId, noteId, payload),
      onSuccess: invalidate,
    }),
    deleteNote: useMutation({
      mutationFn: ({ meetingId, noteId }) => meetingsApi.deleteNote(meetingId, noteId),
      onSuccess: invalidate,
    }),
    uploadAttachments: useMutation({
      mutationFn: ({ meetingId, payload }) => meetingsApi.uploadAttachments(meetingId, payload),
      onSuccess: invalidate,
    }),
    deleteAttachment: useMutation({
      mutationFn: ({ meetingId, attachmentId }) => meetingsApi.deleteAttachment(meetingId, attachmentId),
      onSuccess: invalidate,
    }),
    assignParticipants: useMutation({
      mutationFn: ({ meetingId, payload }) => meetingsApi.assignParticipants(meetingId, payload),
      onSuccess: invalidate,
    }),
    removeParticipant: useMutation({
      mutationFn: ({ meetingId, userId }) => meetingsApi.removeParticipant(meetingId, userId),
      onSuccess: invalidate,
    }),
    changeStatus: useMutation({
      mutationFn: ({ meetingId, payload }) => meetingsApi.changeStatus(meetingId, payload),
      onSuccess: invalidate,
    }),
    changeParticipantStatus: useMutation({
      mutationFn: ({ meetingId, userId, payload }) => (
        meetingsApi.changeParticipantStatus(meetingId, userId, payload)
      ),
      onSuccess: invalidate,
    }),
  }
}
