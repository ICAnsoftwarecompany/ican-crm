import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { useCustomerLookup } from '../../cases/hooks/useCases'

/** Search + pick a customer (server lookup). `fixed` shows a preselected customer only. */
export function CustomerSelect({ value, onChange, error, fixed }) {
  const { t } = useTranslation()
  const term = useServiceTerminology()
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search, 300)
  const customers = useCustomerLookup(debounced)
  const options = useMemo(() => {
    const list = fixed ? [fixed] : customers.data || []
    return list.map((item) => ({ value: item.id, label: item.phone ? `${item.name} · ${item.phone}` : item.name }))
  }, [customers.data, fixed])

  return (
    <div className="grid gap-2">
      {!fixed && (
        <Input
          label={t('service.cases.create.findCustomer', { entity: term('customer') })}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('service.cases.create.searchPlaceholder')}
          startIcon={<Search size={16} aria-hidden="true" />}
        />
      )}
      <Select
        label={fixed ? term('customer') : undefined}
        aria-label={term('customer')}
        value={value}
        onChange={onChange}
        options={options}
        disabled={Boolean(fixed)}
        error={error}
        placeholder={t('service.records.create.pickCustomer', { customer: term('customer') })}
      />
    </div>
  )
}
