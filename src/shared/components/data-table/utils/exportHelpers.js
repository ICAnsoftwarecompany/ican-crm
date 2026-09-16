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
 * Generate and download an Excel file with styling
 */
export function generateExcelFile(rows, columns, filename = 'export.xlsx', visibleColumnsOnly = true, styles = {}) {
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

    // Apply styling if available
    const { rowStyles = {}, cellStyles = {}, columnStyles = {}, tableStyle = {} } = styles || {}

    // Helper function to convert hex color to RGB for XLSX
    const hexToRgb = (hex) => {
      if (!hex || hex === '#FFFFFF') return 'FFFFFF'
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!result) return 'FFFFFF'
      return `${result[1]}${result[2]}${result[3]}`.toUpperCase()
    }

    // Apply column styles and header styling
    headers.forEach((h, idx) => {
      const cellRef = String.fromCharCode(65 + idx) + '1'
      const colStyle = columnStyles[h.id] || {}
      
      sheet[cellRef] = {
        v: h.header,
        t: 's',
        s: {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: 'D3D3D3' } },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        }
      }
    })

    // Apply cell and row styles to data cells
    let rowIndex = 2
    Object.keys(data).forEach((dataRowIdx) => {
      const rowNum = parseInt(dataRowIdx)
      const displayRowIndex = rowNum + 1 // Excel uses 1-based indexing after header
      
      // Get the original row key (we need to map back to the data row)
      // Since we don't have direct mapping, we'll use rowNum as rowKey placeholder
      const rowKey = String(rowNum)

      headers.forEach((h, colIdx) => {
        const cellRef = String.fromCharCode(65 + colIdx) + displayRowIndex
        const cellKey = `${rowKey}::${h.id}`
        
        const cellStyle = cellStyles[cellKey] || {}
        const rowStyle = rowStyles[rowKey] || {}
        const colStyle = columnStyles[h.id] || {}

        // Resolve styles with priority: cell > row > column > table > default
        const bgColor = cellStyle.bgColor || rowStyle.bgColor || colStyle.bgColor || tableStyle.bgColor || '#FFFFFF'
        const textColor = cellStyle.textColor || rowStyle.textColor || colStyle.textColor || tableStyle.textColor || '#000000'
        const fontSize = parseInt(cellStyle.fontSize || rowStyle.fontSize || colStyle.fontSize || tableStyle.fontSize || '14')
        const fontWeight = cellStyle.fontWeight || rowStyle.fontWeight || colStyle.fontWeight || tableStyle.fontWeight || '400'
        const fontFamily = cellStyle.fontFamily || rowStyle.fontFamily || colStyle.fontFamily || tableStyle.fontFamily || 'Calibri'

        const cellStyle_obj = sheet[cellRef]?.s || {}

        sheet[cellRef] = {
          ...sheet[cellRef],
          s: {
            ...cellStyle_obj,
            font: {
              ...cellStyle_obj.font,
              bold: fontWeight === '700' || fontWeight === '600',
              color: { rgb: hexToRgb(textColor) },
              sz: Math.max(8, Math.min(72, fontSize)),
              name: fontFamily.split(',')[0],
            },
            fill: {
              fgColor: { rgb: hexToRgb(bgColor) },
              patternType: 'solid',
            },
            alignment: {
              horizontal: 'right',
              vertical: 'center',
              wrapText: true,
            },
          }
        }
      })
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
