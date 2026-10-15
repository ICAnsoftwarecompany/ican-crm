import { useTranslation } from 'react-i18next'
import { useNumberFormat } from '../../../products'
import { toIdList } from '../utils/interestForm'

const present = (value) => value !== undefined && value !== null && value !== ''

/**
 * The structured details of a saved interest (quantity, wanted units, preferred date, people, add-ons, expected
 * value). Renders nothing until the backend returns those fields (BACKEND-REQUESTS §E1).
 */
export function InterestFactsChips({ interest }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  if (!interest) return null
  const units = toIdList(interest.item_instance_ids).length
  const addOns = toIdList(interest.optional_product_ids).length
  const facts = [
    present(interest.quantity) && Number(interest.quantity) !== 1 ? t('leads.interestDialog.chips.quantity', { value: formatNumber(interest.quantity) }) : '',
    units ? t('leads.interestDialog.chips.units', { count: units }) : '',
    interest.preferred_date ? t('leads.interestDialog.chips.date', { value: String(interest.preferred_date).slice(0, 10) }) : '',
    present(interest.participants) ? t('leads.interestDialog.chips.participants', { count: Number(interest.participants) }) : '',
    addOns ? t('leads.interestDialog.chips.addOns', { count: addOns }) : '',
    present(interest.estimated_value) ? t('leads.interestDialog.chips.value', { value: formatNumber(interest.estimated_value) }) : '',
  ].filter(Boolean)
  if (!facts.length) return null

  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {facts.map((fact) => (
        <li key={fact} className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">{fact}</li>
      ))}
    </ul>
  )
}
