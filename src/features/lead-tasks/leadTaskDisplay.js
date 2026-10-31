import { getTaskDeadline, getTaskTaskable, isTaskClosed } from '../tasks'

export function indexLeadTasks(tasks = []) {
  const index = new Map()
  tasks.forEach((task) => {
    const link = getTaskTaskable(task)
    if (link?.type !== 'lead') return
    const key = String(link.id)
    index.set(key, [...(index.get(key) || []), task])
  })
  return index
}

export function leadTaskCountdown(tasks, now) {
  const dated = tasks.filter((task) => !isTaskClosed(task) && getTaskDeadline(task))
    .sort((a, b) => getTaskDeadline(a) - getTaskDeadline(b))
  if (!dated.length) return null
  const difference = getTaskDeadline(dated[0]).getTime() - now
  const minutes = Math.max(0, Math.ceil(Math.abs(difference) / 60000))
  return { task: dated[0], overdue: difference < 0, days: Math.floor(minutes / 1440), hours: Math.floor((minutes % 1440) / 60), minutes: minutes % 60 }
}

export function leadTasksTimeline(tasks = []) {
  return tasks.map((task) => ({
    id: `lead-task-${task.id}`, type: 'task', category: 'task', title: task.title || '',
    date: task.created_at || null, description: task.description || '', user: task.creator || (task.created_by && typeof task.created_by === 'object' ? task.created_by : null),
    userName: task.creator?.name || task.created_by?.name || '', task,
  }))
}
