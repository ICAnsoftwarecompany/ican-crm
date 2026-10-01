import { describe, expect, it, vi } from 'vitest'

vi.mock('./useTasks', () => ({ useTasks: () => ({}), useTaskMutations: () => ({}) }))
const { splitEntityTasks } = await import('./useEntityTasks')

describe('splitEntityTasks', () => {
  const tasks = [
    { id: 1, taskable_type: 'App\\Models\\Lead', taskable_id: 3, due_date: '2026-10-09', status: 'pending' },
    { id: 2, taskable_type: 'App\\Models\\Lead', taskable_id: 3, due_date: '2026-10-05', due_time: '10:00', status: 'in_progress' },
    { id: 3, taskable_type: 'App\\Models\\Lead', taskable_id: 3, status: 'pending' },
    { id: 4, taskable_type: 'App\\Models\\Lead', taskable_id: 3, due_date: '2026-10-01', status: 'completed' },
    { id: 5, taskable_type: 'App\\Models\\Lead', taskable_id: 3, due_date: '2026-10-03', status: 'cancelled' },
    { id: 6, taskable_type: 'App\\Models\\Lead', taskable_id: 99, status: 'pending' },
    { id: 7, title: 'personal to-do', status: 'pending' },
  ]

  it('keeps only this record\'s tasks: open by deadline (undated last), closed newest first', () => {
    const { open, closed } = splitEntityTasks(tasks, 'lead', 3)
    expect(open.map((task) => task.id)).toEqual([2, 1, 3])
    expect(closed.map((task) => task.id)).toEqual([5, 4])
  })

  it('never shows personal tasks or other records, even if the backend ignores the filter', () => {
    const { open, closed } = splitEntityTasks(tasks, 'lead', 3)
    const ids = [...open, ...closed].map((task) => task.id)
    expect(ids).not.toContain(6)
    expect(ids).not.toContain(7)
  })
})
