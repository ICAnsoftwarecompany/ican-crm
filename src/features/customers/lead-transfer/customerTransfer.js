import { extractList } from '../../../shared/utils/apiResponse'
import { customersApi } from '../api/customersApi'

export async function readCustomerFile(file) {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', raw: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return []
  return XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false }).map((row) => {
    const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), String(value).trim()]))
    return { name: normalized.name || normalized['الاسم'] || '', phone: normalized.phone || normalized['الهاتف'] || '', email: normalized.email || normalized['البريد الإلكتروني'] || '', company: normalized.company || normalized['الشركة'] || '', source: normalized.source || 'manual', note: normalized.note || '' }
  })
}

export async function fetchAllCustomers() {
  const rows = []
  let params = {}
  const visited = new Set()
  while (true) {
    const response = await customersApi.getCustomers(params)
    if (response?.success === false) throw new Error(response.message || 'export_failed')
    rows.push(...extractList(response))
    if (response.has_more) {
      if (!response.next_cursor || visited.has(String(response.next_cursor))) throw new Error('invalid_export_cursor')
      visited.add(String(response.next_cursor))
      params = { cursor: response.next_cursor }
    } else if (response.data?.next_page_url && response.data?.current_page) {
      const page = Number(response.data.current_page) + 1
      if (visited.has(`page:${page}`)) throw new Error('invalid_export_page')
      visited.add(`page:${page}`)
      params = { page }
    } else break
  }
  return rows
}
