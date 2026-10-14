import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../../api/productsApi'
import { productInstancesApi, productRelationsApi } from '../../api/catalogApi'
import { catalogKeys } from '../../hooks/catalogQueryKeys'
import { formatApiError } from '../../utils/apiErrors'
import { getCreatedId } from '../../utils/catalogPayloads'
import { remainingRequests } from '../../utils/productCreateWizard'

const EMPTY_DONE = { productId: null, relations: [], instances: false }

/**
 * Sends the create plan in order: product → each attached item → instances (2026-10-07, split out 2026-10-15).
 * What already succeeded is remembered, so "retry" continues from the failed request and never creates the
 * product twice. `run(plan)` returns the product id, or null on failure.
 */
export function useCreateSubmission({ t }) {
  const client = useQueryClient()
  const [done, setDone] = useState(EMPTY_DONE)
  const [progress, setProgress] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const run = useCallback(async (plan) => {
    setSubmitting(true)
    setError('')
    const current = { ...done, relations: [...done.relations] }
    const left = remainingRequests(plan, current)
    const mark = (key, value) => setProgress((previous) => ({ ...previous, [key]: value }))
    try {
      if (left.product) {
        mark('product', 'running')
        const response = await productsApi.createProducts(plan.product)
        current.productId = getCreatedId(response)
        if (!current.productId) throw new Error(t('catalog.create.noIdReturned'))
        setDone({ ...current })
        mark('product', 'done')
      }
      for (const relation of left.relations) {
        mark(`relation:${relation.key}`, 'running')
        await productRelationsApi.add(current.productId, relation.body)
        current.relations.push(relation.key)
        setDone({ ...current, relations: [...current.relations] })
        mark(`relation:${relation.key}`, 'done')
      }
      if (left.instances) {
        mark('instances', 'running')
        await productInstancesApi.create(current.productId, plan.instances.instances)
        current.instances = true
        setDone({ ...current })
        mark('instances', 'done')
      }
      return current.productId
    } catch (requestError) {
      setProgress((previous) => Object.fromEntries(Object.entries(previous).map(([key, value]) => [key, value === 'running' ? 'failed' : value])))
      setError(formatApiError(requestError, t('catalog.common.saveFailed')))
      return null
    } finally {
      setSubmitting(false)
      client.invalidateQueries({ queryKey: catalogKeys.root })
    }
  }, [client, done, t])

  return { done, progress, error, submitting, locked: Boolean(done.productId), run }
}
