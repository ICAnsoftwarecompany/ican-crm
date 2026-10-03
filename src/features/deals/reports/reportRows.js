const SPECIAL_KEYS = { __none__: 'reports.none', __other__: 'reports.other' }

/** countBy rows → chart rows (translated special keys; "Other" gets the neutral color). */
export function toChartRows(rows, t, labelFor = (key) => key) {
  return rows.map((row) => ({
    key: row.key,
    value: row.value,
    label: SPECIAL_KEYS[row.key] ? t(SPECIAL_KEYS[row.key]) : labelFor(row.key),
    colorIndex: row.key === '__other__' ? -1 : undefined,
  }))
}
