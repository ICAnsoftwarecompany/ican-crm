export const activityKeys = {
  all: ['activities'],
  lists: () => ['activities', 'list'],
  list: (filters) => ['activities', 'list', filters],
  detail: (id) => ['activities', 'detail', id],
  reports: (id, filters) => ['activities', id, 'reports', filters],
  summary: (filters) => ['activities', 'summary', filters],
}
