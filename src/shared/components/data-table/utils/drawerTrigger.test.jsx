import { describe, expect, it, vi } from 'vitest'
import { findDrawerTriggerColumn, withDrawerTrigger } from './drawerTrigger'

describe('withDrawerTrigger', () => {
  const columns = [{ id: '__select' }, { id: 'image', accessor: 'image' }, { id: 'name', accessor: 'name' }, { id: 'price', accessor: 'price' }]

  it('picks the marked column, then name, then the first data column', () => {
    expect(findDrawerTriggerColumn(columns).id).toBe('name')
    expect(findDrawerTriggerColumn([{ id: 'a' }, { id: 'b', drawerTrigger: true }]).id).toBe('b')
    expect(findDrawerTriggerColumn([{ id: '__serial' }, { id: 'title' }]).id).toBe('title')
  })

  it('wraps only the trigger column and leaves the table untouched without a handler', () => {
    expect(withDrawerTrigger(columns, null)).toBe(columns)
    const wrapped = withDrawerTrigger(columns, vi.fn())
    expect(wrapped[2].render).toBeTypeOf('function')
    expect(wrapped[3]).toBe(columns[3])
  })
})
