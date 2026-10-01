import { describe, expect, it } from 'vitest'
import {
  buildTaskablePayload,
  getTaskableType,
  getTaskLinkPath,
  isTaskLinkedTo,
  taskableFromCrmRecord,
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

describe('getTaskLinkPath', () => {
  it('customer links go to the record page; lead links only when the lead\'s customer is known', () => {
    expect(getTaskLinkPath({ taskable_type: 'App\\Models\\Customer', taskable_id: 8 })).toBe('/leads/8')
    expect(getTaskLinkPath({ taskable_type: 'App\\Models\\Lead', taskable_id: 3, taskable: { id: 3, customer_id: 40 } })).toBe('/leads/40')
    expect(getTaskLinkPath({ taskable_type: 'App\\Models\\Lead', taskable_id: 3 })).toBeNull()
    expect(getTaskLinkPath({ title: 'personal' })).toBeNull()
  })
})

describe('taskableFromCrmRecord / isTaskLinkedTo', () => {
  it('links a Leads Center record through its lead', () => {
    expect(taskableFromCrmRecord({ id: 40, lead: { id: 3 }, name: 'Ahmed' })).toEqual({ type: 'lead', id: '3', name: 'Ahmed' })
    expect(taskableFromCrmRecord({ id: 40, lead_id: 5 })).toMatchObject({ id: '5' })
    expect(taskableFromCrmRecord({ id: 40 })).toMatchObject({ id: '40' })
    expect(taskableFromCrmRecord(null)).toBeNull()
  })

  it('matches only tasks linked to that record (never personal tasks)', () => {
    const task = { taskable_type: 'App\\Models\\Lead', taskable_id: 3 }
    expect(isTaskLinkedTo(task, 'lead', 3)).toBe(true)
    expect(isTaskLinkedTo(task, 'App\\Models\\Lead', '3')).toBe(true)
    expect(isTaskLinkedTo(task, 'customer', 3)).toBe(false)
    expect(isTaskLinkedTo({ title: 'todo' }, 'lead', 3)).toBe(false)
    expect(isTaskLinkedTo(task, 'lead', '')).toBe(false)
  })
})

describe('fromRecord', () => {
  it('lead uses the record\'s lead id, customer the record id', () => {
    const record = { id: 40, lead: { id: 3 } }
    expect(getTaskableType('lead').fromRecord(record)).toBe('3')
    expect(getTaskableType('customer').fromRecord(record)).toBe('40')
  })
})
