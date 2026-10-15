import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { readLeadFile } from './readLeadFile'

const strip = (rows) => rows.map(({ key, ...row }) => row)

describe('readLeadFile', () => {
  it('reads a CSV file with an Arabic header', async () => {
    const file = new File(['الاسم,الهاتف,الشركة\nأحمد,01001234567,ABC\n'], 'leads.csv', { type: 'text/csv' })
    expect(strip(await readLeadFile(file))).toEqual([{ name: 'أحمد', phone: '01001234567', email: '', company: 'ABC' }])
  })

  it('reads the first sheet of an xlsx file (numbers kept as text)', async () => {
    const book = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([['Phone', 'Name', 'Email'], [201001234567, 'Mona', 'mona@x.io']]), 'Leads')
    const buffer = XLSX.write(book, { type: 'array', bookType: 'xlsx' })
    const file = new File([buffer], 'leads.xlsx')
    expect(strip(await readLeadFile(file))).toEqual([{ name: 'Mona', phone: '201001234567', email: 'mona@x.io', company: '' }])
  })
})
