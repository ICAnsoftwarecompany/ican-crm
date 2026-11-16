import { EntityTasksPanel, taskableFromCrmRecord } from '../../../../../../features/tasks'

/**
 * Customer drawer → Tasks tab. Thin wrapper (2026-10-02, tasks F2): the list, quick actions and form
 * live in features/tasks (EntityTasksPanel). Tasks hang on the record's lead, as before.
 */
export function TasksTab({ customer, layoutMode = 'compact' }) {
  return <EntityTasksPanel taskable={taskableFromCrmRecord(customer)} layoutMode={layoutMode} />
}
