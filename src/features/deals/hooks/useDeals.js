import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dealsApi, pipelineTemplatesApi } from '../api'
import { dealKeys } from '../constants/dealQueryKeys'
import { unwrapEntity, unwrapList } from './dealResponse'

export function useDeals(params) {
  const query = useQuery({ queryKey: dealKeys.list(params), queryFn: () => dealsApi.getAll(params) })
  const deals = useMemo(() => unwrapList(query.data, ['deals']), [query.data])
  return { ...query, deals }
}

export function useDeal(id) {
  const query = useQuery({ queryKey: dealKeys.detail(id), queryFn: () => dealsApi.getById(id), enabled: Boolean(id) })
  const deal = useMemo(() => unwrapEntity(query.data, 'deal'), [query.data])
  return { ...query, deal }
}

export function usePipelineTemplates() {
  const query = useQuery({ queryKey: dealKeys.templates, queryFn: () => pipelineTemplatesApi.getAll() })
  const templates = useMemo(() => unwrapList(query.data, ['templates', 'pipeline_templates']), [query.data])
  return { ...query, templates }
}

export function useDealMutations() {
  const client = useQueryClient()
  const invalidate = () => client.invalidateQueries({ queryKey: dealKeys.all })
  return {
    create: useMutation({ mutationFn: dealsApi.create, onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }) => dealsApi.update(id, payload), onSuccess: invalidate }),
    delete: useMutation({ mutationFn: dealsApi.delete, onSuccess: invalidate }),
  }
}

export function usePipelineTemplateMutations() {
  const client = useQueryClient()
  const invalidate = () => client.invalidateQueries({ queryKey: dealKeys.templates })
  return {
    create: useMutation({ mutationFn: pipelineTemplatesApi.create, onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }) => pipelineTemplatesApi.update(id, payload), onSuccess: invalidate }),
    delete: useMutation({ mutationFn: pipelineTemplatesApi.delete, onSuccess: invalidate }),
  }
}
