import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dealLeadsApi, dealResourcesApi, dealsApi, pipelineTemplatesApi } from '../api'

const keys = {
  all: ['deals'],
  list: (params) => ['deals', 'list', params],
  detail: (id) => ['deals', 'detail', id],
  templates: ['deals', 'pipeline-templates'],
  leads: (id, params) => ['deals', id, 'leads', params],
  team: (id) => ['deals', id, 'team'],
  products: (id) => ['deals', id, 'products'],
}

const unwrapList = (response) => response?.data?.data || response?.data || response || []
const unwrapEntity = (response) => response?.data?.deal || response?.data || response || null

export function useDeals(params) {
  const query = useQuery({ queryKey: keys.list(params), queryFn: () => dealsApi.getAll(params) })
  return { ...query, deals: Array.isArray(unwrapList(query.data)) ? unwrapList(query.data) : [] }
}

export function useDeal(id) {
  const query = useQuery({ queryKey: keys.detail(id), queryFn: () => dealsApi.getById(id), enabled: Boolean(id) })
  return { ...query, deal: unwrapEntity(query.data) }
}

export function usePipelineTemplates() {
  const query = useQuery({ queryKey: keys.templates, queryFn: () => pipelineTemplatesApi.getAll() })
  return { ...query, templates: Array.isArray(unwrapList(query.data)) ? unwrapList(query.data) : [] }
}

export function useDealLeads(dealId, params) {
  const query = useQuery({ queryKey: keys.leads(dealId, params), queryFn: () => dealLeadsApi.getAll(dealId, params), enabled: Boolean(dealId) })
  return { ...query, leads: Array.isArray(unwrapList(query.data)) ? unwrapList(query.data) : [] }
}

export function useDealResources(dealId) {
  const team = useQuery({ queryKey: keys.team(dealId), queryFn: () => dealResourcesApi.getTeam(dealId), enabled: Boolean(dealId) })
  const products = useQuery({ queryKey: keys.products(dealId), queryFn: () => dealResourcesApi.getProducts(dealId), enabled: Boolean(dealId) })
  return { team: { ...team, items: Array.isArray(unwrapList(team.data)) ? unwrapList(team.data) : [] }, products: { ...products, items: Array.isArray(unwrapList(products.data)) ? unwrapList(products.data) : [] } }
}

export function useDealMutations() {
  const client = useQueryClient()
  const invalidate = () => client.invalidateQueries({ queryKey: keys.all })
  return {
    create: useMutation({ mutationFn: dealsApi.create, onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }) => dealsApi.update(id, payload), onSuccess: invalidate }),
    delete: useMutation({ mutationFn: dealsApi.delete, onSuccess: invalidate }),
    changeStage: useMutation({ mutationFn: ({ dealLeadId, stageId }) => dealLeadsApi.changeStage(dealLeadId, { stage_id: stageId }), onSuccess: invalidate }),
  }
}
