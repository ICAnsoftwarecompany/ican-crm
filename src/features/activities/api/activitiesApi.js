import { meetingsApi } from '../../meetings/api/meetingsApi'
import { extractList } from '../../../shared/utils/apiResponse'
import { buildScheduleStatusPayload } from '../../call-meetings/utils/scheduleUiUtils'
import { normalizeActivity } from '../utils/activityHelpers'

export function extractActivitiesList(response) {
  return extractList(response, ['data', 'meetings', 'calls_meetings', 'activities', 'items', 'records'])
}

export function extractPaginationMeta(response) {
  const source = response?.data && !Array.isArray(response.data) ? response.data : response
  if (!source) return null

  return {
    current_page: source.current_page,
    last_page: source.last_page,
    per_page: source.per_page,
    total: source.total,
    next_page_url: source.next_page_url,
    prev_page_url: source.prev_page_url,
  }
}

function normalizeListResponse(response) {
  return {
    raw: response,
    data: extractActivitiesList(response).map(normalizeActivity),
    meta: extractPaginationMeta(response),
  }
}

function normalizeDetailResponse(response) {
  const data = response?.data?.id ? response.data : response?.data?.meeting || response?.data?.activity || response?.meeting || response?.activity || response?.data || response
  return {
    raw: response,
    data: normalizeActivity(data),
  }
}

function normalizeStatusPayload(payload) {
  if (typeof payload === 'string') return buildScheduleStatusPayload(payload)
  if (!payload?.status) return payload

  return {
    ...payload,
    ...buildScheduleStatusPayload(payload.status),
  }
}

export const activitiesApi = {
  getActivities: async (params) => normalizeListResponse(await meetingsApi.getMeetings(params)),
  getActivityInfo: async (activityId, params) => normalizeDetailResponse(await meetingsApi.getMeetingInfo(activityId, params)),
  createActivity: meetingsApi.createMeetingOrCall,
  updateActivity: meetingsApi.updateMeetingOrCall,
  deleteActivity: meetingsApi.deleteMeetingOrCall,
  changeActivityStatus: (activityId, payload) => (
    meetingsApi.changeStatus(activityId, normalizeStatusPayload(payload))
  ),
  startActivity: (activityId) => meetingsApi.changeStatus(activityId, buildScheduleStatusPayload('in_progress')),
  cancelActivity: (activityId) => meetingsApi.changeStatus(activityId, buildScheduleStatusPayload('cancelled')),
  completeActivity: (activityId) => meetingsApi.changeStatus(activityId, buildScheduleStatusPayload('completed')),
  getActivityReports: meetingsApi.getReports,
  createActivityReport: meetingsApi.createReport,
  deleteActivityReport: meetingsApi.deleteReport,
  addActivityNote: meetingsApi.addNote,
  updateActivityNote: meetingsApi.updateNote,
  deleteActivityNote: meetingsApi.deleteNote,
  uploadActivityAttachments: meetingsApi.uploadAttachments,
  deleteActivityAttachment: meetingsApi.deleteAttachment,
  assignActivityParticipants: meetingsApi.assignParticipants,
  removeActivityParticipant: meetingsApi.removeParticipant,
  getActivityReportsSummary: meetingsApi.getReportsSummary,
  changeParticipantStatus: meetingsApi.changeParticipantStatus,
}
