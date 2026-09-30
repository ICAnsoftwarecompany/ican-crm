// Public surface of the tasks feature for other features (added 2026-10-01 for features/my-work).
// Existing consumers that import internal paths keep working; new cross-feature code imports from here.
export { useTasks, useTaskMutations } from './hooks/useTasks'
export { TaskDrawer } from './components/TaskDrawer'
export {
  getTaskDateTime,
  getTaskDueDate,
  isTaskCompleted,
  isTaskOverdue,
} from './utils/taskMeta'
