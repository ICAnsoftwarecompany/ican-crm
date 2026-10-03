import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { contractsApi } from '../api'
import { dealKeys } from '../constants/dealQueryKeys'
import { normalizeContract } from '../utils/dealContracts'
import { unwrapEntity, unwrapList } from './dealResponse'

/** Contracts list; pass `{ deal_id }` for one deal, nothing for all deals (hub). */
export function useDealContracts(params = {}, { enabled = true } = {}) {
  const query = useQuery({ queryKey: dealKeys.contracts(params), queryFn: () => contractsApi.getAll(params), enabled })
  const contracts = useMemo(() => unwrapList(query.data, ['contracts']).map(normalizeContract), [query.data])
  return { ...query, contracts }
}

export function useDealContract(id) {
  const query = useQuery({ queryKey: dealKeys.contract(id), queryFn: () => contractsApi.getById(id), enabled: Boolean(id) })
  const contract = useMemo(() => {
    const entity = unwrapEntity(query.data, 'contract')
    return entity ? normalizeContract(entity) : null
  }, [query.data])
  return { ...query, contract }
}
