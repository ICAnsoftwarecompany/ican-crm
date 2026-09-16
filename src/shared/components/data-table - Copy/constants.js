export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 1000]
export const DEFAULT_SORT_DIRECTION = 'asc'
export const STORAGE_KEY_PREFIX = 'datatable-'
export const STORAGE_VERSION = 1

export const DENSITY_LEVELS = {
  compact: 'py-2',
  normal: 'py-3',
  comfortable: 'py-4',
}

export const ROW_ACTIONS_WIDTH = 'w-16'

// Filter Types & Operators
export const FILTER_TYPES = {
  TEXT: 'text',
  SELECT: 'select',
  NUMBER: 'number',
  DATE: 'date',
  BOOLEAN: 'boolean',
}

export const FILTER_OPERATORS = {
  text: [
    { value: 'contains', label: 'يحتوي على' },
    { value: 'starts_with', label: 'يبدأ بـ' },
    { value: 'ends_with', label: 'ينتهي بـ' },
    { value: 'equals', label: 'يساوي' },
  ],
  select: [
    { value: 'equals', label: 'يساوي' },
    { value: 'in', label: 'في' },
  ],
  number: [
    { value: 'equals', label: 'يساوي' },
    { value: 'greater_than', label: 'أكبر من' },
    { value: 'less_than', label: 'أقل من' },
    { value: 'between', label: 'بين' },
  ],
  date: [
    { value: 'equals', label: 'يساوي' },
    { value: 'before', label: 'قبل' },
    { value: 'after', label: 'بعد' },
    { value: 'between', label: 'بين' },
  ],
  boolean: [
    { value: true, label: 'نعم' },
    { value: false, label: 'لا' },
  ],
}

export const DEFAULT_FILTER_OPERATOR = {
  text: 'contains',
  select: 'equals',
  number: 'equals',
  date: 'equals',
  boolean: true,
}
