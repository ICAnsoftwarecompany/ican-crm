/**
 * Centralized condition operators — modules never define their own operator
 * list. A condition field can restrict which of these apply via
 * `field.operators` (see schemas/conditionSchema in registry usage);
 * omitted means all generic operators are offered.
 */
export const CONDITION_OPERATORS = [
  { value: 'equals', labelKey: 'workflow.operators.equals' },
  { value: 'not_equals', labelKey: 'workflow.operators.notEquals' },
  { value: 'contains', labelKey: 'workflow.operators.contains' },
  { value: 'not_contains', labelKey: 'workflow.operators.notContains' },
  { value: 'greater_than', labelKey: 'workflow.operators.greaterThan' },
  { value: 'less_than', labelKey: 'workflow.operators.lessThan' },
  { value: 'is_empty', labelKey: 'workflow.operators.isEmpty' },
  { value: 'is_not_empty', labelKey: 'workflow.operators.isNotEmpty' },
  { value: 'in', labelKey: 'workflow.operators.in' },
  { value: 'not_in', labelKey: 'workflow.operators.notIn' },
]

export function getOperatorLabelKey(operatorValue) {
  return CONDITION_OPERATORS.find((operator) => operator.value === operatorValue)?.labelKey || null
}

/** Operators that take no `value` input (unary). */
export const UNARY_OPERATORS = ['is_empty', 'is_not_empty']
