import { useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('assets')
const unwrap = (response) => response.data?.data ?? response.data
const A = serviceEndpoints.assets

/**
 * Assets (spec §34.1): { id, customer {id,name,phone}, item_id, name {ar,en}, asset_type, serial_number,
 * model_number, purchase_date, installation_date, status: active|in_repair|replaced|retired|transferred,
 * location {address}, warranty {id,type,ends_at}|null, warranty_status: active|expired|none, transfers[], version }.
 * Detail adds warranties[], entitlements[], service_history[{ source_type, id, reference, title, status, occurred_at }].
 */
export const assetsApi = {
  list: async (params) => (await api.get(A, { params })).data,
  get: async (id) => unwrap(await api.get(`${A}/${id}`)),
  create: async (payload) => unwrap(await api.post(A, payload)),
  update: async (id, payload) => unwrap(await api.patch(`${A}/${id}`, payload)),
  transfer: async (id, payload) => unwrap(await api.post(`${A}/${id}/transfer`, payload)),
  voidWarranty: async (id, payload) => unwrap(await api.post(`${serviceEndpoints.warranties}/${id}/void`, payload)),
}

export function useAssetList(params) {
  const query = useInfiniteQuery({
    queryKey: serviceKeys.assetList(params),
    queryFn: ({ pageParam }) => assetsApi.list({ ...params, page: pageParam, per_page: 25 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last?.meta && last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
  })
  const assets = useMemo(() => query.data?.pages.flatMap((page) => page.data || []) ?? [], [query.data])
  return { ...query, assets }
}

export const useAsset = (id) => useQuery({ queryKey: serviceKeys.assetDetail(id), queryFn: () => assetsApi.get(id), enabled: Boolean(id) })

export function useAssetMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const onSuccess = (asset) => {
    if (asset?.id && asset.serial_number !== undefined) queryClient.setQueryData(serviceKeys.assetDetail(asset.id), asset)
    queryClient.invalidateQueries({ queryKey: serviceKeys.assets() })
    queryClient.invalidateQueries({ queryKey: serviceKeys.entitlements() })
  }
  const onError = (error) => error?.response?.status !== 422 && toast.error(getServiceErrorMessage(error, t))
  return {
    create: useMutation({ mutationFn: assetsApi.create, onSuccess, onError }),
    update: useMutation({ mutationFn: ({ id, ...payload }) => assetsApi.update(id, payload), onSuccess, onError }),
    transfer: useMutation({ mutationFn: ({ id, ...payload }) => assetsApi.transfer(id, payload), onSuccess, onError }),
    voidWarranty: useMutation({ mutationFn: ({ id, ...payload }) => assetsApi.voidWarranty(id, payload), onSuccess: () => onSuccess(null), onError }),
  }
}
