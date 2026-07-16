import * as XLSX from 'xlsx'

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj)
}

/**
 * Format a value for Excel export
 * Handles dates, nested objects, and arrays
 */
function formatCellValue(value) {
  if (value === null || value === undefined) {
    return ''
  }

  if (value instanceof Date) {
    return value.toLocaleDateString('ar-SA')
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

/**
 * Prepare data for Excel export
 * Converts rows and columns into export-ready format
 */
export function prepareExportData(rows, columns, visibleColumnsOnly = true) {
  if (!rows || rows.length === 0) {
    return { data: [], headers: [] }
  }

  // Determine which columns to export
  const columnsToExport = visibleColumnsOnly
    ? columns.filter(col => col.visible !== false)
    : columns

  // Create headers from column definitions
  const headers = columnsToExport.map(col => ({
    id: col.id,
    header: col.header,
    accessor: col.accessor,
  }))

  // Convert rows to export data
  const data = rows.map(row => {
    const exportRow = {}
    headers.forEach(({ id, accessor }) => {
      const value = getNestedValue(row, accessor)
      exportRow[id] = formatCellValue(value)
    })
    return exportRow
  })

  return { data, headers }
}

/**
 * Generate and download an Excel file
 */
export function generateExcelFile(rows, columns, filename = 'export.xlsx', visibleColumnsOnly = true) {
  const { data, headers } = prepareExportData(rows, columns, visibleColumnsOnly)

  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  try {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()

    // Convert data to sheet
    const sheet = XLSX.utils.json_to_sheet(data, {
      header: headers.map(h => h.id),
    })

    // Set header row with better formatting
    sheet['!A1'] = { v: headers[0].header, t: 's', s: { bold: true, fill: { fgColor: { rgb: 'D3D3D3' } } } }
    headers.forEach((h, idx) => {
      const cell = String.fromCharCode(65 + idx) + '1'
      sheet[cell] = { v: h.header, t: 's' }
    })

    // Auto-size columns based on header width
    const columnWidths = headers.map(h => ({
      wch: Math.max(h.header.length + 2, 15)
    }))
    sheet['!cols'] = columnWidths

    // Add sheet to workbook
    XLSX.utils.book_append_sheet(workbook, sheet, 'Data')

    // Write file
    XLSX.writeFile(workbook, filename)
  } catch (error) {
    console.error('Error generating Excel file:', error)
    throw error
  }
}

/**
 * Get export filename with timestamp
 */
export function getExportFilename(prefix = 'export') {
  const timestamp = new Date().toISOString().slice(0, 10)
  return `${prefix}-${timestamp}.xlsx`
}

/**
 * Build export data structure for callback (server-side export)
 */
export function buildExportPayload(rows, columns, options) {
  const { data, headers } = prepareExportData(
    rows,
    columns,
    options.columnMode === 'visible'
  )

  return {
    rows: data,
    columns: headers,
    rowCount: data.length,
    columnCount: headers.length,
    exportMode: options.exportMode,
    columnMode: options.columnMode,
    generatedAt: new Date().toISOString(),
  }
}
