import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dealResourcesApi } from '../api'
import { dealKeys } from '../constants/dealQueryKeys'
import { normalizeTeamMember } from '../utils/dealTeam'
import { unwrapEntity, unwrapList } from './dealResponse'
import { normalizeDealProduct } from '../utils/dealProducts'

export function useDealTeam(dealId) {
  const query = useQuery({ queryKey: dealKeys.team(dealId), queryFn: () => dealResourcesApi.getTeam(dealId), enabled: Boolean(dealId) })
  const members = useMemo(() => normalizeDealTeam(query.data), [query.data])
  return { ...query, members }
}

/** Rows of `GET /deals/{id}/products` → products (`linkId` = the deal-product row id). */
export function normalizeDealProducts(data) {
  return unwrapList(data, ['products']).map(normalizeDealProduct)
}

export function useDealProduct(dealId, productId) {
  const query = useQuery({ queryKey: [...dealKeys.products(dealId), String(productId)], queryFn: () => dealResourcesApi.getProduct(dealId, productId), enabled: Boolean(dealId && productId) })
  const product = useMemo(() => {
    const entity = unwrapEntity(query.data)
    return entity ? normalizeDealProduct(entity) : null
  }, [query.data])
  return { ...query, product }
}

/** Rows of `GET /deals/{id}/team` → normalized members. */
export function normalizeDealTeam(data) {
  return unwrapList(data, ['team', 'members']).map(normalizeTeamMember)
}

export function useDealProducts(dealId) {
  const query = useQuery({ queryKey: dealKeys.products(dealId), queryFn: () => dealResourcesApi.getProducts(dealId), enabled: Boolean(dealId) })
  const products = useMemo(() => normalizeDealProducts(query.data), [query.data])
  return { ...query, products }
}

/** Kept for older callers: team + products in one object. */
export function useDealResources(dealId) {
  const team = useDealTeam(dealId)
  const products = useDealProducts(dealId)
  return { team: { ...team, items: team.members }, products: { ...products, items: products.products } }
}

export function useDealResourceMutations(dealId) {
  const client = useQueryClient()
  const invalidateTeam = () => client.invalidateQueries({ queryKey: dealKeys.team(dealId) })
  const invalidateProducts = () => client.invalidateQueries({ queryKey: dealKeys.products(dealId) })
  return {
    addTeamMember: useMutation({ mutationFn: dealResourcesApi.addTeamMember, onSuccess: invalidateTeam }),
    removeTeamMember: useMutation({ mutationFn: dealResourcesApi.removeTeamMember, onSuccess: invalidateTeam }),
    updateTeamMember: useMutation({ mutationFn: ({ memberId, payload }) => dealResourcesApi.updateTeamMember(memberId, payload), onSuccess: invalidateTeam }),
    addProducts: useMutation({ mutationFn: (payload) => dealResourcesApi.addProducts(dealId, payload), onSuccess: invalidateProducts }),
    updateProduct: useMutation({ mutationFn: ({ productId, details }) => dealResourcesApi.updateProduct(dealId, productId, { details }), onSuccess: invalidateProducts }),
    removeProduct: useMutation({ mutationFn: (productId) => dealResourcesApi.removeProduct(dealId, productId), onSuccess: invalidateProducts }),
  }
}
