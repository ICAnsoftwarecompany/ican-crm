// Public surface of the tasks feature for other features (added 2026-10-01 for features/my-work;
// To-Do + taskable registry added 2026-10-02 F1; record panel, quick actions, picker in F2). Existing consumers that import internal paths keep
// working; new cross-feature code imports from here. See ./README.md.
export { useTasks, useTaskMutations } from './hooks/useTasks'
export { useTodoList } from './hooks/useTodoList'
export { useEntityTasks } from './hooks/useEntityTasks'
export { TaskDrawer } from './components/TaskDrawer'
export { TaskLinkChip } from './components/TaskLinkChip'
export { EntityTasksPanel } from './components/entity/EntityTasksPanel'
export { CreateTaskButton } from './components/entity/CreateTaskButton'
export { TodoPanel } from './components/todo/TodoPanel'
export { TodoPanelView } from './components/todo/TodoPanelView'
export {
  getTaskDateTime,
  getTaskDeadline,
  getTaskDueDate,
  isTaskClosed,
  isTaskCompleted,
  isTaskOverdue,
} from './utils/taskMeta'
export {
  buildTaskablePayload,
  getTaskableTypes,
  getTaskLinkPath,
  getTaskTaskable,
  isPersonalTask,
  isTaskLinkedTo,
  taskableFromCrmRecord,
  registerTaskableType,
  resolveTaskableAlias,
  toBackendTaskableType,
} from './constants/taskableTypes'
export { buildTaskPayload, taskToFormValues, TASK_FORM_DEFAULTS } from './utils/taskPayload'
export { buildTodoSchedule, getPeriodRange, groupTodoItems, TODO_PERIODS, TODO_VIEWS } from './utils/todoPeriods'
