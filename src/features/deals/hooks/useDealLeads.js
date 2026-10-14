import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dealLeadsApi } from '../api'
import { dealKeys } from '../constants/dealQueryKeys'
import { normalizeDealLead } from '../utils/dealLeads'
import { unwrapList } from './dealResponse'

/** Shared by the workspace and the hub quick info (same cache entry). */
export const DEAL_LEADS_LIST_PARAMS = { per_page: 500 }
const LIST_PARAMS = DEAL_LEADS_LIST_PARAMS

export const normalizeDealLeadList = (data) => unwrapList(data, ['leads', 'deal_leads']).map(normalizeDealLead)

/** Every lead of one deal (normalized, `id` = deal-lead id). One cached list per deal. */
export function useDealLeads(dealId) {
  const query = useQuery({
    queryKey: dealKeys.leads(dealId, LIST_PARAMS),
    queryFn: () => dealLeadsApi.getAll(dealId, LIST_PARAMS),
    enabled: Boolean(dealId),
  })
  const leads = useMemo(() => normalizeDealLeadList(query.data), [query.data])
  return { ...query, leads }
}

export function useDealLeadProducts(dealLeadId, { enabled = true } = {}) {
  const query = useQuery({
    queryKey: dealKeys.leadProducts(dealLeadId),
    queryFn: () => dealLeadsApi.getProducts(dealLeadId),
    enabled: Boolean(dealLeadId) && enabled,
  })
  // Memoized: dialogs reset their form when this list changes, so it must keep its identity between renders.
  const items = useMemo(() => unwrapList(query.data, ['products', 'items']), [query.data])
  return { ...query, items }
}

/**
 * Mutations on the deal's leads. `changeStage` updates the cached list first (the board moves the card at
 * once) and rolls back if the request fails.
 */
export function useDealLeadMutations(dealId) {
  const client = useQueryClient()
  const listKey = dealKeys.leads(dealId, LIST_PARAMS)
  const invalidate = () => client.invalidateQueries({ queryKey: dealKeys.all })
  const invalidateContracts = () => client.invalidateQueries({ queryKey: ['deals', 'contracts'] })

  const patchLead = (dealLeadId, patch) => {
    client.setQueryData(listKey, (current) => {
      if (!current) return current
      const update = (rows) => rows.map((row) => (String(row?.id) === String(dealLeadId) ? { ...row, ...patch } : row))
      if (Array.isArray(current)) return update(current)
      if (Array.isArray(current.data)) return { ...current, data: update(current.data) }
      if (Array.isArray(current.data?.data)) return { ...current, data: { ...current.data, data: update(current.data.data) } }
      return current
    })
  }

  return {
    changeStage: useMutation({
      mutationFn: ({ dealLeadId, stageId }) => dealLeadsApi.changeStage(dealLeadId, { stage_id: stageId }),
      onMutate: async ({ dealLeadId, stageId }) => {
        await client.cancelQueries({ queryKey: listKey })
        const previous = client.getQueryData(listKey)
        patchLead(dealLeadId, { stage_id: stageId })
        return { previous }
      },
      onError: (_error, _variables, context) => {
        if (context?.previous !== undefined) client.setQueryData(listKey, context.previous)
      },
      onSettled: invalidate,
    }),
    addExisting: useMutation({ mutationFn: (payload) => dealLeadsApi.addExisting({ deal_id: dealId, ...payload }), onSuccess: invalidate }),
    create: useMutation({ mutationFn: (payload) => dealLeadsApi.create({ deal_id: dealId, ...payload }), onSuccess: invalidate }),
    importFile: useMutation({ mutationFn: (formData) => dealLeadsApi.importFile(formData), onSuccess: invalidate }),
    bulkAssign: useMutation({
      mutationFn: ({ dealLeadIds, ownerId }) => dealLeadsApi.bulkAssign({ deal_id: dealId, deal_lead_ids: dealLeadIds, owner_id: ownerId }),
      onSuccess: invalidate,
    }),
    distribute: useMutation({ mutationFn: (payload) => dealLeadsApi.distribute(dealId, payload), onSuccess: invalidate }),
    syncProducts: useMutation({
      mutationFn: ({ dealLeadId, items }) => dealLeadsApi.syncProducts({ deal_lead_id: dealLeadId, items }),
      onSuccess: invalidate,
    }),
    markWon: useMutation({
      mutationFn: ({ dealLeadId, payload }) => dealLeadsApi.markWon(dealLeadId, payload),
      onSuccess: () => {
        invalidate()
        invalidateContracts()
        client.invalidateQueries({ queryKey: ['tasks'] })
      },
    }),
    markLost: useMutation({ mutationFn: ({ dealLeadId, reason }) => dealLeadsApi.markLost(dealLeadId, { reason }), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (dealLeadId) => dealLeadsApi.remove(dealLeadId), onSuccess: invalidate }),
    reopen: useMutation({ mutationFn: (dealLeadId) => dealLeadsApi.reopen(dealLeadId), onSuccess: invalidate }),
  }
}
