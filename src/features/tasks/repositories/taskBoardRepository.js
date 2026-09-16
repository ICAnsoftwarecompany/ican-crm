const BOARD_DEFINITIONS = [
  { id: 'main', name: 'Main Board', description: 'Core task flow', accent: 'bg-[#E8F9FA] text-[#007A80]' },
  { id: 'sales', name: 'Sales Team', description: 'Sales follow-up pipeline', accent: 'bg-[#EEF2FF] text-[#4F46E5]' },
  { id: 'followups', name: 'Follow-ups', description: 'Client follow-up queue', accent: 'bg-[#FFF7ED] text-[#C2410C]' },
]

const BOARD_LIST_TEMPLATES = {
  main: [
    { id: 'my-tasks', name: 'My Tasks' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'waiting', name: 'Waiting' },
    { id: 'follow-up', name: 'Follow Up' },
  ],
  sales: [
    { id: 'sales-pipeline', name: 'Pipeline' },
    { id: 'sales-follow-up', name: 'Follow Up' },
    { id: 'sales-quote', name: 'Quote Review' },
  ],
  followups: [
    { id: 'followup-today', name: 'Today' },
    { id: 'followup-later', name: 'Later' },
    { id: 'followup-waiting', name: 'Waiting Customer' },
  ],
}

function getTemplate(boardId) {
  return BOARD_LIST_TEMPLATES[boardId] || BOARD_LIST_TEMPLATES.main
}

function listMatch(task, listId, boardId) {
  const template = getTemplate(boardId)
  const defaultListIds = template.map((list) => list.id)
  const status = String(task?.status || '').toLowerCase()
  const type = String(task?.type || '').toLowerCase()

  if (defaultListIds.includes(listId) && task?.board_list_id) {
    return String(task.board_list_id) === String(listId)
  }

  if (listId === 'my-tasks') return status === 'pending'
  if (listId === 'in-progress') return status === 'in_progress'
  if (listId === 'waiting') return status === 'pending' && (type === 'meeting' || type === 'call')
  if (listId === 'follow-up') return type === 'follow_up' || status === 'pending'

  if (listId === 'sales-pipeline') return status === 'pending' || status === 'in_progress'
  if (listId === 'sales-follow-up') return type === 'follow_up' || task?.priority === 'high'
  if (listId === 'sales-quote') return status === 'completed' || type === 'todo'

  if (listId === 'followup-today') return task?.due_date || task?.dueDate
  if (listId === 'followup-later') return !task?.due_date && !task?.dueDate
  if (listId === 'followup-waiting') return status === 'pending' && (task?.priority === 'medium' || task?.priority === 'low')

  return false
}

export const taskBoardRepository = {
  getBoards: async () => BOARD_DEFINITIONS,
  getBoardLists: async (boardId = 'main') => {
    const template = getTemplate(boardId)
    return template.map((list, index) => ({ ...list, position: index, taskCount: 0 }))
  },
  buildBoardListsForTasks: (boardId = 'main', tasks = [], boardTaskSlots = {}) => {
    const normalized = tasks.map((task) => {
      const slotId = boardTaskSlots[String(task?.id)] || task?.board_list_id
      return slotId ? { ...task, board_list_id: slotId } : task
    })

    const template = getTemplate(boardId)

    return template.map((list) => ({
      ...list,
      tasks: normalized.filter((task) => listMatch(task, list.id, boardId)),
    }))
  },
}
