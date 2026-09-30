const SPECIAL_KEYS = { __none__: 'reports.none', __other__: 'reports.other' }

/** countBy rows → chart rows with translated special keys; "Other" gets the neutral color. */
export function toChartRows(rows, t, labelFor = (key) => key) {
  return rows.map((row) => ({
    key: row.key,
    value: row.value,
    label: SPECIAL_KEYS[row.key] ? t(SPECIAL_KEYS[row.key]) : labelFor(row.key),
    colorIndex: row.key === '__other__' ? -1 : undefined,
  }))
}

/** First usable date on a conversation-like record (APIs name it differently per channel). */
export function getConversationActivityDate(conversation) {
  return conversation?.last_message_at
    || conversation?.last_message?.created_at
    || conversation?.updated_at
    || conversation?.updatedAt
    || conversation?.created_at
    || null
}
