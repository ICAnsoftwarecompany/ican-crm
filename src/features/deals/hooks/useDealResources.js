import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dealResourcesApi } from '../api'
import { dealKeys } from '../constants/dealQueryKeys'
import { normalizeTeamMember } from '../utils/dealTeam'
import { unwrapList } from './dealResponse'

export function useDealTeam(dealId) {
  const query = useQuery({ queryKey: dealKeys.team(dealId), queryFn: () => dealResourcesApi.getTeam(dealId), enabled: Boolean(dealId) })
  const members = useMemo(() => unwrapList(query.data, ['team', 'members']).map(normalizeTeamMember), [query.data])
  return { ...query, members }
}

export function useDealProducts(dealId) {
  const query = useQuery({ queryKey: dealKeys.products(dealId), queryFn: () => dealResourcesApi.getProducts(dealId), enabled: Boolean(dealId) })
  const products = useMemo(() => unwrapList(query.data, ['products']).map((row) => {
    const product = row.product || row
    return { ...product, id: product.id ?? row.product_id, linkId: row.id, name: product.name || product.title || '', price: product.price ?? row.price ?? null }
  }), [query.data])
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
    addProducts: useMutation({ mutationFn: (productIds) => dealResourcesApi.addProducts({ deal_id: dealId, product_ids: productIds }), onSuccess: invalidateProducts }),
    removeProduct: useMutation({ mutationFn: (productId) => dealResourcesApi.removeProduct(dealId, productId), onSuccess: invalidateProducts }),
  }
}
