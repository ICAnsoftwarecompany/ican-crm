import { describe, expect, it } from 'vitest'
import { suggestMapping } from './suggestMapping'

describe('suggestMapping', () => {
  it('matches keys and labels once each', () => {
    const fields = [{ key: 'reference_no' }, { key: 'customer_phone' }, { key: 'data.cod_amount', label: { en: 'COD amount', ar: 'مبلغ التحصيل' } }]
    const labelOf = (field) => [field.label?.en, field.label?.ar]
    expect(suggestMapping(['Reference No', 'customer phone', 'مبلغ التحصيل', 'Notes'], fields, labelOf)).toEqual({ 'Reference No': 'reference_no', 'customer phone': 'customer_phone', 'مبلغ التحصيل': 'data.cod_amount', Notes: '' })
  })
})
