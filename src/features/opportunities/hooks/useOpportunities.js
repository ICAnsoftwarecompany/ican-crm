import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { opportunitiesApi } from '../api/opportunitiesApi'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractList } from '../../../shared/utils/apiResponse'

const LIST_PARAMS = {}

export function useOpportunities(params = LIST_PARAMS, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.opportunities.list(params),
    queryFn: () => opportunitiesApi.getOpportunities(params),
    select: (data) => extractList(data, ['data']),
    ...options,
  })
}

// Reads from the same list cache the table/inbox/overview use, so every
// screen (including the drawer) always renders the same up-to-date record
// without a second network round trip.
export function useOpportunityInfo(id, options = {}) {
  const listQuery = useOpportunities(LIST_PARAMS, options)
  const opportunity = (listQuery.data || []).find((item) => String(item.id) === String(id)) || null

  return { ...listQuery, data: opportunity }
}

function appendTimelineEvent(opportunity, event, actorName) {
  const timeline = Array.isArray(opportunity.timeline) ? opportunity.timeline : []
  return [
    ...timeline,
    {
      id: `evt_${opportunity.id}_${Date.now()}`,
      at: new Date().toISOString(),
      actor: { id: 'current_user', name: actorName },
      ...event,
    },
  ]
}

export function useOpportunityMutations() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const listKey = QUERY_KEYS.opportunities.list(LIST_PARAMS)
  const actorName = t('opportunities.you')

  const patchOpportunity = (id, patch = {}, timelineEvent = null) => {
    queryClient.setQueryData(listKey, (current) => {
      const rows = extractList(current, ['data'])
      const nextRows = rows.map((row) => {
        if (row.id !== id) return row

        const nextRow = { ...row, ...patch, updated_at: new Date().toISOString() }
        if (timelineEvent) {
          nextRow.timeline = appendTimelineEvent(row, timelineEvent, actorName)
        }
        return nextRow
      })

      return { ...(current || {}), data: nextRows }
    })
  }

  return {
    qualify: useMutation({
      mutationFn: (id) => opportunitiesApi.qualifyOpportunity(id),
      onSuccess: (_response, id) => {
        patchOpportunity(id, { status: 'qualified' }, {
          type: 'status_changed',
          meta: { to: 'qualified' },
        })
      },
    }),

    activate: useMutation({
      mutationFn: ({ id, payload }) => opportunitiesApi.activateOpportunity(id, payload),
      onSuccess: (_response, { id, payload }) => {
        patchOpportunity(id, {
          status: 'activated',
          estimated_value: payload?.estimated_value,
          assigned_user: payload?.assigned_user || null,
          assigned_team: payload?.assigned_team || null,
          next_action: payload?.next_action || null,
        }, {
          type: 'status_changed',
          meta: { to: 'activated' },
        })
      },
    }),

    watch: useMutation({
      mutationFn: ({ id, payload }) => opportunitiesApi.watchOpportunity(id, payload),
      onSuccess: (_response, { id, payload }) => {
        patchOpportunity(id, {
          status: 'watching',
          watch_until: payload?.watch_until || null,
        }, {
          type: 'status_changed',
          meta: { to: 'watching', reason: payload?.reason },
        })
      },
    }),

    dismiss: useMutation({
      mutationFn: ({ id, payload }) => opportunitiesApi.dismissOpportunity(id, payload),
      onSuccess: (_response, { id, payload }) => {
        patchOpportunity(id, {
          status: 'dismissed',
          dismiss_reason: payload?.reason || null,
          dismiss_note: payload?.note || null,
        }, {
          type: 'status_changed',
          meta: { to: 'dismissed', reason: payload?.reason },
        })
      },
    }),

    assign: useMutation({
      mutationFn: ({ id, payload }) => opportunitiesApi.assignOpportunity(id, payload),
      onSuccess: (_response, { id, payload }) => {
        patchOpportunity(id, {
          assigned_user: payload?.assigned_user || null,
          assigned_team: payload?.assigned_team || null,
        }, {
          type: 'assigned',
          meta: { to: payload?.assigned_user?.name || payload?.assigned_team?.name || '-' },
        })
      },
    }),
  }
}
