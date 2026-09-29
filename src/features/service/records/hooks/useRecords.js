import { useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'
import { recordsApi } from '../api/recordsApi'

const PAGE_SIZE = 25

export const useRecordsSetup = () => useQuery({ queryKey: serviceKeys.recordsSetup(), queryFn: () => recordsApi.setup(), staleTime: 5 * 60 * 1000 })

export function useRecordList(params) {
  const query = useInfiniteQuery({
    queryKey: serviceKeys.recordList(params),
    queryFn: ({ pageParam }) => recordsApi.list({ ...params, page: pageParam, per_page: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last?.meta && last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
    enabled: Boolean(params?.type || params?.batch_id || params?.customer_id),
  })
  const records = useMemo(() => query.data?.pages.flatMap((page) => page.data || []) ?? [], [query.data])
  return { ...query, records }
}

export const useRecordSummary = (params) =>
  useQuery({ queryKey: serviceKeys.recordSummary(params), queryFn: () => recordsApi.summary(params), enabled: Boolean(params?.type) })

export const useRecord = (id) => useQuery({ queryKey: serviceKeys.recordDetail(id), queryFn: () => recordsApi.get(id), enabled: Boolean(id) })

/** section: participants | components | entries | documents | timeline */
export const useRecordSection = (id, section, enabled = true) =>
  useQuery({ queryKey: serviceKeys.recordSection(id, section), queryFn: () => recordsApi.section(id, section), enabled: Boolean(id) && enabled })

export function useRecordMutations(recordId) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const refresh = (record) => {
    if (record?.id && record.reference_no) queryClient.setQueryData(serviceKeys.recordDetail(record.id), record)
    queryClient.invalidateQueries({ queryKey: serviceKeys.records() })
  }
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
    if (error?.response?.status === 409 && recordId) queryClient.invalidateQueries({ queryKey: serviceKeys.recordDetail(recordId) })
  }
  const sectionRefresh = (section) => () => {
    queryClient.invalidateQueries({ queryKey: serviceKeys.recordSection(recordId, section) })
    queryClient.invalidateQueries({ queryKey: serviceKeys.recordDetail(recordId) })
    queryClient.invalidateQueries({ queryKey: [...serviceKeys.records(), 'list'] })
  }
  return {
    create: useMutation({ mutationFn: recordsApi.create, onSuccess: refresh, onError }),
    update: useMutation({ mutationFn: ({ id, ...payload }) => recordsApi.update(id, payload), onSuccess: refresh, onError }),
    transition: useMutation({
      mutationFn: ({ id, ...payload }) => recordsApi.transition(id, payload),
      onSuccess: (record) => {
        refresh(record)
        queryClient.invalidateQueries({ queryKey: serviceKeys.recordSection(record.id, 'timeline') })
      },
      onError,
    }),
    saveIn: useMutation({
      mutationFn: ({ section, itemId, ...payload }) => (itemId ? recordsApi.updateIn(recordId, section, itemId, payload) : recordsApi.createIn(recordId, section, payload)),
      onSuccess: (_, { section }) => sectionRefresh(section)(),
      onError,
    }),
    removeIn: useMutation({ mutationFn: ({ section, itemId }) => recordsApi.removeIn(recordId, section, itemId), onSuccess: (_, { section }) => sectionRefresh(section)(), onError }),
    documentAction: useMutation({ mutationFn: ({ docId, action, ...payload }) => recordsApi.documentAction(recordId, docId, action, payload), onSuccess: sectionRefresh('documents'), onError }),
    postUpdate: useMutation({ mutationFn: (payload) => recordsApi.postUpdate(recordId, payload), onSuccess: sectionRefresh('timeline'), onError }),
  }
}

export const useBatches = (params) => useQuery({ queryKey: serviceKeys.batches(params), queryFn: () => recordsApi.batches(params) })
export const useBatch = (id) => useQuery({ queryKey: serviceKeys.batchDetail(id), queryFn: () => recordsApi.batch(id), enabled: Boolean(id) })

export function useBatchMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const onError = (error) => error?.response?.status !== 422 && toast.error(getServiceErrorMessage(error, t))
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: serviceKeys.records() })
  return {
    create: useMutation({ mutationFn: recordsApi.createBatch, onSuccess, onError }),
    bulkStatus: useMutation({ mutationFn: ({ id, ...payload }) => recordsApi.bulkStatus(id, payload), onSuccess, onError }),
  }
}
