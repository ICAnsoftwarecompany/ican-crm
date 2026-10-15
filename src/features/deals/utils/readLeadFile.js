import { parseLeadMatrix, parseLeadText } from './leadSource'

export const LEAD_FILE_ACCEPT = '.xlsx,.xls,.csv'

const cellText = (cell) => (typeof cell === 'number' ? String(cell) : cell)

/**
 * Reads lead rows from a file in the browser (see parseLeadMatrix); nothing is uploaded — each row is sent later with
 * `POST /deals/leads/create`.
 * - CSV is read as UTF-8 text (Arabic names stay intact; a BOM is dropped).
 * - Excel: first sheet, raw cell values, so a phone stored as a number stays "201001234567" (never "2.01E+11").
 *   `xlsx` is loaded only when such a file is chosen.
 */
export async function readLeadFile(file) {
  if (/\.csv$/i.test(file.name || '') || file.type === 'text/csv') {
    return parseLeadText((await file.text()).replace(/^﻿/, ''))
  }
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return []
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '' })
  return parseLeadMatrix(matrix.map((cells) => cells.map(cellText)))
}
