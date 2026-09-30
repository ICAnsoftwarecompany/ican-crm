/**
 * "Focus" = which part of the job the viewer wants to see. The backend does not send the user's
 * role yet, so the viewer picks it (remembered per browser). `all` shows every section.
 * A section declares the focuses it belongs to; sections for everyone use FOCUS_EVERYONE.
 */
export const MY_WORK_FOCUS = {
  all: 'all',
  sales: 'sales',
  service: 'service',
}

export const MY_WORK_FOCUS_LIST = [MY_WORK_FOCUS.all, MY_WORK_FOCUS.sales, MY_WORK_FOCUS.service]

/** Sections useful in every focus (calls, meetings, tasks, chat...). */
export const FOCUS_EVERYONE = [MY_WORK_FOCUS.sales, MY_WORK_FOCUS.service]

export const MY_WORK_FOCUS_STORAGE_KEY = 'ican-crm:my-work:focus'

export const MY_WORK_ROUTE = '/my-work'
