import { getCollection } from './db'
import { MockHttpError, notFound } from './errors'
import { mockId } from './seeds/seedUtils'
import { nowIso } from './utils'

/**
 * Generic CRUD mock for tenant configuration resources (settings screens).
 *
 *   ...crudHandlers({ collection: 'queues', path: `${SERVICE_API}/queues`, validate, prefix: 'q' })
 *
 * GET list → { data: [...] } · POST → 201 { data } · PATCH/:id → { data } · DELETE/:id → 204.
 * `validate(body, { existing })` returns `{ field: ['required'] }`; a non-empty result is a 422.
 * `canDelete(item)` may throw a MockHttpError (e.g. 409 when the item is in use).
 */
export function crudHandlers({ collection, path, prefix = 'id', validate = () => ({}), serialize = (item) => item, canDelete }) {
  const list = () => getCollection(collection)
  const find = (id) => {
    const found = list().find((item) => String(item.id) === String(id))
    if (!found) throw notFound(collection)
    return found
  }
  const check = (body, existing) => {
    const errors = validate(body, { existing, items: list() }) || {}
    if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
  }

  return [
    { method: 'GET', path, handler: () => ({ data: list().map(serialize) }) },
    {
      method: 'POST',
      path,
      handler: ({ body = {} }) => {
        check(body, null)
        const created = { ...body, id: mockId(prefix), created_at: nowIso(), updated_at: nowIso() }
        list().push(created)
        return { status: 201, body: { data: serialize(created) } }
      },
    },
    { method: 'GET', path: `${path}/:id`, handler: ({ params }) => ({ data: serialize(find(params.id)) }) },
    {
      method: 'PATCH',
      path: `${path}/:id`,
      handler: ({ params, body = {} }) => {
        const item = find(params.id)
        check({ ...item, ...body }, item)
        Object.assign(item, body, { id: item.id, updated_at: nowIso() })
        return { data: serialize(item) }
      },
    },
    {
      method: 'DELETE',
      path: `${path}/:id`,
      handler: ({ params }) => {
        const item = find(params.id)
        canDelete?.(item)
        const items = list()
        items.splice(items.indexOf(item), 1)
        return { status: 204, body: null }
      },
    },
  ]
}

/** Shared validators. */
export const required = (value) => (Array.isArray(value) ? value.length === 0 : !String(value ?? '').trim())
export const requiredLabel = (label) => !label || (!String(label.ar || '').trim() && !String(label.en || '').trim())
