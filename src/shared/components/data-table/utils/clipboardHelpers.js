/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      return success
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Copy selected rows data to clipboard as TSV (Tab-Separated Values)
 * This format works well with Excel and spreadsheets
 */
export function copySelectedRowsToClipboard(rows, columns, selectedRowKeys, rowStyles, cellStyles, columnStyles) {
  if (!selectedRowKeys || selectedRowKeys.size === 0 || !rows) {
    return Promise.resolve(false)
  }

  // Filter rows based on selected keys
  const selectedRows = rows.filter(row => {
    const rowKey = row.__rowKey || String(row.id || '')
    return selectedRowKeys.has(rowKey)
  })

  // Build TSV with headers
  const headers = columns
    .filter(col => col.id !== '__select' && col.id !== '__serial')
    .map(col => col.header)
    .join('\t')

  const dataRows = selectedRows.map(row => {
    return columns
      .filter(col => col.id !== '__select' && col.id !== '__serial')
      .map(col => {
        const value = col.accessor
          ? col.accessor.split('.').reduce((current, prop) => current?.[prop], row)
          : row[col.id]
        return formatCellValue(value)
      })
      .join('\t')
  })

  const tsv = [headers, ...dataRows].join('\n')
  return copyToClipboard(tsv)
}

/**
 * Copy single cell value to clipboard
 */
export function copyCellToClipboard(value) {
  const text = formatCellValue(value)
  return copyToClipboard(text)
}

/**
 * Format value for display
 */
function formatCellValue(value) {
  if (value === null || value === undefined) {
    return ''
  }

  if (value instanceof Date) {
    return value.toLocaleDateString()
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    return JSON.stringify(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'نعم' : 'لا'
  }

  return String(value)
}
