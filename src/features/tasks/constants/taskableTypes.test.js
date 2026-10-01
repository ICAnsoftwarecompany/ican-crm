import { describe, expect, it } from 'vitest'
import {
  buildTaskablePayload,
  getTaskableTypes,
  getTaskTaskable,
  isPersonalTask,
  registerTaskableType,
  resolveTaskableAlias,
  toBackendTaskableType,
} from './taskableTypes'

describe('taskable registry', () => {
  it('registers lead and customer by default', () => {
    expect(getTaskableTypes().map((type) => type.id)).toEqual(expect.arrayContaining(['lead', 'customer']))
  })

  it('resolves every spelling the backend or an old payload may send', () => {
    expect(resolveTaskableAlias('lead')).toBe('lead')
    expect(resolveTaskableAlias('App\\Models\\Lead')).toBe('lead')
    expect(resolveTaskableAlias('App\\\\Models\\\\Lead"')).toBe('lead')
    expect(resolveTaskableAlias('App/Models/Customer')).toBe('customer')
    expect(resolveTaskableAlias('App\\Models\\User')).toBe('')
    expect(resolveTaskableAlias('')).toBe('')
    expect(resolveTaskableAlias(null)).toBe('')
  })

  it('converts an alias to the backend model name', () => {
    expect(toBackendTaskableType('lead')).toBe('App\\Models\\Lead')
    expect(toBackendTaskableType('customer')).toBe('App\\Models\\Customer')
    expect(toBackendTaskableType('nope')).toBe('')
  })

  it('supports registering a new entity in one call', () => {
    registerTaskableType({ id: 'deal', model: 'App\\Models\\Deal', labelKey: 'tasks.taskable.types.deal' })
    expect(resolveTaskableAlias('App\\Models\\Deal')).toBe('deal')
    expect(toBackendTaskableType('deal')).toBe('App\\Models\\Deal')
  })
})

describe('getTaskTaskable / isPersonalTask', () => {
  it('reads the link of a task', () => {
    expect(getTaskTaskable({ taskable_type: 'App\\Models\\Lead', taskable_id: 15, taskable: { name: 'Ahmed' } }))
      .toEqual({ type: 'lead', id: 15, name: 'Ahmed' })
  })

  it('treats a task with no type or no id as personal', () => {
    expect(isPersonalTask({ title: 'x' })).toBe(true)
    expect(isPersonalTask({ taskable_type: 'App\\Models\\Lead', taskable_id: '' })).toBe(true)
    expect(isPersonalTask({ taskable_type: 'App\\Models\\Lead', taskable_id: 3 })).toBe(false)
  })
})

describe('buildTaskablePayload', () => {
  it('sends the backend type with the id', () => {
    expect(buildTaskablePayload('lead', 7)).toEqual({ taskable_type: 'App\\Models\\Lead', taskable_id: '7' })
  })

  it('sends both fields empty when there is no link (never a lead with no id)', () => {
    expect(buildTaskablePayload('', '')).toEqual({ taskable_type: '', taskable_id: '' })
    expect(buildTaskablePayload('lead', '')).toEqual({ taskable_type: '', taskable_id: '' })
    expect(buildTaskablePayload('unknown', 4)).toEqual({ taskable_type: '', taskable_id: '' })
  })
})
